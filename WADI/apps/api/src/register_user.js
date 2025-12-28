import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function register() {
  const { data, error } = await supabase.auth.signUp({
    email: "test@example.com",
    password: "password123",
  });

  if (error) {
    console.error("Error registering:", error.message);
  } else {
    console.log("User registered:", data.user?.email);
  }
}

register();
