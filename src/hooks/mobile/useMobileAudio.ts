import { useState, useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';

interface AudioChapter {
  id: number;
  baseFreq: number;
  texture: 'drone' | 'crystal' | 'void' | 'flow' | 'light' | 'earth' | 'cosmic';
  scaleName: string;
}

const CHAPTER_AUDIO: AudioChapter[] = [
  { id: 1, baseFreq: 174, texture: 'drone',  scaleName: 'C Aeolian'   },
  { id: 2, baseFreq: 285, texture: 'crystal', scaleName: 'D Phrygian' },
  { id: 3, baseFreq: 396, texture: 'void',   scaleName: 'G Dorian'    },
  { id: 4, baseFreq: 417, texture: 'flow',   scaleName: 'A Mixolydian'},
  { id: 5, baseFreq: 528, texture: 'light',  scaleName: 'F Lydian'    },
  { id: 6, baseFreq: 639, texture: 'earth',  scaleName: 'E Dorian'    },
  { id: 7, baseFreq: 741, texture: 'cosmic', scaleName: 'B Locrian'   },
];

const safeGain = (v: number) => Math.max(v, 0.0001);
const safeFreq = (v: number) => Math.max(v, 20);

export function useMobileAudio() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioDisabled, setIsAudioDisabled] = useState(
    import.meta.env.VITE_DISABLE_AUDIO === 'true'
  );
  const [volume, setVolume] = useState(0.5);
  const [currentChapterId, setCurrentChapterId] = useState(1);
  const [isHeadphones, setIsHeadphones] = useState(false);

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const droneRef = useRef<Tone.Oscillator | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);

  const disableAudio = useCallback(() => {
    setIsAudioDisabled(true);
    setIsPlaying(false);
    try { droneRef.current?.stop(); } catch (_) { /* ignore */ }
  }, []);

  useEffect(() => {
    const checkAudioOutput = async () => {
      try {
        // @ts-ignore - experimental API
        if (navigator.mediaDevices?.selectAudioOutput) {
          // @ts-ignore
          const device = await navigator.mediaDevices.selectAudioOutput();
          setIsHeadphones(
            device.label.toLowerCase().includes('headphone') ||
            device.label.toLowerCase().includes('earphone') ||
            device.label.toLowerCase().includes('bluetooth')
          );
        }
      } catch {
        setIsHeadphones(false);
      }
    };
    checkAudioOutput();
  }, []);

  const initialize = useCallback(async () => {
    if (isInitialized || isAudioDisabled) return;

    try {
      await Tone.start();

      reverbRef.current = new Tone.Reverb({ decay: 6, wet: 0.4 }).toDestination();

      filterRef.current = new Tone.Filter({
        frequency: isHeadphones ? 1000 : 800,
        type: 'lowpass',
        rolloff: -12
      }).connect(reverbRef.current);

      droneRef.current = new Tone.Oscillator({
        frequency: 110,
        type: 'sine',
        volume: isHeadphones ? -15 : -12
      }).connect(filterRef.current);

      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 1.5, decay: 0.8, sustain: 0.7, release: 3 },
        volume: -18
      }).connect(reverbRef.current);

      Tone.Destination.volume.value = Tone.gainToDb(safeGain(volume));
      setIsInitialized(true);
    } catch (err) {
      console.warn('[MobileAudio] Initialization failed, disabling audio:', err);
      disableAudio();
    }
  }, [isInitialized, isAudioDisabled, volume, isHeadphones, disableAudio]);

  const playChapter = useCallback(async (chapterId: number) => {
    if (isAudioDisabled) return;
    if (!isInitialized) await initialize();

    const chapter = CHAPTER_AUDIO.find(c => c.id === chapterId);
    if (!chapter || !droneRef.current) return;

    try {
      setCurrentChapterId(chapterId);

      droneRef.current.frequency.rampTo(safeFreq(chapter.baseFreq), 2);

      const filterFreqs: Record<string, number> = {
        drone: 600, crystal: 1200, void: 400,
        flow: 800, light: 1000, earth: 500, cosmic: 900
      };
      if (filterRef.current) {
        filterRef.current.frequency.rampTo(safeFreq(filterFreqs[chapter.texture] || 800), 1);
      }

      if (chapter.texture === 'crystal' || chapter.texture === 'light') {
        const notes = chapter.id === 2 ? ['C4', 'E4', 'G4'] : ['F4', 'A4', 'C5'];
        notes.forEach((note, i) => {
          setTimeout(() => {
            try { synthRef.current?.triggerAttackRelease(note, '2m'); } catch (_) { /* ignore */ }
          }, i * 500);
        });
      }

      if (!isPlaying) {
        droneRef.current.start();
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn('[MobileAudio] playChapter error, disabling audio:', err);
      disableAudio();
    }
  }, [isInitialized, initialize, isPlaying, isAudioDisabled, disableAudio]);

  const togglePlay = useCallback(async () => {
    if (isAudioDisabled) return;

    if (!isInitialized) {
      await initialize();
      await playChapter(currentChapterId);
      return;
    }

    try {
      if (isPlaying) {
        droneRef.current?.stop();
        setIsPlaying(false);
      } else {
        await playChapter(currentChapterId);
      }
    } catch (err) {
      console.warn('[MobileAudio] togglePlay error, disabling audio:', err);
      disableAudio();
    }
  }, [isInitialized, initialize, isPlaying, playChapter, currentChapterId, isAudioDisabled, disableAudio]);

  const pause = useCallback(() => {
    if (isPlaying) {
      try { droneRef.current?.stop(); } catch (_) { /* ignore */ }
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (isInitialized && !isPlaying && !isAudioDisabled) {
      try {
        droneRef.current?.start();
        setIsPlaying(true);
      } catch (err) {
        console.warn('[MobileAudio] resume error:', err);
        disableAudio();
      }
    }
  }, [isInitialized, isPlaying, isAudioDisabled, disableAudio]);

  const setVolumeLevel = useCallback((newVolume: number) => {
    const safe = safeGain(newVolume);
    setVolume(safe);
    if (isInitialized && !isAudioDisabled) {
      try {
        Tone.Destination.volume.rampTo(Tone.gainToDb(safe), 0.1);
      } catch (err) {
        console.warn('[MobileAudio] setVolume error:', err);
      }
    }
  }, [isInitialized, isAudioDisabled]);

  useEffect(() => {
    return () => {
      try { droneRef.current?.dispose(); } catch (_) { /* ignore */ }
      try { synthRef.current?.dispose(); } catch (_) { /* ignore */ }
      try { filterRef.current?.dispose(); } catch (_) { /* ignore */ }
      try { reverbRef.current?.dispose(); } catch (_) { /* ignore */ }
    };
  }, []);

  return {
    isInitialized,
    isPlaying,
    isAudioDisabled,
    volume,
    currentChapter: CHAPTER_AUDIO.find(c => c.id === currentChapterId),
    isHeadphones,
    initialize,
    playChapter,
    togglePlay,
    pause,
    resume,
    setVolume: setVolumeLevel,
    disableAudio,
  };
}
