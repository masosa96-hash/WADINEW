import express from "express";
import { openai, AI_MODEL } from "../openai.js";
import { WADI_SYSTEM_PROMPT } from "../wadi-brain.js";

const router = express.Router();

// GET /api/kivo (status)
router.get("/", (req, res) => {
  res.json({
    service: "kivo",
    status: "ready",
    message: "Kivo module is online",
  });
});

// POST /api/kivo/chat (Frontend endpoint)
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: WADI_SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;
    return res.json({ reply });
  } catch (err) {
    console.error("Kivo error:", err);
    // DEBUG: Retornamos el error exacto para verlo en frontend
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/kivo/run (Legacy/Internal)
router.post("/run", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });
    return res.json({ reply: `You said: ${message}` });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/kivo/session
router.post("/session", (req, res) => {
  res.json({ session: true, timestamp: Date.now() });
});

export default router;
