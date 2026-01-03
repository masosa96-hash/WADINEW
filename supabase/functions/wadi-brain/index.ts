import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const body = await req.json();
  return new Response(
    JSON.stringify({
      ok: true,
      message: "wadi-brain function alive",
      input: body
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
