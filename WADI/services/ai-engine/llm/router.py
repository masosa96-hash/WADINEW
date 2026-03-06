"""
LLM Router de Wadi.
Decide qué modelo usar en base a la tarea.
Soporta Groq (por defecto) y OpenAI como respaldo.
"""
import os
from openai import OpenAI  # type: ignore
from tenacity import retry, stop_after_attempt, wait_exponential  # type: ignore
from dotenv import load_dotenv  # type: ignore

load_dotenv()

# ---------------------------------------------------------------------------
# Clientes
# ---------------------------------------------------------------------------
_groq_client = None
_openai_client = None

def _get_groq() -> OpenAI:
    global _groq_client
    if not _groq_client:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY no está configurado")
        _groq_client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=api_key
        )
    return _groq_client

def _get_openai() -> OpenAI:
    global _openai_client
    if not _openai_client:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY no está configurado")
        _openai_client = OpenAI(api_key=api_key)
    return _openai_client

# ---------------------------------------------------------------------------
# Router: Elige modelo según la tarea
# Lee GROQ_DEFAULT_MODEL del entorno para facilitar swaps sin tocar código
# ---------------------------------------------------------------------------
_GROQ_MODEL = os.environ.get("GROQ_DEFAULT_MODEL", "llama-3.1-8b-instant")

MODEL_MAP = {
    # Tarea               → (provider,  model)
    "clarification":      ("groq",   _GROQ_MODEL),
    "intent_detection":   ("groq",   _GROQ_MODEL),
    "project_generation": ("groq",   _GROQ_MODEL),
    "default":            ("groq",   _GROQ_MODEL),
}

def get_client_and_model(task: str) -> tuple[OpenAI, str]:
    provider, model = MODEL_MAP.get(task, MODEL_MAP["default"])
    if provider == "groq":
        return _get_groq(), model
    return _get_openai(), model

# ---------------------------------------------------------------------------
# Llamada central con reintentos automáticos
# ---------------------------------------------------------------------------
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=8))
def call_llm(system_prompt: str, user_message: str, task: str = "default") -> str:
    """
    Envía un mensaje al LLM correspondiente según la tarea.
    Retorna el contenido en texto plano (JSON string, lista, etc).
    """
    client, model = get_client_and_model(task)

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_message}
        ],
        temperature=0.3,  # Bajo: respuestas más predecibles y estructuradas
    )

    return response.choices[0].message.content or ""
