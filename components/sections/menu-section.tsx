"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";

const PDF_URL = "/menu-bar-toninho.pdf";

export function MenuSection() {
  const [open, setOpen] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWidth, setPageWidth] = useState(400);
  const [pageHeight, setPageHeight] = useState(560);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [animDir, setAnimDir] = useState<"next" | "prev" | null>(null);
  const lockRef = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      setPageImages([]);
      setNumPages(0);
      setCurrentPage(1);

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const doc = await pdfjsLib.getDocument({ url: PDF_URL }).promise;
        if (cancelled) return;
        setNumPages(doc.numPages);

        const firstPage = await doc.getPage(1);
        const origViewport = firstPage.getViewport({ scale: 1 });

        const mq = window.innerWidth < 768;
        const maxW = mq ? window.innerWidth * 0.82 : window.innerWidth * 0.35;
        const maxH = mq ? window.innerHeight * 0.55 : window.innerHeight * 0.7;
        const scale = Math.min(maxW / origViewport.width, maxH / origViewport.height);
        const imgW = Math.floor(origViewport.width * scale);
        const imgH = Math.floor(origViewport.height * scale);

        setPageWidth(imgW);
        setPageHeight(imgH);

        const images: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return;
          const pg = await doc.getPage(i);
          const vp = pg.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width;
          canvas.height = vp.height;
          await pg.render({ canvas, viewport: vp }).promise;
          images.push(canvas.toDataURL("image/jpeg", 0.85));
        }
        if (!cancelled) setPageImages(images);
      } catch (err) {
        console.error("PDF load error:", err);
        if (!cancelled) setError("Impossibile caricare il menu. Riprova più tardi.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPdf();
    return () => { cancelled = true; };
  }, [open]);

  const turnPage = useCallback(
    (dir: "next" | "prev") => {
      if (lockRef.current || loading) return;
      lockRef.current = true;
      setAnimDir(dir);
      setAnimating(true);

      setTimeout(() => {
        setCurrentPage((p) => {
          const step = isMobile ? 1 : 2;
          return dir === "next" ? Math.min(numPages, p + step) : Math.max(1, p - step);
        });
        setAnimating(false);
        setAnimDir(null);
        lockRef.current = false;
      }, 420);
    },
    [loading, numPages, isMobile]
  );

  const showPrev = currentPage > 1;
  const showNext = currentPage < numPages;
  const showSpread = !isMobile && currentPage < numPages;
  const leftIdx = currentPage - 1;
  const rightIdx = showSpread ? currentPage : -1;
  const totalW = showSpread ? pageWidth * 2 + 12 : pageWidth;

  const nextPage = animDir === "next"
    ? Math.min(numPages, currentPage + (isMobile ? 1 : 2))
    : animDir === "prev"
    ? Math.max(1, currentPage - (isMobile ? 1 : 2))
    : currentPage;
  const nextLeftIdx = nextPage - 1;
  const nextRightIdx = showSpread ? nextPage : -1;

  return (
    <section id="menu" className="py-20 md:py-28 lg:py-36">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <span className="product-label inline-block mb-4">Il Nostro Menu</span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-primary mb-6">
          Scopri le Nostre Creazioni
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
          Dai caffè specialty ai cocktails artigianali, dai vini selezionati ai
          piatti della cucina — sfoglia il nostro menu come un libro.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-3 px-8 py-4 text-sm font-medium transition-all rounded-full bg-primary text-primary-foreground hover:opacity-90 warm-shadow-lg group"
        >
          <BookOpen size={20} className="transition-transform group-hover:rotate-[-8deg]" />
          Sfoglia il Menu
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-background border-border max-w-[95vw] w-auto p-0 gap-0 overflow-hidden" showCloseButton={false}>
          <DialogTitle className="sr-only">Menu Bar Toninho</DialogTitle>

          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-medium text-foreground">Menù Bar Toninho</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {currentPage}{showSpread ? `-${currentPage + 1}` : ""} / {numPages}
              </span>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-muted transition-colors" aria-label="Chiudi">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 sm:gap-3 px-2 py-4 min-h-[300px] md:min-h-[400px]">
            <button
              onClick={() => turnPage("prev")}
              className={`shrink-0 rounded-full p-1.5 sm:p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-20 ${animating ? "invisible" : showPrev ? "" : "invisible"}`}
              disabled={!showPrev || animating}
              aria-label="Pagina precedente"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="relative flex items-center justify-center" style={{ width: totalW, height: pageHeight }}>
              {loading && (
                <div className="flex items-center justify-center gap-2" style={{ width: totalW, height: pageHeight }}>
                  <Loader2 size={20} className="animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground animate-pulse">Caricamento menu...</span>
                </div>
              )}
              {error && (
                <div className="flex items-center justify-center" style={{ width: totalW, height: pageHeight }}>
                  <div className="text-sm text-destructive text-center px-4">{error}</div>
                </div>
              )}

              {!loading && !error && pageImages.length > 0 && (
                <div className="relative flex gap-2 items-center" style={{ height: pageHeight }}>
                  <div className="relative" style={{ width: pageWidth, height: pageHeight }}>
                    <Page
                      src={
                        animating && animDir === "prev" && nextLeftIdx >= 0
                          ? pageImages[nextLeftIdx] ?? ""
                          : !showSpread && animating && animDir === "next" && leftIdx + 1 < pageImages.length
                          ? pageImages[leftIdx + 1] ?? ""
                          : pageImages[leftIdx] ?? ""
                      }
                      width={pageWidth}
                      height={pageHeight}
                    />
                    {animating && animDir === "prev" && (
                      <div
                        className="absolute inset-0 z-10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex items-center justify-center overflow-hidden rounded-sm"
                        style={{
                          width: pageWidth,
                          height: pageHeight,
                          animation: "pageLeaveLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                          transformOrigin: "right center",
                        }}
                      >
                        <img src={pageImages[leftIdx] ?? ""} alt="" className="block select-none" style={{ width: pageWidth, height: pageHeight, objectFit: "contain" }} draggable={false} />
                      </div>
                    )}
                    {!showSpread && animating && animDir === "next" && (
                      <div
                        className="absolute inset-0 z-10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex items-center justify-center overflow-hidden rounded-sm"
                        style={{
                          width: pageWidth,
                          height: pageHeight,
                          animation: "pageLeaveRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                          transformOrigin: "left center",
                        }}
                      >
                        <img src={pageImages[leftIdx] ?? ""} alt="" className="block select-none" style={{ width: pageWidth, height: pageHeight, objectFit: "contain" }} draggable={false} />
                      </div>
                    )}
                  </div>
                  {showSpread && (
                    <>
                      <div className="w-px h-3/4 bg-gradient-to-b from-transparent via-amber-900/20 to-transparent shrink-0" />
                      <div className="relative" style={{ width: pageWidth, height: pageHeight }}>
                        <Page
                          src={
                            animating && (animDir === "next" || animDir === "prev")
                              ? pageImages[nextRightIdx] ?? ""
                              : pageImages[rightIdx] ?? ""
                          }
                          width={pageWidth}
                          height={pageHeight}
                        />
                        {animating && animDir === "next" && (
                          <div
                            className="absolute inset-0 z-10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex items-center justify-center overflow-hidden rounded-sm"
                            style={{
                              width: pageWidth,
                              height: pageHeight,
                              animation: "pageLeaveRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                              transformOrigin: "left center",
                            }}
                          >
                            <img src={pageImages[rightIdx] ?? ""} alt="" className="block select-none" style={{ width: pageWidth, height: pageHeight, objectFit: "contain" }} draggable={false} />
                          </div>
                        )}
                        {animating && animDir === "prev" && (
                          <div
                            className="absolute inset-0 z-10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex items-center justify-center overflow-hidden rounded-sm"
                            style={{
                              width: pageWidth,
                              height: pageHeight,
                              animation: "pageLeaveLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                              transformOrigin: "right center",
                            }}
                          >
                            <img src={pageImages[rightIdx] ?? ""} alt="" className="block select-none" style={{ width: pageWidth, height: pageHeight, objectFit: "contain" }} draggable={false} />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => turnPage("next")}
              className={`shrink-0 rounded-full p-1.5 sm:p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-20 ${animating ? "invisible" : showNext ? "" : "invisible"}`}
              disabled={!showNext || animating}
              aria-label="Pagina successiva"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          <div className="text-center pb-4 text-xs text-muted-foreground">
            Usa le frecce per sfogliare il menu
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes pageLeaveRight {
          0% { transform: perspective(1200px) rotateY(0deg) scale(1); opacity: 1; }
          50% { transform: perspective(1200px) rotateY(-8deg) scale(0.97); opacity: 0.7; box-shadow: 0 30px 80px rgba(0,0,0,0.3); }
          100% { transform: perspective(1200px) rotateY(-90deg) scale(0.95); opacity: 0; }
        }
        @keyframes pageLeaveLeft {
          0% { transform: perspective(1200px) rotateY(0deg) scale(1); opacity: 1; }
          50% { transform: perspective(1200px) rotateY(8deg) scale(0.97); opacity: 0.7; box-shadow: 0 30px 80px rgba(0,0,0,0.3); }
          100% { transform: perspective(1200px) rotateY(90deg) scale(0.95); opacity: 0; }
        }
        @keyframes pageEnterRight {
          0% { transform: perspective(1200px) rotateY(90deg) scale(0.95); opacity: 0; }
          50% { transform: perspective(1200px) rotateY(8deg) scale(0.97); opacity: 0.7; box-shadow: 0 30px 80px rgba(0,0,0,0.3); }
          100% { transform: perspective(1200px) rotateY(0deg) scale(1); opacity: 1; }
        }
      `}</style>
    </section>
  );
}

function Page({ src, width, height }: { src: string; width: number; height: number }) {
  return (
    <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-center overflow-hidden rounded-sm" style={{ width, height }}>
      <img src={src} alt="" className="block select-none" style={{ width, height, objectFit: "contain" }} draggable={false} />
    </div>
  );
}
