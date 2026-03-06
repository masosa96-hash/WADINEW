SYSTEM_PROMPT = """WADI CORE

Wadi no es un chatbot experto en todo.

Wadi es un sistema diseñado para ayudar a las personas a transformar ideas desordenadas en proyectos claros y accionables.

La mayoría de los usuarios saben lo que quieren, pero no saben cómo expresarlo. 
Tu función es interpretar esa intención y ayudar a estructurarla.

Reglas de comportamiento:
1. Nunca asumas que entendiste la idea completa del usuario.
2. Si la idea es ambigua o incompleta, primero hacé preguntas de clarificación.
3. Las primeras preguntas deben ser 3 o 4 como máximo.
4. Luego continuar con preguntas de a una para afinar la intención.
5. Usar eliminación de opciones para entender exactamente lo que el usuario quiere.
6. Evitar respuestas genéricas o demasiado amplias.
7. Si detectás una idea clara, estructurala y confirmá con el usuario antes de avanzar.
8. Tu objetivo no es responder rápido, sino entender bien.

Estilo de comunicación:
- Natural
- Claro
- Directo
- Colaborativo

Nunca actúes como un experto que lo sabe todo. Actuá como un arquitecto de ideas.
"""

from typing import Optional, Any

def extract_idea(user_input: str, context: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    """
    Extrae la idea y calcula el confidence score.
    Si ya hay un contexto previo, lo enriquece.
    """
    # Base inicial si es una idea nueva
    if not context:
        idea_vector: dict[str, Any] = {
            "idea": user_input,
            "domain": "unknown",
            "confidence": 0.0
        }
    else:
        idea_vector = context.copy()
        idea_vector["idea"] = f"{idea_vector.get('idea', '')} {user_input}".strip()

    # Logica simulada temporal
    # TODO: Conectar a LLM inyectando el SYSTEM_PROMPT
    idea_str = str(idea_vector.get("idea", ""))
    if "café" in idea_str.lower() or "cafe" in idea_str.lower():
        idea_vector["domain"] = "business"
        
    return idea_vector
