'use server';

import { cookies } from 'next/headers';
import { createCart, addToCart, updateCart, removeFromCart, getCart } from '@/lib/shopify/mutations/cart';
import type { ShopifyCartLineInput, ShopifyCartLineUpdateInput } from '@/lib/shopify/types';

const CART_COOKIE = 'cart_id';

async function getCartId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value ?? null;
}

async function setCartId(cartId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function serverCreateCart(lineItems: ShopifyCartLineInput[]) {
  const cart = await createCart(lineItems);
  await setCartId(cart.id);
  return cart;
}

export async function serverAddToCart(lineItems: ShopifyCartLineInput[]) {
  const cartId = await getCartId();

  if (!cartId) {
    return serverCreateCart(lineItems);
  }

  try {
    const cart = await addToCart(cartId, lineItems);
    return cart;
  } catch {
    const cart = await createCart(lineItems);
    await setCartId(cart.id);
    return cart;
  }
}

export async function serverUpdateCart(lines: ShopifyCartLineUpdateInput[]) {
  const cartId = await getCartId();
  if (!cartId) throw new Error('No cart found');
  return updateCart(cartId, lines);
}

export async function serverRemoveFromCart(lineIds: string[]) {
  const cartId = await getCartId();
  if (!cartId) throw new Error('No cart found');
  return removeFromCart(cartId, lineIds);
}

export async function serverGetCart() {
  const cartId = await getCartId();
  if (!cartId) return null;
  return getCart(cartId);
}
