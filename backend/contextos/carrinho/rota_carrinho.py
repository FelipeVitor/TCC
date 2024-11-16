from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from contextos.carrinho.entidade_carrinho import Carrinho
from contextos.carrinho.modelo_carrinho import (
    AdicionarItemCarrinho,
    CarrinhoFinal,
    CarrinhoItem,
    CarrinhoRetorno,
    LivroRetorno,
)
from contextos.livros.entidade_livro import Livro
from contextos.usuarios.entidade_usuario import Usuario
from libs.autenticacao.config import JWTBearer
from libs.database.sqlalchemy import pegar_conexao_db

roteador = APIRouter(prefix="/carrinho", tags=["Carrinho"])


@roteador.post("/adicionar")
def adicionar_item_no_carrinho(
    item: AdicionarItemCarrinho,
    db: Session = Depends(pegar_conexao_db),
    usuario_do_login: Usuario = Depends(JWTBearer()),
):
    # Verificar se o livro existe e tem quantidade disponível
    livro = db.query(Livro).filter(Livro.id == item.livro_id).first()
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")

    carrinhos = (
        db.query(Carrinho)
        .filter(Carrinho.livro_id == livro.id)
        .filter(Carrinho.usuario_id == usuario_do_login.id)
        .all()
    )

    novo_carrinho = Carrinho.criar(
        usuario_id=usuario_do_login.id,
        livro_id=livro.id,
        quantidade=item.quantidade,
    )
    if len(carrinhos) >= 1:
        for carrinho_existente in carrinhos:
            novo_carrinho.quantidade += carrinho_existente.quantidade

    livro: Livro

    if livro.quantidade <= novo_carrinho.quantidade:
        raise HTTPException(
            status_code=400, detail="Quantidade insuficiente em estoque"
        )

    with db as tx:
        ids_carrinhos_antigos = [carrinho.id for carrinho in carrinhos]

        tx.add(novo_carrinho)

        tx.query(Carrinho).where(Carrinho.id.in_(ids_carrinhos_antigos)).delete()

        tx.commit()

    return Response(status_code=200)


# Endpoint para visualizar o carrinho
@roteador.get("/")
def buscar_carrinho_do_usuario(
    db: Session = Depends(pegar_conexao_db),
    usuario_do_login: Usuario = Depends(JWTBearer()),
) -> CarrinhoFinal:
    carrinhos_com_livros = buscar_carriho_do_usuario_repo(db, usuario_do_login.id)

    carrinho_final = CarrinhoFinal(itens=[], total_do_carrinho=0)

    for carrinho, livro in carrinhos_com_livros:
        livro_id = livro.id
        quantidade = carrinho.quantidade

        # Verifica se o livro já está no carrinho final para atualizar a quantidade
        item_existente = next(
            (item for item in carrinho_final.itens if item.livro.id == livro_id), None
        )

        if item_existente:
            # Atualiza a quantidade e o total do item existente
            item_existente.carrinho.quantidade += quantidade
            item_existente.carrinho.total = (
                item_existente.carrinho.quantidade * item_existente.livro.preco
            )
        else:
            # Cria um novo item do carrinho com os detalhes do livro e a quantidade
            novo_item = CarrinhoItem(
                livro=LivroRetorno(
                    id=livro.id,
                    titulo=livro.titulo,
                    preco=livro.preco,
                    genero=livro.genero,
                    descricao=livro.descricao,
                    url_imagem=livro.url_imagem,
                ),
                carrinho=CarrinhoRetorno(
                    quantidade=quantidade, total=quantidade * livro.preco
                ),
            )
        # Adiciona o novo item à lista de itens do carrinho final
        carrinho_final.itens.append(novo_item)

    total_do_carrinho = sum(item.carrinho.total for item in carrinho_final.itens)
    carrinho_final.total_do_carrinho = total_do_carrinho

    return carrinho_final


# Endpoint para adicionar um item ao carrinho
@roteador.delete("/remover-item/{livro_id}/{quantidade}")
def remover_item_no_carrinho(
    livro_id: int,
    quantidade: int,
    db: Session = Depends(pegar_conexao_db),
    usuario_do_login: Usuario = Depends(JWTBearer()),
):
    # Verificar se o livro existe e tem quantidade disponível
    livro = db.query(Livro).filter(Livro.id == livro_id).first()
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")

    carrinhos = buscar_carriho_do_usuario_repo(db, usuario_do_login.id)

    if len(carrinhos) == 0:
        raise HTTPException(status_code=404, detail="Item não encontrado no carrinho")

    carrinho = carrinhos[0]

    if carrinho.quantidade < quantidade:
        raise HTTPException(status_code=400, detail="Quantidade inválida")

    carrinho.quantidade -= quantidade

    if carrinho.quantidade == 0:
        with db as tx:
            tx.delete(carrinho)
            tx.commit()
    else:
        with db as tx:
            tx.add(carrinho)
            tx.commit()

    return Response(status_code=200)


def buscar_carriho_do_usuario_repo(
    db: Session, usuario_id: int
) -> list[tuple[Carrinho, Livro]]:
    from contextos.carrinho.entidade_carrinho import Carrinho
    from contextos.livros.entidade_livro import Livro

    return (
        db.query(Carrinho, Livro)
        .join(Livro, Carrinho.livro_id == Livro.id)
        .filter(Carrinho.usuario_id == usuario_id)
        .all()
    )
