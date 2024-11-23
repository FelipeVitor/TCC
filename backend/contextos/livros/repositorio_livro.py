from typing import Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from contextos.livros.entidade_livro import Livro
from contextos.usuarios.entidade_usuario import Usuario
from libs.repository.repositorio_interface import IRepository


class LivroRepository(IRepository):
    def __init__(self, db: Session):
        self.db = db

    def buscar_paginada_de_livros_ativos_com_autor_opcional(
        self,
        pagina: int,
        quantidade: int,
        filtro: Optional[str],
        usuario: Optional[int] = None,
    ) -> tuple[list[Livro], int, int]:
        consulta = self.db.query(Livro)
        consulta = consulta.filter(Livro.deletado == False)

        if filtro:
            consulta = consulta.filter(
                or_(
                    Livro.titulo.ilike(filtro),
                    Usuario.nome.ilike(filtro),
                )
            )

        if usuario:
            consulta = consulta.filter(Livro.usuario_id == usuario)

        total_de_livros = consulta.count()

        consulta = consulta.limit(quantidade).offset((pagina - 1) * quantidade)

        livros = consulta.all()

        total_de_paginas = (total_de_livros + quantidade - 1) // quantidade

        return livros, total_de_livros, total_de_paginas

    def buscar_livro_por_id(self, livro_id: int) -> Livro:
        return self.db.query(Livro).filter(Livro.id == livro_id).first()

    def atualizar_livro(self, livro: Livro) -> Livro:
        self.db.add(livro)
        self.db.commit()
        return livro

    def cadastrar_livro(self, livro: Livro) -> Livro:
        self.db.add(livro)
        self.db.commit()
        return livro
