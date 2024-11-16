from typing import Optional

from sqlalchemy.orm import Session

from contextos.carrinho.entidade_carrinho import Carrinho
from contextos.livros.entidade_livro import Livro
from contextos.vendas.entidade_vendas import Venda, VendaItem
from libs.repository.repositorio_interface import IRepository


class VendaRepository(IRepository):
    def __init__(self, db: Session):
        self.db = db

    # start tx
    def __enter__(self):
        self.tx = self.db.begin()
        self.commit_tx = False
        return self

    # end tx
    def __exit__(self, exc_type, exc_val, exc_tb):
        if not self.commit_tx:
            self.tx.commit()
        else:
            self.tx.rollback()

    def buscar_vendas_do_usuario(self, usuario_id: int) -> list[Venda]:
        consulta = self.db.query(VendaItem)
        consulta = consulta.join(Livro, VendaItem.livro_id == Livro.id)
        consulta = consulta.filter(Livro.usuario_id == usuario_id)
        vendas_do_autor = consulta.all()
        return vendas_do_autor

    def buscar_compras_do_usuario(self, usuario_id: int) -> list[Venda]:
        consulta = self.db.query(Venda)
        consulta = consulta.filter(Venda.id_usuario_comprador == usuario_id)
        compras = consulta.all()
        return compras

    def buscar_livro_por_id(self, livro_id: int) -> Optional[Livro]:
        livro = self.db.query(Livro).filter(Livro.id == livro_id).first()
        return livro

    def buscar_carrinho_do_usuario(
        self, usuario_id: int
    ) -> list[tuple[Carrinho, Livro]]:
        consulta = self.db.query(Carrinho, Livro)
        consulta = consulta.join(Livro, Carrinho.livro_id == Livro.id)
        consulta = consulta.filter(Carrinho.usuario_id == usuario_id)
        carrinho = consulta.all()
        return carrinho

    def salvar_venda_e_livro(self, venda: Venda, livro: Livro):
        self.db.add(venda)
        self.db.add(livro)
        self.db.commit()
