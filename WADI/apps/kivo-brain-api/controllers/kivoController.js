import { generateResponse } from "../services/openaiService.js";

export const handleMessage = async (req, res) => {
  try {
    const { mensajeUsuario, historial, tono, personalidad } = req.body;

    if (!mensajeUsuario) {
      return res.json({
        respuestaKivo: "Hola, soy Kivo. ¿En qué puedo ayudarte hoy?",
        emocion: "neutral",
        modo: "normal",
      });
    }

    const response = await generateResponse({
      message: mensajeUsuario,
      history: historial || [],
      tone: tono || "neutral",
      personality: personalidad || "normal",
    });

    res.json(response);
  } catch (error) {
    console.error("Error in kivoController:", error);
    res.status(500).json({
      error: "Error interno del cerebro de Kivo",
      respuestaKivo:
        "Lo siento, tuve un problema procesando eso. ¿Podemos intentar de nuevo?",
    });
  }
};
