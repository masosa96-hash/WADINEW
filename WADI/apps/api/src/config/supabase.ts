import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("FATAL: Missing Supabase credentials in environment variables.");
  console.log("--- DEBUG INFO ---");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("SUPABASE_URL is set:", !!supabaseUrl, supabaseUrl ? `(Length: ${supabaseUrl.length})` : "");
  console.log("SUPABASE_SERVICE_ROLE_KEY is set:", !!supabaseServiceKey, supabaseServiceKey ? `(Length: ${supabaseServiceKey.length})` : "");
  console.log("Current working directory:", process.cwd());
  console.log("--- END DEBUG ---");
  console.error("Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey
);
