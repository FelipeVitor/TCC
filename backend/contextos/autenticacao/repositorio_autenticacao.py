from typing import Optional

from sqlalchemy.orm import Session

from contextos.carrinho.entidade_carrinho import Carrinho
from contextos.livros.entidade_livro import Livro
from contextos.vendas.entidade_vendas import Venda, VendaItem
from libs.repository.repositorio_interface import IRepository
from contextos.usuarios.entidade_usuario import Usuario


class AutenticacaoRepository(IRepository):
    def __init__(self, db: Session):
        self.db = db

    def buscar_usuario_por_email(self, usuario_email: str) -> Optional[Usuario]:
        # usuario = db.query(Usuario).filter(Usuario.email.ilike(body.email)).first()
        consulta = self.db.query(Usuario)
        consulta = consulta.filter(Usuario.email.ilike(usuario_email))
        usuario = consulta.first()
        return usuario
