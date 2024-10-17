from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Boolean
from sqlalchemy.orm import relationship
from libs.database.sqlalchemy import _Base
# from contextos.livros.entidade_livro import Livro


class Carrinho(_Base):
    __tablename__ = "carrinho"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    livro_id = Column(Integer, ForeignKey("livros.id"), nullable=False)
    quantidade = Column(Integer, nullable=False)

    # Relacionamento com a tabela de livros
    # livro = relationship("Livro")

    @classmethod
    def criar(cls, usuario_id, livro_id, quantidade):
        return cls(usuario_id=usuario_id, livro_id=livro_id, quantidade=quantidade)

    def atualizar_total(self, preco_livro):
        total = preco_livro * self.quantidade

    # Todo:
    # - coluna livro id unico (unique)
    # - remover coluna e codigo referente ao total

    # api de visualização deve buscar pelo id do usuario (get), id do usuario vai trazer todos os itens associados, é necessário fazer um join entre livro e carrinho:
    # item 1 - fazer verificacao da quantidade de itens no carrinho e a quantidade de livros disponivel
    # item 2 - calcular o preco com base no valor salvo no livro e a quantidade
