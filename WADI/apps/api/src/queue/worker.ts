import { Worker } from "bullmq";
import { createRedis } from "@wadi/core";
import { runBrain } from "@wadi/core";
import { chatQueue } from "./chatQueue.js";
import { supabase } from "../supabase";

// Singleton worker instance to avoid duplicates in dev
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let worker: Worker<any, any, string> | null = null;

export function startWorker() {
  if (worker) {
    console.log("[Worker] Already running.");
    return;
  }

  console.log("[Worker] Starting chat worker...");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  worker = new Worker<any, any, string>(
    "chat",
    async (job) => {
      const start = Date.now();
      const { id, data } = job;
      console.log(`[Worker] 🚀 Processing job ${id} for user ${data.userId}`);
      
      // 1. RAG Retrieve (Async Step)
      let ragContext = "";
      try {
          // Dynamic import or usage if available. Importing from @wadi/core now.
          const { searchKnowledgeBase } = await import("@wadi/core");
          
          if (data.message && data.userId) {
             const docs = await searchKnowledgeBase(data.message, { userId: data.userId, limit: 3 });
             if (docs && docs.length > 0) {
                 ragContext = docs.map((d: any) => `[DOC_ID:${d.id}]: ${d.content}`).join("\n---\n");
                 console.log(`[Worker] 🧠 RAG Found ${docs.length} docs for job ${id}`);
             }
          }
      } catch (e) {
          console.error(`[Worker] ⚠️ RAG Error for job ${id}:`, e);
          // Continue without RAG
      }

      // 2. Inject Context into Messages
      // Use pre-computed messages from API if available (Legacy/Fallback: simple user msg)
      let messages = data.messages || [{ role: "user", content: data.message }];
      
      if (ragContext) {
          // Strategy: Inject as System message just before the last User message
          // OR prepend to the specific user message. 
          // Let's prepend to the User content for strongest attention.
          const lastMsg = messages[messages.length - 1];
          if (lastMsg.role === "user") {
              // Modify NOT in place if we want to be pure, but here we can mutate the local var
              // Use specific marker for Brain to recognize context
              const originalContent = typeof lastMsg.content === 'string' ? lastMsg.content : JSON.stringify(lastMsg.content);
              // Check if complex content (array) - if so, this is harder. 
              // Assuming string for now based on routes.ts userContent handling (it can be array if images).
              
              if (Array.isArray(lastMsg.content)) {
                  // If content is array (multimodal), add text block at start
                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (lastMsg.content as any[]).unshift({ type: "text", text: `## CONTEXTO RECUPERADO (RAG):\n${ragContext}\n\n## USUARIO:\n` });
              } else {
                  lastMsg.content = `## CONTEXTO RECUPERADO (RAG):\n${ragContext}\n\n## USUARIO:\n${originalContent}`;
              }
          } else {
              // If last msg is not user (weird), just push a system message
              messages.push({ role: "system", content: `CONTEXTO RAG:\n${ragContext}` });
          }
      }

      // 3. Execution
      const result = await runBrain(messages);

      // 4. Persistence (SAVE THE RESPONSE)
      if (data.conversationId && result.response) {
          try {
             // Use static import
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             const { error: saveError } = await supabase.from("messages").insert({
                 conversation_id: data.conversationId,
                 role: "assistant",
                 content: result.response,
                 // CRITICAL FIX: Associate with user so RLS allows them to see it.
                 // If anonymous (string ID), keep null to avoid UUID FK violation.
                 user_id: data.userId.startsWith("anonymous_") ? null : data.userId,
                 meta: result.meta || {}
             } as any);
             
             if (saveError) {
                 console.error(`[Worker] ❌ DB Save Failed for job ${id}:`, saveError);
             } else {
                 console.log(`[Worker] 💾 Message Saved to DB for conversation ${data.conversationId}`);
             }
          } catch (dbErr) {
             console.error(`[Worker] ❌ Critical DB Error for job ${id}:`, dbErr);
          }
      } else {
          console.warn(`[Worker] ⚠️ Skipping DB Save: No conversationId (${data.conversationId}) or empty response.`);
      }

      const duration = Date.now() - start;
      console.log(`[Worker] ✅ Job ${id} Done in ${duration}ms`);

      return {
        ok: true,
        response: result,
        degraded: result.meta?.degraded,
        metrics: {
            duration,
            ragDocs: ragContext ? 1 : 0
        }
      };
    },
    {
      connection: createRedis() as any,
      concurrency: 3,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    }
  );

  worker.on("completed", (job) => {
    // console.log(`[Worker] Job ${job.id} completed!`); // Handled inside logic for timing
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker] ❌ Job ${job?.id} failed: ${err.message}`);
  });
}
