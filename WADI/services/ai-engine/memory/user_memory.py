def get_user_memory(user_id: str) -> dict:
    """
    Recupera el contexto histórico del usuario.
    Retorna preferencias, nivel de experiencia y proyectos previos.
    """
    # Stub: Aquí iría la consulta a la base de datos PostgreSQL
    return {
        "user_id": user_id,
        "experience_level": "beginner",
        "interests": ["negocios", "automatización"],
        "projects_count": 4,
        "preferred_style": "pasos simples"
    }

def update_user_memory(user_id: str, intent: dict):
    """
    Actualiza el perfil del usuario basado en su nueva intención.
    """
    pass
