from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


_Base = declarative_base()

# Criar uma conexão com o banco de dados SQLite
engine = create_engine("sqlite:///banco-de-dados.db", echo=True)

# Criar as tabelas no banco de dados
_Base.metadata.create_all(engine)

# Configurar o session maker
_Session = sessionmaker(bind=engine)
session = _Session()


# Função para obter a sessão do banco de dados
def pegar_conexao_db():
    db = _Session()
    try:
        print("Abrindo a conexão com o banco de dados")
        yield db
        print("Você está indo para o bloco finally, pois o yield foi executado")
    finally:
        print("Fechando a conexão com o banco de dados")
        db.close()


def criar_tabela():
    from contextos.usuarios.entidade_usuario import Usuario
    from contextos.livros.entidade_livro import Livro

    _Base.metadata.create_all(engine)

    usuario = Usuario.criar(
        nome="Eli",
        sobrenome="Oto",
        data_nascimento=date.today(),
        email="a@b.com",
        senha="1234",
    )
    usuario.id = 2
    try:
        db = _Session()
        db.add(usuario)
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

        db = _Session()
        db.add_all(livros)
        db.commit()

    except Exception as e:
        e
        pass
