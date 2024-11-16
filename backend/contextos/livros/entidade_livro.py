from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    Numeric,
    String,
    create_engine,
)

from libs.database.sqlalchemy import _Base


class Livro(_Base):
    __tablename__ = "livros"

    id = Column(Integer, primary_key=True, autoincrement=True)
    titulo = Column(String(200), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    genero = Column(String(100), nullable=False)
    quantidade = Column(Integer, nullable=False)
    preco = Column(Numeric(10, 2), nullable=False)
    descricao = Column(String(250), nullable=False)
    url_imagem = Column(String(), nullable=False)
    deletado = Column(Boolean, default=False, nullable=False)

    @classmethod
    def criar(
        cls, titulo, usuario_id, genero, quantidade, preco, descricao, url_imagem
    ):
        return cls(
            titulo=titulo,
            usuario_id=usuario_id,
            genero=genero,
            quantidade=quantidade,
            preco=preco,
            descricao=descricao,
            url_imagem=url_imagem,
            deletado=False,
        )

    def decrementar_quantidade_disponivel(self, quantidade: int = 1):
        self.quantidade -= quantidade

    def __repr__(self):
        return f"<Livro {self.id} - {self.usuario_id} - {self.titulo} - {self.quantidade} - {self.preco} >"
