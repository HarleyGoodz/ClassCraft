/*
 * confetti.js: the confetti for the party-pop celebration.
 * Purpose: draws confetti shooting out of two party poppers in the bottom corners.
 * What it does: launchConfetti(canvas) animates the confetti on the given full-screen canvas
 * and returns a function that stops it early. onFinish is called when the last piece has fallen.
 */

const COLORS = ["#FFD34D", "#FF6B8B", "#6E5CD6", "#3B82F6", "#34D399", "#FF9F43"];
const PIECES_PER_POPPER = 90;

export function launchConfetti(canvas, onFinish) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Speeds scale with the screen so the confetti reaches about two-thirds of the way up.
  const power = Math.sqrt(height) * 0.95;
  const pieces = [];
  [[0, -1], [width, 1]].forEach(([x, side]) => {
    for (let i = 0; i < PIECES_PER_POPPER; i++) {
      // Left popper aims up and to the right; right popper aims up and to the left.
      const angle = (-Math.PI / 2) + side * -(0.35 + Math.random() * 0.55);
      const speed = power * (0.55 + Math.random() * 0.6);
      pieces.push({
        x,
        y: height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        round: Math.random() < 0.3,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.4,
        wobble: Math.random() * Math.PI * 2,
      });
    }
  });

  let frame = 0;
  let stopped = false;
  let last = performance.now();

  function draw(now) {
    if (stopped) return;
    const dt = Math.min((now - last) / 16.67, 3); // 1 = one frame at 60 fps
    last = now;
    ctx.clearRect(0, 0, width, height);
    let alive = 0;
    pieces.forEach((p) => {
      p.vy += 0.32 * dt; // gravity
      p.vx *= Math.pow(0.985, dt); // air drag
      p.vy *= Math.pow(0.985, dt);
      p.wobble += 0.12 * dt;
      p.spin += p.spinSpeed * dt;
      p.x += (p.vx + Math.sin(p.wobble) * 0.6) * dt;
      p.y += p.vy * dt;
      if (p.y > height + 20) return;
      alive++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Flat paper strips look like they flip as they fall.
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, (p.size / 2) * Math.abs(Math.cos(p.wobble)) + 1);
      }
      ctx.restore();
    });
    frame++;
    if (alive > 0 || frame < 10) requestAnimationFrame(draw);
    else {
      ctx.clearRect(0, 0, width, height);
      onFinish?.();
    }
  }
  requestAnimationFrame(draw);

  return function stop() {
    stopped = true;
    ctx.clearRect(0, 0, width, height);
  };
}