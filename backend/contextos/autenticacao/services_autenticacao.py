from contextos.autenticacao.repositorio_autenticacao import AutenticacaoRepository
from fastapi import HTTPException
from libs.autenticacao.config import criar_token_de_acesso_a_rotas_protegidas


class AutenticacaoService:
    def __init__(self, repo: AutenticacaoRepository):
        self.repository: AutenticacaoRepository = repo

    def verificar_login(self, email: str, senha: str):
        usuario = self.repository.buscar_usuario_por_email(usuario_email=email)

        if usuario is None:
            raise HTTPException(
                status_code=400, detail="Não foi possível encontrar o usuário"
            )

        if not usuario.senha == senha:
            raise HTTPException(status_code=400, detail="Senha incorreta")

        token = criar_token_de_acesso_a_rotas_protegidas(
            data={"sub": usuario.email, "id": usuario.id}
        )

        return token
