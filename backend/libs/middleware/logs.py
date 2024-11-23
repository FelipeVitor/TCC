import sys
import time

from fastapi import Request
from loguru import logger
from rich.logging import RichHandler
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class ConsoleLogs(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
    ):
        super().__init__(app)
        logger.remove()
        logger.add(
            sys.stderr,
            format=(
                "<green>{level: <4}</green>:     "
                "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
                "<level>{message}</level>"
            ),
        )

    async def dispatch(self, request: Request, call_next):
        tempo_inicio_requisicao = time.perf_counter()

        resposta = await call_next(request)

        tempo_fim_requisicao = time.perf_counter()

        calculo_diferenca_tempo = tempo_fim_requisicao - tempo_inicio_requisicao
        tempo_formatado = "{0:.3f}".format(calculo_diferenca_tempo)

        ### add X-Process-Time to header
        resposta.headers["X-Process-Time"] = tempo_formatado

        cor = self._color_request(resposta.status_code)

        remoto_endereco_cliente = request.headers.get("x-original-forwarded-for", None)  # type: ignore
        remoto_porta_cliente = request.headers.get("x-forwarded-port", None)  # type: ignore

        if all([remoto_endereco_cliente, remoto_porta_cliente]):
            remoto_endereco_cliente = remoto_endereco_cliente.split(",")[0]  # type: ignore
            endereco_cliente = f"{remoto_endereco_cliente}:{remoto_porta_cliente}"
        else:
            endereco_cliente = f"{request.client.host}:{request.client.port}"  # type: ignore

        endereco_cliente = endereco_cliente.ljust(21)

        logger.opt(colors=True).info(
            f"<blue><bold>Client: {endereco_cliente}</bold></blue> - "
            f"<{cor}>Status: {resposta.status_code}</{cor}> - "
            f"<yellow><bold>Time: {tempo_formatado}s</bold></yellow> - "
            f"<magenta>Method: {request.method.ljust(7)}</magenta> - "
            f"<cyan><bold>Path: {request.url.path} </bold></cyan>"
        )
        return resposta

    def _color_request(self, status_code: int):
        if status_code < 300:
            color = "green"
        if status_code >= 300 and status_code < 400:
            color = "black"
        if status_code >= 400 and status_code < 500:
            color = "yellow"
        if status_code >= 500:
            color = "red"
        return color
