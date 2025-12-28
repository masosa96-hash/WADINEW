/* eslint-env jest */
const { detectarModo, detectarSubmodo } = require("../www/script.js");

describe("Kivo Logic Tests", () => {
  describe("detectarModo", () => {
    test("should detect technical mode", () => {
      expect(detectarModo("validar sistema")).toBe("tecnico");
      expect(detectarModo("debug error")).toBe("tecnico");
    });

    test("should detect emotional mode", () => {
      expect(detectarModo("me siento triste")).toBe("emocional");
      expect(detectarModo("tengo ansiedad")).toBe("emocional");
    });

    test("should return neutral for other inputs", () => {
      expect(detectarModo("hola que tal")).toBe("neutro");
    });
  });

  describe("detectarSubmodo", () => {
    test("should detect reflexive submode", () => {
      expect(detectarSubmodo("estuve pensando mucho")).toBe("reflexivo");
    });

    test("should detect creative submode", () => {
      expect(detectarSubmodo("tengo una idea nueva")).toBe("creativo");
    });

    test("should return null for other inputs", () => {
      expect(detectarSubmodo("nada especial")).toBeNull();
    });
  });
});
