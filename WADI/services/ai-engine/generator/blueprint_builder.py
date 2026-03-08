# Blueprint Builder
# Convierte un Playbook en la estructura del proyecto en sí

def build_blueprint(playbook: dict) -> dict:
    """
    Toma un playbook (por ejemplo: Vertical SaaS) y genera
    su blueprint técnico estricto.
    """
    # En un sistema real esto también puede tener una pasada de LLM pequeña
    # para adaptar features según el Idea Vector del usuario.
    # Por ahora tomamos la base del playbook.
    
    blueprint = {
        "project_type": playbook.get("archetype", "Custom"),
        "features": playbook.get("core_features", []),
        "stack": playbook.get("tech_stack", {}),
        "pages": playbook.get("mvp_structure", []),
        "architecture": {
            "type": "Monolith" if "Node" in playbook.get("tech_stack", {}).get("backend", "") else "Microservices/API"
        }
    }
    
    return blueprint
