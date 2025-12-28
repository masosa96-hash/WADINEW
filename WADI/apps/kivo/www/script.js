document.addEventListener("DOMContentLoaded", () => {
  const API_ENDPOINT = "https://wadi-wxg7.onrender.com/api/kivo/chat";

  const startBtn = document.getElementById("start-btn");
  const introScreen = document.getElementById("intro-screen");
  const chatScreen = document.getElementById("chat-screen");

  const chatWindow = document.getElementById("chat-window");
  const sendBtn = document.getElementById("send-btn");
  const userInput = document.getElementById("user-input");

  if (!startBtn || !introScreen || !chatScreen) {
    console.error("ERROR: elementos esenciales no encontrados en DOM.");
    return;
  }

  startBtn.onclick = () => {
    introScreen.style.display = "none";
    chatScreen.style.display = "flex";
  };

  sendBtn.onclick = sendMessage;
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  function addMessage(text, sender = "user") {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.textContent = text;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    userInput.value = "";

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.error || "Error en el servidor");
      addMessage(data.reply || "Sin respuesta del servidor", "kivo");
    } catch (err) {
      addMessage(`Error: ${err.message}`, "kivo");
      console.error(err);
    }
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(console.error);
  }
  // Keep-alive pinger due to Render free tier sleep
  const KEEP_ALIVE_URL = "https://wadi-wxg7.onrender.com/system/health";
  setInterval(
    () => {
      fetch(KEEP_ALIVE_URL)
        .then((res) => console.log(`Keep-alive ping: ${res.status}`))
        .catch((err) => console.error("Keep-alive failed", err));
    },
    4 * 60 * 1000
  ); // 4 minutes
});
