export function analizarMensaje(texto) {
  const t = texto.toLowerCase();

  if (t.includes("ayuda") || t.includes("mal") || t.includes("triste"))
    return { emocion: "triste", modo: "emocional" };

  if (t.includes("ansioso") || t.includes("nervioso"))
    return { emocion: "ansioso", modo: "reflexivo" };

  if (t.includes("idea") || t.includes("crear"))
    return { emocion: "neutral", modo: "creativo" };

  if (t.includes("cómo") || t.includes("hacer"))
    return { emocion: "neutral", modo: "tecnico" };

  return { emocion: "neutral", modo: "emocional" };
}
