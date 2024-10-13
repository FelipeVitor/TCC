from fastapi import FastAPI
from uvicorn import run
from libs.database.sqlalchemy import criar_tabela
from contextos.usuarios import rota_usuario
from contextos.autenticacao import rota_autenticacao
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


criar_tabela()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(rota_usuario.roteador)
app.include_router(rota_autenticacao.roteador)

if __name__ == "__main__":
    run(app, host="0.0.0.0", port=9000)
