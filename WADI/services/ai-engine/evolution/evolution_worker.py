from .metrics_collector import collect_metrics # pyre-ignore
from .product_analysis import analyze_product # pyre-ignore
from .feature_planner import plan_feature # pyre-ignore
from .pr_generator import generate_pull_request # pyre-ignore

def run_evolution_for_project(project_id: str, repo_url: str, dna: dict, token: str) -> dict:
    """
    Simula la secuencia PM autonoma contra 1 solo proyecto.
    El Worker general deberia llamarlo cada 24 horas (Cronjob).
    """
    print(f"\n[Evolution Engine] Booting for Project {project_id}...")
    
    # 1. Listen Metrics
    metrics = collect_metrics(project_id)
    print(f"[*] Obtenidas metricas reales... Churn: {metrics['churn']}")
    
    # 2. Product Analyzer (PM LLM)
    analysis = analyze_product(metrics, dna)
    insight = analysis['insights'][0] if analysis['insights'] else 'No issues'
    print(f"[*] AI Product Manager Insight: {insight}")
    
    if "Healthy metrics" in insight:
        return {"status": "skipped", "reason": "healthy"}
        
    # 3. Code Generation Planner
    feature = plan_feature(analysis)
    print(f"[*] AI Engineer Planner: {feature['feature_name']} a modificar {len(feature['files_to_modify'])} archivos")
    
    # 4. Git Repo Regeneration (Modificacion Topologica) -> PR creation
    result = generate_pull_request(repo_url, feature, token)
    
    print(f"[!] MAGIC! Nuevo Pull Request Evolutivo creado en GitHub.")
    print(f"    - URL: {result['pr_url']}")
    
    return result
