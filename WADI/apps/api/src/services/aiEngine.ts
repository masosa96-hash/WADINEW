import axios from "axios";

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";

export async function analyzeIdea(ideaId: string, description: string = "") {
  try {
    const res = await axios.post(`${AI_ENGINE_URL}/analyze`, {
      idea_id: ideaId,
      description
    });
    return res.data;
  } catch (error: any) {
    console.error("[aiEngine] analyzeIdea failed:", error?.message);
    throw error;
  }
}

export async function generateProject(playbook: Record<string, any>) {
  try {
    const res = await axios.post(`${AI_ENGINE_URL}/generate`, {
      playbook
    });
    return res.data;
  } catch (error: any) {
    console.error("[aiEngine] generateProject failed:", error?.message);
    throw error;
  }
}
