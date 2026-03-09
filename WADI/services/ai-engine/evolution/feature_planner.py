def plan_feature(analysis: dict) -> dict:
    """
    Convierte el "Product Insight" en tickets tecnicos para el file_generator.
    """
    selected_feature = analysis.get("suggested_features", ["unknown_feature"])[0]
    
    # Mocking a technical breakdown
    if "onboarding" in selected_feature:
        return {
            "feature_name": "onboarding_wizard",
            "files_to_modify": [
                "frontend/pages/signup.tsx",
                "backend/api/user_routes.py"
            ],
            "description": "Step by step onboarding modal and backend flag to track completion."
        }
    
    return {
        "feature_name": "general_improvement",
        "files_to_modify": ["frontend/components/App.tsx"],
        "description": "General UX polish based on metrics."
    }
