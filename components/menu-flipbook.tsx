"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const ReactPageFlip = dynamic(
  () => import("react-pageflip"),
  { ssr: false }
);

interface PageImage {
  src: string;
  width: number;
  height: number;
}

interface MenuFlipbookProps {
  pdfUrl: string;
  onClose: () => void;
}

export function MenuFlipbook({ pdfUrl, onClose }: MenuFlipbookProps) {
  const [pages, setPages] = useState<PageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [bookSize, setBookSize] = useState<{
    width: number;
    height: number;
  }>({ width: 596, height: 842 });
  const flipRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    blobUrlsRef.current = [];

    async function loadPDF() {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        if (cancelled || !mountedRef.current) return;

        const totalPages = pdf.numPages;
        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        const scale = isMobile ? 1.0 : 1.5;

        const firstPage = await pdf.getPage(1);
        const vp = firstPage.getViewport({ scale });
        const dims = {
          width: Math.round(vp.width),
          height: Math.round(vp.height),
        };

        if (mountedRef.current) {
          setDimensions(dims);
        }

        const renderedPages: PageImage[] = [];

        const renderPage = async (pageNum: number) => {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);
          const ctx = canvas.getContext("2d")!;

          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({ canvasContext: ctx, viewport }).promise;

          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), "image/jpeg", 0.82)
          );

          page.cleanup();

          if (blob) {
            const url = URL.createObjectURL(blob);
            blobUrlsRef.current.push(url);
            return { src: url, width: canvas.width, height: canvas.height };
          }
          return null;
        };

        const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
        const concurrency = 4;

        for (let i = 0; i < pageNumbers.length; i += concurrency) {
          if (cancelled || !mountedRef.current) break;

          const batch = pageNumbers.slice(i, i + concurrency);
          const results = await Promise.all(batch.map(renderPage));

          for (const result of results) {
            if (result) renderedPages.push(result);
          }

          if (mountedRef.current) {
            const completed = Math.min(i + concurrency, totalPages);
            setProgress(Math.round((completed / totalPages) * 100));
          }
        }

        if (!cancelled && mountedRef.current) {
          setPages(renderedPages);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled && mountedRef.current) {
          setError(
            err instanceof Error ? err.message : "Errore nel caricamento del menu"
          );
          setLoading(false);
        }
      }
    }

    setLoading(true);
    setProgress(0);
    setError(null);
    loadPDF();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  const handleFlip = useCallback((e: any) => {
    if (e && typeof e.data === "number") {
      setCurrentPage(e.data);
    }
  }, []);

  const goToPrevPage = useCallback(() => {
    if (flipRef.current?.pageFlip()) {
      flipRef.current.pageFlip().flipPrev();
    }
  }, []);

  const goToNextPage = useCallback(() => {
    if (flipRef.current?.pageFlip()) {
      flipRef.current.pageFlip().flipNext();
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goToPrevPage();
      } else if (e.key === "ArrowRight") {
        goToNextPage();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goToPrevPage, goToNextPage]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!dimensions) return;
    const ratio = dimensions.width / dimensions.height;

    function calcSize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxW = Math.min(vw - 48, 896);
      const maxH = vh * 0.78;
      let w = maxW;
      let h = w / ratio;
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      setBookSize({ width: Math.round(w), height: Math.round(h) });
    }

    calcSize();
    window.addEventListener("resize", calcSize);
    return () => window.removeEventListener("resize", calcSize);
  }, [dimensions]);

  if (error) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
        <div className="bg-card rounded-2xl p-8 max-w-md text-center">
          <p className="text-destructive text-lg mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium"
          >
            Chiudi
          </button>
        </div>
      </div>
    );
  }

  const totalPages = pages.length;
  const displayPage = Math.min(currentPage + 1, totalPages);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/85 backdrop-blur-md">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
        aria-label="Chiudi menu"
      >
        <X size={20} />
      </button>

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          <div className="relative">
            <Loader2
              size={48}
              className="animate-spin text-primary/60"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/40 text-xs font-medium">
                {progress}%
              </span>
            </div>
          </div>
          <div className="w-48 sm:w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/50 text-sm">
            Caricamento menu in corso...
          </p>
        </div>
      )}

      {!loading && pages.length > 0 && (
        <>
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
            <div
              className="relative animate-fade-in"
              style={{
                width: bookSize.width,
                height: bookSize.height,
                filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.5)) drop-shadow(0 8px 20px rgba(0,0,0,0.3))",
              }}
            >
              <ReactPageFlip
                ref={flipRef}
                key={pages.length}
                className="w-full h-full"
                style={{}}
                width={bookSize.width}
                height={bookSize.height}
                size="fixed"
                startPage={0}
                drawShadow
                flippingTime={700}
                usePortrait
                showCover
                clickEventForward
                mobileScrollSupport
                swipeDistance={30}
                showPageCorners
                maxShadowOpacity={0.7}
                onFlip={handleFlip}
              >
                {pages.map((page, idx) => (
                  <div key={idx} className="relative bg-white overflow-hidden">
                    <img
                      src={page.src}
                      alt={`Pagina ${idx + 1}`}
                      className="w-full h-full object-contain"
                      draggable={false}
                      loading={idx < 3 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </ReactPageFlip>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 py-4 px-6 bg-black/40 backdrop-blur-sm">
            <button
              onClick={goToPrevPage}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={currentPage <= 0}
              aria-label="Pagina precedente"
            >
              <ChevronLeft size={20} />
            </button>

            <span className="text-white/70 text-sm font-medium min-w-[80px] text-center tabular-nums">
              {displayPage} / {totalPages}
            </span>

            <button
              onClick={goToNextPage}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={currentPage >= totalPages - 1}
              aria-label="Pagina successiva"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
