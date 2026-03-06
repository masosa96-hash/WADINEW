from typing import Optional, Any

from engines.idea_engine import extract_idea  # type: ignore
from engines.ambiguity_detector import detect_missing  # type: ignore
from engines.clarification_engine import generate_questions  # type: ignore
from engines.intent_builder import build_intent  # type: ignore
from engines.project_generator import generate_project  # type: ignore

from memory.user_memory import get_user_memory, update_user_memory  # type: ignore
from memory.pattern_memory import get_pattern_memory, update_pattern_memory  # type: ignore
from memory.idea_graph import search_idea_graph, update_idea_graph  # type: ignore

def process_message(message: str, user_id: str, state: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    """
    Controla el pipeline a través de estados conversacionales.
    Estados: exploration -> clarification -> intent_building -> confirmation -> project_creation
    """
    if not state:
        state = {
            "stage": "exploration",
            "questions_asked": 0,
            "intent_confidence": 0.0,
            "idea_vector": {},
            "missing_dims": []
        }
        
    stage = state.get("stage", "exploration")

    # ----- ESTADO: EXPLORACION -----
    if stage == "exploration":
        idea = extract_idea(message)
        state["idea_vector"] = idea
        
        missing = detect_missing(message, idea)
        state["missing_dims"] = missing
        
        # Si la idea es demasiado vaga o faltan dimensiones -> entrar a Clarificar
        if missing or idea.get("confidence", 0.0) < 0.85:
            state["stage"] = "clarification"
            state["intent_confidence"] = idea.get("confidence", 0.0)
            
            user_context = get_user_memory(user_id)
            pattern_context = get_pattern_memory(idea.get("domain", ""))
            similar_ideas = search_idea_graph(idea.get("idea", ""))
            
            # Trae hasta 4 preguntas si es el primer pase (como dicta la regla)
            questions = generate_questions(missing, user_context, pattern_context, similar_ideas)
            state["questions_asked"] += len(questions)
            
            return {
                "stage": "clarification",
                "questions": questions,
                "state": state
            }
        
        else:
            # Idea rara vez es tan clara de entrada, pero existe la remota posibilidad
            state["stage"] = "confirmation"
            state["intent_confidence"] = 0.9
            intent = build_intent(idea)
            return build_confirmation_response(intent, state)

    # ----- ESTADO: CLARIFICACION -----
    elif stage == "clarification":
        # Sumamos la info nueva al vector de la idea
        idea = extract_idea(message, context=state.get("idea_vector", {}))
        state["idea_vector"] = idea
        
        # Simulamos que con cada respuesta la confianza sube un 20%
        current_conf = state.get("intent_confidence", 0.0)
        state["intent_confidence"] = min(current_conf + 0.2, 1.0)
        
        missing = detect_missing(message, idea)
        state["missing_dims"] = missing
        
        # Si ya confía suficiente (ej Intent Score = 0.85+)
        if state["intent_confidence"] >= 0.85:
            state["stage"] = "confirmation"
            intent = build_intent(state["idea_vector"])
            return build_confirmation_response(intent, state)
        else:
            # Realimentamos a Wadi
            user_context = get_user_memory(user_id)
            pattern_context = get_pattern_memory(idea.get("domain", ""))
            similar_ideas = search_idea_graph(idea.get("idea", ""))
            
            # Ahora sólo preguntamos DE A UNA (Regla #4: refinar intención)
            questions = generate_questions(missing, user_context, pattern_context, similar_ideas)
            q = questions[0] if questions else "¿Me podés contar un poco más cómo lo imaginás?"
            state["questions_asked"] += 1
            
            return {
                "stage": "clarification",
                "questions": [q],
                "state": state
            }

    # ----- ESTADO: CONFIRMACION -----
    elif stage == "confirmation":
        msg_lower = message.lower()
        if any(word in msg_lower for word in ["si", "sí", "correcto", "perfecto", "avanzar", "dale"]):
            # Usuario validó su propia idea -> Generamos proyecto final
            state["stage"] = "project_creation"
            intent = build_intent(state["idea_vector"])
            project = generate_project(intent)
            
            # Aprendizaje del agente
            update_user_memory(user_id, intent)
            update_pattern_memory(intent)
            update_idea_graph(intent)
            
            return {
                "stage": "project_creation",
                "intent": intent,
                "project": project,
                "first_step": project.get("phase_1", [""])[0],
                "state": state
            }
        else:
            # Usuario rechazó o quiso cambiar detalles -> Volver a clarificación
            state["stage"] = "clarification"
            state["intent_confidence"] -= 0.3 # Baja confianza lógica
            return {
                "stage": "clarification",
                "questions": ["¿Qué parte te gustaría cambiar o ajustar específicamente?"],
                "state": state
            }
            
    return {"stage": "error", "message": "Estado desconocido en máquina de estados."}


def build_confirmation_response(intent: dict, state: dict):
    """Arma el texto del Modo A: Confirmando antes de ejecutar la acción DB."""
    idea_text = intent.get("idea", "")
    domain = intent.get("domain", "")
    target = intent.get("target", "")
    
    confirmation_message = (
        f"Si entendí bien tu idea es:\n"
        f"• Proyecto: {idea_text}\n"
        f"• Enfoque de: {domain}\n"
        f"• Dirigido a: {target}\n\n"
        f"Tengo una estructura de proyecto lista.\n"
        f"¿Querés que lo convierta en un proyecto y te dé el primer paso?"
    )
    
    return {
        "stage": "confirmation",
        "message": confirmation_message,
        "intent": intent,
        "state": state
    }
