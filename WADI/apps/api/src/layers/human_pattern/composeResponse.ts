import { SOCIAL_MEMORY } from "./socialMemory";

// Manually defining keys if needed, or using 'keyof typeof SOCIAL_MEMORY'
type MemoryKey = keyof typeof SOCIAL_MEMORY;

export function composeResponse(pattern: string): string {
  const memory =
    SOCIAL_MEMORY[pattern as MemoryKey] || SOCIAL_MEMORY["UNCLASSIFIED"];
  const { observation, stance } = memory;

  switch (stance) {
    case "cansancio_informado":
      return `${observation}
Si querés avanzar, decime qué problema concreto querés resolver.`;

    case "pinchar_globo":
      return `${observation}
Bajemos a algo específico: ¿qué afirmación concreta estás haciendo?`;

    case "devolver_responsabilidad":
      return `${observation}
Puedo ayudarte, pero primero necesitás poner algo sobre la mesa.
¿Qué ya decidiste?`;

    case "corte_seco":
      return `${observation}
Sigamos solo si estás dispuesto a cambiar el planteo.
¿Qué vas a definir ahora?`;

    case "ayuda_dirigida":
      return `${observation}
Acá hay material. Falta elegir un próximo paso.
¿Querés explorar o ejecutar?`;

    default:
      return `${observation}
Necesito algo más concreto para seguir.`;
  }
}
