export type AudioContextState = "suspended" | "running" | "closed";

export function useScouter() {
  // WADI AUDIO PROTOCOL - DISABLED
  // All audio logic has been stripped as per instructions.

  // No-op functions to satisfy interface
  const playScanSound = () => {};
  const playAlertSound = () => {};
  const playCrystallizeSound = () => {};
  const playDeathSound = () => {};
  const playYawnSound = () => {};
  const initAmbientHum = () => {};
  const setAmbientIntensity = (_level: "normal" | "high") => {
    void _level;
  };

  return {
    playScanSound,
    playAlertSound,
    playCrystallizeSound,
    playDeathSound,
    playYawnSound,
    initAmbientHum,
    setAmbientIntensity,
    audioState: "suspended" as AudioContextState,
  };
}
