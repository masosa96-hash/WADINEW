import { useCallback, useRef } from "react";

export type AudioContextState = "suspended" | "running" | "closed";

export function useScouter() {
  // WADI AUDIO PROTOCOL - DISABLED
  // Ambience: Brown Noise (Deep Bunker Rumble)

  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);

  // DISABLE ALL AUDIO
  const initAudio = useCallback(() => {
    // Disabled
  }, []);

  const playTone = useCallback(
    (freq: number, type: OscillatorType, duration: number, rampTo?: number) => {
      // Disabled
    },
    []
  );

  const initAmbientHum = useCallback(() => {
    // Disabled
  }, []);

  const setAmbientIntensity = useCallback((level: "normal" | "high") => {
    // Disabled
  }, []);

  const playScanSound = useCallback(() => {
    // Disabled
  }, []);

  const playAlertSound = useCallback(() => {
    // Disabled
  }, []);

  const playCrystallizeSound = useCallback(() => {
    // Disabled
  }, []);

  const playDeathSound = useCallback(() => {
    // Disabled
  }, []);

  const playYawnSound = useCallback(() => {
    // Disabled
  }, []);

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
