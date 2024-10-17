from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi import Request
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


SECRET_KEY = "TiaraEhTierA"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
bcrypt = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return bcrypt.verify(plain_password, hashed_password)


def get_password_hash(password):
    return bcrypt.hash(password)


def criar_token_de_acesso_a_rotas_protegidas(
    data: dict, expires_delta: timedelta = None
):
    to_encode = data.copy()
    if not data.get("sub", None):
        raise ValueError("Passar email do Usuário no sub")

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=60)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(
            JWTBearer, self
        ).__call__(request)

        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=403, detail="Invalid authentication scheme"
                )

            dados_token = self.verify_jwt(credentials.credentials)
            if not dados_token:
                raise HTTPException(status_code=403, detail="Invalid token")

            from libs.database.sqlalchemy import _Session
            from contextos.usuarios.entidade_usuario import Usuario

            db = _Session()
            usuario = (
                db.query(Usuario)
                .filter(
                    Usuario.email.ilike(dados_token.get("sub", "sem-email-no-sub?"))
                )
                .first()
            )
            if not usuario:
                raise HTTPException(status_code=403, detail="Invalid token")

            usuario: Usuario
            if not usuario.ativo:
                raise HTTPException(status_code=403, detail="Usuario desativado")

            if usuario.deletado:
                raise HTTPException(status_code=403, detail="Usuario deletado")

            return dados_token
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code")

    def verify_jwt(self, jwt_token: str):
        try:
            payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return False


def verificar_token_de_acesso_a_rotas_protegidas(request: Request): ...
