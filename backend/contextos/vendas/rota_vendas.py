from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from contextos.livros.entidade_livro import Livro
from contextos.usuarios.entidade_usuario import Usuario
from contextos.vendas.entidade_vendas import Venda, VendaItem
from libs.autenticacao.config import JWTBearer
from libs.database.sqlalchemy import pegar_conexao_db

roteador = APIRouter(prefix="/venda", tags=["Venda"])


# Endpoint para adicionar um item ao carrinho
@roteador.post("/comprar-do-carrinho")
def finalizar_compra_pelo_carrinho(
    db: Session = Depends(pegar_conexao_db),
    info_do_login: str = Depends(JWTBearer()),
):
    from contextos.carrinho.rota_carrinho import buscar_carriho_do_usuario_repo

    usuario_email = info_do_login.get("sub")
    usuario: Usuario = (
        db.query(Usuario).filter(Usuario.email.ilike(usuario_email)).first()
    )

    carrinho_items = buscar_carriho_do_usuario_repo(db=db, usuario_id=usuario.id)

    with db as tx:
        venda = Venda.criar(usuario_id=usuario.id)

        for carrinho, livro in carrinho_items:
            venda_item = VendaItem.criar(
                venda_id=venda.id,
                livro_id=livro.id,
                quantidade=carrinho.quantidade,
                preco_unitario=livro.preco,
            )
            venda.adicionar_item(venda_item)

            # Remover item do estoque
            if livro.quantidade < carrinho.quantidade:
                raise HTTPException(
                    status_code=400,
                    detail=f"Quantidade insuficiente do livro {livro.titulo}, restam apenas {livro.quantidade} unidades, você tentou comprar {carrinho.quantidade}, por favor, atualize a quantidade do livro no carrinho.",
                )

            if livro.id != carrinho.livro_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"O livro {livro.titulo} não corresponde ao livro no carrinho.",
                )

            livro.quantidade -= carrinho.quantidade

            tx.delete(carrinho)

        tx.add(venda)

        tx.commit()

    return Response(status_code=200)


# Endpoint para adicionar um item ao carrinho
@roteador.post("/venda-direta/{livro_id}")
def finalizar_venda_direta(
    livro_id: int,
    db: Session = Depends(pegar_conexao_db),
    info_do_login: str = Depends(JWTBearer()),
):
    usuario_email = info_do_login.get("sub")
    usuario: Usuario = (
        db.query(Usuario).filter(Usuario.email.ilike(usuario_email)).first()
    )

    livro = db.query(Livro).filter(Livro.id == livro_id).first()

    with db as tx:
        venda = Venda.criar(usuario_id=usuario.id)

        venda_item = VendaItem.criar(
            venda_id=venda.id,
            livro_id=livro.id,
            quantidade=1,
            preco_unitario=livro.preco,
        )
        venda.adicionar_item(venda_item)

        # Remover item do estoque
        if livro.quantidade < 1:
            raise HTTPException(
                status_code=400,
                detail=f"Quantidade insuficiente do livro {livro.titulo}, restam apenas {livro.quantidade} unidades, você tentou comprar 1, por favor, atualize a quantidade do livro no carrinho.",
            )

        livro.quantidade -= 1

        tx.add(venda)

        tx.commit()

    return Response(status_code=200)


# Endpoint para listar todas as vendas
@roteador.get("/listar")
def listar_vendas(
    db: Session = Depends(pegar_conexao_db),
    info_do_login: str = Depends(JWTBearer()),
):
    usuario_email = info_do_login.get("sub")
    usuario: Usuario = (
        db.query(Usuario).filter(Usuario.email.ilike(usuario_email)).first()
    )

    vendas = db.query(Venda).filter(Venda.usuario_id == usuario.id).all()

    return vendas
