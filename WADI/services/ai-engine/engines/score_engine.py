def score_engine(dimensions: dict) -> dict:
    """
    Evalúa la viabilidad comercial y estructura el Idea Score base.
    """
    market = 10
    scope = dimensions.get("market_scope", "").lower()
    scale = dimensions.get("scale_potential", "").lower()
    if scope == "global": market += 20
    elif scope == "regional": market += 10
    if scale == "venture": market += 20
    elif scale == "startup": market += 10
        
    monetization = 10
    biz_model = dimensions.get("business_model", "").lower()
    monet_type = dimensions.get("monetization", "").lower()
    if monet_type == "subscription": monetization += 20
    if biz_model == "saas": monetization += 10
        
    distribution = 10
    distrib = dimensions.get("distribution", "").lower()
    customer_type = dimensions.get("customer_type", "").lower()
    if distrib == "self-serve": distribution += 20
    elif distrib == "sales-led": distribution += 10
    if customer_type == "b2b": distribution += 10
        
    complexity = 10
    comp_type = dimensions.get("complexity", "").lower()
    if comp_type == "low": complexity = 20
    elif comp_type == "medium": complexity = 10
    else: complexity = 5
        
    competition = 15 # Default mock
    innovation = 10
    innov_type = dimensions.get("innovation_type", "").lower()
    if innov_type == "deep tech": innovation = 20
    elif innov_type == "ai leverage": innovation = 15
    elif innov_type == "workflow improvement": innovation = 10
        
    overall = (market * 0.2 + distribution * 0.2 + monetization * 0.2 + complexity * 0.15 + competition * 0.15 + innovation * 0.1)
    
    return {
        "market_score": min(market, 100),
        "distribution_score": min(distribution, 100),
        "monetization_score": min(monetization, 100),
        "complexity_score": min(complexity, 100),
        "competition_score": min(competition, 100),
        "innovation_score": min(innovation, 100),
        "overall_score": round(min(float(overall), 100.0), 2)  # type: ignore
    }
