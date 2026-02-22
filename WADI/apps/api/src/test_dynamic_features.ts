import { featureService } from "./services/features/feature-service";

async function testDynamicVariables() {
  console.log("🚀 TESTING DYNAMIC VARIABLE REPLACEMENT...");

  const params = {
    entityLow: "order",
    entityCap: "Order"
  };

  const recipe = featureService.getRecipe("basic-crud", params);
  
  if (!recipe) {
    console.error("❌ Recipe 'basic-crud' not found!");
    process.exit(1);
  }

  console.log(`Recipe: ${recipe.name}`);
  for (const change of recipe.changes) {
    console.log(`\n--- Path: ${change.path} ---`);
    console.log(change.content.slice(0, 150) + "...");
    
    if (change.path.includes("${") || change.content.includes("${")) {
      console.error("❌ FAILED: Found unresolved placeholder!");
      process.exit(1);
    }
    
    if (change.content.includes("Order") && change.content.includes("order")) {
      console.log("✅ Success: Variables replaced correctly.");
    }
  }

  console.log("\n✅ ALL DYNAMIC VARIABLE TESTS PASSED!");
}

testDynamicVariables();
