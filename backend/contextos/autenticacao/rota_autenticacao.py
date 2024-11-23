from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from contextos.autenticacao.modelos_autenticacao import LoginData, TokenData
from libs.database.sqlalchemy import pegar_conexao_db
from contextos.autenticacao.repositorio_autenticacao import AutenticacaoRepository
from contextos.autenticacao.services_autenticacao import AutenticacaoService

roteador = APIRouter(prefix="/autenticacao", tags=["Autenticação"])


@roteador.post("/login")
def login(body: LoginData, db: Session = Depends(pegar_conexao_db)) -> TokenData:
    repo_autenticacao = AutenticacaoRepository(db=db)
    servico_autenticacao = AutenticacaoService(repo_autenticacao)

    token = servico_autenticacao.verificar_login(email=body.email, senha=body.senha)

    return TokenData(access_token=token, token_type="bearer")
