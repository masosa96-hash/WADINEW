import { supabase } from '../supabase';
import { openai } from '../openai'; // Corrected import path based on file proximity

export const extractAndSaveKnowledge = async (userId: string, userMessage: string) => {
  try {
    // 1. Preguntarle a la IA si hay algo relevante para recordar
    const prompt = `
      Analiza el siguiente mensaje de un usuario y extrae "hechos" importantes sobre él, sus proyectos o preferencias.
      Si no hay nada relevante, responde "NONE".
      Si hay algo, responde en formato JSON: {"content": "el hecho", "category": "Personal|Proyecto|Preferencia", "confidence": 0-1}
      
      Mensaje: "${userMessage}"
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Usamos el modelo mini para que sea rápido y barato
      messages: [{ role: "system", content: "Sos un extractor de información preciso." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    if (result.content && result.content !== "NONE") {
      // 2. Guardar en Supabase
      const { error } = await supabase
        .from('wadi_knowledge_base')
        .insert({
          user_id: userId,
          content: result.content,
          category: result.category || 'General',
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
