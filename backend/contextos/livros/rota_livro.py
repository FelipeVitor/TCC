from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from contextos.livros.entidade_livro import (
    Livro,
)  # Certifique-se de que a entidade Livro esteja importada
from contextos.livros.modelos_livro import CadastrarLivro
from contextos.usuarios.entidade_usuario import Usuario
from libs.autenticacao.config import JWTBearer
from libs.database.sqlalchemy import _Session, pegar_conexao_db

roteador = APIRouter(prefix="/livros", tags=["Livro"])


# Rota para cadastrar livro
@roteador.post("/cadastrar")
def cadastrar_livro(
    body: CadastrarLivro,
    db: _Session = Depends(pegar_conexao_db),
    info_do_login: str = Depends(JWTBearer()),
):
    # Verifica se o autor existe e se é um autor
    usuario = db.query(Usuario).filter(Usuario.id == body.usuario_id).first()

    if not usuario:
        raise HTTPException(status_code=400, detail="Usuário não encontrado.")

    if not usuario.autor:
        raise HTTPException(status_code=400, detail="Usuário não é autor.")

    livro = Livro(
        titulo=body.titulo,
        usuario_id=body.usuario_id,
        genero=body.genero,
        quantidade=body.quantidade,
        preco=body.preco,
        descricao=body.descricao,
        url_imagem=body.url_imagem,
    )

    db.add(livro)
    db.commit()

    return livro


# Rota para listar todos os livros com paginação, iniciando da página 1
@roteador.get("/")
def listar_livros(
    quantidade: int = Query(10, ge=1),
    pagina: int = Query(1, ge=1),
    busca: Optional[str] = Query(None),  # Parâmetro de busca opcional
    db: _Session = Depends(pegar_conexao_db),
):
    # Calcula o offset com base na página e no tamanho da página (ajustando para que a primeira página seja 1)
    offset = (pagina - 1) * quantidade

    # Consulta livros com paginação e faz o join com a tabela Usuario para buscar pelo nome do autor
    consulta = db.query(Livro).join(Usuario, Livro.usuario_id == Usuario.id)

    # Se o parâmetro de busca for fornecido, filtra os livros pelo título ou pelo nome do autor
    if busca:
        busca_formatada = f"%{busca}%"
        consulta = consulta.filter(
            or_(
                Livro.titulo.ilike(busca_formatada),  # Busca pelo título do livro
                Usuario.nome.ilike(busca_formatada),  # Busca pelo nome do autor
            )
        )

    # Executa a consulta com limite e offset
    livros = consulta.offset(offset).limit(quantidade).all()

    # Conta o total de livros filtrados (sem limite e offset)
    total = consulta.count()

    # Calcula o número total de páginas
    total_paginas = (total + quantidade - 1) // quantidade

    # Retorna os livros e a paginação
    return {
        "total": total,
        "tamanho_pagina": quantidade,
        "total_paginas": total_paginas,
        "pagina": pagina,
        "data": livros,
    }


# Rota para obter um livro pelo ID
@roteador.get("/{id}")
def obter_livro(id: int, db: _Session = Depends(pegar_conexao_db)):
    livro = db.query(Livro).filter(Livro.id == id).first()

    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")

    return livro


# Rota para atualizar um livro
@roteador.put("/{id}")
def atualizar_livro(
    id: int,
    body: CadastrarLivro,
    db: _Session = Depends(pegar_conexao_db),
    info_do_login: str = Depends(JWTBearer()),
):
    # Recupera o email do usuário logado
    email_usuario = info_do_login.get("sub")

    # Busca o usuário no banco de dados com base no email
    usuario = db.query(Usuario).filter(Usuario.email.ilike(email_usuario)).first()

    # Verificação se o usuário existe
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # Verificação se o usuário é um autor
    if not usuario.autor:
        raise HTTPException(
            status_code=403, detail="Apenas autores podem atualizar livros."
        )

    # Verificação se o usuário está ativo
    if not usuario.ativo:
        raise HTTPException(status_code=403, detail="Usuário não está ativo.")

    # Verificação se o usuário foi deletado
    if usuario.deletado:
        raise HTTPException(
            status_code=403, detail="Usuário foi deletado e não pode fazer esta ação."
        )

    # Busca o livro no banco de dados pelo ID
    livro = db.query(Livro).filter(Livro.id == id).first()

    # Verifica se o livro existe
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")

    # Verifica se o autor do livro é o mesmo usuário que está tentando atualizar
    if livro.usuario_id != usuario.id:
        raise HTTPException(
            status_code=403, detail="Você não tem permissão para atualizar este livro."
        )

    # Atualiza os atributos do livro
    livro.titulo = body.titulo
    livro.usuario_id = body.usuario_id
    livro.genero = body.genero
    livro.quantidade = body.quantidade
    livro.preco = body.preco
    livro.descricao = body.descricao
    livro.url_imagem = body.url_imagem

    db.add(livro)
    # Salva as alterações no banco de dados
    db.commit()

    return livro


# Rota para deletar um livro
@roteador.delete("/{id}")
def deletar_livro(
    id: int,
    db: _Session = Depends(pegar_conexao_db),
    info_do_login: str = Depends(JWTBearer()),
):
    livro = db.query(Livro).filter(Livro.id == id).first()

    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")

    if livro.deletado:
        raise HTTPException(status_code=304, detail="Livro já foi deletado.")

    livro.deletado = True
    db.add(livro)
    db.commit()

    return Response(status_code=204)  # Retorna 204 No Content após deletar
