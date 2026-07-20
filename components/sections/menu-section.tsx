"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { MenuFlipbook } from "@/components/menu-flipbook";

export function MenuSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
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
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-4 text-sm font-medium transition-all rounded-full bg-primary text-primary-foreground hover:opacity-90 warm-shadow-lg group"
          >
            <BookOpen
              size={20}
              className="transition-transform group-hover:rotate-[-8deg]"
            />
            Sfoglia il Menu
          </button>
        </div>
      </section>

      {isOpen && (
        <MenuFlipbook
          pdfUrl="/menu-bar-toninho.pdf"
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
