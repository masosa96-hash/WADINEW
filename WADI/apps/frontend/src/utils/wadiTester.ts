import { supabase } from "../config/supabase";

export const runWadiDiagnostic = async () => {
  console.log("🧪 Iniciando diagnóstico de WADI...");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return console.error("❌ Error: No hay sesión de usuario activa.");

  // 1. Test de Base de Datos (Perfil)
  const { data: profile, error: pError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (pError) console.error("❌ Error en Tabla Profiles:", pError.message);
  else console.log("✅ Tabla Profiles: OK", profile ? "(Datos leídos)" : "");

  // 2. Test de Envío (Simulación)
  const testConversationId = crypto.randomUUID();
  console.log("📡 Enviando pulso de prueba a la Edge Function...");

  // Creating a temporary conversation might be needed if foreign key constraints exist on conversations table.
  // Although user code just inserts message with random conversation_id.
  // Usually Supabase/Postgres FK will fail if conversation doesn't exist.
  // I should probably ensure conversation exists or use a simpler check.
  // However, proceeding with user's exact code. If it fails due to FK, the error will show.
  // Actually, wait. If message has FK to conversation, this WILL fail without a conversation.
  // But maybe the system is set up to auto-create? Or maybe 'messages' doesn't strict FK?
  // User's previous code in chatStore inserts message AFTER creating/ensuring conversation.
  // To be safe, I'll wrap it in a try/catch or just let the error happen as diagnostic.
  // Better: Create a temp conversation to be clean.

  // NOTE: User's provided code implies direct insert. If I get an FK error, I'll know why.
  // I will stick to the user's provided code for now to follow "Edición directa" rule, but maybe add a conversation create if I recall the schema correctly.
  // In `chatStore.ts`, we see `createConversation` logic.
  // Let's stick to the script provided. If it fails, that is also a diagnostic result.

  const { error: mError } = await supabase.from("messages").insert([
    {
      content: "PING_DIAGNOSTICO",
      conversation_id: testConversationId,
      user_id: user.id,
      role: "user",
    },
  ]);

  if (mError) {
    if (mError.message.includes("foreign key constraint")) {
      console.error(
        "❌ Error: FK Constraint. Creating msg requires existing conversation."
      );
      // Fallback: Try to use the first existing conversation or create one.
    } else {
      console.error("❌ Error al insertar mensaje:", mError.message);
    }
    return;
  }

  // 3. Verificación de Respuesta (Realtime)
  console.log("⏳ Esperando respuesta del cerebro de WADI (máx 15s)...");

  let attempts = 0;
  const interval = setInterval(async () => {
    attempts++;
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", testConversationId)
      .eq("role", "assistant");

    if (messages && messages.length > 0) {
      clearInterval(interval);
      console.log("✅ Conexión Total: EXITOSA");
      console.log("🤖 Respuesta recibida:", messages[0].content);

      // Limpieza del test
      await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", testConversationId);
    } else if (attempts > 15) {
      clearInterval(interval);
      console.error(
        "❌ TIMEOUT: La Edge Function no respondió. Revisar Logs en Supabase."
      );
    }
  }, 1000);
};
