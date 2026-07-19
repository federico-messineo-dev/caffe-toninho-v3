"use client";

import Image from "next/image";

type TestimonialsSectionProps = {
  image?: string;
  imageAlt?: string;
  quote?: string;
};

export function TestimonialsSection({
  image = "/images/esterno.jpeg",
  imageAlt = "Toninho Caffè — Torrefazione artigianale",
  quote = "Un angolo dove il caffè incontra il vino — selezionato con cura, preparato con passione, servito con autenticità.",
}: TestimonialsSectionProps) {
  return (
    <section id="about" className="bg-background">
      {/* About Image with Text Overlay */}
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={image || "/placeholder.svg"}
          alt={imageAlt}
          fill
          className="object-cover"
        />
        {/* Fade gradient overlay - dark at bottom fading to transparent at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-section-dark/70 via-section-dark/30 to-transparent" />
        
        {/* Text Overlay */}
        <div className="absolute inset-0 flex items-end justify-center px-6 pb-16 md:px-12 md:pb-24 lg:px-20 lg:pb-32">
          <p className="mx-auto max-w-5xl text-2xl leading-relaxed text-white md:text-3xl lg:text-[2.5rem] lg:leading-snug text-center">
            {quote}
          </p>
        </div>
      </div>
    </section>
  );
}
