/**
 * User Preferences Module
 * Manejo de preferencias de usuario (idioma, tono, longitud de respuesta, etc.)
 */

export const getUserPreferences = async (userId) => {
  // TODO: Conectar con DB real (tabla profiles o user_settings)
  console.log(`[Preferences] Fetching for user ${userId}`);
  return {
    idiomaPreferido: "auto", // 'es', 'en', 'auto'
    longitudRespuesta: "normal", // 'breve', 'normal', 'detallada'
    tono: "neutro", // 'casual', 'neutro', 'tecnico'
  };
};

export const saveUserPreferences = async (userId, newPrefs) => {
  // TODO: Guardar en DB cuando estemos listos
  console.log(`[Preferences] Saving for user ${userId}`, newPrefs);
  return { success: true, userId, updated: newPrefs };
};
