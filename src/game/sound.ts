// Tiny WebAudio sound engine — no external assets needed.
let ctx: AudioContext | null = null;
let sfxOn = true;
let musicOn = true;
let musicNodes: { osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode } | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, vol = 0.15, sweepTo?: number) {
  if (!sfxOn) return;
  const c = ac(); if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime);
  if (sweepTo !== undefined) o.frequency.exponentialRampToValueAtTime(Math.max(1, sweepTo), c.currentTime + dur);
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur);
}

function noise(dur: number, vol = 0.2, filterFreq = 1200) {
  if (!sfxOn) return;
  const c = ac(); if (!c) return;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource(); src.buffer = buf;
  const filt = c.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = filterFreq;
  const g = c.createGain(); g.gain.value = vol;
  src.connect(filt).connect(g).connect(c.destination);
  src.start();
}

export const Sound = {
  shoot() { tone(880, 0.08, "square", 0.12, 220); noise(0.05, 0.08, 2000); },
  hit() { tone(180, 0.12, "sawtooth", 0.18, 60); },
  enemyShoot() { tone(420, 0.09, "square", 0.08, 140); },
  explosion() { noise(0.6, 0.35, 800); tone(80, 0.5, "sine", 0.25, 30); },
  levelUp() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.18, "triangle", 0.18), i * 90)); },
  defeat() { tone(220, 0.5, "sawtooth", 0.2, 60); tone(165, 0.6, "sawtooth", 0.15, 50); },
  victory() { [523, 659, 784].forEach((f, i) => setTimeout(() => tone(f, 0.25, "triangle", 0.2), i * 120)); },
  startMusic() {
    if (!musicOn || musicNodes) return;
    const c = ac(); if (!c) return;
    const osc = c.createOscillator();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    const gain = c.createGain();
    osc.type = "sine"; osc.frequency.value = 55;
    lfo.frequency.value = 0.2; lfoGain.gain.value = 12;
    lfo.connect(lfoGain).connect(osc.frequency);
    gain.gain.value = 0.04;
    osc.connect(gain).connect(c.destination);
    osc.start(); lfo.start();
    musicNodes = { osc, gain, lfo };
  },
  stopMusic() {
    if (!musicNodes) return;
    try { musicNodes.osc.stop(); musicNodes.lfo.stop(); } catch { /* noop */ }
    musicNodes = null;
  },
  setSfx(on: boolean) { sfxOn = on; },
  setMusic(on: boolean) { musicOn = on; if (!on) Sound.stopMusic(); else Sound.startMusic(); },
  isSfx() { return sfxOn; },
  isMusic() { return musicOn; },
};
