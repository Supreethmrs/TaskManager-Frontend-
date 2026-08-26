/**
 * Web Audio API Generative Ambient Audio Synthesizer
 * Zero external audio files required. Generates soothing ambient focus tracks.
 */

export type AmbientTrackId = 'none' | 'rain' | 'space' | 'cafe' | 'synthwave';

export interface AmbientTrack {
  id: AmbientTrackId;
  name: string;
  emoji: string;
  desc: string;
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  { id: 'none', name: 'Off', emoji: '🔇', desc: 'No background audio' },
  { id: 'rain', name: 'Cyber Rain', emoji: '🌧️', desc: 'Relaxing rain & low rumble' },
  { id: 'space', name: 'Deep Space', emoji: '🌌', desc: '432Hz binaural focus drone' },
  { id: 'cafe', name: 'Neo-Tokyo Cafe', emoji: '☕', desc: 'Warm vinyl hum & air texture' },
  { id: 'synthwave', name: 'Synthwave Chill', emoji: '🎵', desc: 'Warm electronic focus pulse' },
];

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private currentTrack: AmbientTrackId = 'none';
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTrack(): AmbientTrackId {
    return this.currentTrack;
  }

  public playTrack(trackId: AmbientTrackId) {
    this.stop();
    if (trackId === 'none') {
      this.currentTrack = 'none';
      return;
    }

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.currentTrack = trackId;

    if (trackId === 'rain') {
      this.generateRainAmbiance();
    } else if (trackId === 'space') {
      this.generateSpaceDrone();
    } else if (trackId === 'cafe') {
      this.generateCafeAmbiance();
    } else if (trackId === 'synthwave') {
      this.generateSynthwavePulse();
    }
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch {
          // ignore disconnect errors
        }
      }
    });
    this.activeNodes = [];
    this.currentTrack = 'none';
  }

  // 1. Cyber Rain (Pink Noise filtered with gentle low-pass rumble)
  private generateRainAmbiance() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, gain);
  }

  // 2. Deep Space Alpha Waves (432Hz + 440Hz warm binaural drone)
  private generateSpaceDrone() {
    if (!this.ctx || !this.masterGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const oscSub = this.ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(108, this.ctx.currentTime); // A2 harmonic

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(116, this.ctx.currentTime); // Alpha beat difference

    oscSub.type = 'triangle';
    oscSub.frequency.setValueAtTime(54, this.ctx.currentTime); // Sub-bass warmth

    const gain1 = this.ctx.createGain();
    gain1.gain.setValueAtTime(0.3, this.ctx.currentTime);

    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.3, this.ctx.currentTime);

    const gainSub = this.ctx.createGain();
    gainSub.gain.setValueAtTime(0.2, this.ctx.currentTime);

    osc1.connect(gain1);
    osc2.connect(gain2);
    oscSub.connect(gainSub);

    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);
    gainSub.connect(this.masterGain);

    osc1.start();
    osc2.start();
    oscSub.start();

    this.activeNodes.push(osc1, osc2, oscSub, gain1, gain2, gainSub);
  }

  // 3. Neo-Tokyo Cafe (Warm Vinyl Hum & soft low frequencies)
  private generateCafeAmbiance() {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    this.activeNodes.push(osc, filter, gain);
  }

  // 4. Synthwave Focus Pulse (Gentle rhythmic ambient chord swell)
  private generateSynthwavePulse() {
    if (!this.ctx || !this.masterGain) return;

    const notes = [130.81, 164.81, 196.0]; // C-E-G triad
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    notes.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.12, this.ctx.currentTime);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start();

      oscillators.push(osc);
      gains.push(g);
      this.activeNodes.push(osc, g);
    });
  }
}

export const ambientAudio = new AmbientAudioEngine();
