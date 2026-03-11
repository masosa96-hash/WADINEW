def generate_questions(missing_dims: list, user_context: dict, pattern_context: dict, similar_ideas: list) -> list:
    questions: list[str] = []

    if "goal" in missing_dims:
        questions.append("¿Qué querés lograr con esto? Sé específico, no me vengas con 'cambiar el mundo'.")

    if "target_user" in missing_dims:
        # Usa patrón colectivo si existe y aplica
        if pattern_context and "common_questions" in pattern_context:
            for q in pattern_context["common_questions"]:
                if "clientes" in q.lower() or "negocio" in q.lower():
                    questions.append(q)
                    break
            else:
                questions.append("¿Para quién es esto? ¿Quién se supone que lo va a usar?")
        else:
            questions.append("¿Para quién es esto? ¿Quién se supone que lo va a usar?")

    if "project_type" in missing_dims:
        # Usa memoria de usuario para personalizar
        if user_context and user_context.get("projects_count", 0) > 0:
            questions.append("Como tus laburos anteriores fueron de negocio, ¿esto también es para facturar o es un hobby personal?")
        else:
            questions.append("¿Esto es un negocio, algo personal, contenido o solo software para jugar?")

    if "scale" in missing_dims:
        questions.append("¿A qué escala lo pensás? ¿Algo para vos o para que lo use el mundo entero?")
        
    if "constraints" in missing_dims:
        questions.append("¿Tenés límites de tiempo o presupuesto, o pensás que los recursos son infinitos?")

    res = []
    for q in questions:
        res.append(q)
        if len(res) == 4:
            break
    return res
