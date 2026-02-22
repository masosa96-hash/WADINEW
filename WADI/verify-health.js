async function verify() {
  const API_URL = "http://localhost:3000";
  console.log(`[VERIFY] Checking health at ${API_URL}/api/health...`);
  try {
    const res = await fetch(`${API_URL}/api/health`);
    const data = await res.json();
    console.log(`[VERIFY] Status: ${res.status}`);
    console.log(`[VERIFY] Body:`, JSON.stringify(data));
    if (res.status === 200 && data.status.includes("WADI ONLINE")) {
      console.log("[VERIFY] SUCCESS: API is healthy and format is correct.");
    } else {
      console.log("[VERIFY] FAILED: Health check returned unexpected response.");
      process.exit(1);
    }

    console.log(`[VERIFY] Checking 404 at ${API_URL}/api/not-found...`);
    const res404 = await fetch(`${API_URL}/api/not-found`);
    const data404 = await res404.json();
    console.log(`[VERIFY] 404 Status: ${res404.status}`);
    console.log(`[VERIFY] 404 Body:`, JSON.stringify(data404));
    if (res404.status === 404 && data404.status === "error") {
      console.log("[VERIFY] SUCCESS: 404 handling is standardized.");
    } else {
      console.log("[VERIFY] FAILED: 404 response is not standardized.");
      process.exit(1);
    }
  } catch (e) {
    console.error(`[VERIFY] ERROR: Could not connect to API. Is it running?`, e.message);
    process.exit(1);
  }
}
verify();
