from fastapi import Depends, HTTPException, APIRouter, Response
from sqlalchemy.orm import Session
from libs.database.sqlalchemy import _Session, pegar_conexao_db
from libs.autenticacao.config import JWTBearer
from contextos.livros.entidade_livro import Livro
from contextos.usuarios.entidade_usuario import Usuario
from contextos.carrinho.modelo_carrinho import AdicionarItemCarrinho
from contextos.carrinho.entidade_carrinho import Carrinho


roteador = APIRouter(prefix="/carrinho", tags=["carrinho"])


# Endpoint para adicionar um item ao carrinho
@roteador.post("/carrinho/adicionar")
def adicionar_item_carrinho(
    item: AdicionarItemCarrinho,
    db: _Session = Depends(pegar_conexao_db),
    info_do_login: str = Depends(JWTBearer()),
):
    usuario_email = info_do_login.get("sub")
    usuario = db.query(Usuario).filter(Usuario.email.ilike(usuario_email)).first()

    # Verificar se o livro existe e tem quantidade disponível
    livro = db.query(Livro).filter(Livro.id == item.livro_id).first()
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")

    livro: Livro

    if livro.quantidade < item.quantidade:
        raise HTTPException(
            status_code=400, detail="Quantidade insuficiente em estoque"
        )

    carrinho = Carrinho.criar(
        usuario_id=usuario.id,
        livro_id=livro.id,
        quantidade=item.quantidade,
    )

    carrinho.atualizar_total(preco_livro=livro.preco)

    db.add(carrinho)
    db.commit()

    return Response(status_code=200)


@roteador.get("/carrinho/visualizar_carrinho")
def buscar_carrinho_com_livros(
    db: _Session = Depends(pegar_conexao_db),
    info_do_login: str = Depends(JWTBearer()),
):
    usuario_email = info_do_login.get("sub")
    usuario = db.query(Usuario).filter(Usuario.email.ilike(usuario_email)).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    carrinhos_com_livros = (
        db.query(Carrinho, Livro)
        .join(Livro, Carrinho.livro_id == Livro.id)
        .filter(Carrinho.usuario_id == usuario.id)
        .all()
    )

    # Retorna os dados formatados
    resultado = []
    for carrinho, livro in carrinhos_com_livros:
        resultado.append(
            {
                "livro": {
                    "id": livro.id,
                    "titulo": livro.titulo,
                    "preco": livro.preco,
                    "genero": livro.genero,
                    "descricao": livro.descricao,
                },
                "carrinho": {
                    "quantidade": carrinho.quantidade,
                },
            }
        )

    return resultado
