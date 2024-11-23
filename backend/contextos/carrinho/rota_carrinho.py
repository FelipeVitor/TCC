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
from contextos.carrinho.repositorio_carrinho import (
    CarrinhoRepository,
)
from contextos.carrinho.services_carrinho import CarrinhoService

roteador = APIRouter(prefix="/carrinho", tags=["Carrinho"])


@roteador.post("/adicionar")
def adicionar_item_no_carrinho(
    item: AdicionarItemCarrinho,
    db: Session = Depends(pegar_conexao_db),
    usuario_do_login: Usuario = Depends(JWTBearer()),
):
    repo_carrinho = CarrinhoRepository(db=db)
    servico_carrinho = CarrinhoService(repo_carrinho)

    servico_carrinho.adicionar_item_no_carrinho(
        livro_id=item.livro_id,
        usuario_id=usuario_do_login.id,
        quantidade_item=item.quantidade,
    )

    return Response(status_code=200)


# Endpoint para visualizar o carrinho
@roteador.get("/")
def buscar_carrinho_do_usuario(
    db: Session = Depends(pegar_conexao_db),
    usuario_do_login: Usuario = Depends(JWTBearer()),
) -> CarrinhoFinal:
    repo_carrinho = CarrinhoRepository(db=db)
    servico_carrinho = CarrinhoService(repo_carrinho)

    carrinho_final = servico_carrinho.buscar_carrinho_do_usuario(
        usuario_id=usuario_do_login.id
    )

    return carrinho_final


# Endpoint para adicionar um item ao carrinho
@roteador.delete("/remover-item/{livro_id}/{quantidade}")
def remover_item_no_carrinho(
    livro_id: int,
    quantidade: int,
    db: Session = Depends(pegar_conexao_db),
    usuario_do_login: Usuario = Depends(JWTBearer()),
):
    repo_carrinho = CarrinhoRepository(db=db)
    servico_carrinho = CarrinhoService(repo_carrinho)

    servico_carrinho.remover_item_no_carrinho(
        livro_id=livro_id,
        quantidade=quantidade,
        usuario_id=usuario_do_login.id,
    )

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
