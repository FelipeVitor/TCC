from contextos.carrinho.repositorio_carrinho import CarrinhoRepository
from fastapi import HTTPException
from libs.autenticacao.config import criar_token_de_acesso_a_rotas_protegidas
from contextos.carrinho.entidade_carrinho import Carrinho
from contextos.livros.entidade_livro import Livro
from contextos.carrinho.modelo_carrinho import (
    CarrinhoFinal,
    LivroRetorno,
    CarrinhoItem,
    CarrinhoRetorno,
)


class CarrinhoService:
    def __init__(self, repo: CarrinhoRepository):
        self.repository: CarrinhoRepository = repo

    def adicionar_item_no_carrinho(
        self,
        livro_id: int,
        usuario_id: int,
        quantidade_item: int,
    ):
        livro = self.repository.buscar_livro_por_usuario(livro_id=livro_id)

        if not livro:
            raise HTTPException(status_code=404, detail="Livro não encontrado")

        carrinhos = self.repository.buscar_carrinhos_do_usuario(
            livro_id=livro_id, usuario_id=usuario_id
        )

        novo_carrinho = Carrinho.criar(
            usuario_id=usuario_id,
            livro_id=livro.id,
            quantidade=quantidade_item,
        )

        if len(carrinhos) >= 1:
            for carrinho_existente in carrinhos:
                novo_carrinho.quantidade += carrinho_existente.quantidade

        livro: Livro

        if livro.quantidade <= novo_carrinho.quantidade:
            raise HTTPException(
                status_code=400, detail="Quantidade insuficiente em estoque"
            )

        with self.repository.db as tx:
            ids_carrinhos_antigos = [carrinho.id for carrinho in carrinhos]

            tx.add(novo_carrinho)

            tx.query(Carrinho).where(Carrinho.id.in_(ids_carrinhos_antigos)).delete()

            tx.commit()

            return novo_carrinho.id

    def buscar_carrinho_do_usuario(self, usuario_id: int) -> CarrinhoFinal:
        carrinhos_com_livros = self.repository.buscar_carrinho_do_usuario(
            usuario_id=usuario_id,
        )

        carrinho_final = CarrinhoFinal(itens=[], total_do_carrinho=0)

        for carrinho, livro in carrinhos_com_livros:
            livro_id = livro.id
            quantidade = carrinho.quantidade

            # Verifica se o livro já está no carrinho final para atualizar a quantidade
            item_existente = next(
                (item for item in carrinho_final.itens if item.livro.id == livro_id),
                None,
            )

            if item_existente:
                # Atualiza a quantidade e o total do item existente
                item_existente.carrinho.quantidade += quantidade
                item_existente.carrinho.total = (
                    item_existente.carrinho.quantidade * item_existente.livro.preco
                )
            else:
                # Cria um novo item do carrinho com os detalhes do livro e a quantidade
                novo_item = CarrinhoItem(
                    livro=LivroRetorno(
                        id=livro.id,
                        titulo=livro.titulo,
                        preco=livro.preco,
                        genero=livro.genero,
                        descricao=livro.descricao,
                        url_imagem=livro.url_imagem,
                    ),
                    carrinho=CarrinhoRetorno(
                        quantidade=quantidade, total=quantidade * livro.preco
                    ),
                )
            # Adiciona o novo item à lista de itens do carrinho final
            carrinho_final.itens.append(novo_item)

        total_do_carrinho = sum(item.carrinho.total for item in carrinho_final.itens)
        carrinho_final.total_do_carrinho = total_do_carrinho

        return carrinho_final

    def remover_item_no_carrinho(
        self,
        livro_id: int,
        usuario_id: int,
        quantidade: int,
    ):
        livro = self.repository.buscar_livro_por_id(livro_id=livro_id)

        if not livro:
            raise HTTPException(status_code=404, detail="Livro não encontrado")

        carrinho_e_livro = self.repository.buscar_carrinho_por_id_e_livro_id(
            usuario_id=usuario_id,
            livro_id=livro_id,
        )

        if not carrinho_e_livro:
            raise HTTPException(
                status_code=404, detail="Item não encontrado no carrinho"
            )

        carrinho = carrinho_e_livro[0]

        if carrinho.quantidade < quantidade:
            raise HTTPException(status_code=400, detail="Quantidade inválida")

        carrinho.quantidade -= quantidade

        if carrinho.quantidade == 0:
            with self.repository.db as tx:
                tx.delete(carrinho)
                tx.commit()
        else:
            with self.repository.db as tx:
                tx.add(carrinho)
                tx.commit()
