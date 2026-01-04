import { describe, it, expect } from "vitest";
import { mondayPersona } from "./monday";

describe("mondayPersona", () => {
  it("is hostile and non-empathetic", () => {
    const output = mondayPersona({
      userId: "test",
      efficiencyRank: 42,
      pastFailures: ["bad schema", "no tests"],
      messageCount: 10,
      contextFlags: {
        isMobile: false,
        isReturningUser: true,
        isUnderTimePressure: false,
      },
    });

    expect(output.tone).toBe("hostile");
    expect(output.systemPrompt).toContain("No sos empático");
  });
});
