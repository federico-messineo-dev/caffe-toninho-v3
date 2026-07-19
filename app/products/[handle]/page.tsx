import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getProductByHandle } from '@/lib/shopify/queries/product';
import { ProductJsonLd } from '@/components/json-ld';
import { Header } from '@/components/header';
import { FooterSection } from '@/components/sections/footer-section';

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return { title: 'Prodotto non trovato' };
  }

  const firstImage = product.images.edges[0]?.node;

  return {
    title: product.title,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.title,
      description: product.description.substring(0, 160),
      type: 'website',
      images: firstImage ? [{ url: firstImage.url, width: firstImage.width, height: firstImage.height, alt: firstImage.altText ?? product.title }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const firstImage = product.images.edges[0]?.node;
  const firstVariant = product.variants.edges[0]?.node;
  const price = firstVariant?.price ?? product.priceRange.minVariantPrice;

  return (
    <>
      <ProductJsonLd
        name={product.title}
        description={product.description}
        image={firstImage?.url ?? '/placeholder.svg'}
        price={price.amount}
        currency={price.currencyCode}
      />
      <Header />
      <main className="min-h-screen pt-24">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-20">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
              {firstImage ? (
                <Image
                  src={firstImage.url}
                  alt={firstImage.altText ?? product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <Image
                  src="/placeholder.svg"
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center">
              <p className="product-label text-muted-foreground">{product.productType || 'Caffè'}</p>
              <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
                {product.title}
              </h1>
              <p className="mt-4 text-2xl font-medium text-primary">
                {price.amount} {price.currencyCode}
              </p>
              <p className="mt-6 leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              {/* Variants */}
              {product.variants.edges.length > 1 && (
                <div className="mt-8">
                  <p className="text-sm font-medium text-foreground">Opzioni</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.variants.edges.map((variantEdge) => (
                      <button
                        key={variantEdge.node.id}
                        type="button"
                        className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
                      >
                        {variantEdge.node.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                type="button"
                className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Aggiungi al Carrello
              </button>

              {/* Product Meta */}
              <div className="mt-8 border-t border-border pt-6">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  {product.vendor && (
                    <>
                      <dt className="text-muted-foreground">Produttore</dt>
                      <dd className="font-medium text-foreground">{product.vendor}</dd>
                    </>
                  )}
                  {product.productType && (
                    <>
                      <dt className="text-muted-foreground">Tipo</dt>
                      <dd className="font-medium text-foreground">{product.productType}</dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
