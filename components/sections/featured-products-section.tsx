"use client";

import { FadeImage } from "@/components/fade-image";
import type { FeaturedProductData } from "@/lib/adapters";

const defaultFeatures: FeaturedProductData[] = [
  { image: "/images/torrefazione-1.jpg", span: "col-span-2 row-span-2" },
  { image: "/images/torrefazione-2.jpg", span: "col-span-1 row-span-1" },
  { image: "/images/torrefazione-3.jpg", span: "col-span-1 row-span-1" },
  { image: "/images/torrefazione-4.jpg", span: "col-span-1 row-span-2" },
  { image: "/images/torrefazione-5.jpg", span: "col-span-1 row-span-1" },
  { image: "/images/7638f650-8586-4403-8c13-141921a04f9d.png", span: "col-span-2 row-span-1" },
  { image: "/images/5b3bdb95-fac7-4d22-aa97-98b5d547b2db.png", span: "col-span-1 row-span-1" },
  { image: "/images/634f7bae-77a5-49d0-a0ab-5271a6194e66.png", span: "col-span-1 row-span-2" },
  { image: "/images/09ffa8fd-cdd1-453f-9aa2-d6c702a1f4b5.png", span: "col-span-2 row-span-1" },
  { image: "/images/040e36b1-d16f-474b-a712-a9979e6ab479.png", span: "col-span-1 row-span-1" },
];

type FeaturedProductsSectionProps = {
  features?: FeaturedProductData[];
};

export function FeaturedProductsSection({ features = defaultFeatures }: FeaturedProductsSectionProps) {
  return (
    <section id="technology" className="relative bg-background py-20 md:py-32">
      <div className="px-4 md:px-12 lg:px-20">
        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-7xl mx-auto auto-rows-[180px] md:auto-rows-[220px]">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`relative overflow-hidden rounded-lg border border-border ${feature.span}`}
            >
              <FadeImage
                src={feature.image || "/placeholder.svg"}
                alt={`Architecture sketch ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
