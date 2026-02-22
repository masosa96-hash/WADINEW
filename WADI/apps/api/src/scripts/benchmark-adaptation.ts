/**
 * WADI Adaptive Benchmark
 * Validates that cognitive profiles actually influence generation.
 */
import { generateCrystallizeStructure } from "../wadi-brain";
import { getCognitiveProfileSummary } from "../services/cognitive-service";

async function runBenchmark() {
  const testIdea = {
    name: "Lean Tracker",
    description: "A minimalist app to track habits without distractions."
  };

  console.log("--- STARTING ADAPTIVE BENCHMARK ---");

  // 1. Baseline (No profile)
  console.log("\n[1/3] Generating Baseline...");
  const baseline = await generateCrystallizeStructure(testIdea.name, testIdea.description);
  console.log(`Baseline Milestones: ${baseline.milestones.length}`);
  console.log(`Baseline Stack: ${baseline.recommended_stack.length} items`);

  // 2. Adapted (Low Complexity Preference)
  console.log("\n[2/3] Generating Adapted (Lean Profile)...");
  const leanProfile = "User prefers lean MVP stacks, avoids over-engineering. Favors short, high-impact milestone lists.";
  const adaptedLean = await generateCrystallizeStructure(testIdea.name, testIdea.description, [], leanProfile);
  console.log(`Adapted Milestones: ${adaptedLean.milestones.length}`);
  console.log(`Adapted Stack: ${adaptedLean.recommended_stack.length} items`);

  // 3. Comparison
  const milestoneDiff = baseline.milestones.length - adaptedLean.milestones.length;
  console.log(`\n--- RESULT ---`);
  if (milestoneDiff > 0) {
    console.log(`✅ ADAPTATION DETECTED: Reduced milestones by ${milestoneDiff} items.`);
  } else if (milestoneDiff < 0) {
    console.log(`⚠️ REVERSE ADAPTATION: Increased milestones by ${Math.abs(milestoneDiff)} items.`);
  } else {
    console.log(`ℹ️ NO CHANGE: Structure remained identical.`);
  }

  console.log("\nBenchmark complete.");
}

if (require.main === module) {
  runBenchmark().catch(console.error);
}
