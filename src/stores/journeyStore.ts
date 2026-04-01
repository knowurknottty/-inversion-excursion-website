import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type JourneyPhase = 'portal' | 'reading' | 'reflection' | 'transition';

export interface JourneyState {
  currentChapter: number;
  completedChapters: number[];
  journeyPhase: JourneyPhase;
  isAudioEnabled: boolean;
  isMandalaOpen: boolean;
  meditationActive: boolean;
  scrollProgress: number;
  hasEnteredPortal: boolean;
  
  // Actions
  setCurrentChapter: (chapter: number) => void;
  completeChapter: (chapter: number) => void;
  setJourneyPhase: (phase: JourneyPhase) => void;
  setAudioEnabled: (enabled: boolean) => void;
  toggleMandala: () => void;
  setMeditationActive: (active: boolean) => void;
  setScrollProgress: (progress: number) => void;
  enterPortal: () => void;
  nextChapter: () => void;
  prevChapter: () => void;
}

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set, get) => ({
      currentChapter: 1,
      completedChapters: [],
      journeyPhase: 'portal',
      isAudioEnabled: false,
      isMandalaOpen: false,
      meditationActive: false,
      scrollProgress: 0,
      hasEnteredPortal: false,

      setCurrentChapter: (chapter) => set({ 
        currentChapter: chapter,
        journeyPhase: 'transition'
      }),
      
      completeChapter: (chapter) => set((state) => ({
        completedChapters: [...new Set([...state.completedChapters, chapter])]
      })),
      
      setJourneyPhase: (phase) => set({ journeyPhase: phase }),
      
      setAudioEnabled: (enabled) => set({ isAudioEnabled: enabled }),
      
      toggleMandala: () => set((state) => ({ isMandalaOpen: !state.isMandalaOpen })),
      
      setMeditationActive: (active) => set({ meditationActive: active }),
      
      setScrollProgress: (progress) => set({ scrollProgress: progress }),
      
      enterPortal: () => set({ hasEnteredPortal: true, journeyPhase: 'reading' }),
      
      nextChapter: () => {
        const { currentChapter, completeChapter } = get();
        if (currentChapter < 7) {
          completeChapter(currentChapter);
          set({ 
            currentChapter: currentChapter + 1,
            journeyPhase: 'transition'
          });
        }
      },
      
      prevChapter: () => {
        const { currentChapter } = get();
        if (currentChapter > 1) {
          set({ 
            currentChapter: currentChapter - 1,
            journeyPhase: 'transition'
          });
        }
      }
    }),
    {
      name: 'inversion-journey',
      partialize: (state) => ({ 
        completedChapters: state.completedChapters,
        hasEnteredPortal: state.hasEnteredPortal 
      })
    }
  )
);
