const fs = require("fs");
const path = require("path");

function explain(fileName) {
  // Búsqueda más flexible: intenta encontrar el archivo en varios directorios
  const potentialPaths = [
    path.join(__dirname, "../../apps/frontend/src/components", fileName),
    path.join(__dirname, "../../apps/frontend/src/components/ui", fileName),
    path.join(__dirname, "../../apps/frontend/src/pages", fileName),
    path.join(__dirname, "../../apps/frontend/src/hooks", fileName),
  ];

  let filePath = potentialPaths.find((p) => fs.existsSync(p));

  if (!filePath) {
    console.log(`❌ No se encontró el archivo: ${fileName}`);
    return;
  }

  console.log(`📄 Explicación de: ${fileName}`);
  console.log(
    "Este componente forma parte del sistema WADI y probablemente está conectado con el flujo de UI o input."
  );
  console.log(
    "⚠️ Este es un resumen simulado. Para explicación real, integrá WADI con LLM."
  );
}

module.exports = { explain };
