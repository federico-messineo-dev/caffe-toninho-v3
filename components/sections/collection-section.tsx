"use client";

import { FadeImage } from "@/components/fade-image";
import type { ProductCardData } from "@/lib/adapters";

const defaultAccessories: ProductCardData[] = [
  {
    id: "1",
    name: "Blend Classico",
    description: "Miscela equilibrata di caffè arabica e robusta, tostatura media",
    price: "€12,00",
    image: "/images/blend-classico.jpg",
    handle: "blend-classico",
    availableForSale: true,
  },
  {
    id: "2",
    name: "Mono Origins",
    description: "Singola origine, Ethiopia Yirgacheffe, note fruttate e fiorali",
    price: "€18,00",
    image: "/images/mono-origins.jpg",
    handle: "mono-origins",
    availableForSale: true,
  },
  {
    id: "3",
    name: "Chianti Classico Riserva",
    description: "Toscano, invecchiato 24 mesi, note di ciliegia e spezie",
    price: "€32,00",
    image: "/images/chianti-riserva.jpg",
    handle: "chianti-riserva",
    availableForSale: true,
  },
];

type CollectionSectionProps = {
  accessories?: ProductCardData[];
  title?: string;
};

export function CollectionSection({ accessories = defaultAccessories, title = "I Nostri Prodotti" }: CollectionSectionProps) {
  return (
    <section id="prodotti" className="bg-background">
      {/* Section Title */}
      <div className="px-6 pt-12 pb-6 md:px-12 lg:px-20 md:pt-16 md:pb-8">
        <h2 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          {title}
        </h2>
      </div>

      {/* Accessories Grid/Carousel */}
      <div className="pb-16">
        {/* Mobile: Horizontal Carousel */}
        <div className="flex gap-3 overflow-x-auto px-6 pb-4 md:hidden snap-x snap-mandatory scrollbar-hide">
          {accessories.map((accessory) => (
            <div key={accessory.id} className="group flex-shrink-0 w-[55vw] snap-center">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                <FadeImage
                  src={accessory.image || "/placeholder.svg"}
                  alt={accessory.name}
                  fill
                  className="object-cover group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="pt-3 pb-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium leading-snug text-foreground">
                      {accessory.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                      {accessory.description}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {accessory.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-5 md:px-12 lg:px-20">
          {accessories.map((accessory) => (
            <div key={accessory.id} className="group">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                <FadeImage
                  src={accessory.image || "/placeholder.svg"}
                  alt={accessory.name}
                  fill
                  className="object-cover group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="pt-3 pb-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium leading-snug text-foreground">
                      {accessory.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                      {accessory.description}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {accessory.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
