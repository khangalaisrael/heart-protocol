import React, { useEffect, useRef } from 'react';

interface Point {
  drawX: number;
  y: number;
  alpha: number;
  targetAlpha: number;
  delay: number;
  hue: number;
  lightness: number;
}

export default function TextHeart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let points: Point[] = [];
    const text = "i love you";
    const fontSize = 14;
    let textHalfWidth = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.font = `${fontSize}px "Fira Code", monospace`;
      textHalfWidth = ctx.measureText(text).width / 2;
      initPoints();
    };

    const heartX = (t: number) => 16 * Math.pow(Math.sin(t), 3);
    const heartY = (t: number) => -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

    const initPoints = () => {
      points = [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = Math.min(canvas.width, canvas.height) / 45;

      for (let t = 0; t < Math.PI * 2; t += 0.05) {
        const cx = centerX + heartX(t) * scale;
        const cy = centerY + heartY(t) * scale;
        points.push({
          drawX: cx - textHalfWidth,
          y: cy,
          alpha: 0,
          targetAlpha: 0.8 + Math.random() * 0.2,
          delay: Math.random() * 2000,
          hue: 340 + Math.random() * 30,
          lightness: 60 + Math.random() * 20,
        });
      }

      // Denser inner layers
      for (let s = 0.15; s < 1; s += 0.15) {
        for (let t = 0; t < Math.PI * 2; t += 0.08) {
          const cx = centerX + heartX(t) * scale * s;
          const cy = centerY + heartY(t) * scale * s;
          points.push({
            drawX: cx - textHalfWidth,
            y: cy,
            alpha: 0,
            targetAlpha: 0.35 + Math.random() * 0.45,
            delay: Math.random() * 3000,
            hue: 340 + Math.random() * 30,
            lightness: 55 + Math.random() * 20,
          });
        }
      }
    };

    let start: number | null = null;
    let lastBeat = 0;
    let beatScale = 1;
    let beatDir = 0; // 0 = idle, 1 = expanding, -1 = contracting

    const draw = (time: number) => {
      if (!start) start = time;
      const elapsed = time - start;

      // Heartbeat every 1200ms
      if (elapsed - lastBeat > 1200) {
        lastBeat = elapsed;
        beatDir = 1;
        beatScale = 1;
      }
      if (beatDir === 1) {
        beatScale += 0.008;
        if (beatScale >= 1.04) beatDir = -1;
      } else if (beatDir === -1) {
        beatScale -= 0.006;
        if (beatScale <= 1) { beatScale = 1; beatDir = 0; }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px "Fira Code", monospace`;

      // Apply heartbeat scale from canvas center
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(beatScale, beatScale);
      ctx.translate(-cx, -cy);

      // Glow pass (blur, low opacity)
      ctx.shadowColor = 'rgba(255, 77, 109, 0.6)';
      ctx.shadowBlur = 14;

      points.forEach(p => {
        if (elapsed > p.delay) {
          p.alpha += (p.targetAlpha - p.alpha) * 0.02;
        }
        ctx.fillStyle = `hsla(${p.hue}, 100%, ${p.lightness}%, ${p.alpha})`;
        ctx.fillText(text, p.drawX, p.y);
      });

      ctx.shadowBlur = 0;
      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
    />
  );
}
