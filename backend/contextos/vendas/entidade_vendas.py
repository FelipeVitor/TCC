import uuid
from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    Numeric,
    DateTime,
)
from sqlalchemy.orm import relationship
from libs.database.sqlalchemy import _Base
from datetime import datetime
from sqlalchemy.types import TypeDecorator, CHAR, TEXT

from sqlalchemy import types
from typing import Optional, Type


# class UUID(types.UserDefinedType):
#     cache_ok = True
#     __visit_name__ = "UUID"

#     def __init__(self, class_type: Optional[Type[uuid.UUID]] = None):
#         if class_type:
#             assert issubclass(class_type, uuid.UUID), ValueError(
#                 "Deve ser subclasse de uuid.UUID"
#             )
#             self.class_type = class_type
#         else:
#             self.class_type = uuid.UUID
#         self.as_uuid = True

#     def bind_processor(self, dialect):
#         def process(value):
#             if value is not None:
#                 value = str(value)
#             return value

#         return process

#     def result_processor(self, dialect, coltype):
#         def process(value):
#             if value is not None:
#                 # No SQLite, o valor de retorno pode ser um string, então é necessário converter para uuid.UUID
#                 try:
#                     value = (
#                         self.class_type(value)
#                         if not isinstance(value, self.class_type)
#                         else value
#                     )
#                 except ValueError:
#                     return None
#             return value

#         return process

#     def get_col_spec(self, **kw):
#         # Para SQLite, um tipo de coluna adequado para armazenar UUIDs é TEXT
#         return "TEXT"


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
