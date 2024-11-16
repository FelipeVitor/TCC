from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from contextos.usuarios.entidade_usuario import Usuario
from contextos.vendas.modelo_vendas import ComprasEVendasRetorno
from contextos.vendas.repositorio_vendas import VendaRepository
from contextos.vendas.services_vendas import VendaService
from libs.autenticacao.config import JWTBearer
from libs.database.sqlalchemy import pegar_conexao_db

roteador = APIRouter(prefix="/venda", tags=["Venda"])


# Endpoint para adicionar um item ao carrinho
@roteador.post("/comprar-do-carrinho")
def finalizar_compra_pelo_carrinho(
    db: Session = Depends(pegar_conexao_db),
    usuario_do_login: Usuario = Depends(JWTBearer()),
):
    repo_venda = VendaRepository(db=db)
    servico_venda = VendaService(repo_venda)

    id_da_venda = servico_venda.finalizar_compra_pelo_carrinho(
        usuario_comprador=usuario_do_login.id
    )

    return {"id": id_da_venda}


# Endpoint para adicionar um item ao carrinho
@roteador.post("/venda-direta/{livro_id}")
def finalizar_venda_direta(
    livro_id: int,
    db: Session = Depends(pegar_conexao_db),
    usuario_do_login: Usuario = Depends(JWTBearer()),
):
    repo_venda = VendaRepository(db=db)
    servico_venda = VendaService(repo_venda)

    id_da_venda = servico_venda.finalizar_venda_direta(
        livro_id=livro_id,
        usuario_comprador=usuario_do_login.id,
    )
    return {"id": id_da_venda}


@roteador.get("/listar")
def listar_compras_e_vendas(
    db: Session = Depends(pegar_conexao_db),
    usuario_do_login: Usuario = Depends(JWTBearer()),
) -> ComprasEVendasRetorno:
    repo_venda = VendaRepository(db=db)
    servico_venda = VendaService(repo_venda)

    retorno = servico_venda.listar_compras_e_vendas_do_usuario(
        usuario_id=usuario_do_login.id
    )

    return retorno


git rm --cached