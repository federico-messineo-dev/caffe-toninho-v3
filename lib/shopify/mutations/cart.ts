import { shopifyFetch } from '../client';
import { isShopifyConfigured } from '../constants';
import type { ShopifyCart, ShopifyCartLineInput, ShopifyCartLineUpdateInput } from '../types';

type CartCreateResponse = {
  cartCreate: {
    cart: ShopifyCart;
    userErrors: { field: string[]; message: string }[];
  };
};

type CartLinesAddResponse = {
  cartLinesAdd: {
    cart: ShopifyCart;
    userErrors: { field: string[]; message: string }[];
  };
};

type CartLinesUpdateResponse = {
  cartLinesUpdate: {
    cart: ShopifyCart;
    userErrors: { field: string[]; message: string }[];
  };
};

type CartLinesRemoveResponse = {
  cartLinesRemove: {
    cart: ShopifyCart;
    userErrors: { field: string[]; message: string }[];
  };
};

type CartResponse = {
  cart: ShopifyCart | null;
};

const cartFragment = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              product {
                id
                handle
                title
                images(first: 1) {
                  edges {
                    node {
                      id
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
              selectedOptions {
                name
                value
              }
              image {
                id
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
    cost {
      totalAmount {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
    }
  }
`;

export async function createCart(lineItems: ShopifyCartLineInput[]): Promise<ShopifyCart> {
  if (!isShopifyConfigured) throw new Error('Shopify non configurato');

  const data = await shopifyFetch<CartCreateResponse>({
    query: `mutation CartCreate($input: CartInput!) { cartCreate(input: $input) { cart { ...CartFields } userErrors { field message } } } ${cartFragment}`,
    variables: { input: { lines: lineItems } },
  });

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join('\n'));
  }

  return data.cartCreate.cart;
}

export async function addToCart(cartId: string, lineItems: ShopifyCartLineInput[]): Promise<ShopifyCart> {
  const data = await shopifyFetch<CartLinesAddResponse>({
    query: `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } } } ${cartFragment}`,
    variables: { cartId, lines: lineItems },
  });

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(data.cartLinesAdd.userErrors.map((e) => e.message).join('\n'));
  }

  return data.cartLinesAdd.cart;
}

export async function updateCart(cartId: string, lines: ShopifyCartLineUpdateInput[]): Promise<ShopifyCart> {
  const data = await shopifyFetch<CartLinesUpdateResponse>({
    query: `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } } } ${cartFragment}`,
    variables: { cartId, lines },
  });

  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new Error(data.cartLinesUpdate.userErrors.map((e) => e.message).join('\n'));
  }

  return data.cartLinesUpdate.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<ShopifyCart> {
  const data = await shopifyFetch<CartLinesRemoveResponse>({
    query: `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } userErrors { field message } } } ${cartFragment}`,
    variables: { cartId, lineIds },
  });

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new Error(data.cartLinesRemove.userErrors.map((e) => e.message).join('\n'));
  }

  return data.cartLinesRemove.cart;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<CartResponse>({
    query: `query GetCart($cartId: ID!) { cart(id: $cartId) { ...CartFields } } ${cartFragment}`,
    variables: { cartId },
    cache: 'no-store',
  });
  return data.cart;
}
