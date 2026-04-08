"""
Idea Engine — corazón del sistema Wadi.

Analiza el mensaje del usuario e intenta extraer:
- idea principal
- dominio
- intención posible
- confianza estimada
- si necesita clarificación

El LLM solo produce JSON. La máquina de estados controla el flujo.
"""
import json
from typing import Optional, Any

from llm.router import call_llm  # type: ignore

# ---------------------------------------------------------------------------
# Prompt central del agente Wadi
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """Eres WADI, un sistema diseñado para ayudar a las personas a transformar ideas desordenadas en proyectos claros y accionables.

La mayoría de los usuarios saben lo que quieren, pero no saben cómo expresarlo.
Tu función es interpretar esa intención y devolver un análisis estructurado de alta fidelidad.

Reglas:
1. Nunca asumas que entendiste la idea completa del usuario.
2. Si la idea es ambigua o incompleta, marcá needs_clarification como true.
3. Sé conciso y directo, con un tono analítico pero punzante.
4. No respondas con texto libre. Responde ÚNICAMENTE con un JSON válido.

El JSON debe tener exactamente esta forma:
{
  "idea": "<resumen claro de la idea en 1 oración>",
  "domain": "<business | software | content | personal | unknown>",
  "possible_intent": "<descripción breve de la intención detectada>",
  "target": "<quién es el usuario final o beneficiario>",
  "complexity": "<bajo | medio | alto | extremo>",
  "needs_clarification": true | false,
  "confidence": <número entre 0.0 y 1.0>
}

Si el mensaje es un saludo o texto sin intención, devolvé confidence: 0.0 y needs_clarification: true."""

# ---------------------------------------------------------------------------
# Función principal
# ---------------------------------------------------------------------------
def extract_idea(user_input: str, context: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    """
    Llama al LLM para extraer la idea estructurada del mensaje.
    Si hay contexto previo de conversación, lo incorpora al prompt.
    """
    if context and context.get("idea"):
        context_str = (
            f"Contexto previo de la conversación:\n"
            f"- Idea hasta ahora: {context.get('idea', '')}\n"
            f"- Dominio: {context.get('domain', 'desconocido')}\n"
            f"- Confianza actual: {context.get('confidence', 0.0)}\n\n"
        )
        user_message = f"{context_str}Nuevo mensaje del usuario: {user_input}"
    else:
        user_message = user_input

    try:
        raw = call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_message,
            task="intent_detection"
        )

        # Limpiar posibles markdown wrappers (```json ... ```)
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        cleaned = cleaned.strip()

        idea_vector: dict[str, Any] = json.loads(cleaned)

        # Garantizar que siempre existan los campos base
        idea_vector.setdefault("idea", user_input)
        idea_vector.setdefault("domain", "unknown")
        idea_vector.setdefault("confidence", 0.0)
        idea_vector.setdefault("needs_clarification", True)
        idea_vector.setdefault("possible_intent", "")

        return idea_vector

    except (json.JSONDecodeError, Exception):
        # Fallback seguro si el LLM no devuelve JSON válido
        return {
            "idea": user_input,
            "domain": "unknown",
            "possible_intent": "",
            "needs_clarification": True,
            "confidence": 0.0
        }
