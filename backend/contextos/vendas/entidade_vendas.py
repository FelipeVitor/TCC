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


# Tipo personalizado para UUID com SQLAlchemy e SQLite
class UUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses
    CHAR(36), storing as stringified standard UUID values.
    """

    impl = CHAR
    cache_ok = True  # Define como True para permitir uso seguro em cache

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(uuid.UUID())
        else:
            return dialect.type_descriptor(
                CHAR(36)
            )  # Usamos CHAR(36) para strings padrão de UUID

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        try:
            # Garante que o valor seja um objeto UUID antes de converter para string
            if not isinstance(value, uuid.UUID):
                value = uuid.UUID(str(value))
            return str(value)  # Retorna como string padrão de UUID
        except ValueError as e:
            raise ValueError(
                f"Valor '{value}' não é um UUID válido."
            )  # Erro amigável para casos inválidos

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return uuid.UUID(value)  # Converte a string de volta para um objeto UUID


class Venda(_Base):
    __tablename__ = "vendas"

    id = Column(UUID(), primary_key=True, default=uuid.uuid4, nullable=False)
    data_venda = Column(DateTime, default=datetime.utcnow, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    itens = relationship("VendaItem", back_populates="venda")

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
    venda_id = Column(UUID(), ForeignKey("vendas.id"), nullable=False)
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
