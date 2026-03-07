import { interpretMessage } from "./src/services/wadi-interpret.service";
import dotenv from "dotenv";
dotenv.config();

async function testWadi() {
  const userId = "11111111-1111-1111-1111-111111111111"; // UUID falso para test

  console.log("=== TEST 1: Primer mensaje ===");
  const res1 = await interpretMessage("quiero vender café online", userId);
  console.log(JSON.stringify(res1, null, 2));

  console.log("\n=== TEST 2: Segundo mensaje (continuacion) ===");
  const res2 = await interpretMessage("quiero que sea de especialidad, venta a consumidores finales (B2C)", userId);
  console.log(JSON.stringify(res2, null, 2));
}

testWadi().catch(console.error);
