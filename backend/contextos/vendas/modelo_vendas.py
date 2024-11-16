from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


# Schema para o item no carrinho
class AdicionarItemCarrinho(BaseModel):
    livro_id: int
    quantidade: int


class LivroRetorno(BaseModel):
    id: int
    titulo: str
    preco: float
    genero: str
    descricao: str
    url_imagem: str


class CarrinhoRetorno(BaseModel):
    quantidade: int
    total: float


class CarrinhoItem(BaseModel):
    livro: LivroRetorno
    carrinho: CarrinhoRetorno


class CarrinhoFinal(BaseModel):
    itens: list[CarrinhoItem]
    total_do_carrinho: float


class VendaItemRetorno(BaseModel):
    id: UUID
    quantidade: int
    nome_do_livro: str
    data_venda: datetime
    valor_total_da_venda: float


class VendaRetorno(BaseModel):
    venda: list[VendaItemRetorno]


class LivroInfoRetorno(BaseModel):
    id: int
    titulo: str
    preco: float
    quantidade: int


class CompraItemRetorno(BaseModel):
    id: UUID
    quantidade: int
    data_venda: datetime
    valor_total_da_venda: float
    nome_do_livro: list[LivroInfoRetorno]


class CompraRetorno(BaseModel):
    compra: CompraItemRetorno


class ComprasEVendasRetorno(BaseModel):
    compras: list[CompraRetorno]
    vendas: list[VendaRetorno]
