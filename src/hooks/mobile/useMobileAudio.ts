import { useState, useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';

interface AudioChapter {
  id: number;
  baseFreq: number;
  texture: 'drone' | 'crystal' | 'void' | 'flow' | 'light' | 'earth' | 'cosmic';
}

const CHAPTER_AUDIO: AudioChapter[] = [
  { id: 1, baseFreq: 174, texture: 'drone' },
  { id: 2, baseFreq: 285, texture: 'crystal' },
  { id: 3, baseFreq: 396, texture: 'void' },
  { id: 4, baseFreq: 417, texture: 'flow' },
  { id: 5, baseFreq: 528, texture: 'light' },
  { id: 6, baseFreq: 639, texture: 'earth' },
  { id: 7, baseFreq: 741, texture: 'cosmic' },
];

export function useMobileAudio() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentChapterId, setCurrentChapterId] = useState(1);
  const [isHeadphones, setIsHeadphones] = useState(false);
  
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const droneRef = useRef<Tone.Oscillator | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);

  // Detect headphone state (if supported)
  useEffect(() => {
    const checkAudioOutput = async () => {
      try {
        // @ts-ignore - experimental API
        if (navigator.mediaDevices?.selectAudioOutput) {
          // @ts-ignore
          const device = await navigator.mediaDevices.selectAudioOutput();
          setIsHeadphones(device.label.toLowerCase().includes('headphone') || 
                         device.label.toLowerCase().includes('earphone') ||
                         device.label.toLowerCase().includes('bluetooth'));
        }
      } catch {
        // Fallback - assume speakers on mobile
        setIsHeadphones(false);
      }
    };

    checkAudioOutput();
  }, []);

  const initialize = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      await Tone.start();
      
      // Create simpler audio chain for mobile
      reverbRef.current = new Tone.Reverb({
        decay: 6,
        wet: 0.4
      }).toDestination();
      
      filterRef.current = new Tone.Filter({
        frequency: isHeadphones ? 1000 : 800,
        type: 'lowpass',
        rolloff: -12
      }).connect(reverbRef.current);
      
      // Simpler drone for mobile
      droneRef.current = new Tone.Oscillator({
        frequency: 110,
        type: 'sine',
        volume: isHeadphones ? -15 : -12
      }).connect(filterRef.current);
      
      // Lightweight synth
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 1.5,
          decay: 0.8,
          sustain: 0.7,
          release: 3
        },
        volume: -18
      }).connect(reverbRef.current);
      
      Tone.Destination.volume.value = Tone.gainToDb(volume);
      setIsInitialized(true);
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }, [isInitialized, volume, isHeadphones]);

  const playChapter = useCallback(async (chapterId: number) => {
    if (!isInitialized) {
      await initialize();
    }
    
    const chapter = CHAPTER_AUDIO.find(c => c.id === chapterId);
    if (!chapter || !droneRef.current) return;
    
    setCurrentChapterId(chapterId);
    
    // Smooth frequency transition
    droneRef.current.frequency.rampTo(chapter.baseFreq, 2);
    
    // Adjust filter based on texture
    const filterFreqs: Record<string, number> = {
      drone: 600,
      crystal: 1200,
      void: 400,
      flow: 800,
      light: 1000,
      earth: 500,
      cosmic: 900
    };
    
    if (filterRef.current) {
      filterRef.current.frequency.rampTo(filterFreqs[chapter.texture] || 800, 1);
    }
    
    // Occasional crystalline notes
    if (chapter.texture === 'crystal' || chapter.texture === 'light') {
      const notes = chapter.id === 2 
        ? ['C4', 'E4', 'G4'] 
        : ['F4', 'A4', 'C5'];
      
      // Stagger the notes
      notes.forEach((note, i) => {
        setTimeout(() => {
          synthRef.current?.triggerAttackRelease(note, '2m');
        }, i * 500);
      });
    }
    
    if (!isPlaying) {
      droneRef.current.start();
      setIsPlaying(true);
    }
  }, [isInitialized, initialize, isPlaying, isHeadphones]);

  const togglePlay = useCallback(async () => {
    if (!isInitialized) {
      await initialize();
      await playChapter(currentChapterId);
      return;
    }
    
    if (isPlaying) {
      droneRef.current?.stop();
      setIsPlaying(false);
    } else {
      await playChapter(currentChapterId);
    }
  }, [isInitialized, initialize, isPlaying, playChapter, currentChapterId]);

  const pause = useCallback(() => {
    if (isPlaying) {
      droneRef.current?.stop();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (isInitialized && !isPlaying) {
      droneRef.current?.start();
      setIsPlaying(true);
    }
  }, [isInitialized, isPlaying]);

  const setVolumeLevel = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (isInitialized) {
      Tone.Destination.volume.rampTo(Tone.gainToDb(newVolume), 0.1);
    }
  }, [isInitialized]);

  // Cleanup
  useEffect(() => {
    return () => {
      droneRef.current?.dispose();
      synthRef.current?.dispose();
      filterRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  return {
    isInitialized,
    isPlaying,
    volume,
    currentChapter: CHAPTER_AUDIO.find(c => c.id === currentChapterId),
    isHeadphones,
    initialize,
    playChapter,
    togglePlay,
    pause,
    resume,
    setVolume: setVolumeLevel,
  };
}
