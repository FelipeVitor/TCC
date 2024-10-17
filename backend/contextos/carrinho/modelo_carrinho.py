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


class CarrinhoRetorno(BaseModel):
    quantidade: int
    total: float


class CarrinhoItem(BaseModel):
    livro: LivroRetorno
    carrinho: CarrinhoRetorno


class CarrinhoFinal(BaseModel):
    itens: list[CarrinhoItem]
    total_do_carrinho: float
