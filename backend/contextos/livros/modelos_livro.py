from pydantic import BaseModel


# Modelo para cadastrar um livro
class CadastrarLivro(BaseModel):
    titulo: str
    genero: str
    quantidade: int
    preco: float  # Altere conforme necessário, se usar Decimal
    descricao: str
    url_imagem: str

    class Config:
        min_anystr_length = 1
        anystr_strip_whitespace = True
