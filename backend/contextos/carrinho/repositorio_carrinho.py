from typing import Optional

from sqlalchemy.orm import Session

from contextos.carrinho.entidade_carrinho import Carrinho
from contextos.livros.entidade_livro import Livro
from contextos.vendas.entidade_vendas import Venda, VendaItem
from libs.repository.repositorio_interface import IRepository
from contextos.usuarios.entidade_usuario import Usuario


class CarrinhoRepository(IRepository):
    def __init__(self, db: Session):
        self.db = db

    def buscar_livro_por_usuario(self, livro_id: str) -> Optional[Livro]:
        consulta = self.db.query(Livro)
        consulta = consulta.filter(Livro.id == livro_id)
        livro = consulta.first()
        return livro

    def buscar_carrinhos_do_usuario(
        self, livro_id: int, usuario_id: int
    ) -> list[Carrinho]:
        consulta = self.db.query(Carrinho)
        consulta = consulta.filter(Carrinho.livro_id == livro_id)
        consulta = consulta.filter(Carrinho.usuario_id == usuario_id)
        consulta = consulta.all()
        return consulta

    def buscar_carrinho_do_usuario(
        self, usuario_id: int
    ) -> list[tuple[Carrinho, Livro]]:
        consulta = self.db.query(Carrinho, Livro)
        consulta = consulta.join(Livro, Carrinho.livro_id == Livro.id)
        consulta = consulta.filter(Carrinho.usuario_id == usuario_id)
        carrinho = consulta.all()
        return carrinho

    def buscar_carrinho_por_id_e_livro_id(
        self,
        usuario_id: int,
        livro_id: int,
    ) -> Optional[tuple[Carrinho, Livro]]:
        consulta = self.db.query(Carrinho, Livro)
        consulta = consulta.join(Livro, Carrinho.livro_id == Livro.id)
        consulta = consulta.filter(Carrinho.usuario_id == usuario_id)
        consulta = consulta.filter(Carrinho.livro_id == livro_id)
        carrinho = consulta.first()
        return carrinho

    def buscar_livro_por_id(self, livro_id: int) -> Optional[Livro]:
        consulta = self.db.query(Livro)
        consulta = consulta.filter(Livro.id == livro_id)
        livro = consulta.first()
        return livro
