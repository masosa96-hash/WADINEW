import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { wadiBrain } from "../../../packages/wadi-core/src/brain.ts";

serve(async (req) => {
  try {
    const body = await req.json();

    const result = wadiBrain({
      userId: body.userId ?? "edge",
      message: body.message,
      history: body.history ?? [],
    });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
