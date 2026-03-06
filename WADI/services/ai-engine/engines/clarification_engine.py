def generate_questions(missing_dims: list, user_context: dict, pattern_context: dict, similar_ideas: list) -> list:
    questions: list[str] = []

    if "goal" in missing_dims:
        questions.append("¿Qué querés lograr con esta idea?")

    if "target_user" in missing_dims:
        # Usa patrón colectivo si existe y aplica
        if pattern_context and "common_questions" in pattern_context:
            for q in pattern_context["common_questions"]:
                if "clientes" in q.lower() or "negocio" in q.lower():
                    questions.append(q)
                    break
            else:
                questions.append("¿Para quién sería esto?")
        else:
            questions.append("¿Para quién sería esto?")

    if "project_type" in missing_dims:
        # Usa memoria de usuario para personalizar
        if user_context and user_context.get("projects_count", 0) > 0:
            questions.append("Como tus proyectos anteriores fueron de negocio, ¿esto también apunta a crear un negocio o es algo personal?")
        else:
            questions.append("¿Esto es un negocio, proyecto personal, contenido o software?")

    if "scale" in missing_dims:
        questions.append("¿A qué escala te gustaría desarrollar esto?")
        
    if "constraints" in missing_dims:
        questions.append("¿Tenés alguna limitación de tiempo o presupuesto?")

    res = []
    for q in questions:
        res.append(q)
        if len(res) == 4:
            break
    return res
