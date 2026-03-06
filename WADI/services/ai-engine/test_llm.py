from dotenv import load_dotenv
load_dotenv()

from llm.router import call_llm

result = call_llm(
    system_prompt='Responde SOLO con JSON valido. Ejemplo: {"ok": true, "model": "nombre"}',
    user_message="test de conexion",
    task="intent_detection"
)
print("=== RESPUESTA DEL LLM ===")
print(result)
