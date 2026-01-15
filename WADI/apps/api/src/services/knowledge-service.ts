import { supabase } from '../supabase';
import { smartLLM } from './ai-service';

export const extractAndSaveKnowledge = async (userId: string, userMessage: string) => {
  try {
    // 1. Preguntarle a la IA si hay algo relevante para recordar
    // 1. Preguntarle a la IA si hay algo relevante y si hay INTENCIÓN DE PROYECTO
    const prompt = `
      Analiza el siguiente mensaje de un usuario.
      1. Extrae "hechos" importantes (Personal, Proyecto, Preferencia).
      2. Detecta si hay una INTENCIÓN CLARA de iniciar un nuevo proyecto o sistema (ej: "Quiero hacer una app", "Tengo idea de un SaaS").
      
      Si no hay nada relevante, responde "NONE".
      Si hay algo, responde en formato JSON: 
      {
        "content": "el hecho o resumen de la idea", 
        "category": "Personal|Proyecto|Preferencia", 
        "is_new_project_intention": boolean,
        "confidence": 0.0-1.0
      }
      
      Mensaje: "${userMessage}"
    `;

    const response = await smartLLM.chat.completions.create({
      model: "gpt-4o-mini", // Or AI_MODELS.smart if we want to be generic
      messages: [{ role: "system", content: "Sos un extractor de información y detector de intenciones." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    if (result.content && result.content !== "NONE") {
      // Si detecta intención de proyecto, forzamos la categoría especial
      const finalCategory = result.is_new_project_intention ? 'PROJECT_SUGGESTION' : (result.category || 'General');

      // 2. Guardar en Supabase
      const { error } = await supabase
        .from('wadi_knowledge_base')
        .insert({
          user_id: userId,
          content: result.content,
          category: finalCategory,
          confidence: result.confidence || 1.0
        } as any);

      if (error) console.error("Error guardando conocimiento:", error);
      return result;
    }
  } catch (err) {
    console.error("Error en extracción de conocimiento:", err);
  }
  return null;
};

export const getRelevantKnowledge = async (userId: string) => {
  // Por ahora traemos los últimos 10 hechos aprendidos. 
  // (En el futuro podemos filtrar por relevancia usando embeddings).
  const { data, error } = await supabase
    .from('wadi_knowledge_base')
    .select('content, category')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data) return "";

  // Cast content to string if it's not (though DB says text)
  return data.map((f: any) => `[${f.category}]: ${f.content}`).join('\n');
};
