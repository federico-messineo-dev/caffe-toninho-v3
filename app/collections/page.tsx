import type { Metadata } from 'next';
import { getCollections } from '@/lib/shopify/queries/product';
import { Header } from '@/components/header';
import { FooterSection } from '@/components/sections/footer-section';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Collezioni',
  description: 'Esplora le nostre collezioni di caffè specialty, vini e prodotti artigianali.',
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-20">
          <h1 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            Le Nostre Collezioni
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Esplora la selezione completa di caffè, vini e prodotti della torrefazione.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.handle}`}
                className="group"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  {collection.image ? (
                    <Image
                      src={collection.image.url}
                      alt={collection.image.altText ?? collection.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <Image
                      src="/placeholder.svg"
                      alt={collection.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <h2 className="mt-4 font-display text-xl font-medium text-foreground">
                  {collection.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {collection.description.substring(0, 80)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
