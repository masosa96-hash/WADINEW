from .repo_operator import octokit_create_branch, octokit_commit_file, octokit_create_pull_request # pyre-ignore

def generate_pull_request(repo_url: str, feature_plan: dict, token: str = "") -> dict:
    """
    Simula la regeneracion de codigo (in-place generation).
    Modifica archivos del code graph, hace commit y sube el PR.
    """
    branch_name = f"wadi-feature/{feature_plan.get('feature_name', 'update')}"
    
    # 1. Crear rama
    octokit_create_branch(repo_url, branch_name, "main", token)
    
    # 2. Generar el parche para los archivos planificados (Se llama al `project_generator` acá pero parcial)
    for file_path in feature_plan.get("files_to_modify", []):
        dummy_content = f"// Modificated by Wadi Evolution Engine\n// Insight: {feature_plan.get('description')}\n"
        octokit_commit_file(repo_url, branch_name, file_path, dummy_content, token)
        
    # 3. Pull Request
    title = f"AI PM: Improve {feature_plan.get('feature_name')} based on analytics"
    description = f"Wadi Evolution detected usage patterns that require this update.\n\nDescription: {feature_plan.get('description')}"
    
    pr_url = octokit_create_pull_request(repo_url, title, description, head=branch_name, base="main", token=token)
    
    return {
        "status": "pr_opened",
        "pr_url": pr_url,
        "branch": branch_name
    }
