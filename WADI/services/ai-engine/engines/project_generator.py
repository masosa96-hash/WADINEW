import json
from llm.router import call_llm

SYSTEM_PROMPT = """Eres el Arquitecto de WADI. Tu especialidad es transformar visiones abstractas en roadmaps técnicos y estratégicos de alto impacto.

Tu tarea: Generar un plan de ejecución de 3 fases basado en la intención del usuario.
Cada fase debe ser precisa, realista y adaptada al dominio del proyecto.

Reglas:
1. Divide el proyecto en EXACTAMENTE 3 fases (Setup/Fundamentos, Desarrollo Core, Lanzamiento/Optimización).
2. Proporciona un título creativo para cada fase.
3. Incluye una descripción matizada de los objetivos de cada fase.
4. Devuelve ÚNICAMENTE un JSON con la siguiente estructura:
{
  "phase_1": { "title": "...", "description": "..." },
  "phase_2": { "title": "...", "description": "..." },
  "phase_3": { "title": "...", "description": "..." },
  "tech_stack": ["...", "..."]
}
"""

def generate_project(intent):
    """
    Genera un Roadmap real usando el LLM.
    """
    user_message = f"Genera un Roadmap detallado para el siguiente proyecto:\n- Idea: {intent.get('idea')}\n- Dominio: {intent.get('domain')}\n- Target: {intent.get('target')}"
    
    try:
        raw = call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_message,
            task="project_generation"
        )
        
        # Limpiar markdown y parsear
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        cleaned = cleaned.strip()
        
        return json.loads(cleaned)
    except Exception as e:
        print(f"[WADI_GEN_ERROR]: Falló la generación del roadmap: {e}")
        # Fallback decoroso si el LLM falla
        return {
            "phase_1": { "title": "Cimentación", "description": "Configuración de entorno y validación inicial." },
            "phase_2": { "title": "Construcción Neural", "description": "Desarrollo de las funcionalidades core." },
            "phase_3": { "title": "Despliegue Táctico", "description": "Optimización y lanzamiento al mercado." },
            "tech_stack": [intent.get("domain", "TypeScript"), "Node.js"]
        }
