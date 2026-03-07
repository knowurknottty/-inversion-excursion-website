/**
 * SynSync Web Audio Engine
 * Generates binaural beats and isochronic tones for entrainment
 */

class SynSyncAudioEngine {
  private ctx: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private isPlaying = false;
  private currentProtocol: string | null = null;

  // Protocol frequency definitions
  private readonly PROTOCOLS: Record<string, { base: number; beat: number; type: 'binaural' | 'isochronic' }> = {
    alpha: { base: 200, beat: 10, type: 'binaural' },
    theta: { base: 200, beat: 6, type: 'isochronic' },
    gamma: { base: 200, beat: 40, type: 'binaural' },
    schumann: { base: 200, beat: 7.83, type: 'isochronic' },
    delta: { base: 100, beat: 2, type: 'binaural' },
    beta: { base: 200, beat: 20, type: 'isochronic' }
  };

  async init(): Promise<void> {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // iOS unlock
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  async startProtocol(protocolId: string): Promise<void> {
    if (!this.ctx) await this.init();
    if (this.isPlaying) this.stop();

    const protocol = this.PROTOCOLS[protocolId];
    if (!protocol) throw new Error(`Unknown protocol: ${protocolId}`);

    this.currentProtocol = protocolId;

    if (protocol.type === 'binaural') {
      await this.startBinaural(protocol.base, protocol.beat);
    } else {
      await this.startIsochronic(protocol.base, protocol.beat);
    }

    this.isPlaying = true;
  }

  private async startBinaural(baseFreq: number, beatFreq: number): Promise<void> {
    if (!this.ctx) return;

    // Binaural: different frequency in each ear
    const leftFreq = baseFreq - (beatFreq / 2);
    const rightFreq = baseFreq + (beatFreq / 2);

    // Left channel
    const leftOsc = this.ctx.createOscillator();
    const leftGain = this.ctx.createGain();
    leftOsc.frequency.value = leftFreq;
    leftOsc.connect(leftGain);
    
    // Right channel
    const rightOsc = this.ctx.createOscillator();
    const rightGain = this.ctx.createGain();
    rightOsc.frequency.value = rightFreq;
    rightOsc.connect(rightGain);

    // Stereo panning
    const merger = this.ctx.createChannelMerger(2);
    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);
    merger.connect(this.ctx.destination);

    // Gentle fade in
    leftGain.gain.setValueAtTime(0, this.ctx.currentTime);
    leftGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 2);
    rightGain.gain.setValueAtTime(0, this.ctx.currentTime);
    rightGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 2);

    leftOsc.start();
    rightOsc.start();

    this.oscillators = [leftOsc, rightOsc];
    this.gainNodes = [leftGain, rightGain];
  }

  private async startIsochronic(baseFreq: number, beatFreq: number): Promise<void> {
    if (!this.ctx) return;

    // Isochronic: amplitude modulation of single tone
    const carrier = this.ctx.createOscillator();
    carrier.frequency.value = baseFreq;

    // Create amplitude modulation (pulsing)
    const modulator = this.ctx.createOscillator();
    modulator.frequency.value = beatFreq;

    const modulatorGain = this.ctx.createGain();
    modulatorGain.gain.value = 0.5;

    const carrierGain = this.ctx.createGain();
    carrierGain.gain.value = 0.3;

    // Modulate carrier amplitude
    modulator.connect(modulatorGain);
    modulatorGain.connect(carrierGain.gain);
    carrier.connect(carrierGain);
    carrierGain.connect(this.ctx.destination);

    // Fade in
    carrierGain.gain.setValueAtTime(0, this.ctx.currentTime);
    carrierGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 2);

    carrier.start();
    modulator.start();

    this.oscillators = [carrier, modulator];
    this.gainNodes = [carrierGain, modulatorGain];
  }

  stop(): void {
    if (!this.ctx || !this.isPlaying) return;

    // Gentle fade out
    const now = this.ctx.currentTime;
    this.gainNodes.forEach(gain => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
    });

    // Stop after fade
    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try { osc.stop(); } catch {}
      });
      this.oscillators = [];
      this.gainNodes = [];
    }, 1100);

    this.isPlaying = false;
    this.currentProtocol = null;
  }

  getCurrentProtocol(): string | null {
    return this.currentProtocol;
  }

  isActive(): boolean {
    return this.isPlaying;
  }
}

export default SynSyncAudioEngine;
