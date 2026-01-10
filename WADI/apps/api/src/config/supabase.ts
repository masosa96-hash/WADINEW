import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("FATAL: Missing Supabase credentials in environment variables.");
  
  // Safe Debug Logging
  console.log("--- CREDENTIALS CHECK ---");
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`SUPABASE_URL: ${supabaseUrl ? "Present" : "MISSING"} (Length: ${supabaseUrl?.length || 0})`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? "Present" : "MISSING"} (Length: ${supabaseServiceKey?.length || 0})`);
  console.log("-------------------------");

  console.error("Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Render Dashboard.");
  process.exit(1);
}

export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey
);
