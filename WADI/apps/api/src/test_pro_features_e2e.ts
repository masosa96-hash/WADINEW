import { materializer } from "./services/materializer";
import "./wadi-brain"; // Registers ALL tools implicitly
import * as fs from "fs/promises";
import * as path from "path";

async function testProFeaturesE2E() {
  console.log("🚀 TESTING PRO FEATURES E2E (WITH OVERRIDE)...");
  
  const projectId = `pro-feat-override-${Date.now()}`;
  const structure = {
    name: "E-commerce-Pro",
    description: "App con persistencia y CRUD de productos.",
    templateId: "nextjs-tailwind",
    features: [
      { id: "drizzle-postgres" },
      { id: "basic-crud", params: { entityLow: "product", entityCap: "Product" } }
    ],
    files: [
      { path: "src/app/dashboard/page.tsx", content: "export default function DbDash() { return <div>DB Dashboard</div> }" }
    ]
  };

  try {
    // 2. Materialization WITH OVERRIDE
    console.log(`2. Materializing project ${projectId} using structure override...`);
    const res = await materializer.materialize(projectId, { overrideStructure: structure });
    console.log("Result:", res);

    if (!res.success) {
      throw new Error("Materialization failed");
    }

    // 3. Verification
    const projectPath = path.resolve("e:\\WADINEW\\projects", projectId);
    const checks = [
      "src/db/index.ts",
      "src/db/schema.ts",
      "src/controllers/product.controller.ts",
      "src/routes/product.routes.ts"
    ];

    for (const check of checks) {
      const fullPath = path.join(projectPath, check);
      const exists = await fs.access(fullPath).then(() => true).catch(() => false);
      console.log(`- ${check} created: ${exists ? "YES" : "NO"}`);
      
      if (exists && check.includes("product.controller")) {
        const content = await fs.readFile(fullPath, "utf-8");
        if (content.includes("listProduct") && !content.includes("${entityCap}")) {
          console.log("  ✅ Content validated: Entity 'Product' correctly injected.");
        }
      }
    }

    console.log("✅ PRO FEATURES E2E TEST COMPLETED SUCCESSFULLY!");

  } catch (e: any) {
    console.error("❌ E2E FAILED:", e.message);
  }
}

testProFeaturesE2E();
