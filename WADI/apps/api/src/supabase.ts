import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import type { Database } from "@wadi/db-types";
dotenv.config({ path: "../../.env" });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "⚠️ Missing Supabase URL or Key. functionality will be limited."
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder"
);
