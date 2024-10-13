from pydantic import BaseModel, Field, EmailStr
from datetime import date

class CadastrarUsuario(BaseModel):
    nome: str = Field(..., min_length=1, max_length=100, description="Nome do usuário")
    sobrenome: str = Field(..., min_length=1, max_length=100, description="Sobrenome do usuário")
    data_nascimento: date = Field(..., description="Data de nascimento do usuário (formato: YYYY-MM-DD)")
    email: EmailStr = Field(..., min_length=4, max_length=100, description="Email do usuário")
    senha: str = Field(..., min_length=8, description="Senha do usuário (mínimo de 8 caracteres)")    

    class Config:
        min_anystr_length = 1
        anystr_strip_whitespace = True

# Modelo de entrada para o login
class LoginData(BaseModel):
    email: str
    senha: str
