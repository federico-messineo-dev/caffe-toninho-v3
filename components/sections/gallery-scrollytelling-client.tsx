"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  useScroll,
  useTransform,
  useMotionValueEvent,
  motion,
  type MotionValue,
} from "framer-motion";

type GalleryScrollytellingClientProps = {
  frames: string[];
};

const TOTAL_VH_DESKTOP = 500;
const TOTAL_VH_MOBILE = 250;

const HEADING = "L'Arte del Caffè Toninho";
const DESCRIPTION =
  "Ogni chicco è selezionato con cura, tostato artigianalmente per rivelare aromi ricchi e profondi. Il nostro sacchetto racconta una tradizione che unisce passione e qualità, dal chicco alla tazza.";
const CTA_LABEL = "Scopri i Prodotti";
const CTA_HREF = "#prodotti";

function getDpr(): number {
  const raw = window.devicePixelRatio || 1;
  return raw > 1.5 ? 1.5 : raw;
}

function loadImages(srcs: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(
    srcs.map(
      (src) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load ${src}`));
          img.src = src;
        })
    )
  );
}

function setupCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  containerW: number,
  containerH: number
): { w: number; h: number } {
  const dpr = getDpr();
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const containerAspect = containerW / containerH;

  let drawW: number;
  let drawH: number;

  if (imgAspect > containerAspect) {
    drawW = containerW;
    drawH = containerW / imgAspect;
  } else {
    drawH = containerH;
    drawW = containerH * imgAspect;
  }

  canvas.width = drawW * dpr;
  canvas.height = drawH * dpr;
  canvas.style.width = `${drawW}px`;
  canvas.style.height = `${drawH}px`;

  return { w: drawW * dpr, h: drawH * dpr };
}

function drawBlendedFrame(
  ctx: CanvasRenderingContext2D,
  imgA: HTMLImageElement,
  imgB: HTMLImageElement,
  blend: number,
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.drawImage(imgA, 0, 0, w, h);
  ctx.globalAlpha = blend;
  ctx.drawImage(imgB, 0, 0, w, h);
  ctx.globalAlpha = 1;
}

function WordReveal({
  text,
  progress,
  className,
}: {
  text: string;
  progress: MotionValue<number>;
  className?: string;
}) {
  const words = text.split(" ");
  const [progressValue, setProgressValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const latestRef = useRef(0);

  useMotionValueEvent(progress, "change", (latest) => {
    latestRef.current = latest;
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setProgressValue(latestRef.current);
      });
    }
  });

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <span className={className}>
      {words.map((word, index) => {
        const appearProgress = progressValue * (words.length + 1);
        const wordAppearProgress = Math.max(
          0,
          Math.min(1, appearProgress - index)
        );
        return (
          <span
            key={index}
            className="inline-block"
            style={{
              opacity: wordAppearProgress,
              filter: `blur(${(1 - wordAppearProgress) * 40}px)`,
              transition: "opacity 0.15s linear, filter 0.15s linear",
              marginRight: "0.3em",
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}

export function GalleryScrollytellingClient({
  frames,
}: GalleryScrollytellingClientProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const canvasDimsRef = useRef<{ w: number; h: number } | null>(null);
  const currentFrameRef = useRef<number>(0);
  const drawRafRef = useRef<number | null>(null);
  const pendingFrameRef = useRef<number>(-1);

  const [loaded, setLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const totalVh = frames.length > 50 ? TOTAL_VH_MOBILE : TOTAL_VH_DESKTOP;

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const frameIndex: MotionValue<number> = useTransform(
    scrollYProgress,
    [0, 1],
    [0, frames.length - 1]
  );

  const setupCanvasFromContainer = useCallback(
    (img: HTMLImageElement) => {
      const canvas = canvasRef.current;
      const container = canvasContainerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;

      const dims = setupCanvas(canvas, img, w, h);
      canvasDimsRef.current = dims;
    },
    []
  );

  const drawBlended = useCallback(
    (fractionalIndex: number) => {
      const canvas = canvasRef.current;
      const dims = canvasDimsRef.current;
      const imgs = imagesRef.current;
      if (!canvas || !dims || imgs.length === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const floorIndex = Math.floor(fractionalIndex);
      const ceilIndex = Math.min(floorIndex + 1, imgs.length - 1);
      const blend = fractionalIndex - floorIndex;

      if (blend < 0.001 || floorIndex === ceilIndex) {
        ctx.clearRect(0, 0, dims.w, dims.h);
        ctx.drawImage(imgs[floorIndex], 0, 0, dims.w, dims.h);
      } else {
        drawBlendedFrame(
          ctx,
          imgs[floorIndex],
          imgs[ceilIndex],
          blend,
          dims.w,
          dims.h
        );
      }
    },
    []
  );

  const scheduleDraw = useCallback(
    (fractionalIndex: number) => {
      pendingFrameRef.current = fractionalIndex;
      if (drawRafRef.current === null) {
        drawRafRef.current = requestAnimationFrame(() => {
          drawRafRef.current = null;
          const frame = pendingFrameRef.current;
          if (frame >= 0) drawBlended(frame);
        });
      }
    },
    [drawBlended]
  );

  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (reducedMotion) return;
    scheduleDraw(latest);
  });

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadImages(frames).then((imgs) => {
      if (cancelled) return;
      imagesRef.current = imgs;

      if (imgs.length > 0) {
        setupCanvasFromContainer(imgs[0]);
        const canvas = canvasRef.current;
        const dims = canvasDimsRef.current;
        if (canvas && dims) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(imgs[imgs.length - 1], 0, 0, dims.w, dims.h);
          }
        }
      }

      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [frames, setupCanvasFromContainer]);

  useEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    const firstImg = imagesRef.current[0];
    if (!canvas || !firstImg) return;

    const container = canvasContainerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      setupCanvasFromContainer(firstImg);
      drawBlended(currentFrameRef.current);
    });
    ro.observe(container);

    return () => ro.disconnect();
  }, [loaded, setupCanvasFromContainer, drawBlended]);

  useEffect(() => {
    if (loaded && reducedMotion && imagesRef.current.length > 0) {
      const canvas = canvasRef.current;
      const dims = canvasDimsRef.current;
      if (canvas && dims) {
        const ctx = canvas.getContext("2d");
        const lastImg = imagesRef.current[imagesRef.current.length - 1];
        if (ctx && lastImg) {
          ctx.drawImage(lastImg, 0, 0, dims.w, dims.h);
        }
      }
    }
  }, [loaded, reducedMotion]);

  useEffect(() => {
    return () => {
      if (drawRafRef.current !== null) cancelAnimationFrame(drawRafRef.current);
    };
  }, []);

  if (frames.length === 0) return null;

  return (
    <motion.section
      ref={wrapperRef}
      className="relative bg-section-dark"
      style={{ height: `${totalVh}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full flex-col-reverse md:flex-row">
          <div
            className="flex w-full flex-col items-center justify-center px-6 py-8 md:h-full md:w-1/2 md:items-start md:px-12 md:py-0 lg:px-20"
          >
            <WordReveal
              text={HEADING}
              progress={scrollYProgress}
              className="mb-6 block text-center font-display text-2xl font-medium leading-tight tracking-tight text-white sm:text-3xl md:mb-4 md:text-left md:text-5xl lg:text-6xl"
            />
            <WordReveal
              text={DESCRIPTION}
              progress={scrollYProgress}
              className="mb-6 block text-center text-sm leading-relaxed text-white/70 md:text-left md:text-lg lg:text-xl"
            />
            <Link
              href={CTA_HREF}
              className="inline-block rounded-full bg-primary px-6 py-2.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-80 sm:px-8 sm:py-3 sm:text-sm"
            >
              {CTA_LABEL}
            </Link>
          </div>

          <div
            ref={canvasContainerRef}
            className="relative flex h-[70vh] w-full flex-shrink-0 items-center justify-center md:h-screen md:w-1/2"
          >
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm tracking-wide text-white/60">
                  Caricamento…
                </span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className={`transition-opacity duration-300 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
