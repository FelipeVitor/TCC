from sqlalchemy import create_engine, Column, Integer, String, Date, Boolean
from libs.database.sqlalchemy import _Base


class Usuario(_Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    sobrenome = Column(String(100), nullable=False)
    data_nascimento = Column(Date, nullable=False)
    email = Column(String(256), nullable=False, unique=True)
    ativo = Column(Boolean, default=True, nullable=False)
    deletado = Column(Boolean, default=False, nullable=False)
    senha = Column(String(255), nullable=False)
    autor = Column(Boolean, default=False, nullable=False)

    @classmethod
    def criar(cls, nome, sobrenome, data_nascimento, email, senha):
        return cls(
            nome=nome,
            sobrenome=sobrenome,
            data_nascimento=data_nascimento,
            email=email,
            ativo=True,
            deletado=False,
            senha=senha,
        )

    def __repr__(self):
        return f"<Usuario {self.id} - {self.nome} {self.sobrenome} - {self.ativo} - {self.deletado} >"
