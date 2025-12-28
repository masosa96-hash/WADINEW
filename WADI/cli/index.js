#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { program } = require("commander");

program
  .name("wadi")
  .description("WADI CLI - Herramienta de gestión técnica del búnker")
  .version("2.0.0");

program
  .command("explain")
  .description("Explica un componente o archivo del sistema")
  .argument("<file>", "Archivo a explicar")
  .action((file) => {
    console.log(`\n🧠 WADI ANALIZANDO: ${file}\n`);
    // Mock analysis
    if (fs.existsSync(file) || fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`[STATUS: FOUND] Archivo localizado.`);
      console.log(
        `[ANALYSIS] Este archivo es parte crítica de la infraestructura.`
      );
      console.log(`[ADVICE] Si lo tocas, testealo.`);
    } else {
      console.log(`[ERROR] Archivo no encontrado. ¿Estás alucinando?`);
    }
  });

program
  .command("lint")
  .description("Juzga tu código (wrapper de npm run lint)")
  .action(() => {
    console.log("🔍 Iniciando escaneo de incompetencia (Linting)...");
    require("child_process").execSync("npm run lint", { stdio: "inherit" });
  });

program
  .command("docs")
  .description("Gestiona la documentación")
  .option("--serve", "Sirve la documentación localmente")
  .action((options) => {
    if (options.serve) {
      console.log("📚 Sirviendo documentación en puerto 3000...");
      require("child_process").execSync("docsify serve docs", {
        stdio: "inherit",
      });
    } else {
      console.log("Use --serve para ver la documentación.");
    }
  });

program
  .command("deploy")
  .description("Simula un despliegue a producción")
  .action(() => {
    console.log("🚀 Iniciando secuencia de despliegue...");
    console.log("... Verificando integridad ... OK");
    console.log("... Compilando assets ... OK");
    console.log("... Deploy simulado EXITOSO.");
    console.log("ℹ️ Para deploy real: git push origin master");
  });

program.parse();
