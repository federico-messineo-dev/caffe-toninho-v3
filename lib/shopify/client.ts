import { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_TOKEN } from './constants';

const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`;

type ShopifyFetchOptions = {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  tags?: string[];
};

export async function shopifyFetch<T>({ query, variables, cache = 'force-cache', tags }: ShopifyFetchOptions): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600, tags },
  });

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join('\n'));
  }

  return json.data as T;
}
