from collections import defaultdict

from sqlalchemy import UUID

from contextos.vendas.entidade_vendas import Venda, VendaItem
from contextos.vendas.modelo_vendas import (
    CompraItemRetorno,
    CompraRetorno,
    ComprasEVendasRetorno,
    LivroInfoRetorno,
    VendaItemRetorno,
    VendaRetorno,
)
from contextos.vendas.repositorio_vendas import VendaRepository


class VendaService:
    def __init__(self, repo: VendaRepository):
        self.repository = repo

    def listar_compras_e_vendas_do_usuario(
        self, usuario_id: int
    ) -> ComprasEVendasRetorno:
        vendas_usuario = self.repository.buscar_vendas_do_usuario(
            usuario_id=usuario_id,
        )
        compras_usuario = self.repository.buscar_compras_do_usuario(
            usuario_id=usuario_id,
        )

        itens_retorno_vendas = defaultdict(list)
        for item in vendas_usuario:
            itens_retorno_vendas[item.venda.id].append(
                VendaItemRetorno(
                    id=item.venda.id,
                    nome_do_livro=item.livro.titulo,
                    data_venda=item.venda.data_venda,
                    valor_total_da_venda=item.venda.total_da_venda,
                    quantidade=item.quantidade,
                )
            )

        venda_retorno = []
        for _, itens in itens_retorno_vendas.items():
            venda_retorno.append(VendaRetorno(venda=itens))

        compra_retorno: list[CompraRetorno] = []
        for venda in compras_usuario:
            compra_retorno.append(
                CompraRetorno(
                    compra=CompraItemRetorno(
                        id=venda.id,
                        data_venda=venda.data_venda,
                        quantidade=venda.total_de_itens_vendidos,
                        valor_total_da_venda=venda.total_da_venda,
                        nome_do_livro=[
                            LivroInfoRetorno(
                                id=item.livro.id,
                                titulo=item.livro.titulo,
                                preco=item.preco_unitario,
                                quantidade=item.quantidade,
                            )
                            for item in venda.itens
                        ],
                    ),
                )
            )

        return ComprasEVendasRetorno(
            vendas=venda_retorno,
            compras=compra_retorno,
        )

    def finalizar_venda_direta(self, livro_id: int, usuario_comprador: int) -> UUID:
        livro = self.repository.buscar_livro_por_id(livro_id)
        if not livro:
            raise ValueError("Livro não encontrado")

        if livro.quantidade == 0:
            raise ValueError(
                f"Quantidade insuficiente do livro {livro.titulo}, restam apenas {livro.quantidade} unidades, você tentou comprar 1, por favor, atualize a quantidade do livro no carrinho."
            )

        venda = Venda.criar(id_usuario_comprador=usuario_comprador)

        venda_item = VendaItem.criar(
            quantidade=1,
            venda_id=venda.id,
            livro_id=livro.id,
            preco_unitario=livro.preco,
        )

        venda.adicionar_item(venda_item)
        livro.decrementar_quantidade_disponivel()

        self.repository.salvar_venda_e_livro(venda=venda, livro=livro)

        return venda.id

    def finalizar_compra_pelo_carrinho(self, usuario_comprador: int) -> UUID:
        venda = Venda.criar(id_usuario_comprador=usuario_comprador)

        itens_do_carrinho = self.repository.buscar_carrinho_do_usuario(
            usuario_comprador
        )

        for carrinho, livro in itens_do_carrinho:
            venda_item = VendaItem.criar(
                venda_id=venda.id,
                livro_id=livro.id,
                quantidade=carrinho.quantidade,
                preco_unitario=livro.preco,
            )
            venda.adicionar_item(venda_item)

            # Remover item do estoque
            if livro.quantidade < carrinho.quantidade:
                raise ValueError(
                    # status_code=400,
                    detail=f"Quantidade insuficiente do livro {livro.titulo}, restam apenas {livro.quantidade} unidades, você tentou comprar {carrinho.quantidade}, por favor, atualize a quantidade do livro no carrinho.",
                )

            livro.quantidade -= carrinho.quantidade

            self.repository.db.delete(carrinho)

        self.repository.db.add(venda)

        self.repository.db.commit()

        return venda.id
