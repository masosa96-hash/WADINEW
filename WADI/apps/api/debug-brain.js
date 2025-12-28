import { generateSystemPrompt } from "./src/wadi-brain.js";

console.log("----- GENERATING MONDAYIZED BRAIN -----");
const prompt = generateSystemPrompt(
  "normal",
  "general",
  "normal",
  "organizar su vida rota"
);
console.log(prompt);
console.log("---------------------------------------");
