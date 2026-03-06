from .idea_engine import extract_idea
from .ambiguity_detector import detect_missing
from .clarification_engine import generate_questions
from .intent_builder import build_intent
from .project_generator import generate_project

from ..memory.user_memory import get_user_memory, update_user_memory
from ..memory.pattern_memory import get_pattern_memory, update_pattern_memory
from ..memory.idea_graph import search_idea_graph, update_idea_graph

def process_message(message: str, user_id: str):
    # 1. Detectar idea
    idea = extract_idea(message)

    # 2. Revisar memoria del usuario
    user_context = get_user_memory(user_id)
    
    # 3. Revisar patrones globales (idea / dominio)
    pattern_context = get_pattern_memory(idea.get("domain", ""))
    
    # 4. Revisar grafo global de ideas para influir
    similar_ideas = search_idea_graph(idea.get("idea", ""))

    missing = detect_missing(idea)

    if missing:
        # Pasa los contextos para hacer preguntas más inteligentes
        questions = generate_questions(
            missing_dims=missing, 
            user_context=user_context, 
            pattern_context=pattern_context, 
            similar_ideas=similar_ideas
        )
        return {
            "type": "questions",
            "questions": questions
        }

    # 5. Reconstruir intención
    intent = build_intent(idea)
    
    project = generate_project(intent)

    # 6. Actualizar las memorias. 
    # Notar que enviamos toda la intención a patron/grafo, pero no user_id (anonimato total)
    update_user_memory(user_id, intent)
    update_pattern_memory(intent)
    update_idea_graph(intent)

    return {
        "type": "project_preview",
        "intent": intent,
        "project": project
    }
