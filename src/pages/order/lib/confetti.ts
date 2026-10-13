/** Lightweight canvas confetti in the brand colours (~60 lines instead of a dependency). */
const COLORS = ['#f2a7bf', '#e9c27e', '#9fc98b', '#7fb2e5', '#ffffff'];

export const launchConfetti = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '3000' });
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(2, window.devicePixelRatio);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const pieces = Array.from({ length: 160 }, () => ({
    x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
    y: window.innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 16 - 4,
    size: 6 + Math.random() * 6,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#fff',
    petal: Math.random() > 0.5,
  }));

  const start = performance.now();
  const frame = (now: number) => {
    const elapsed = now - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of pieces) {
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, 1 - elapsed / 3200);
      ctx.fillStyle = p.color;
      if (p.petal) {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size / 2, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }
    if (elapsed < 3200) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
};
