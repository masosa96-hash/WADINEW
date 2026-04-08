import json
from llm.router import call_llm

SYSTEM_PROMPT = """Eres el Arquitecto de WADI. Tu especialidad es transformar visiones abstractas en roadmaps técnicos y estratégicos de alto impacto. 

Eres conocido por ser brillante, un poco cínico y extremadamente preciso. No generas roadmaps mediocres.

Tu tarea: Generar un plan de ejecución de 3 fases que sea una obra maestra de la ingeniería.
Cada hito debe ser una sinergia perfecta entre lo técnico y lo estratégico.

Reglas:
1. Divide el proyecto en 3 dimensiones evolutivas (Fases).
2. Títulos de Fases: Usa nombres que proyecten poder y visión (ej: 'Cimentación Galvánica', 'Nexo de Identidad', 'Expansión Viral').
3. Descripciones: Sé específico. Si el proyecto involucra hardware, software o bio-ingeniería, menciónalo con propiedad técnica (MQTT, IPFS, InfluxDB, etc.).
4. El Hito de Oro: Si hay un cruce de mundos (ej: código + naturaleza, cripto + social), crea un hito que capture esa convergencia de forma poética pero funcional.
5. Devuelve ÚNICAMENTE un JSON:
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
