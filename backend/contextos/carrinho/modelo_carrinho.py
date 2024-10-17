from pydantic import BaseModel


# Schema para o item no carrinho
class AdicionarItemCarrinho(BaseModel):
    livro_id: int
    quantidade: int
