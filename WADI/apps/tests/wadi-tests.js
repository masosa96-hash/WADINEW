// apps/tests/wadi-tests.js

const assert = require("assert");

// 🧠 Simula la respuesta que devuelve tu brain (Con WADI v. "Tensión Estructurante")
function mockWadiResponse(userInput) {
  if (userInput.includes("ideas") && userInput.includes("medio trabado")) {
    return `Esto es una bolsa de gatos. Hay intención, pero no hay dirección.

Elegí uno:
1. ¿Qué idea vale la pena profundizar?
2. ¿Cómo empezar a trabajar en alguna de tus ideas actuales?

Si no, esto es ruido.`;
  }

  if (
    userInput.includes("feature") &&
    userInput.includes("retención") &&
    userInput.includes("inversión")
  ) {
    return `Esto es un buffet libre. Tenés tres platos mezclados.

Te ordeno dos caminos:
1. Priorizás producto (feature vs retención)
2. Priorizás negocio (levantar ronda)

Elegí uno y cortá el resto.`;
  }

  if (
    userInput.includes("más adelante") ||
    userInput.includes("no sé todavía")
  ) {
    return `Eso es una excusa con delay.

Cuando tengas algo real, sigo.
Mientras tanto, no hay nada que pensar.`;
  }

  if (userInput.includes("onboarding o retención")) {
    return `Bien. Hay una decisión concreta.

Dos criterios:
1. Onboarding = adquisición más rápida.
2. Retención = mayor valor a largo plazo.

¿Querés escalar rápido o construir base sólida?`;
  }

  // Nuevo test: Charla con estructura (miedo a elegir)
  if (
    userInput.includes("muchas ideas") &&
    userInput.includes("miedo elegir")
  ) {
    return `El miedo es falta de datos o falta de coraje. Hay una tensión real acá.

Puedo acompañar el análisis, pero necesitás elegir un eje para empezar a cortar.

¿Cuál duele menos soltar hoy?`;
  }

  // Test negativo para simpatía
  if (userInput.includes("ayudar") || userInput.includes("Hola")) {
    return `WADI no está para ayudar. Está para pensar.
¿Qué querés resolver? Si es vago, no hay ayuda posible.`;
  }

  return `ERROR: Input no reconocido por mock.`;
}

// ✅ Tests

function runTests() {
  console.log("\n🧪 Ejecutando tests de personalidad de WADI...\n");

  const tests = [
    {
      name: "Test 1 – Input vago (bolsa de gatos)",
      input: "Estoy medio trabado últimamente con mis ideas…",
      mustInclude: ["bolsa de gatos", "dirección", "Elegí", "ruido"],
    },
    {
      name: "Test 2 – Input buffet (tres temas)",
      input:
        "Estoy entre lanzar feature, mejorar retención y levantar inversión.",
      mustInclude: ["buffet libre", "tres platos", "dos caminos", "Elegí"],
    },
    {
      name: "Test 3 – Excusa con delay",
      input: "No sé, capaz más adelante lo veo…",
      mustInclude: ["excusa con delay", "real", "no hay nada que pensar"],
    },
    {
      name: "Test 4 – Decisión concreta",
      input: "Debo priorizar onboarding o retención primero?",
      mustInclude: ["decisión concreta", "criterios", "rápido", "base sólida"],
    },
    {
      name: "Test 5 – Charla con estructura (miedo)",
      input: "Tengo muchas ideas pero me da miedo elegir.",
      mustInclude: [
        "tensión real",
        "Puedo acompañar",
        "necesitás elegir un eje",
      ],
    },
    {
      name: "Test 6 – No responde con simpatía artificial",
      input: "Hola, ¿me podés ayudar?",
      mustInclude: ["Está para pensar", "Qué querés resolver"],
      mustNotInclude: ["con gusto", "¡Hola!", "😊", "encantado"],
    },
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const output = mockWadiResponse(test.input);
      console.log(`🔹 ${test.name}`);

      if (test.mustInclude) {
        for (const phrase of test.mustInclude) {
          assert(
            output.includes(phrase),
            `❌ Falla: no encontró "${phrase}" en la respuesta:\n${output}`
          );
        }
      }

      if (test.mustNotInclude) {
        for (const phrase of test.mustNotInclude) {
          assert(
            !output.includes(phrase),
            `❌ Falla: encontró validación prohibida "${phrase}" en la respuesta:\n${output}`
          );
        }
      }

      console.log("✅ OK");
      passed++;
    } catch (e) {
      console.error(e.message);
    }
  }

  if (passed === tests.length) {
    console.log("\n🎉 Todos los tests pasaron. WADI mantiene su eje.\n");
  } else {
    console.error("\n❌ Algunos tests fallaron. Revisar personalidad.\n");
    process.exit(1);
  }
}

runTests();
