/**
 * Keyboard switch sounds synthesised with the Web Audio API — no audio files to download.
 * Each switch type is a short filtered noise burst with its own "body":
 * linear = soft thock, tactile = two-step bump, clicky = sharp click + jacket, silent = muffled tap.
 * Real recordings can replace it later (see assets-src/sounds/README.md).
 */
type SoundKind = 'linear' | 'tactile' | 'clicky' | 'silent';

let ctx: AudioContext | null = null;
const getCtx = () => {
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
};

const burst = (
  ac: AudioContext,
  at: number,
  { freq, q, gain, decay }: { freq: number; q: number; gain: number; decay: number },
) => {
  const length = Math.ceil(ac.sampleRate * (decay + 0.02));
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++)
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * decay * 0.35));
  const source = ac.createBufferSource();
  source.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;
  const amp = ac.createGain();
  amp.gain.setValueAtTime(gain, at);
  amp.gain.exponentialRampToValueAtTime(0.001, at + decay);
  source.connect(filter).connect(amp).connect(ac.destination);
  source.start(at);
};

const thock = (ac: AudioContext, at: number, freq: number, gain: number) => {
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, at);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, at + 0.08);
  const amp = ac.createGain();
  amp.gain.setValueAtTime(gain, at);
  amp.gain.exponentialRampToValueAtTime(0.001, at + 0.09);
  osc.connect(amp).connect(ac.destination);
  osc.start(at);
  osc.stop(at + 0.1);
};

const press = (kind: SoundKind, at: number, ac: AudioContext) => {
  switch (kind) {
    case 'linear':
      burst(ac, at, { freq: 1100, q: 1.2, gain: 0.5, decay: 0.05 });
      thock(ac, at, 180, 0.35);
      break;
    case 'tactile':
      burst(ac, at, { freq: 1500, q: 2, gain: 0.25, decay: 0.03 });
      burst(ac, at + 0.035, { freq: 1000, q: 1.2, gain: 0.45, decay: 0.05 });
      thock(ac, at + 0.035, 200, 0.3);
      break;
    case 'clicky':
      burst(ac, at, { freq: 4200, q: 6, gain: 0.7, decay: 0.02 });
      burst(ac, at + 0.04, { freq: 2600, q: 3, gain: 0.45, decay: 0.03 });
      thock(ac, at + 0.04, 260, 0.2);
      break;
    case 'silent':
      burst(ac, at, { freq: 600, q: 0.8, gain: 0.25, decay: 0.04 });
      thock(ac, at, 140, 0.18);
      break;
  }
};

/** Plays a short "typing" phrase of 5 key presses. */
export const playSwitchSound = (kind: SoundKind) => {
  const ac = getCtx();
  const now = ac.currentTime + 0.02;
  [0, 0.13, 0.24, 0.41, 0.52].forEach((offset) => press(kind, now + offset, ac));
};
