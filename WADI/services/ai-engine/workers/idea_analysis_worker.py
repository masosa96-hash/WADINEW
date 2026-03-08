import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engines.score_engine import score_engine # pyre-ignore
from engines.dna_engine import dna_engine # pyre-ignore
from engines.playbook_matcher import match_playbook # pyre-ignore
def llm_extract_dimensions(description: str) -> dict:
    """
    Extracción LLM guiada por metadata JSON (Vector Dimensions)
    """
    # Dummy mock for now
    desc_lower = description.lower()
    dimensions = {
        "problem": "Unknown problem",
        "solution": "App to solve the problem",
        "target_user": "professionals",
        "customer_type": "b2c",
        "domain": "productivity",
        "platform": "web app",
        "complexity": "medium",
        "business_model": "freemium",
        "monetization": "subscription",
        "distribution": "organic",
        "market_scope": "global",
        "scale_potential": "startup",
        "innovation_type": "incremental"
    }
    
    # Simple heuristics to mock actual logic via LLM
    if "b2b" in desc_lower or "business" in desc_lower:
         dimensions["customer_type"] = "b2b"
    if "saas" in desc_lower:
         dimensions["business_model"] = "saas"
    if "freelancer" in desc_lower:
         dimensions["target_user"] = "freelancers"
    
    return dimensions


def analyze_idea(idea_id: str, description: str) -> dict:
    """
    El Pipeline base que transila una Idea Raw de la base de datos y cruza 
    todas las capas de inteligencia hasta el Blueprint Starter.
    """
    # 1. Extracción Estructurada
    dimensions = llm_extract_dimensions(description)
    # db.save_dimensions(idea_id, dimensions)
    
    # 2. Score Computation (Market & Distribution likelihood)
    scores = score_engine(dimensions)
    # db.save_scores(idea_id, scores)
    
    # 3. DNA Engine Archetyping
    dna = dna_engine(dimensions, scores)
    # db.save_dna(idea_id, dna)
    
    # 4. Venture Playbook Lookup
    playbook = match_playbook(dna)
    
    print(f"[Worker Analysis] Idea {idea_id} | Archetype: {dna['archetype']} | Score: {scores['overall_score']}")
    
    return playbook
