import sys
import os

# Ajuste temporal para resolver problemas de búsqueda en linters que no reconocen la carpeta como root
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI # pyre-ignore # type: ignore
from engines.pipeline import process_message # pyre-ignore # type: ignore

app = FastAPI()

@app.post("/process")
async def process(data: dict):
    message = data["message"]
    user_id = data["user_id"]

    result = process_message(message, user_id)

    return result
