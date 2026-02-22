/**
 * WADI Regression Test Suite
 * Ensures that changes in prompts don't break the JSON structure or quality.
 */
import { generateCrystallizeStructure, ProjectStructure } from "../wadi-brain";
import * as dotenv from "dotenv";
import path from "path";

// Load ENV from root or local
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const TEST_CASES = [
  {
    name: "Micro-SaaS Subscriptions",
    description: "Una plataforma para que freelancers cobren suscripciones simples sin usar Stripe, usando crypto."
  },
  {
    name: "Idea Vaga",
    description: "Quiero hacer algo con inteligencia artificial para que la gente sea más feliz."
  },
  {
    name: "E-commerce Nicho",
    description: "Tienda online de mates artesanales tallados a mano con envíos a Europa."
  },
  {
    name: "Tooling Dev",
    description: "Un CLI que detecta y elimina leaks de memoria en aplicaciones Node.js en tiempo real."
  }
];

function validateShape(result: ProjectStructure): boolean {
  const keys: (keyof ProjectStructure)[] = [
    "problem", "solution", "target_icp", "value_proposition", 
    "recommended_stack", "milestones", "risks", "validation_steps"
  ];
  
  for (const key of keys) {
    if (!result[key]) {
      console.error(`Missing key: ${key}`);
      return false;
    }
  }
  
  const arrayKeys: (keyof ProjectStructure)[] = ["milestones", "risks", "validation_steps"];
  for (const key of arrayKeys) {
    if (!Array.isArray(result[key]) || (result[key] as string[]).length < 3) {
      console.error(`Array key "${key}" is either not an array or has length < 3`);
      return false;
    }
  }
  
  return true;
}

async function runRegression() {
  console.log("🚀 STARTING WADI REGRESSION TEST (Veteran Hardening)...");
  let passed = 0;

  for (const testCase of TEST_CASES) {
    const started = Date.now();
    process.stdout.write(`Testing: [${testCase.name}]... `);
    
    try {
      const result = await generateCrystallizeStructure(testCase.name, testCase.description);
      const isValid = validateShape(result);

      const duration = ((Date.now() - started) / 1000).toFixed(1);
      if (isValid) {
        console.log(`✅ PASS (${duration}s)`);
        passed++;
      } else {
        console.log(`❌ FAIL (${duration}s) - Invalid Structure`);
        console.log(JSON.stringify(result, null, 1));
      }
    } catch (err) {
      console.log(`❌ ERROR: ${(err as Error).message}`);
    }
  }

  console.log(`\n--- FINAL RESULTS ---`);
  console.log(`Total: ${TEST_CASES.length} | Passed: ${passed} | Failed: ${TEST_CASES.length - passed}`);
  
  if (passed === TEST_CASES.length) {
    console.log("💎 100% SUCCESS. Systems are stable and structural integrity is maintained.");
    process.exit(0);
  } else {
    console.log("⚠️ REGRESSION DETECTED. Please review prompts in wadi-brain.ts or LLM provider status.");
    process.exit(1);
  }
}

runRegression().catch(err => {
  console.error("Fatal Error running regression:", err);
  process.exit(1);
});
