function deploy() {
  console.log("🚀 Pasos para desplegar WADI:\n");
  console.log("1. npm run build");
  console.log("2. Validar que /docs tenga el index.html correcto.");
  console.log("3. Confirmar CNAME apuntando al dominio correcto.");
  console.log('4. git add . && git commit -m "Deploy" && git push');
  console.log("5. Listo.");
}

module.exports = { deploy };
