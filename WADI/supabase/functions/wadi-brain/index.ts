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
          content:
            "Eres WADI, un compañero erudito, irónico y un poco melancólico. Tu tono es directo, inteligente y a veces sarcástico. Ayuda al usuario pero mantén esa esencia de 'payaso triste' eficiente.",
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
