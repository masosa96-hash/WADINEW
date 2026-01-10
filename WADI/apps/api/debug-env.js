// Standalone debug script to check environment variables
// This should be run as the start command temporarily to debug

console.log("--- STANDALONE DEBUG ENV START ---");
console.log("Node Version:", process.version);
console.log("Current Directory:", process.cwd());

const requiredVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY", "GROQ_API_KEY", "NODE_ENV", "PORT"];

requiredVars.forEach(key => {
    const value = process.env[key];
    if (value) {
        console.log(`${key}: PRESENT (Length: ${value.length})`);
        if (value.length < 10) console.log(`${key} Value: ${value}`); // Show full value if short (likely garbage)
    } else {
        console.log(`${key}: MISSING`);
    }
});

console.log("--- STANDALONE DEBUG ENV END ---");
