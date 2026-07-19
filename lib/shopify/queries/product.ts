import { shopifyFetch } from '../client';
import { isShopifyConfigured } from '../constants';
import { productFragment, collectionFragment } from '../fragments/product';
import type { ShopifyProduct, ShopifyCollection } from '../types';

type ProductsResponse = {
  products: { edges: { node: ShopifyProduct }[] };
};

type ProductByHandleResponse = {
  productByHandle: ShopifyProduct | null;
};

type CollectionByHandleResponse = {
  collectionByHandle: ShopifyCollection | null;
};

type CollectionsResponse = {
  collections: { edges: { node: ShopifyCollection }[] };
};

export async function getProducts(first: number = 20, tag?: string): Promise<ShopifyProduct[]> {
  if (!isShopifyConfigured) return [];
  const filter = tag ? `filterByQuery: "tag:${tag}"` : '';
  const data = await shopifyFetch<ProductsResponse>({
    query: `query GetProducts($first: Int!) { products(first: $first, ${filter}) { edges { node { ...ProductFields } } } } ${productFragment}`,
    variables: { first },
    tags: ['products'],
  });
  return data.products.edges.map((e) => e.node);
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  if (!isShopifyConfigured) return null;
  const data = await shopifyFetch<ProductByHandleResponse>({
    query: `query GetProductByHandle($handle: String!) { productByHandle(handle: $handle) { ...ProductFields } } ${productFragment}`,
    variables: { handle },
    tags: ['product'],
  });
  return data.productByHandle;
}

export async function getCollections(first: number = 10): Promise<ShopifyCollection[]> {
  if (!isShopifyConfigured) return [];
  const data = await shopifyFetch<CollectionsResponse>({
    query: `query GetCollections($first: Int!) { collections(first: $first) { edges { node { ...CollectionFields } } } } ${collectionFragment}`,
    variables: { first },
    tags: ['collections'],
  });
  return data.collections.edges.map((e) => e.node);
}

export async function getCollectionByHandle(handle: string): Promise<ShopifyCollection | null> {
  if (!isShopifyConfigured) return null;
  const data = await shopifyFetch<CollectionByHandleResponse>({
    query: `query GetCollectionByHandle($handle: String!) { collectionByHandle(handle: $handle) { ...CollectionFields } } ${collectionFragment}`,
    variables: { handle },
    tags: ['collections'],
  });
  return data.collectionByHandle;
}
