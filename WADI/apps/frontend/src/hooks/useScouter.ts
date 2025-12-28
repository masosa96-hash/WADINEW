import { useCallback, useRef } from "react";

export type AudioContextState = "suspended" | "running" | "closed";

export function useScouter() {
  // WADI AUDIO PROTOCOL
  // Ambience: Brown Noise (Deep Bunker Rumble)

  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (audioContextRef.current) return;
    const AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext })
        .webkitAudioContext;
    if (!AudioContext) return;
    audioContextRef.current = new AudioContext();
  }, []);

  const playTone = useCallback(
    (freq: number, type: OscillatorType, duration: number, rampTo?: number) => {
      try {
        initAudio();
        const ctx = audioContextRef.current;
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        if (rampTo) {
          osc.frequency.exponentialRampToValueAtTime(
            rampTo,
            ctx.currentTime + duration
          );
        }

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + duration
        );

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {
        console.error("Audio error", e);
      }
    },
    [initAudio]
  );

  const initAmbientHum = useCallback(() => {
    try {
      initAudio();
      const ctx = audioContextRef.current;
      if (!ctx || ambientNodeRef.current) return;

      // Create Brown Noise Buffer (Deep Rumble)
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate for gain loss
      }

      const brownNoise = ctx.createBufferSource();
      brownNoise.buffer = noiseBuffer;
      brownNoise.loop = true;

      // Filter (Optional, strict lowpass to suppress any hiss)
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 120; // Extremely deep

      const gain = ctx.createGain();
      gain.gain.value = 0.02; // As requested

      brownNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      brownNoise.start();
      ambientNodeRef.current = brownNoise;
      ambientGainRef.current = gain;

      if (ctx.state === "suspended") ctx.resume();
    } catch (e) {
      console.error("Ambient error", e);
    }
  }, [initAudio]);

  const setAmbientIntensity = useCallback((level: "normal" | "high") => {
    if (!ambientGainRef.current) return;
    const target = level === "high" ? 0.05 : 0.02;
    // Smooth transition
    const ctx = audioContextRef.current;
    if (ctx) {
      ambientGainRef.current.gain.linearRampToValueAtTime(
        target,
        ctx.currentTime + 1
      );
    }
  }, []);

  const playScanSound = useCallback(() => {
    playTone(1200, "sine", 0.1);
  }, [playTone]);

  const playAlertSound = useCallback(() => {
    playTone(400, "sawtooth", 0.3);
  }, [playTone]);

  const playCrystallizeSound = useCallback(() => {
    playTone(1500, "sine", 0.05);
    setTimeout(() => playTone(1200, "sine", 0.2), 50);
  }, [playTone]);

  const playDeathSound = useCallback(() => {
    playTone(50, "square", 1, 10);
  }, [playTone]);

  const playYawnSound = useCallback(() => {
    playTone(300, "triangle", 0.8, 100);
  }, [playTone]);

  return {
    playScanSound,
    playAlertSound,
    playCrystallizeSound,
    playDeathSound,
    playYawnSound,
    initAmbientHum,
    setAmbientIntensity,
    audioState: "running" as AudioContextState,
  };
}
