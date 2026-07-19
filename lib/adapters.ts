import type { ShopifyProduct, ShopifyCollection } from './shopify/types';

export type HeroImageData = {
  src: string;
  alt: string;
  position: 'left' | 'right';
  span: number;
};

export type FeaturedProductData = {
  image: string;
  span: string;
};

export type ProductCardData = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  handle: string;
  availableForSale: boolean;
};

export type GalleryImageData = {
  src: string;
  alt: string;
};

export type ProductSpecData = {
  label: string;
  value: string;
};

function getImageUrl(product: ShopifyProduct, index: number = 0): string {
  return product.images.edges[index]?.node.url ?? '/placeholder.svg';
}

function getImageAlt(product: ShopifyProduct, index: number = 0): string {
  return product.images.edges[index]?.node.altText ?? product.title;
}

function formatPrice(amount: string, currencyCode: string): string {
  const num = parseFloat(amount);
  if (currencyCode === 'EUR') return `€${num.toFixed(2)}`;
  if (currencyCode === 'USD') return `$${num.toFixed(2)}`;
  return `${num.toFixed(2)} ${currencyCode}`;
}

export function adaptProductToHeroImages(products: ShopifyProduct[]): HeroImageData[] {
  const images: HeroImageData[] = [];
  const positions: ('left' | 'right')[] = ['left', 'right'];

  products.slice(0, 4).forEach((product, i) => {
    images.push({
      src: getImageUrl(product),
      alt: getImageAlt(product),
      position: positions[i % 2],
      span: 1,
    });
  });

  return images;
}

export function adaptProductToFeaturedImages(products: ShopifyProduct[]): FeaturedProductData[] {
  const spans = [
    'col-span-2 row-span-2',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-2',
    'col-span-1 row-span-1',
    'col-span-2 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-2',
    'col-span-2 row-span-1',
    'col-span-1 row-span-1',
  ];

  return products.slice(0, 10).map((product, i) => ({
    image: getImageUrl(product),
    span: spans[i] ?? 'col-span-1 row-span-1',
  }));
}

export function adaptProductToCard(product: ShopifyProduct): ProductCardData {
  const firstVariant = product.variants.edges[0]?.node;
  const price = firstVariant
    ? formatPrice(firstVariant.price.amount, firstVariant.price.currencyCode)
    : formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode);

  return {
    id: product.id,
    name: product.title,
    description: product.description.substring(0, 100),
    price,
    image: getImageUrl(product),
    handle: product.handle,
    availableForSale: product.availableForSale,
  };
}

export function adaptProductsToCards(products: ShopifyProduct[]): ProductCardData[] {
  return products.map(adaptProductToCard);
}

export function adaptProductsToGalleryImages(products: ShopifyProduct[]): GalleryImageData[] {
  return products.slice(0, 4).map((product) => ({
    src: getImageUrl(product),
    alt: getImageAlt(product),
  }));
}

export function adaptProductToSpecs(product: ShopifyProduct): ProductSpecData[] {
  const specs: ProductSpecData[] = [];

  if (product.productType) {
    specs.push({ label: 'Type', value: product.productType });
  }

  const firstVariant = product.variants.edges[0]?.node;
  if (firstVariant) {
    specs.push({
      label: 'Price',
      value: formatPrice(firstVariant.price.amount, firstVariant.price.currencyCode),
    });
  }

  if (product.tags.length > 0) {
    specs.push({ label: 'Tags', value: product.tags.slice(0, 3).join(', ') });
  }

  if (product.vendor) {
    specs.push({ label: 'Brand', value: product.vendor });
  }

  return specs;
}
