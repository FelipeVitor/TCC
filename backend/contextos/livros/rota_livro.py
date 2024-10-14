from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from contextos.livros.entidade_livro import Livro  # Certifique-se de que a entidade Livro esteja importada
from contextos.livros.modelos_livro import CadastrarLivro
from contextos.usuarios.entidade_usuario import Usuario
from libs.database.sqlalchemy import _Session, pegar_conexao_db
from libs.autenticacao.config import JWTBearer

roteador = APIRouter(
    prefix="/livros",
    tags=["livro"]
)


# Rota para cadastrar livro
@roteador.post("/cadastrar")
def cadastrar_livro(body: CadastrarLivro, db: _Session = Depends(pegar_conexao_db), info_do_login: str = Depends(JWTBearer())):
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
        url_imagem=body.url_imagem
    )
    
    db.add(livro)
    db.commit()
    
    return livro

# Rota para listar todos os livros
@roteador.get("/")
def listar_livros(db: _Session = Depends(pegar_conexao_db)):
    livros = db.query(Livro).all()
    return livros

# Rota para obter um livro pelo ID
@roteador.get("/{id}")
def obter_livro(id: int, db: _Session = Depends(pegar_conexao_db)):
    livro = db.query(Livro).filter(Livro.id == id).first()
    
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    
    return livro

# Rota para atualizar um livro
@roteador.put("/{id}")
def atualizar_livro(id: int, body: CadastrarLivro, db: _Session = Depends(pegar_conexao_db), info_do_login: str = Depends(JWTBearer())):
    email_usuario = info_do_login.get("sub")
    usuario = db.query(Usuario).filter(Usuario.email.ilike(email_usuario)).first()

    # to do:
    # verificar se é autor
    # verificar se está ativo
    # verificar se está deletado

    livro = db.query(Livro).filter(Livro.id == id).first()
    
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    
    # Atualiza os atributos do livro
    livro.titulo = body.titulo
    livro.autor_id = body.autor_id
    livro.genero = body.genero
    livro.quantidade = body.quantidade
    livro.preco = body.preco
    livro.descricao = body.descricao
    livro.url_imagem = body.url_imagem
    
    db.commit()
    
    return livro

# Rota para deletar um livro
@roteador.delete("/{id}")
def deletar_livro(id: int, db: _Session = Depends(pegar_conexao_db), info_do_login: str = Depends(JWTBearer())):
    livro = db.query(Livro).filter(Livro.id == id).first()
    
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    
    db.delete(livro)
    db.commit()
    
    return Response(status_code=204)  # Retorna 204 No Content após deletar
