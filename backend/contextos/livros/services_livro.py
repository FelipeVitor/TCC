from typing import Optional
from uuid import UUID

from fastapi import HTTPException

from contextos.livros.entidade_livro import Livro
from contextos.livros.modelos_livro import (
    CadastrarLivro,
    LivroRetorno,
    RetonoPaginaLivros,
)
from contextos.livros.repositorio_livro import LivroRepository
from contextos.usuarios.entidade_usuario import Usuario


class LivroService:
    def __init__(self, repo: LivroRepository):
        self.repository = repo

    def cadastrar_livro(
        self, dados_do_livro: CadastrarLivro, usuario: Usuario
    ) -> LivroRetorno:
        if not usuario.autor:
            raise HTTPException(
                status_code=403,
                detail="Usuário não tem permissão para cadastrar livro, já que não é autor.",
            )

        livro = Livro.criar(
            usuario_id=usuario.id,
            preco=dados_do_livro.preco,
            genero=dados_do_livro.genero,
            titulo=dados_do_livro.titulo,
            descricao=dados_do_livro.descricao,
            quantidade=dados_do_livro.quantidade,
            url_imagem=dados_do_livro.url_imagem,
        )

        livro = self.repository.cadastrar_livro(livro=livro)

        return LivroRetorno(
            id=livro.id,
            preco=livro.preco,
            titulo=livro.titulo,
            genero=livro.genero,
            deletado=livro.deletado,
            descricao=livro.descricao,
            usuario_id=livro.usuario_id,
            quantidade=livro.quantidade,
            url_imagem=livro.url_imagem,
        )

    def buscar_de_livros_paginado(
        self,
        pagina: int,
        quantidade: int,
        filtro: Optional[str] = None,
        usuario: Optional[Usuario] = None,
    ) -> RetonoPaginaLivros:
        livros, total_livros, total_paginas = (
            self.repository.buscar_paginada_de_livros_ativos_com_autor_opcional(
                pagina,
                quantidade,
                filtro,
                usuario.id if usuario else None,
            )
        )

        retorno = RetonoPaginaLivros(
            data=[
                LivroRetorno(
                    id=livro.id,
                    preco=livro.preco,
                    titulo=livro.titulo,
                    genero=livro.genero,
                    deletado=livro.deletado,
                    descricao=livro.descricao,
                    usuario_id=livro.usuario_id,
                    quantidade=livro.quantidade,
                    url_imagem=livro.url_imagem,
                )
                for livro in livros
            ],
            pagina=pagina,
            total=total_livros,
            tamanho_pagina=quantidade,
            total_paginas=total_paginas,
        )

        return retorno

    def buscar_livro_por_id(self, livro_id: int) -> Optional[LivroRetorno]:
        livro = self.repository.buscar_livro_por_id(livro_id)

        if not livro:
            raise HTTPException(status_code=404, detail="Livro não encontrado.")

        return LivroRetorno(
            id=livro.id,
            preco=livro.preco,
            titulo=livro.titulo,
            genero=livro.genero,
            deletado=livro.deletado,
            descricao=livro.descricao,
            usuario_id=livro.usuario_id,
            quantidade=livro.quantidade,
            url_imagem=livro.url_imagem,
        )

    def atualizar_livro_existente(
        self,
        livro_id: int,
        usuario: Usuario,
        dados_atualizados: CadastrarLivro,
    ) -> LivroRetorno:
        if not usuario.autor:
            raise HTTPException(
                status_code=403,
                detail="Usuário não tem permissão para atualizar livro, já que não é autor.",
            )

        livro = self.repository.buscar_livro_por_id(livro_id)

        if not livro:
            raise HTTPException(status_code=404, detail="Livro não encontrado.")

        if livro.usuario_id != usuario.id:
            raise HTTPException(
                status_code=403,
                detail="Usuário não tem permissão para atualizar livro, já que não é dono do livro.",
            )

        if not livro:
            raise HTTPException(status_code=404, detail="Livro não encontrado.")

        for campo, valor in dados_atualizados.dict().items():
            # os nomes devem ser iguais aos do modelo para atualizar automaticamente
            setattr(livro, campo, valor)

        livro_atualizado = self.repository.atualizar_livro(livro)

        return LivroRetorno(
            id=livro_atualizado.id,
            preco=livro_atualizado.preco,
            titulo=livro_atualizado.titulo,
            genero=livro_atualizado.genero,
            deletado=livro_atualizado.deletado,
            descricao=livro_atualizado.descricao,
            usuario_id=livro_atualizado.usuario_id,
            quantidade=livro_atualizado.quantidade,
            url_imagem=livro_atualizado.url_imagem,
        )

    def deletar_livro(self, livro_id: int, usuario: Usuario) -> UUID:
        if not usuario.autor:
            raise HTTPException(
                status_code=403,
                detail="Usuário não tem permissão para deletar livro, já que não é autor.",
            )

        livro = self.repository.buscar_livro_por_id(livro_id)

        if not livro:
            raise HTTPException(status_code=404, detail="Livro não encontrado.")

        if livro.usuario_id != usuario.id:
            raise HTTPException(
                status_code=403,
                detail="Usuário não tem permissão para deletar livro, já que não é dono do livro.",
            )

        livro.deletar()
        self.repository.atualizar_livro(livro)

        return None
