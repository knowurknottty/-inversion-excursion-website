'use client';

import { useEffect, useRef } from 'react';
import { useSynSyncStore } from '@/lib/store';
import { SYNSYNC_CONFIG } from '@/lib/constants';

export function FrequencyVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { frequency, currentEntrainment, isPlaying, volume } = useSynSyncStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    let animationId: number;
    let time = 0;

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerY = height / 2;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw background grid
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.lineWidth = 1;
      
      // Horizontal lines
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      if (isPlaying) {
        // Draw waveform
        ctx.strokeStyle = `rgba(99, 102, 241, ${volume})`;
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Multiple waves representing different frequencies
        const waves = [
          { freq: frequency / 100, amp: 30, phase: 0 },
          { freq: (frequency + currentEntrainment) / 100, amp: 20, phase: Math.PI / 4 },
          { freq: currentEntrainment / 50, amp: 15, phase: Math.PI / 2 },
        ];

        for (let x = 0; x < width; x += 2) {
          let y = centerY;
          
          waves.forEach(wave => {
            y += Math.sin((x * wave.freq * 0.02) + time + wave.phase) * wave.amp * volume;
          });

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();

        // Draw glow effect
        ctx.shadowColor = 'rgba(99, 102, 241, 0.5)';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;

        time += 0.05;
      }

      // Draw frequency text
      ctx.fillStyle = '#6366f1';
      ctx.font = '12px monospace';
      ctx.fillText(`${frequency.toFixed(1)} Hz`, 10, height - 10);
      ctx.fillText(`${currentEntrainment.toFixed(1)} Hz entrainment`, 10, height - 25);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [frequency, currentEntrainment, isPlaying, volume]);

  return (
    <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold">SynSync Engine</h3>
          <p className="text-sm text-slate-500">Real-time frequency visualization</p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-mono text-indigo-400">
            {frequency.toFixed(0)}Hz
          </div>
          <div className="text-xs text-slate-500">
            {Object.entries(SYNSYNC_CONFIG.brainwaveBands).find(
              ([, band]) => currentEntrainment >= band.min && currentEntrainment <= band.max
            )?.[1].label || 'Unknown'} • {currentEntrainment.toFixed(1)}Hz
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-32 bg-slate-950 rounded-lg"
      />

      <div className="flex justify-between mt-4 text-xs text-slate-500">
        <span>Δ Delta (0.5-4Hz)</span>
        <span>θ Theta (4-8Hz)</span>
        <span>α Alpha (8-13Hz)</span>
        <span>β Beta (13-30Hz)</span>
        <span>γ Gamma (30-100Hz)</span>
      </div>
    </div>
  );
}
