import uuid
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from libs.database.sqlalchemy import _Base
from libs.database.uuid import BaseUUID


class Compra(_Base):
    __tablename__ = "compras"

    id = Column(BaseUUID(), primary_key=True, index=True)
    venda_id = Column(BaseUUID(), ForeignKey("vendas.id"))
    data_compra = Column(DateTime, default=datetime.utcnow)

    venda = relationship("Venda", back_populates="compra")

    @classmethod
    def criar(cls, venda_id):
        return cls(
            id=uuid.uuid4(),
            venda_id=venda_id,
            data_compra=datetime.utcnow(),
        )
