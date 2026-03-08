import os
import uuid

# Project Generator modules
from .blueprint_builder import build_blueprint # pyre-ignore
from .memory_builder import build_project_memory, update_memory_from_code # pyre-ignore
from .file_planner import build_file_plan # pyre-ignore
from .code_graph import build_code_graph, topo_sort # pyre-ignore
from .file_generator import load_dependencies, generate_file # pyre-ignore
from .fix_loop import run_build, fix_project # pyre-ignore

def ensure_folders(project_path: str, files: list):
    """
    Se asegura de crear la estructura de carpetas previas antes de guardar un archivo.
    """
    for file_path in files:
        full_path = os.path.join(project_path, file_path)
        folder = os.path.dirname(full_path)
        os.makedirs(folder, exist_ok=True)


def generate_project(playbook: dict) -> str:
    """
    Este es EL ORQUESTADOR. El corazón del MVP generativo topológico inyectado por memoria de la AI.
    """
    
    # 1. Arma el Blueprint base de technical features
    blueprint = build_blueprint(playbook)
    
    # 2. Project Memory (A persistent state para mantener contexto del prompt coherente)
    memory = build_project_memory(blueprint)
    
    # 3. File Planner (Qué archivos exactos vamos a necesitar instanciar de cero)
    files = build_file_plan(blueprint)
    
    # Create the workspace folder
    project_id = str(uuid.uuid4().hex)[:8]  # type: ignore
    # Guardarlo en una ruta tipo /tmp o workspaces
    project_path = os.path.abspath(f"../../tmp/{project_id}_MVP")
    os.makedirs(project_path, exist_ok=True)
    
    # Primero forzamos la estructura de carpetas vacías requeridas
    ensure_folders(project_path, files)
    
    # 4. Construir Code Graph y ordernar topológicamente
    graph = build_code_graph(files)
    order = topo_sort(graph)
    
    print(f"[*] Inciando generación topológica para proyecto {project_id}")
    print(f"[*] Memory State inicial: {memory}")
    print(f"[*] Order (n={len(order)}): {order}")
    
    # 5. Generación File-by-File con inyección de estado de AST o dependencias source level
    for file_name in order:
        # Qué archivos previos debo inyectarle al prompt porque este modulo depende de ellos
        deps_files = graph.nodes[file_name].dependencies
        deps_str = load_dependencies(deps_files, project_path)
        
        # LLM Llamado
        code = generate_file(file_name, deps_str, memory)
        
        # Guardar en disco el file generado
        target_file = os.path.join(project_path, file_name)
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(code)
            
        print(f"  -> Generated: {file_name}")
            
        # Hook global the memory builder (ej actualiza el schema global porque se definió modelo nuevo)
        update_memory_from_code(memory, code)
        
        
    # 6. Build / Self-Healing Fix Loop
    success, error_log = run_build(project_path)
    
    if not success:
        print("[!] Build crashed. Corriendo Fix Loop...")
        # Llama a un LLM de nuevo enviandole la salida de la consola de error y parchea si es necesario
        fix_project(project_path, error_log, memory)
        
    print(f"[*] Generación finalizada. Repo generado en: {project_path}")
    return project_path
