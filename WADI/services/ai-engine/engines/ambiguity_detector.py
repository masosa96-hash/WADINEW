DIMENSIONS = ["goal", "target_user", "project_type", "scale", "constraints"]
VAGUE_WORDS = ["algo", "una cosa", "un proyecto", "una idea", "no se bien", "tal vez"]

def needs_clarification(message: str) -> bool:
    """Verifica si el mensaje en sí es indicativo de ambigüedad general."""
    if len(message.split()) < 6:
        return True

    msg_lower = message.lower()
    for word in VAGUE_WORDS:
        if word in msg_lower:
            return True
    return False

def detect_missing(message: str, idea_context: dict) -> list:
    """
    Combina análisis del mensaje directo y dimensiones faltantes en el vector idea.
    """
    missing = []
    
    # Si la idea base es totalmente vaga, asumimos todo como missing
    if needs_clarification(message) and idea_context.get("confidence", 0) < 0.3:
        return DIMENSIONS.copy()
        
    for dim in DIMENSIONS:
        if dim not in idea_context or idea_context[dim] is None:
            missing.append(dim)
            
    return missing
