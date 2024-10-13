from pydantic import BaseModel


class LoginData(BaseModel):
    email: str
    senha: str


class TokenData(BaseModel):
    access_token: str
    token_type: str