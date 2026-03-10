import os
import time
import urllib.request
import urllib.error
import urllib.parse
import json
import sys

# Ajuste temporal para resolver problemas de module path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from evolution.metrics_collector import collect_metrics # pyre-ignore
from evolution.product_analysis import analyze_product # pyre-ignore
from evolution.feature_planner import plan_feature # pyre-ignore
from evolution.pr_generator import generate_pull_request # pyre-ignore
from dotenv import load_dotenv

# Intentar cargar .env local del AI Engine y luego el de API si faltan las credenciales
load_dotenv()
api_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../apps/api/.env")
load_dotenv(api_env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GITHUB_OWNER = os.getenv("GITHUB_OWNER", "wadi-ai")

def make_supabase_request(method, endpoint, body=None):
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[ERROR] No hay credenciales de Supabase configuradas en entorno.")
        return None

    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers: dict[str, str] = {
        "apikey": str(SUPABASE_KEY),
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            if response.status in [200, 201, 204]:
                if response.status == 204:
                    return None
                resp_data = response.read()
                return json.loads(resp_data.decode("utf-8")) if resp_data else None
    except urllib.error.HTTPError as e:
        print(f"Supabase HTTP Error: {e.code} - {e.read().decode('utf-8')}")
        return None
    except Exception as e:
        print(f"Supabase Connection Error: {e}")
        return None

def get_active_projects():
    # Buscamos proyectos generados y listos (que contengan código vivo o desplegado idealmente)
    return make_supabase_request("GET", "projects?select=*,idea:ideas(dna:idea_dna(*))&status=eq.READY") or []

def get_user_github_token(user_id):
    accounts = make_supabase_request("GET", f"github_accounts?user_id=eq.{user_id}&select=access_token")
    if accounts and len(accounts) > 0:
        return accounts[0].get("access_token")
    return None

def record_insight(project_id, analysis, pr_status="pr_generated"):
    insight = analysis['insights'][0] if analysis.get('insights') else "No issues"
    feature = analysis['suggested_features'][0] if analysis.get('suggested_features') else "No feature"
    
    make_supabase_request("POST", "evolution_insights", {
        "project_id": project_id,
        "insight_type": "metrics_analysis",
        "description": f"Wadi detected metric patterns: {insight}",
        "status": pr_status,
        "suggested_fix": feature
    })

def record_feed_event(project_id, pr_data):
    make_supabase_request("POST", "project_feed", {
        "project_id": project_id,
        "type": "pr_generated",
        "message": f"Wadi generated code to evolve your project: {pr_data.get('branch', 'update')}",
        "metadata": {"pr_url": pr_data.get("pr_url", "#")}
    })

def run_evolution_cycle():
    print("[CRON] Starting Autonomous Evolution Cycle...")
    projects = get_active_projects()
    print(f"[CRON] Found {len(projects)} active projects.")

    for project in projects:
        project_id = project["id"]
        user_id = project.get("user_id")
        project_name = project.get("name", "untitled")
        repo_url = f"https://github.com/{GITHUB_OWNER}/{project_name}"
        
        # Saltamos si no podemos hacer PR
        token = get_user_github_token(user_id)
        if not token:
            print(f"[SKIP] No GitHub token for user {user_id}, skipping {project_name}.")
            continue

        print(f"\n--- Evolving Project: {project_name} ---")
        metrics = collect_metrics(project_id)
        
        idea = project.get("idea") or {}
        dna_arr = idea.get("dna") or []
        dna = dna_arr[0] if len(dna_arr) > 0 else {}
        
        analysis = analyze_product(metrics, dna)
        
        insight = analysis['insights'][0] if analysis.get('insights') else 'No issues'
        requires_feature = "Healthy metrics" not in insight
        
        if requires_feature:
            plan = plan_feature(analysis)
            try:
                pr = generate_pull_request(repo_url, plan, token)
                record_insight(project_id, analysis, pr_status="pr_generated")
                record_feed_event(project_id, pr)
                print(f"[OK] Pull request generated for {project_name}.")
            except Exception as e:
                print(f"[ERROR] generating PR for {project_name}: {e}")
                record_insight(project_id, analysis, pr_status="open")
        else:
            print(f"[OK] {project_name} has healthy metrics. No feature required right now.")

if __name__ == "__main__":
    # Arrancar el daemon / loop infinito
    while True:
        try:
            run_evolution_cycle()
        except Exception as e:
            print(f"[CRON ERROR] Loop crashed: {e}")
            
        print("[CRON] Sleeping for 6 hours (21600 seconds)...")
        time.sleep(6 * 3600)
