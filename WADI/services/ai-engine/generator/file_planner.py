def build_file_plan(blueprint: dict) -> list:
    """
    Toma un blueprint y devuelve el listado de archivos concretos
    a ser procesados por el grafo topológico.
    """
    files = []
    
    features = blueprint.get("features", [])
    stack = blueprint.get("stack", {})
    
    # Core inicial (ej: con Python)
    db_ext = "py" if "FastAPI" in stack.get("backend", "") else "ts"
    
    # 1. Models / Base
    files.append(f"backend/models/base.{db_ext}")
    
    if "authentication" in features or "auth" in features:
        files.append(f"backend/models/user.{db_ext}")
        files.append(f"backend/services/auth_service.{db_ext}")
        files.append(f"backend/api/auth_api.{db_ext}")
        
    if "subscription billing" in features or "billing" in features:
        files.append(f"backend/services/billing_service.{db_ext}")
        
    if "dashboard" in features:
        files.append(f"backend/api/dashboard_api.{db_ext}")
        
    # Frontend skeleton (muy simplificado)
    if "Next.js" in stack.get("frontend", ""):
        pages = blueprint.get("pages", [])
        for page in pages:
            # Reemplazo rapido espacios
            name = page.replace(" ", "_")
            files.append(f"frontend/pages/{name}.tsx")
            
    return files
