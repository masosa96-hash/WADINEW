import { runBrainStream } from "./src/wadi-brain";
import dotenv from "dotenv";
dotenv.config();

async function testVague() {
  const result = await runBrainStream("user-id", "hola quiero hacer algo", {
    projectId: "mock-proj",
    lastPersona: "CALMA",
    turnsActive: 0,
    messageCount: 0
  }, "fast");

  let out = "";
  for await (const chunk of (result.stream as AsyncIterable<any>)) {
    if (chunk.choices?.[0]?.delta?.content) {
      out += chunk.choices[0].delta.content;
      process.stdout.write(chunk.choices[0].delta.content);
    }
  }
  console.log("\n--- FIN ---");
}

testVague().catch(console.error);
