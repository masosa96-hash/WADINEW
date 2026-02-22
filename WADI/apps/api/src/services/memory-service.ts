import { supabase } from "../supabase";
import { getSmartLLM } from "./ai-service";
import { logger } from "../core/logger";

class MemoryService {
  async generateEmbedding(text: string): Promise<number[]> {
    const openai = getSmartLLM();
    
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy-key") {
      logger.warn("[MEMORY] OpenAI key not found, using mock embedding");
      return new Array(1536).fill(0);
    }

    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error: any) {
      logger.error({ msg: "embedding_generation_failed", error: error.message });
      throw error;
    }
  }

  async saveMemory(userId: string, content: string, metadata: any = {}, projectId?: string) {
    try {
      const embedding = await this.generateEmbedding(content);
      
      const { error } = await (supabase as any).from("long_term_memory").insert({
        user_id: userId,
        project_id: projectId,
        content,
        metadata,
        embedding
      });

      if (error) throw error;
      logger.info({ msg: "memory_saved", userId, projectId });
    } catch (error: any) {
      logger.error({ msg: "save_memory_failed", error: error.message });
    }
  }

  async searchMemories(userId: string, query: string, limit: number = 3) {
    try {
      const embedding = await this.generateEmbedding(query);
      
      const { data, error } = await (supabase.rpc as any)("match_memories", {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: limit,
        p_user_id: userId
      });

      if (error) throw error;
      return (data as any[]) || [];
    } catch (error: any) {
      logger.error({ msg: "search_memory_failed", error: error.message });
      return [];
    }
  }
}

export const memoryService = new MemoryService();
