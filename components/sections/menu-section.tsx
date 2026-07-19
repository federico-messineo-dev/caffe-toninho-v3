"use client";

import { useState, useEffect, useCallback } from "react";
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

        const isMobile = window.innerWidth < 768;
        const maxWidth = isMobile
          ? window.innerWidth * 0.82
          : window.innerWidth * 0.35;
        const maxHeight = isMobile
          ? window.innerHeight * 0.55
          : window.innerHeight * 0.7;
        const scaleW = maxWidth / origViewport.width;
        const scaleH = maxHeight / origViewport.height;
        const scale = Math.min(scaleW, scaleH);

        const imgWidth = Math.floor(origViewport.width * scale);
        const imgHeight = Math.floor(origViewport.height * scale);

        setPageWidth(imgWidth);
        setPageHeight(imgHeight);

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

        if (!cancelled) {
          setPageImages(images);
        }
      } catch (err) {
        console.error("PDF load error:", err);
        if (!cancelled) {
          setError("Impossibile caricare il menu. Riprova più tardi.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentPage((p) => Math.min(numPages, p + 1));
  }, []);

  const showPrev = currentPage > 1;
  const showNext = currentPage < numPages;
  const showSpread = !isMobile && currentPage < numPages;
  const leftIdx = currentPage - 1;
  const rightIdx = showSpread ? currentPage : -1;

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
          <BookOpen
            size={20}
            className="transition-transform group-hover:rotate-[-8deg]"
          />
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
                {currentPage}{numPages > 0 ? ` / ${numPages}` : ""}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 hover:bg-muted transition-colors"
                aria-label="Chiudi"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-4 min-h-[300px] md:min-h-[400px]">
            <button
              onClick={goToPrev}
              className={`shrink-0 rounded-full p-1.5 sm:p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-20 ${showPrev ? "" : "invisible"}`}
              disabled={!showPrev || loading}
              aria-label="Pagina precedente"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="flex justify-center items-center gap-1 overflow-hidden">
              {loading && (
                <div className="flex items-center justify-center gap-2" style={{ width: pageWidth * 2 + 8, height: pageHeight }}>
                  <Loader2 size={20} className="animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground animate-pulse">Caricamento menu...</span>
                </div>
              )}
              {error && (
                <div className="flex items-center justify-center" style={{ width: pageWidth * 2 + 8, height: pageHeight }}>
                  <div className="text-sm text-destructive text-center px-4">{error}</div>
                </div>
              )}
              {!loading && !error && pageImages.length > 0 && (
                <div className="flex gap-1" style={{ height: pageHeight }}>
                  {leftIdx >= 0 && leftIdx < pageImages.length && (
                    <div className="bg-white shadow-md flex items-center justify-center overflow-hidden" style={{ width: pageWidth, height: pageHeight }}>
                      <img
                        src={pageImages[leftIdx]}
                        alt={`Pagina ${currentPage}`}
                        className="block"
                        style={{ width: pageWidth, height: pageHeight, objectFit: "contain" }}
                        draggable={false}
                      />
                    </div>
                  )}
                  {rightIdx >= 0 && rightIdx < pageImages.length && (
                    <div className="bg-white shadow-md flex items-center justify-center overflow-hidden" style={{ width: pageWidth, height: pageHeight }}>
                      <img
                        src={pageImages[rightIdx]}
                        alt={`Pagina ${currentPage + 1}`}
                        className="block"
                        style={{ width: pageWidth, height: pageHeight, objectFit: "contain" }}
                        draggable={false}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={goToNext}
              className={`shrink-0 rounded-full p-1.5 sm:p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-20 ${showNext ? "" : "invisible"}`}
              disabled={!showNext || loading}
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
    </section>
  );
}
