import type { Metadata } from 'next';
import { getCollectionByHandle } from '@/lib/shopify/queries/product';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { FooterSection } from '@/components/sections/footer-section';
import { CollectionSection } from '@/components/sections/collection-section';
import { adaptProductsToCards } from '@/lib/adapters';

type CollectionPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    return { title: 'Collezione non trovata' };
  }

  return {
    title: collection.title,
    description: collection.description.substring(0, 160),
  };
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    notFound();
  }

  const products = collection.products.edges.map((e) => e.node);
  const cards = adaptProductsToCards(products);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-20">
          <h1 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {collection.description}
            </p>
          )}
        </div>
        <CollectionSection accessories={cards} title="" />
      </main>
      <FooterSection />
    </>
  );
}
