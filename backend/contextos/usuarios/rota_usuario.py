from fastapi import APIRouter, Depends, HTTPException, Response

from contextos.usuarios.entidade_usuario import Usuario
from contextos.usuarios.modelos_usuario import CadastrarUsuario
from libs.autenticacao.config import JWTBearer
from libs.database.sqlalchemy import _Session, pegar_conexao_db

roteador = APIRouter(
    prefix="/usuarios",
    tags=["usuario"]
)


#Rota para cadastrar usuário
@roteador.post("/cadastrar")
def cadastrar_usuario(body: CadastrarUsuario, db: _Session = Depends(pegar_conexao_db), info_do_login: str = Depends(JWTBearer())):
    existe_usuario_no_banco = db.query(Usuario).filter(Usuario.email == body.email).first()
    
    if existe_usuario_no_banco:
        raise HTTPException(status_code=400, detail="Usuário já cadastrado")
    
    usuario = Usuario(       
        email = body.email,
        nome = body.nome,
        sobrenome = body.sobrenome,
        senha = body.senha,
        data_nascimento = body.data_nascimento,
    )
    
    db.add(usuario)
    db.commit()

    return usuario


@roteador.post("/ativar/autor/{id}")
def ativar_autor(id: int, db: _Session = Depends(pegar_conexao_db), info_do_login: str = Depends(JWTBearer())):
    existe_usuario_no_banco = db.query(Usuario).filter(Usuario.id == id).first()
    
    if not existe_usuario_no_banco:
        raise HTTPException(status_code=400, detail="Usuário não encontrado")
    
    existe_usuario_no_banco: Usuario
    
    existe_usuario_no_banco.autor = True

    db.add(existe_usuario_no_banco)
    db.commit()
    
    return Response(status_code=200)