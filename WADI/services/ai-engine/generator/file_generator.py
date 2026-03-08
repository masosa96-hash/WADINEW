import os

def load_dependencies(dependencies: list, project_path: str) -> str:
    """
    Lee en string el código actual de las dependencias inyectadas para pasarlas en el prompt.
    """
    code_injected = []
    for dep_file in dependencies:
        path = os.path.join(project_path, dep_file)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                code_injected.append(f"--- {dep_file} ---\n{content}\n")
    return "\n".join(code_injected)


def generate_file(file_name: str, dependency_files_str: str, memory) -> str:
    """
    Wrappea el llamado al LLM inyectando el project memory global y las dependencias ya graficadas.
    """
    prompt = f"""
    You are an autonomous engineering system generating code strictly based on architectural models.
    
    PROJECT ARCHITECTURE DECISIONS:
    {memory}

    Already existing files resolving dependencies for this module:
    {dependency_files_str}

    Generate the file: {file_name}
    Return ONLY valid raw code. No markdown formatting ticks if possible.
    """
    
    # Mock / Stub de la respuesta real a la AI
    # import openai
    # response = openai.chat.completions.create(...)
    # return response.choices[0].message.content
    
    print(f"[LLM Executing] Writing logic for {file_name} based on Project Memory.")
    
    # Stub response
    ext = file_name.split(".")[-1]
    comment_char = "//" if ext in ["ts", "js", "tsx", "jsx"] else "#"
    return f"{comment_char} Auto-generated file for {file_name}\n\n{comment_char} Dependencies injected.\n"
