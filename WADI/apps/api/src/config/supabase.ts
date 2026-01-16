import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("FATAL: Missing Supabase credentials.");
  console.error("Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  console.error("Found:", { 
    SUPABASE_URL: !!supabaseUrl, 
    SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey 
  });
  process.exit(1);
}

export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey
);

try {
  const url = new URL(supabaseUrl);
  console.log("🔌 Supabase Context:", url.hostname);
} catch (e) {
  console.error("❌ Invalid SUPABASE_URL format");
}
