/**
 * Particle network — interactive canvas with drifting particles,
 * particle-to-particle white lines, and bright green cursor lines.
 */

const PARTICLE_COUNT = 90;
const PARTICLE_RADIUS = 2;
const CONNECT_DIST = 120;
const CURSOR_DIST = 180;
const ATTRACT_DIST = 150;
const ATTRACT_STRENGTH = 0.015;

export function initParticles() {
  if (matchMedia('(pointer: coarse)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W = window.innerWidth;
  let H = window.innerHeight;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Mouse tracking
  let mx = -9999, my = -9999;
  document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

  // Particles
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    // Update positions
    for (const p of particles) {
      // Cursor attraction
      const dx = mx - p.x;
      const dy = my - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ATTRACT_DIST && dist > 0) {
        p.vx += (dx / dist) * ATTRACT_STRENGTH;
        p.vy += (dy / dist) * ATTRACT_STRENGTH;
      }

      // Damping to prevent runaway speed
      p.vx *= 0.99;
      p.vy *= 0.99;

      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      if (p.x > W) { p.x = W; p.vx *= -1; }
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      if (p.y > H) { p.y = H; p.vy *= -1; }
    }

    // Draw particle-to-particle lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = 0.1 * (1 - dist / CONNECT_DIST);
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw cursor-to-particle lines (bright green with glow)
    ctx.save();
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 8;
    for (const p of particles) {
      const dx = mx - p.x;
      const dy = my - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CURSOR_DIST) {
        const alpha = 0.5 * (1 - dist / CURSOR_DIST);
        ctx.strokeStyle = `rgba(57,255,20,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }
    ctx.restore();

    // Draw particles
    for (const p of particles) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
