import sys
import os

# Ajuste temporal para resolver problemas de búsqueda en linters que no reconocen la carpeta como root
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI # pyre-ignore # type: ignore
from pydantic import BaseModel # pyre-ignore # type: ignore
from engines.pipeline import process_message # pyre-ignore # type: ignore

# Generator & Analysis dependencies
from workers.idea_analysis_worker import analyze_idea # pyre-ignore
from generator.project_generator import generate_project # pyre-ignore

app = FastAPI()

class InterpretRequest(BaseModel):
    message: str
    user_id: str = "anonymous"
    state: dict | None = None

class IdeaRequest(BaseModel):
    idea_id: str
    description: str = ""

@app.post("/wadi/interpret")
async def process(data: InterpretRequest):
    # Inyección de estado al pipeline
    result = process_message(data.message, data.user_id, data.state)
    return result

@app.post("/analyze")
def analyze(req: IdeaRequest):
    # Pipeline 1: NLP Extract, Score, DNA Archetype, and Playbook lookup
    result = analyze_idea(req.idea_id, req.description)
    return {
        "status": "ok",
        "playbook": result
    }

@app.post("/generate")
def generate(req: dict):
    # Pipeline 2: Takes the Playbook JSON and compiles topological workspace
    # In a real scenario req would contain the matched playbook as body
    # For now we assume req["playbook"] holds the startup DNA playbook
    playbook = req.get("playbook", {})
    project_path = generate_project(playbook)
    return {
        "status": "generated",
        "path": project_path
    }

from evolution.evolution_worker import run_evolution_for_project # pyre-ignore

class EvolveRequest(BaseModel):
    project_id: str
    repo_url: str
    github_token: str
    dna: dict = {}

@app.post("/evolve")
def evolve(req: EvolveRequest):
    """
    Triggering AI Product Manager manually or scheduled via API Call
    """
    result = run_evolution_for_project(req.project_id, req.repo_url, req.dna, req.github_token)
    return result
