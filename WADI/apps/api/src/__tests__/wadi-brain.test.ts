import { describe, it, expect } from "vitest";
import { wadiBrain } from "../wadi-brain";

describe("wadiBrain", () => {
  it("return a default response if not implemented", () => {
    const context = {
      userId: "test-user",
      message: "hello",
      history: [],
    };
    const decision = wadiBrain(context);
    expect(decision.response).toBe("WADI_BRAIN_NOT_FULL_IMPL");
    expect(decision.smokeIndex).toBeGreaterThanOrEqual(0);
  });
});
