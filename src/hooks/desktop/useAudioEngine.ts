import { useState, useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';

interface AudioChapter {
  id: number;
  baseFreq: number;
  beatFreq: number;
  texture: 'drone' | 'crystal' | 'void' | 'flow' | 'light' | 'earth' | 'cosmic';
  scaleName: string;
}

const CHAPTER_AUDIO: AudioChapter[] = [
  { id: 1, baseFreq: 174, beatFreq: 7.83, texture: 'drone',  scaleName: 'C Aeolian'  },
  { id: 2, baseFreq: 285, beatFreq: 9.0,  texture: 'crystal', scaleName: 'D Phrygian' },
  { id: 3, baseFreq: 396, beatFreq: 10.5, texture: 'void',   scaleName: 'G Dorian'   },
  { id: 4, baseFreq: 417, beatFreq: 6.0,  texture: 'flow',   scaleName: 'A Mixolydian'},
  { id: 5, baseFreq: 528, beatFreq: 8.0,  texture: 'light',  scaleName: 'F Lydian'   },
  { id: 6, baseFreq: 639, beatFreq: 7.0,  texture: 'earth',  scaleName: 'E Dorian'   },
  { id: 7, baseFreq: 741, beatFreq: 9.5,  texture: 'cosmic', scaleName: 'B Locrian'  },
];

/** Clamp a gain/volume value to a safe positive range for Web Audio API */
const safeGain = (v: number) => Math.max(v, 0.0001);

/** Clamp a frequency value to a safe audible range */
const safeFreq = (v: number) => Math.max(v, 20);

export function useAudioEngine() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioDisabled, setIsAudioDisabled] = useState(
    import.meta.env.VITE_DISABLE_AUDIO === 'true'
  );
  const [volume, setVolume] = useState(0.4);
  const [currentChapterId, setCurrentChapterId] = useState(1);
  const [scrollResponsiveFreq, setScrollResponsiveFreq] = useState(0);

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const droneRef = useRef<Tone.Oscillator | null>(null);
  const lfoRef = useRef<Tone.LFO | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const delayRef = useRef<Tone.FeedbackDelay | null>(null);

  const disableAudio = useCallback(() => {
    setIsAudioDisabled(true);
    setIsPlaying(false);
    try { droneRef.current?.stop(); } catch (_) { /* ignore */ }
  }, []);

  /** Must be called inside a user-gesture handler */
  const initialize = useCallback(async () => {
    if (isInitialized || isAudioDisabled) return;

    try {
      await Tone.start();

      reverbRef.current = new Tone.Reverb({ decay: 8, wet: 0.5 }).toDestination();

      delayRef.current = new Tone.FeedbackDelay({
        delayTime: '8n',
        feedback: 0.3,
        wet: 0.2
      }).connect(reverbRef.current);

      filterRef.current = new Tone.Filter({
        frequency: 800,
        type: 'lowpass',
        rolloff: -12
      }).connect(delayRef.current);

      droneRef.current = new Tone.Oscillator({
        frequency: 110,
        type: 'sine',
        volume: -20
      }).connect(filterRef.current);

      lfoRef.current = new Tone.LFO({
        frequency: 0.1,
        min: 600,
        max: 1000
      }).connect(filterRef.current.frequency);

      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 2, decay: 1, sustain: 0.8, release: 4 },
        volume: -15
      }).connect(reverbRef.current);

      Tone.Destination.volume.value = Tone.gainToDb(safeGain(volume));
      setIsInitialized(true);
    } catch (err) {
      console.warn('[AudioEngine] Initialization failed, disabling audio:', err);
      disableAudio();
    }
  }, [isInitialized, isAudioDisabled, volume, disableAudio]);

  const playChapter = useCallback(async (chapterId: number) => {
    if (isAudioDisabled) return;
    if (!isInitialized) await initialize();

    const chapter = CHAPTER_AUDIO.find(c => c.id === chapterId);
    if (!chapter || !droneRef.current || !lfoRef.current) return;

    try {
      setCurrentChapterId(chapterId);

      droneRef.current.frequency.rampTo(safeFreq(chapter.baseFreq), 2);

      const lfoRates: Record<string, number> = {
        drone: 0.1, crystal: 0.3, void: 0.05,
        flow: 0.15, light: 0.25, earth: 0.08, cosmic: 0.2
      };
      lfoRef.current.frequency.rampTo(safeFreq(lfoRates[chapter.texture] || 0.1), 1);

      if (chapter.texture === 'crystal' || chapter.texture === 'light') {
        const notes = chapter.id === 2
          ? ['C4', 'E4', 'G4', 'B4']
          : ['F4', 'A4', 'C5', 'E5'];
        synthRef.current?.triggerAttackRelease(notes, '4m');
      }

      if (!isPlaying) {
        droneRef.current.start();
        lfoRef.current.start();
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn('[AudioEngine] playChapter error, disabling audio:', err);
      disableAudio();
    }
  }, [isInitialized, initialize, isPlaying, isAudioDisabled, disableAudio]);

  const updateScrollResponse = useCallback((scrollProgress: number) => {
    if (!filterRef.current || !droneRef.current || isAudioDisabled) return;

    try {
      const baseFreq = CHAPTER_AUDIO[currentChapterId - 1]?.baseFreq || 110;
      const scrollMod = (scrollProgress / 100) * 200;
      setScrollResponsiveFreq(scrollMod);
      filterRef.current.frequency.rampTo(safeFreq(baseFreq + scrollMod), 0.1);
    } catch (err) {
      console.warn('[AudioEngine] updateScrollResponse error:', err);
    }
  }, [currentChapterId, isAudioDisabled]);

  const togglePlay = useCallback(async () => {
    if (isAudioDisabled) return;

    if (!isInitialized) {
      // Must be called from a user gesture — initialize then play
      await initialize();
      await playChapter(currentChapterId);
      return;
    }

    try {
      if (isPlaying) {
        droneRef.current?.stop();
        lfoRef.current?.stop();
        setIsPlaying(false);
      } else {
        await playChapter(currentChapterId);
      }
    } catch (err) {
      console.warn('[AudioEngine] togglePlay error, disabling audio:', err);
      disableAudio();
    }
  }, [isInitialized, initialize, isPlaying, playChapter, currentChapterId, isAudioDisabled, disableAudio]);

  const adjustVolume = useCallback((newVolume: number) => {
    const safe = safeGain(newVolume);
    setVolume(safe);
    if (isInitialized && !isAudioDisabled) {
      try {
        Tone.Destination.volume.rampTo(Tone.gainToDb(safe), 0.1);
      } catch (err) {
        console.warn('[AudioEngine] adjustVolume error:', err);
      }
    }
  }, [isInitialized, isAudioDisabled]);

  useEffect(() => {
    return () => {
      try { droneRef.current?.dispose(); } catch (_) { /* ignore */ }
      try { lfoRef.current?.dispose(); } catch (_) { /* ignore */ }
      try { synthRef.current?.dispose(); } catch (_) { /* ignore */ }
      try { filterRef.current?.dispose(); } catch (_) { /* ignore */ }
      try { reverbRef.current?.dispose(); } catch (_) { /* ignore */ }
      try { delayRef.current?.dispose(); } catch (_) { /* ignore */ }
    };
  }, []);

  return {
    isInitialized,
    isPlaying,
    isAudioDisabled,
    volume,
    currentChapter: CHAPTER_AUDIO.find(c => c.id === currentChapterId),
    scrollResponsiveFreq,
    initialize,
    playChapter,
    togglePlay,
    setVolume: adjustVolume,
    updateScrollResponse,
    disableAudio,
  };
}
