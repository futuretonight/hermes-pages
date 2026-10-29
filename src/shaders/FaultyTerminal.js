/**
 * Azure Developers Club (SRU) — WebGL2 / 2D Canvas Faulty Terminal Shader
 * Renders an animated glitching matrix glyph terminal with scanlines, CRT curvature, and reactive phosphor glow.
 */

export function initFaultyTerminal(container, options = {}) {
  const {
    tint = '#A7EF9E',
    glyphs = 'blocks',
    timeScale = 0.5,
    brightness = 0.75,
    glow = 0.5,
    scanlineIntensity = 0.5,
    glitchAmount = 1,
    flickerAmount = 1
  } = options;

  let canvas = container.querySelector('canvas.card-shader-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'card-shader-canvas faulty-terminal-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    container.insertBefore(canvas, container.firstChild);
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => {};

  let animId = 0;
  let width = 320;
  let height = 335;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  const blockChars = ['█', '▓', '▒', '░', '▌', '▀', '▄', '■', '▪', '▫'];
  const codeChars = ['0', '1', '<', '>', '/', '{', '}', ';', 'λ', 'ADC', '0x', '$', '#', '*'];
  const charSet = glyphs === 'blocks' ? blockChars : codeChars;

  const cols = 28;
  const rows = 24;
  const grid = [];

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        char: charSet[Math.floor(Math.random() * charSet.length)],
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 1.5 + 0.5,
        flicker: Math.random()
      });
    }
    grid.push(row);
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    width = Math.max(160, Math.round(rect.width || container.clientWidth || 320));
    height = Math.max(160, Math.round(rect.height || container.clientHeight || 335));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  let isVisible = true;
  const io = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
  }, { threshold: 0.05 });
  io.observe(container);

  let lastTime = performance.now();
  let time = 0;

  function render(now) {
    const dt = Math.min(0.06, (now - lastTime) / 1000);
    lastTime = now;
    time += dt * timeScale;

    if (isVisible && !document.hidden) {
      ctx.clearRect(0, 0, width, height);

      // CRT Scanline / Dark Terminal Backdrop
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, 'rgba(4, 10, 20, 0.92)');
      grad.addColorStop(1, 'rgba(2, 6, 14, 0.96)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render Glyph Matrix
      const cellW = width / cols;
      const cellH = height / rows;
      ctx.font = `${Math.max(9, Math.round(cellH * 0.72))}px "DM Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const isGlitch = glitchAmount > 0 && Math.sin(time * 8) > 0.93;
      const flicker = flickerAmount * (0.85 + Math.random() * 0.15);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const item = grid[r][c];
          if (Math.random() < 0.03 * item.speed) {
            item.char = charSet[Math.floor(Math.random() * charSet.length)];
            item.opacity = Math.random() * 0.8 + 0.2;
          }

          const x = (c + 0.5) * cellW + (isGlitch && r % 3 === 0 ? (Math.random() - 0.5) * 6 : 0);
          const y = (r + 0.5) * cellH;

          const alpha = item.opacity * brightness * flicker;
          ctx.fillStyle = tint;
          ctx.globalAlpha = Math.min(1, Math.max(0.08, alpha));

          if (glow > 0 && item.opacity > 0.7) {
            ctx.shadowColor = tint;
            ctx.shadowBlur = 8 * glow;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillText(item.char, x, y);
        }
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Scanlines Overlay
      if (scanlineIntensity > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${0.28 * scanlineIntensity})`;
        for (let y = 0; y < height; y += 3) {
          ctx.fillRect(0, y, width, 1.2);
        }
      }

      // Moving CRT Refresh Beam
      const scanY = (time * 140) % (height + 40) - 20;
      const beamGrad = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15);
      beamGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      beamGrad.addColorStop(0.5, `rgba(167, 239, 158, ${0.12 * brightness})`);
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, scanY - 15, width, 30);
    }

    animId = requestAnimationFrame(render);
  }

  animId = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(animId);
    ro.disconnect();
    io.disconnect();
    canvas?.remove();
  };
}
