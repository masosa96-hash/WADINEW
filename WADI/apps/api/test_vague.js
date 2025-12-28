async function testVague() {
  try {
    const res = await fetch("http://127.0.0.1:10000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Quiero hacer algo innovador",
        conversationId: "test-session-vague",
        mode: "normal",
        topic: "general",
        isMobile: false,
        memory: {},
      }),
    });

    if (!res.ok) {
      console.log("Status:", res.status);
      const txt = await res.text();
      console.log("Error Body:", txt);
      return;
    }

    const data = await res.json();
    console.log("WADI RESPONSE:\n" + data.reply);
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

testVague();
