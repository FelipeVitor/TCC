import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    types,
)
from sqlalchemy.orm import relationship
from sqlalchemy.types import CHAR, TypeDecorator

from libs.database.sqlalchemy import _Base
from libs.database.uuid import BaseUUID


class Venda(_Base):
    __tablename__ = "vendas"

    id = Column(BaseUUID(), primary_key=True, default=uuid.uuid4, nullable=False)
    data_venda = Column(DateTime, default=datetime.utcnow, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    itens = relationship("VendaItem", back_populates="venda")
    compra = relationship("Compra", uselist=False, back_populates="venda")

    @classmethod
    def criar(cls, usuario_id):
        venda = cls(
            id=uuid.uuid4(),
            usuario_id=usuario_id,
        )

        return venda

    def adicionar_item(self, item):
        self.itens.append(item)

    @property
    def total_da_venda(self):
        return sum([item.preco_unitario * item.quantidade for item in self.itens])


class VendaItem(_Base):
    __tablename__ = "venda_item"

    id = Column(Integer, primary_key=True, autoincrement=True)
    venda_id = Column(BaseUUID(), ForeignKey("vendas.id"), nullable=False)
    livro_id = Column(Integer, ForeignKey("livros.id"), nullable=False)
    quantidade = Column(Integer, nullable=False)
    preco_unitario = Column(Numeric(10, 2), nullable=False)

    venda = relationship("Venda", back_populates="itens")
    livro = relationship("Livro", backref="venda_itens")

    @classmethod
    def criar(cls, venda_id, livro_id, quantidade, preco_unitario):
        return cls(
            venda_id=venda_id,
            livro_id=livro_id,
            quantidade=quantidade,
            preco_unitario=preco_unitario,
        )
