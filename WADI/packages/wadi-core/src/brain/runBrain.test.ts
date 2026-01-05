import { describe, it, expect } from "vitest";
import { runBrain } from "./runBrain";

describe("runBrain", () => {
    // This requires mocking OpenAI, but for now we test the fallback logic
    // by mocking callLLM or expecting failure without API KEY.
    // However, since we don't mock modules easily without setup, 
    // we'll rely on the fact that without API Key it throws or returns error, triggering fallback.
    
    it("returns fallback on execution failure (no apiKey/network)", async () => {
        const res = await runBrain({ messages: [] });
        expect(res.meta?.degraded).toBe(true);
        expect(res.response).toContain("problema");
    });
});
