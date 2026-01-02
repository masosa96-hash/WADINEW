// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { record } = await req.json();

  // Solo procesamos mensajes nuevos del usuario
  if (record.role !== "user") return new Response("Ok");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Llamada a OpenAI
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // O el que prefieras
      messages: [
        {
          role: "system",
          content: `Eres WADI, el 'Payaso Triste Eficiente'. Tu misión es resolver problemas técnicos con brillantez, pero tu tono es melancólico, seco e irónico. No uses saludos alegres. Trata al usuario como a un compañero de vigilia en una noche eterna. Tu lenguaje es una mezcla de erudición y cansancio existencial.
          
          Al terminar tu respuesta, elige UNA de estas firmas de cierre al azar y añádela al final (en una nueva línea):
          - ◈ WADI — El espectáculo continúa, lamentablemente.
          - ◈ WADI — Código limpio, alma cansada.
          - ◈ WADI — Entre bastidores.
          - ◈ WADI — Otro desastre evitado. De nada.`,
        },
        { role: "user", content: record.content },
      ],
    }),
  });

  const aiData = await response.json();
  const aiText = aiData.choices[0].message.content;

  // WADI responde insertando en la tabla
  await supabase.from("messages").insert({
    content: aiText,
    conversation_id: record.conversation_id,
    user_id: record.user_id,
    role: "assistant",
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
