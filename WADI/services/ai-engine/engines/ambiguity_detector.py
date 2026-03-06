DIMENSIONS = [
    "goal",
    "target_user",
    "project_type",
    "scale",
    "constraints"
]

def detect_missing(context):
    missing = []
    
    if not isinstance(context, dict):
        context = {}

    for dim in DIMENSIONS:
        if dim not in context or context[dim] is None:
            missing.append(dim)

    return missing
