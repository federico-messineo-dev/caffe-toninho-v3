import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { FooterSection } from '@/components/sections/footer-section';

export const metadata: Metadata = {
  title: 'Carrello',
  description: 'Il tuo carrello Toninho Caffè.',
};

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="mx-auto max-w-3xl px-6 py-12 md:px-12">
          <h1 className="font-display text-4xl font-medium tracking-tight text-foreground">
            Il Tuo Carrello
          </h1>
          <p className="mt-4 text-muted-foreground">
            Il carrello è gestito lato client tramite Zustand. I dati vengono sincronizzati con Shopify Storefront API.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Il carrello è vuoto</p>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
