# Stub para Playbook Matcher
from typing import Dict

def match_playbook(dna: dict) -> dict:
    """
    Busca qué startup playbook corresponde a un DNA de idea.
    """
    archetype = dna.get("archetype", "Custom")
    
    # Podría usarse una base de datos real: 
    # db.query("select * from startup_playbooks where archetype = %s", archetype)
    
    if archetype == "Vertical SaaS":
        return {
            "archetype": "Vertical SaaS",
            "core_features": ["authentication", "subscription billing", "dashboard", "data management", "analytics"],
            "tech_stack": {
                "frontend": "Next.js",
                "backend": "FastAPI",
                "database": "Postgres",
                "auth": "Supabase Auth"
            },
            "mvp_structure": ["landing_page", "signup_login", "dashboard", "settings", "billing"]
        }
    elif archetype == "Marketplace":
        return {
            "archetype": "Marketplace",
            "core_features": ["user profiles", "listings", "search", "transactions", "reviews"],
            "tech_stack": {
                "frontend": "Next.js",
                "backend": "Node",
                "database": "Postgres",
                "payments": "Stripe Connect"
            },
            "mvp_structure": ["landing", "browse marketplace", "create listing", "checkout", "reviews"]
        }
    elif archetype == "AI Wrapper":
        return {
            "archetype": "AI Wrapper",
            "core_features": ["prompt interface", "AI API integration", "history", "usage tracking"],
            "tech_stack": {
                "frontend": "Next.js",
                "backend": "Python FastAPI",
                "ai_provider": "OpenAI/Groq",
                "database": "Postgres"
            },
            "mvp_structure": ["prompt interface", "AI results", "history", "settings"]
        }
    else:
        # Generic playbook
        return {
            "archetype": archetype,
            "core_features": ["authentication", "api", "dashboard"],
            "tech_stack": {
                "frontend": "Next.js",
                "backend": "FastAPI",
                "database": "Postgres"
            },
            "mvp_structure": ["landing_page", "dashboard"]
        }
