from collections import defaultdict
from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from contextos.livros.entidade_livro import Livro
from contextos.usuarios.entidade_usuario import Usuario
from contextos.vendas.entidade_vendas import Venda, VendaItem
from libs.autenticacao.config import JWTBearer
from libs.database.sqlalchemy import pegar_conexao_db

roteador = APIRouter(prefix="/venda", tags=["Venda"])


class VendaItemRetorno(BaseModel):
    id: UUID
    valor_total_da_venda: float
    data_venda: datetime
    nome_do_livro: str
    quantidade: int


class VendaRetorno(BaseModel):
    venda: list[VendaItemRetorno]


class CompraRetorno(BaseModel):
    id: UUID
    total: float
    data_venda: datetime


class ComprasEVendasRetorno(BaseModel):
    compras: list[CompraRetorno]
    vendas: list[VendaRetorno]


# Endpoint para adicionar um item ao carrinho
@roteador.post("/comprar-do-carrinho")
def finalizar_compra_pelo_carrinho(
    db: Session = Depends(pegar_conexao_db),
    info_do_login: str = Depends(JWTBearer()),
):
    from contextos.carrinho.rota_carrinho import buscar_carriho_do_usuario_repo

    usuario_email = info_do_login.get("sub")
    usuario: Usuario = (
        db.query(Usuario).filter(Usuario.email.ilike(usuario_email)).first()
    )

    carrinho_items = buscar_carriho_do_usuario_repo(db=db, usuario_id=usuario.id)

    with db as tx:
        venda = Venda.criar(id_usuario_comprador=usuario.id)

        for carrinho, livro in carrinho_items:
            venda_item = VendaItem.criar(
                venda_id=venda.id,
                livro_id=livro.id,
                quantidade=carrinho.quantidade,
                preco_unitario=livro.preco,
            )
            venda.adicionar_item(venda_item)

            # Remover item do estoque
            if livro.quantidade < carrinho.quantidade:
                raise HTTPException(
                    status_code=400,
                    detail=f"Quantidade insuficiente do livro {livro.titulo}, restam apenas {livro.quantidade} unidades, você tentou comprar {carrinho.quantidade}, por favor, atualize a quantidade do livro no carrinho.",
                )

            livro.quantidade -= carrinho.quantidade

            tx.delete(carrinho)

        tx.add(venda)

        tx.commit()

    return Response(status_code=200)


# Endpoint para adicionar um item ao carrinho
@roteador.post("/venda-direta/{livro_id}")
def finalizar_venda_direta(
    livro_id: int,
    db: Session = Depends(pegar_conexao_db),
    info_do_login: str = Depends(JWTBearer()),
):
    usuario_email = info_do_login.get("sub")
    usuario: Usuario = (
        db.query(Usuario).filter(Usuario.email.ilike(usuario_email)).first()
    )

    livro = db.query(Livro).filter(Livro.id == livro_id).first()

    with db as tx:
        venda = Venda.criar(id_usuario_comprador=usuario.id)

        venda_item = VendaItem.criar(
            venda_id=venda.id,
            livro_id=livro.id,
            quantidade=1,
            preco_unitario=livro.preco,
        )
        venda.adicionar_item(venda_item)

        # Remover item do estoque
        if livro.quantidade < 1:
            raise HTTPException(
                status_code=400,
                detail=f"Quantidade insuficiente do livro {livro.titulo}, restam apenas {livro.quantidade} unidades, você tentou comprar 1, por favor, atualize a quantidade do livro no carrinho.",
            )

        livro.quantidade -= 1

        tx.add(venda)

        tx.commit()

    return Response(status_code=200)


@roteador.get("/listar")
def listar_vendas(
    db: Session = Depends(pegar_conexao_db),
    info_do_login: str = Depends(JWTBearer()),
) -> ComprasEVendasRetorno:
    usuario_email = info_do_login.get("sub")
    usuario: Usuario = (
        db.query(Usuario).filter(Usuario.email.ilike(usuario_email)).first()
    )

    vendas_do_autor = (
        db.query(VendaItem)
        .join(Livro, VendaItem.livro_id == Livro.id)
        .filter(
            Livro.usuario_id == usuario.id,
        )
        .all()
    )

    compras_do_usuario = (
        db.query(Venda).filter(Venda.id_usuario_comprador == usuario.id).all()
    )

    itens_retorno_vendas = defaultdict(list)
    itens_retorno_compras: list[CompraRetorno] = []

    for item in vendas_do_autor:
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
    for venda_id, itens in itens_retorno_vendas.items():
        venda_retorno.append(VendaRetorno(venda=itens))

    for item in compras_do_usuario:
        itens_retorno_compras.append(
            CompraRetorno(
                id=item.id,
                total=item.total_da_venda,
                data_venda=item.data_venda,
            )
        )

    return ComprasEVendasRetorno(
        compras=itens_retorno_compras,
        vendas=venda_retorno,
    )
