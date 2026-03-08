def dna_engine(dimensions: dict, scores: dict) -> dict:
    """
    Calcula el Idea DNA (Startup Archetype, Subtype, Growth Model, Risk Profile).
    """
    biz_model = dimensions.get("business_model", "").lower()
    customer_type = dimensions.get("customer_type", "").lower()
    target_user = dimensions.get("target_user", "").lower()
    platform = dimensions.get("platform", "").lower()
    innovation = dimensions.get("innovation_type", "").lower()
    distrib = dimensions.get("distribution", "").lower()
    complexity = dimensions.get("complexity", "").lower()
    
    archetype = "General Tool"
    
    # Simple classification tree
    if "saas" in biz_model and "b2b" in customer_type and target_user not in ["general consumers", "everyone"]:
        archetype = "Vertical SaaS"
    elif "marketplace" in platform:
        archetype = "Marketplace"
    elif "ai leverage" in innovation or "ai" in innovation:
        archetype = "AI Wrapper"
    elif "developers" in target_user:
        archetype = "Dev Tool"
        
    subtype = "Tech Sector"
    if "freelancer" in target_user:
        subtype = "Freelancer Tools"
    elif "creator" in target_user:
        subtype = "Creator Economy"
        
    growth_model = "Organic"
    if "self-serve" in distrib:
        growth_model = "Product Led Growth"
    elif "sales" in distrib:
        growth_model = "Sales Led Growth"
        
    risk_profile = "General Risk"
    if "sales" in distrib:
        risk_profile = "Distribution Risk"
    elif "high" in complexity:
        risk_profile = "Execution Risk"
        
    return {
        "archetype": archetype,
        "subtype": subtype,
        "growth_model": growth_model,
        "risk_profile": risk_profile,
        "pattern": "Standard SaaS" if "saas" in biz_model else "Custom App"
    }
