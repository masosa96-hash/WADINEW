import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Try loading local .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Testing upload to 'attachments' bucket...");
  const fileName = `test_${Date.now()}.txt`;
  // Simple text file upload
  const { data, error } = await supabase.storage
    .from("attachments")
    .upload(fileName, "VERIFICATION_FILE", { upsert: true });

  if (error) {
    console.error("Upload FAILED:", error);
    // Check if bucket missing
    if (error.message.includes("Bucket not found")) {
      console.log("Creating 'attachments' bucket...");
      const { data: bucket, error: bucketError } =
        await supabase.storage.createBucket("attachments", {
          public: true,
        });
      if (bucketError) {
        console.error("Failed to create bucket:", bucketError);
      } else {
        console.log("Bucket created. Retrying upload...");
        const { data: retryData, error: retryError } = await supabase.storage
          .from("attachments")
          .upload(fileName, "VERIFICATION_FILE", { upsert: true });

        if (retryError) console.error("Retry FAILED:", retryError);
        else {
          console.log("Retry SUCCESS:", retryData);
          await supabase.storage.from("attachments").remove([fileName]);
        }
      }
    }
  } else {
    console.log("Upload SUCCESS:", data);
    // Cleanup
    await supabase.storage.from("attachments").remove([fileName]);
    console.log("Cleanup SUCCESS");
  }
}

run();
