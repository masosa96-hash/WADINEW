const { exec } = require("child_process");

function docs() {
  const url = "https://masosa96-hash.github.io/WADINEW/";
  console.log(`📚 Abriendo documentación oficial: ${url}`);
  const command = process.platform === "win32" ? `start ${url}` : `open ${url}`;

  exec(command, (err) => {
    if (err) {
      console.error("❌ Error al abrir el navegador:", err);
      console.log(`🔗 Por favor visita manualmente: ${url}`);
    }
  });
}

module.exports = { docs };
