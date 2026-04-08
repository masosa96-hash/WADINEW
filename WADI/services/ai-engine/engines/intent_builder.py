def build_intent(answers):
    if not isinstance(answers, dict):
        answers = {}

    intent = {
        "idea": answers.get("idea"),
        "domain": answers.get("domain", "business"),
        "target": answers.get("target") or answers.get("target_user", "general"),
        "complexity": answers.get("complexity", "medio"),
        "model": answers.get("project_type", "unknown"),
        "scale": answers.get("scale", "small")
    }

    return intent
