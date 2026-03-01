import { describe, it, expect } from "vitest";
import { resolvePersona } from "./resolve";
import { PersonaInput } from "./types";

describe("resolvePersona Heuristics", () => {
  const baseContext: PersonaInput = {
    userId: "test-user-1",
    messageCount: 1,
    stressLevel: "low",
    isRepeatingError: false,
    pastFailures: [],
    projectContext: { description: "Standard project" }
  };

  it("should select SOCIO_IRONICO by default", () => {
    const result = resolvePersona(baseContext);
    expect(result.personaId).toBe("SOCIO_IRONICO");
    expect(result.tone).toBe("hostile");
  });

  it("should select MODO_CALMA when stress is high", () => {
    const result = resolvePersona({ ...baseContext, stressLevel: "high" });
    expect(result.personaId).toBe("MODO_CALMA");
    expect(result.tone).toBe("calm");
  });

  it("should select ARQUITECTO_SERIO for production projects", () => {
    const result = resolvePersona({ 
      ...baseContext, 
      projectContext: { description: "This is for a producción environment" } 
    });
    expect(result.personaId).toBe("ARQUITECTO_SERIO");
    expect(result.tone).toBe("serious");
  });

  it("should select MODO_EJECUCION when focus mode is active", () => {
    const result = resolvePersona({ ...baseContext, activeFocus: "coding" });
    expect(result.personaId).toBe("MODO_EJECUCION");
    expect(result.tone).toBe("boss");
  });
});

describe("resolvePersona Anti-Flapping", () => {
  const baseContext: PersonaInput = {
    userId: "test-user-1",
    messageCount: 1,
    stressLevel: "low",
    isRepeatingError: false,
    pastFailures: [],
    lastPersona: "MODO_CALMA",
    turnsActive: 1
  };

  it("should stick to MODO_CALMA if turnsActive < 3 and candidate is weaker", () => {
    // Default candidate would be SOCIO_IRONICO (Strength 1)
    // Current is MODO_CALMA (Strength 3)
    const result = resolvePersona(baseContext);
    expect(result.personaId).toBe("MODO_CALMA");
    expect(result.reason).toContain("Anti-flapping");
  });

  it("should allow switching if candidate is STRONGER even if turnsActive < 3", () => {
    // Current SOCIO_IRONICO (Strength 1)
    // Candidate MODO_CALMA (Strength 3)
    const context: PersonaInput = {
        ...baseContext,
        lastPersona: "SOCIO_IRONICO",
        stressLevel: "high"
    };
    const result = resolvePersona(context);
    expect(result.personaId).toBe("MODO_CALMA");
  });

  it("should allow switching if turnsActive >= 3", () => {
    const result = resolvePersona({ ...baseContext, turnsActive: 3 });
    expect(result.personaId).toBe("SOCIO_IRONICO");
  });
});
