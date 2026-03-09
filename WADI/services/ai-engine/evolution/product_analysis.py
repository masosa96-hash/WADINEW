def analyze_product(metrics: dict, dna: dict | None = None) -> dict:
    """
    LLM Product Manager: cruza Data con Startup DNA para proponer mejoras.
    """
    
    # Mock de insights generados por un LLM PM
    churn = metrics.get('churn', 0)
    insights = []
    features = []
    
    if churn > 0.1:
        insights.append(f"High churn detected ({churn * 100}%). Users might be dropping during onboarding.")
        features.append("guided onboarding wizard")
    elif metrics.get('signup_rate', 0) < 0.05:
        insights.append("Low conversion rate on landing.")
        features.append("frictionless google auth integration")
    else:
        insights.append("Healthy metrics, time to expand core value.")
        features.append("advanced reporting dashboard")
        
    return {
        "insights": insights,
        "suggested_features": features
    }
