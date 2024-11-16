from typing import Optional

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from contextos.livros.entidade_livro import (
    Livro,
)  # Certifique-se de que a entidade Livro esteja importada
from contextos.livros.modelos_livro import (
    CadastrarLivro,
    LivroRetorno,
    RetonoPaginaLivros,
)
from contextos.livros.repositorio_livro import LivroRepository
from contextos.livros.services_livro import LivroService
from contextos.usuarios.entidade_usuario import Usuario
from libs.autenticacao.config import JWTBearer
from libs.database.sqlalchemy import pegar_conexao_db

roteador = APIRouter(prefix="/livros", tags=["Livro"])


# Rota para cadastrar livro
@roteador.post("/cadastrar")
def cadastrar_livro(
    body: CadastrarLivro,
    db: Session = Depends(pegar_conexao_db),
    usuario_do_login: Usuario = Depends(JWTBearer()),
):
    repo_livro = LivroRepository(db=db)
    servico_livro = LivroService(repo_livro)

    livro = servico_livro.cadastrar_livro(dados_do_livro=body, usuario=usuario_do_login)

    return livro


@roteador.get("/")
def listar_livros(
    quantidade: int = Query(10, ge=1),
    pagina: int = Query(1, ge=1),
    busca: Optional[str] = Query(None),  # Parâmetro de busca opcional
    db: Session = Depends(pegar_conexao_db),
) -> RetonoPaginaLivros:
    repo_livro = LivroRepository(db=db)
    servico_livro = LivroService(repo_livro)

    retorno_paginado = servico_livro.buscar_de_livros_paginado(
        pagina=pagina, quantidade=quantidade, filtro=busca
    )
    return retorno_paginado


@roteador.get("/obter-livros/{id}")
def obter_livro(id: int, db: Session = Depends(pegar_conexao_db)):
    repo_livro = LivroRepository(db=db)
    servico_livro = LivroService(repo_livro)

    livro = servico_livro.buscar_livro_por_id(id)

    return livro


# Rota para atualizar um livro
@roteador.put("/editar/{id}")
def atualizar_livro(
    id: int,
    body: CadastrarLivro,
    db: Session = Depends(pegar_conexao_db),
    usuario_do_login: Usuario = Depends(JWTBearer()),
) -> Optional[LivroRetorno]:
    repo_livro = LivroRepository(db=db)
    servico_livro = LivroService(repo_livro)

    livro = servico_livro.atualizar_livro_existente(
        livro_id=id,
        dados_atualizados=body,
        usuario=usuario_do_login,
    )

    return livro


@roteador.delete("/{id}")
def deletar_livro(
    id: int,
    db: Session = Depends(pegar_conexao_db),
    usuario_do_login: Usuario = Depends(JWTBearer()),
):
    repo_livro = LivroRepository(db=db)
    servico_livro = LivroService(repo_livro)

    servico_livro.deletar_livro(livro_id=id, usuario=usuario_do_login)

    return Response(status_code=204)


@roteador.get("/livros-do-autor")
def listar_livros_do_autor(
    quantidade: int = Query(10, ge=1),
    pagina: int = Query(1, ge=1),
    db: Session = Depends(pegar_conexao_db),
    usuario_do_login: Usuario = Depends(JWTBearer()),
):
    repo_livro = LivroRepository(db=db)
    servico_livro = LivroService(repo_livro)

    livros = servico_livro.buscar_de_livros_paginado(
        filtro=None,
        pagina=pagina,
        quantidade=quantidade,
        usuario=usuario_do_login,
    )

    return livros
