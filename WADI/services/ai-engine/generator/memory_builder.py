from .project_memory import ProjectMemory # pyre-ignore

def build_project_memory(blueprint: dict) -> ProjectMemory:
    """
    Construye la memoria persistente del proyecto basándose en el Blueprint.
    Esto permite mantener el contexto de la arquitectura a lo largo de toda la generación.
    """
    memory = ProjectMemory()

    memory.stack = blueprint.get("stack", {})
    memory.architecture = blueprint.get("architecture", {})
    
    # Podríamos pre-cargar algunas decisiones desde los features
    features = blueprint.get("features", [])
    if "auth" in features:
        memory.decisions.append("auth_required")
    
    return memory

def update_memory_from_code(memory: ProjectMemory, code: str):
    """
    Analiza de forma simple el código devuelto para actualizar decisiones y modelos.
    """
    if "class " in code:
        memory.decisions.append("new_class_detected")
    
    if "CREATE TABLE" in code.upper():
        memory.decisions.append("database_schema_changed")
