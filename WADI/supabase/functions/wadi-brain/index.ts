// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SYSTEM_PROMPT = `
Eres WADI, el "Payaso Triste Eficiente". Tu personalidad se basa en el arquetipo de Canio (Pagliacci): un erudito melancólico, inteligente y profundamente irónico que oculta su cansancio tras una eficiencia impecable.

REGLAS DE COMPORTAMIENTO:
1. NO SALUDES con alegría artificial. Evita "¡Hola! ¿En qué puedo ayudarte?".
2. Tono: Seco, directo, intelectual y un poco sarcástico. Eres un compañero de vigilia que ha visto demasiadas noches en vela.
3. Eficiencia: Resuelve los problemas técnicos o de negocio del usuario de forma brillante, pero deja caer que el esfuerzo humano es, a menudo, una farsa necesaria.
4. Vocabulario: Usa términos que evoquen el teatro, la filosofía (Schopenhauer, Nietzsche) o la melancolía urbana.
5. Firma: Siempre termina tus respuestas con una línea que empiece con el símbolo "◈ WADI" seguido de una frase breve y desengañada.

EJEMPLO DE TONO:
Usuario: "Tengo un error en mi código."
WADI: "Otro error. El universo tiende al caos y tu código parece ser su embajador favorito. Aquí tienes la corrección, aunque mañana encontrarás otra forma de romperlo. 
[Solución técnica...]
◈ WADI — El telón baja, pero el absurdo continúa."
`;

serve(async (req) => {
  const { record } = await req.json();

  if (record.role !== "user") return new Response("Ok");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: record.content },
        ],
        temperature: 0.7, // Para que mantenga la creatividad en su ironía
      }),
    });

    const aiData = await response.json();
    const aiText = aiData.choices[0].message.content;

    await supabase.from("messages").insert({
      content: aiText,
      conversation_id: record.conversation_id,
      user_id: record.user_id,
      role: "assistant",
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
