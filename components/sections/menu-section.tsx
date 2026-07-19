"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, ChevronLeft, ChevronRight, X } from "lucide-react";

const PDF_URL = "/menu-bar-toninho.pdf";

function PdfPage({
  pageNumber,
  width,
  height,
  pdfDoc,
}: {
  pageNumber: number;
  width: number;
  height: number;
  pdfDoc: any;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;

    async function renderPage() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const page = await pdfDoc.getPage(pageNumber);
      if (cancelled) return;

      const scale = width / page.getViewport({ scale: 1 }).width;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;
    }

    renderPage();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [pageNumber, width, height, pdfDoc]);

  return (
    <div
      className="bg-white shadow-2xl"
      style={{ width, height, pageBreakAfter: "always" }}
    >
      <canvas ref={canvasRef} className="block" style={{ width, height }} />
    </div>
  );
}

export function MenuSection() {
  const [open, setOpen] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWidth, setPageWidth] = useState(400);
  const [pageHeight, setPageHeight] = useState(560);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [FlipBook, setFlipBook] = useState<any>(null);
  const flipBookRef = useRef<any>(null);

  useEffect(() => {
    import("react-pageflip").then((mod) => {
      setFlipBook(() => mod.default);
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      setPdfDoc(null);
      setNumPages(0);
      setCurrentPage(1);

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "";
        const doc = await pdfjsLib.getDocument({
          url: PDF_URL,
          // @ts-expect-error - isEvalSupported is not in the types but works at runtime
          isEvalSupported: false,
        }).promise;
        if (cancelled) return;

        setNumPages(doc.numPages);
        setPdfDoc(doc);

        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const isMobile = window.innerWidth < 768;
        const maxWidth = isMobile
          ? window.innerWidth * 0.85
          : window.innerWidth * 0.4;
        const maxHeight = isMobile
          ? window.innerHeight * 0.55
          : window.innerHeight * 0.65;
        const scaleW = maxWidth / viewport.width;
        const scaleH = maxHeight / viewport.height;
        const scale = Math.min(scaleW, scaleH);
        setPageWidth(Math.floor(viewport.width * scale));
        setPageHeight(Math.floor(viewport.height * scale));
      } catch (err) {
        console.error("PDF load error:", err);
        if (!cancelled) {
          setError(
            "Impossibile caricare il menu. Riprova più tardi."
          );
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

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data + 1);
  }, []);

  const goToPrev = useCallback(() => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const goToNext = useCallback(() => {
    flipBookRef.current?.pageFlip()?.flipNext();
  }, []);

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
        <DialogContent
          className="bg-background border-border max-w-[95vw] w-auto p-0 gap-0 overflow-hidden"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Menu Bar Toninho</DialogTitle>

          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-medium text-foreground">
              Menù Bar Toninho
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Pagina {currentPage} / {numPages || "—"}
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

          <div className="flex items-center justify-center gap-2 px-2 py-4 min-h-[400px] md:min-h-[500px]">
            <button
              onClick={goToPrev}
              className="shrink-0 rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30"
              disabled={currentPage <= 1 || loading}
              aria-label="Pagina precedente"
            >
              <ChevronLeft size={24} />
            </button>

            <div
              className="flex justify-center overflow-hidden"
              style={{
                width: pageWidth * 2 + 16,
                height: pageHeight + 8,
              }}
            >
              {loading && (
                <div className="flex items-center justify-center w-full">
                  <div className="text-sm text-muted-foreground animate-pulse">
                    Caricamento menu...
                  </div>
                </div>
              )}
              {error && (
                <div className="flex items-center justify-center w-full">
                  <div className="text-sm text-destructive text-center px-4">
                    {error}
                  </div>
                </div>
              )}
              {!loading && !error && pdfDoc && FlipBook && (
                <FlipBook
                  ref={flipBookRef}
                  width={pageWidth}
                  height={pageHeight}
                  size="fixed"
                  maxShadowOpacity={0.4}
                  showCover={true}
                  mobileScrollSupport={true}
                  clickEventForward={false}
                  useMouseEvents={true}
                  swipeDistance={30}
                  flippingTime={600}
                  startZIndex={0}
                  autoSize={false}
                  drawShadow={true}
                  startPage={0}
                  startOrientation="portrait"
                  onFlip={onFlip}
                  className="shadow-2xl"
                >
                  {Array.from({ length: numPages }, (_, i) => (
                    <div
                      key={i}
                      className="bg-white flex items-center justify-center overflow-hidden"
                      style={{ width: pageWidth, height: pageHeight }}
                    >
                      <PdfPage
                        pageNumber={i + 1}
                        width={pageWidth}
                        height={pageHeight}
                        pdfDoc={pdfDoc}
                      />
                    </div>
                  ))}
                </FlipBook>
              )}
            </div>

            <button
              onClick={goToNext}
              className="shrink-0 rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30"
              disabled={currentPage >= numPages || loading}
              aria-label="Pagina successiva"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="text-center pb-4 text-xs text-muted-foreground">
            Clicca sul bordo pagina o usa le frecce per sfogliare
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
