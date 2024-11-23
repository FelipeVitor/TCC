from datetime import date
from typing import Type

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.session import Session

_Base = declarative_base()

# Criar uma conexão com o banco de dados SQLite
engine = create_engine("sqlite:///banco-de-dados.db", echo=False)

# Criar as tabelas no banco de dados
_Base.metadata.create_all(engine)

# Configurar o session maker
Sessao = sessionmaker(bind=engine)
SessaoType = Type[Sessao]

session = Sessao()


# Função para obter a sessão do banco de dados
def pegar_conexao_db() -> Session:
    db = Sessao()
    try:
        yield db
    finally:
        db.close()


def popular_tabela():
    from contextos.livros.entidade_livro import Livro
    from contextos.usuarios.entidade_usuario import Usuario
    from contextos.vendas.entidade_vendas import Venda, VendaItem

    usuario = Usuario.criar(
        nome="Westo",
        sobrenome="Coto",
        data_nascimento=date.today(),
        email="westo@coto.com",
        senha="1234",
    )
    usuario.id = 2

    usuario_admin = Usuario.criar(
        nome="admin",
        sobrenome="livraria",
        data_nascimento=date.today(),
        email="admin@email.com",
        senha="1234",
    )
    usuario_admin.id = 1

    try:
        db = Sessao()
        db.add(usuario)
        db.add(usuario_admin)
        db.commit()
    except Exception as e:
        e
        pass
    finally:
        db.close()

    try:
        livros = []
        for x in range(100):
            livro = Livro.criar(
                titulo=f"Livro {x}",
                descricao=f"Descricao do livro hype {x}",
                genero=f"Genero {x}",
                preco=x,
                quantidade=x,
                usuario_id=1,
                url_imagem=f"Imagem {x}",
            )
            livros.append(livro)

        db = Sessao()
        db.add_all(livros)
        db.commit()

    except Exception as e:
        e
        pass

    try:
        db = Sessao()
        livros = db.query(Livro).limit(5).all()

        venda = Venda.criar(id_usuario_comprador=2)

        for livro in livros:
            item = VendaItem.criar(
                venda_id=venda.id,
                livro_id=livro.id,
                quantidade=2,
                preco_unitario=livro.preco,
            )
            venda.adicionar_item(item)

        db = Sessao()
        db.add(venda)
        db.commit()

    except Exception as e:
        e
        pass

    db = Sessao()
    x = db.query(Venda).first()
    x


def criar_tabela():
    from contextos.livros.entidade_livro import Livro
    from contextos.usuarios.entidade_usuario import Usuario
    from contextos.vendas.entidade_vendas import Venda, VendaItem

    _Base.metadata.create_all(engine)
