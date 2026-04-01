import { useState, useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';

interface AudioChapter {
  id: number;
  baseFreq: number;
  beatFreq: number;
  texture: 'drone' | 'crystal' | 'void' | 'flow' | 'light' | 'earth' | 'cosmic';
}

const CHAPTER_AUDIO: AudioChapter[] = [
  { id: 1, baseFreq: 174, beatFreq: 7.83, texture: 'drone' },    // Inversion - Schumann
  { id: 2, baseFreq: 285, beatFreq: 9.0, texture: 'crystal' },   // Mirror
  { id: 3, baseFreq: 396, beatFreq: 10.5, texture: 'void' },     // Threshold
  { id: 4, baseFreq: 417, beatFreq: 6.0, texture: 'flow' },      // Labyrinth
  { id: 5, baseFreq: 528, beatFreq: 8.0, texture: 'light' },     // Revelation
  { id: 6, baseFreq: 639, beatFreq: 7.0, texture: 'earth' },     // Integration
  { id: 7, baseFreq: 741, beatFreq: 9.5, texture: 'cosmic' },    // Return
];

export function useAudioEngine() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [currentChapterId, setCurrentChapterId] = useState(1);
  const [scrollResponsiveFreq, setScrollResponsiveFreq] = useState(0);
  
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const droneRef = useRef<Tone.Oscillator | null>(null);
  const lfoRef = useRef<Tone.LFO | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const delayRef = useRef<Tone.FeedbackDelay | null>(null);

  const initialize = useCallback(async () => {
    if (isInitialized) return;
    
    await Tone.start();
    
    // Create master effects chain
    reverbRef.current = new Tone.Reverb({
      decay: 8,
      wet: 0.5
    }).toDestination();
    
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
    
    // Create drone oscillator
    droneRef.current = new Tone.Oscillator({
      frequency: 110,
      type: 'sine',
      volume: -20
    }).connect(filterRef.current);
    
    // Create LFO for breathing effect
    lfoRef.current = new Tone.LFO({
      frequency: 0.1,
      min: 600,
      max: 1000
    }).connect(filterRef.current.frequency);
    
    // Create poly synth for crystalline textures
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 0.8,
        release: 4
      },
      volume: -15
    }).connect(reverbRef.current);
    
    Tone.Destination.volume.value = Tone.gainToDb(volume);
    setIsInitialized(true);
  }, [isInitialized, volume]);

  const playChapter = useCallback(async (chapterId: number) => {
    if (!isInitialized) await initialize();
    
    const chapter = CHAPTER_AUDIO.find(c => c.id === chapterId);
    if (!chapter || !droneRef.current || !lfoRef.current) return;
    
    setCurrentChapterId(chapterId);
    
    // Set base frequency with binaural offset simulation
    droneRef.current.frequency.rampTo(chapter.baseFreq, 2);
    
    // Adjust LFO based on chapter texture
    const lfoRates: Record<string, number> = {
      drone: 0.1,
      crystal: 0.3,
      void: 0.05,
      flow: 0.15,
      light: 0.25,
      earth: 0.08,
      cosmic: 0.2
    };
    
    lfoRef.current.frequency.rampTo(lfoRates[chapter.texture] || 0.1, 1);
    
    // Play crystalline notes for certain textures
    if (chapter.texture === 'crystal' || chapter.texture === 'light') {
      const notes = chapter.id === 2 
        ? ['C4', 'E4', 'G4', 'B4']  // Mirror - reflective
        : ['F4', 'A4', 'C5', 'E5']; // Revelation - uplifting
      
      synthRef.current?.triggerAttackRelease(notes, '4m');
    }
    
    if (!isPlaying) {
      droneRef.current.start();
      lfoRef.current.start();
      setIsPlaying(true);
    }
  }, [isInitialized, initialize, isPlaying]);

  const updateScrollResponse = useCallback((scrollProgress: number) => {
    if (!filterRef.current || !droneRef.current) return;
    
    // Map scroll progress to filter frequency for dynamic feel
    const baseFreq = CHAPTER_AUDIO[currentChapterId - 1]?.baseFreq || 110;
    const scrollMod = (scrollProgress / 100) * 200;
    setScrollResponsiveFreq(scrollMod);
    
    filterRef.current.frequency.rampTo(baseFreq + scrollMod, 0.1);
  }, [currentChapterId]);

  const togglePlay = useCallback(() => {
    if (!isInitialized) {
      initialize().then(() => playChapter(currentChapterId));
      return;
    }
    
    if (isPlaying) {
      droneRef.current?.stop();
      lfoRef.current?.stop();
      setIsPlaying(false);
    } else {
      playChapter(currentChapterId);
    }
  }, [isInitialized, initialize, isPlaying, playChapter, currentChapterId]);

  const adjustVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (isInitialized) {
      Tone.Destination.volume.rampTo(Tone.gainToDb(newVolume), 0.1);
    }
  }, [isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      droneRef.current?.dispose();
      lfoRef.current?.dispose();
      synthRef.current?.dispose();
      filterRef.current?.dispose();
      reverbRef.current?.dispose();
      delayRef.current?.dispose();
    };
  }, []);

  return {
    isInitialized,
    isPlaying,
    volume,
    currentChapter: CHAPTER_AUDIO.find(c => c.id === currentChapterId),
    scrollResponsiveFreq,
    initialize,
    playChapter,
    togglePlay,
    setVolume: adjustVolume,
    updateScrollResponse
  };
}
