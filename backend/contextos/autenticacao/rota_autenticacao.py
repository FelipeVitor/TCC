from fastapi import APIRouter, Depends, HTTPException

from contextos.autenticacao.modelos_autenticacao import LoginData, TokenData
from contextos.usuarios.entidade_usuario import Usuario
from libs.autenticacao.config import criar_token_de_acesso_a_rotas_protegidas
from libs.database.sqlalchemy import _Session, pegar_conexao_db

roteador = APIRouter(prefix="/autenticacao", tags=["Autenticação"])


@roteador.post("/login")
def login(body: LoginData, db: _Session = Depends(pegar_conexao_db)) -> TokenData:
    usuario = db.query(Usuario).filter(Usuario.email.ilike(body.email)).first()
    usuario.deletado = False

    db.add(usuario)
    db.commit()
    if usuario is None:
        raise HTTPException(
            status_code=400, detail="Não foi possível encontrar o usuário"
        )

    if not usuario.senha == body.senha:
        raise HTTPException(status_code=400, detail="Senha incorreta")

    token = criar_token_de_acesso_a_rotas_protegidas(data={"sub": usuario.email})

    return TokenData(access_token=token, token_type="bearer")
