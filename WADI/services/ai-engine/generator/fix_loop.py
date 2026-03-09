import subprocess
import os

def run_build(project_path: str) -> tuple[bool, str]:
    """
    Intenta buildear el repositorio. O en nuestro caso, correr checks tipados.
    Ejemplo `npm run build` o `pytest`.
    """
    print(f"[Build Check] Verificando compilación en {project_path}...")
    # Simulamos éxito o fallo leyendo el stdout
    # result = subprocess.run(["npm", "run", "build"], cwd=project_path, capture_output=True, text=True)
    # return result.returncode == 0, result.stderr
    
    return True, ""


def fix_project(project_path: str, error_log: str, memory):
    """
    Llama al LLM pasándole el error exacto del compilador de TS / Node / Python
    y le pide que emita un raw patch list o archivo final modificado.
    """
    prompt = f"""
    The project build failed under architecture decisions:
    {memory}

    Fatal Error:
    {error_log}

    Return the module name and the precise full code to overwrite the buggy file.
    """
    print(f"[Self-Healing] Intentando fix en base al error del build en: {project_path}")
    
    # response = openai.chat(..., content=prompt)
    # patch = parse_llm_patch(response)
    # apply_patch(...)
    pass
