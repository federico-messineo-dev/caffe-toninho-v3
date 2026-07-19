import { Header } from "@/components/header";
import { HeroSection } from "@/components/sections/hero-section";
import { PhilosophySection } from "@/components/sections/philosophy-section";
import { FeaturedProductsSection } from "@/components/sections/featured-products-section";
import { TechnologySection } from "@/components/sections/technology-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { GalleryScrollytelling } from "@/components/sections/gallery-scrollytelling";
import { CollectionSection } from "@/components/sections/collection-section";
import { EditorialSection } from "@/components/sections/editorial-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { MenuSection } from "@/components/sections/menu-section";
import { ContactSection } from "@/components/sections/contact-section";
import { FooterSection } from "@/components/sections/footer-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Toninho Caffè — Bar, Enoteca & Torrefazione Artigianale',
  description: 'Caffè specialty di origine, vini selezionati e torrefazione artigianale. Un\'esperienza autentica dal 1987.',
  openGraph: {
    title: 'Toninho Caffè — Bar, Enoteca & Torrefazione Artigianale',
    description: 'Caffè specialty di origine, vini selezionati e torrefazione artigianale.',
    type: 'website',
    locale: 'it_IT',
    siteName: 'Toninho Caffè',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <PhilosophySection />
      <FeaturedProductsSection />
      <TechnologySection />
      <GalleryScrollytelling />
      <GallerySection />
      <CollectionSection />
      <EditorialSection />
      <TestimonialsSection />
      <MenuSection />
      <ContactSection />
      <FooterSection />
    </main>
  );
}
