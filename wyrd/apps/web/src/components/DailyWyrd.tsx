import { useState, useRef, useEffect } from 'react';
import { WordSpecimen } from '@wyrd/etymology';

interface DailyWyrdProps {
  specimen: WordSpecimen;
  audioUrl?: string;
}

export function DailyWyrd({ specimen, audioUrl }: DailyWyrdProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize audio
  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime / audioRef.current.duration);
        }
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  // Visualizer animation
  useEffect(() => {
    if (!canvasRef.current || !isPlaying) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.fillStyle = 'rgba(26, 26, 46, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waveform bars
      const bars = 50;
      const barWidth = canvas.width / bars;
      
      for (let i = 0; i < bars; i++) {
        const height = Math.random() * canvas.height * 0.8 * progress + 5;
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;
        
        // Gradient based on progress
        const hue = 340 + (i / bars) * 40;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.3 + progress * 0.7})`;
        ctx.fillRect(x, y, barWidth - 2, height);
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, progress]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const getChargeColor = (charge: number) => {
    if (charge >= 8) return 'text-emerald-400';
    if (charge >= 5) return 'text-amber-400';
    if (charge >= 2) return 'text-orange-400';
    return 'text-rose-500';
  };

  return (
    <div className="bg-gradient-to-br from-wyrd-800 to-wyrd-900 border border-wyrd-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-wyrd-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-wyrd-100/40 tracking-wider">DAILY WYRD</span>
          <span className="text-xs font-mono text-wyrd-100/20">•</span>
          <span className="text-xs font-mono text-wyrd-100/40">{new Date().toLocaleDateString()}</span>
        </div>
        <div className={`text-2xl font-serif ${getChargeColor(specimen.liveCharge)}`}>
          {specimen.liveCharge}/10
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-serif mb-2 capitalize">{specimen.modern}</h2>
          <p className="font-mono text-wyrd-100/60">
            PIE {specimen.pieRoot} "{specimen.pieMeaning}"
          </p>
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-wyrd-600 hover:bg-wyrd-600/80 
                           flex items-center justify-center transition-all
                           shadow-lg shadow-wyrd-600/20"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-wyrd-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-wyrd-600 transition-all duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-center text-xs font-mono text-wyrd-100/40 mt-2">
              {isPlaying ? 'Playing...' : 'Click to listen'}
            </p>

            {/* Visualizer */}
            <canvas
              ref={canvasRef}
              width={300}
              height={60}
              className="w-full h-16 mt-4 rounded-lg"
            />
          </div>
        )}

        {/* Etymology Preview */}
        <div className="space-y-3">
          <p className="text-xs font-mono text-wyrd-100/40 mb-3">ETYMOLOGY CHAIN</p>
          
          {specimen.stages.slice(0, 3).map((stage, i) => (
            <div key={i} className="flex gap-4 text-sm">
              <span className="w-24 shrink-0 font-mono text-wyrd-100/30 text-xs">
                {stage.period.split('(')[0].trim()}
              </span>
              <span className="font-serif">
                <span className="text-wyrd-600">{stage.form}</span>
                {' → '}
                {stage.meaning.length > 40 ? stage.meaning.slice(0, 40) + '...' : stage.meaning}
              </span>
            </div>
          ))}
          
          {specimen.stages.length > 3 && (
            <p className="text-xs font-mono text-wyrd-100/30 pl-28">
              +{specimen.stages.length - 3} more stages...
            </p>
          )}
        </div>

        {/* Inversion Badge */}
        {specimen.inversion && (
          <div className="mt-6 pt-6 border-t border-wyrd-700/50">
            <div className="flex items-center gap-2">
              <span className="bg-wyrd-600/20 text-wyrd-600 px-3 py-1 rounded-full text-xs font-mono">
                INVERSION DETECTED
              </span>
              <span className="text-xs text-wyrd-100/50">{specimen.inversionNotes}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
