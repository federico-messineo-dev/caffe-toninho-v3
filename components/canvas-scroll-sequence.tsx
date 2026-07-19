'use client';

import { useEffect, useRef, useState } from 'react';

export function CanvasScrollSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      setScrollProgress(Math.max(0, Math.min(1, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    // Placeholder — replace with actual frame rendering logic
    ctx.fillStyle = `rgba(92, 26, 43, ${0.1 + scrollProgress * 0.3})`;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#F5EFE3';
    ctx.font = `${Math.min(w * 0.08, 48)}px 'Playfair Display', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TONINHO', w / 2, h / 2 - 20);

    ctx.font = `${Math.min(w * 0.03, 16)}px 'Inter', sans-serif`;
    ctx.fillStyle = '#E3D9C7';
    ctx.fillText('CanvasScrollSequence — Pronto per l\'innesto', w / 2, h / 2 + 30);
  }, [scrollProgress]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
}
