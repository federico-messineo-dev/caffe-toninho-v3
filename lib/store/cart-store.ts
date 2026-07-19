'use client';

import { create } from 'zustand';
import type { ShopifyCart, ShopifyCartLine } from '../shopify/types';

type CartState = {
  cart: ShopifyCart | null;
  isOpen: boolean;
  isLoading: boolean;
};

type CartActions = {
  setCart: (cart: ShopifyCart) => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setLoading: (loading: boolean) => void;
  optimisticallyAddLine: (line: ShopifyCartLine) => void;
  optimisticallyUpdateLine: (lineId: string, quantity: number) => void;
  optimisticallyRemoveLine: (lineId: string) => void;
  clearCart: () => void;
  getTotalQuantity: () => number;
  getLines: () => ShopifyCartLine[];
};

export const useCartStore = create<CartState & CartActions>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  setCart: (cart) => set({ cart }),
  setOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setLoading: (isLoading) => set({ isLoading }),

  optimisticallyAddLine: (line) =>
    set((state) => {
      if (!state.cart) {
        return {
          cart: {
            id: '',
            checkoutUrl: '',
            totalQuantity: line.quantity,
            lines: { edges: [{ node: line }] },
            cost: {
              totalAmount: { amount: String(parseFloat(line.merchandise.price.amount) * line.quantity), currencyCode: line.merchandise.price.currencyCode },
              subtotalAmount: { amount: String(parseFloat(line.merchandise.price.amount) * line.quantity), currencyCode: line.merchandise.price.currencyCode },
            },
          },
        };
      }

      const existingEdge = state.cart.lines.edges.find(
        (e) => e.node.merchandise.id === line.merchandise.id
      );

      let newEdges;
      if (existingEdge) {
        newEdges = state.cart.lines.edges.map((e) =>
          e.node.merchandise.id === line.merchandise.id
            ? { node: { ...e.node, quantity: e.node.quantity + line.quantity } }
            : e
        );
      } else {
        newEdges = [...state.cart.lines.edges, { node: line }];
      }

      const totalQuantity = newEdges.reduce((sum, e) => sum + e.node.quantity, 0);

      return {
        cart: {
          ...state.cart,
          lines: { edges: newEdges },
          totalQuantity,
        },
      };
    }),

  optimisticallyUpdateLine: (lineId, quantity) =>
    set((state) => {
      if (!state.cart) return state;

      const newEdges = state.cart.lines.edges
        .map((e) =>
          e.node.id === lineId ? { node: { ...e.node, quantity } } : e
        )
        .filter((e) => e.node.quantity > 0);

      const totalQuantity = newEdges.reduce((sum, e) => sum + e.node.quantity, 0);

      return {
        cart: {
          ...state.cart,
          lines: { edges: newEdges },
          totalQuantity,
        },
      };
    }),

  optimisticallyRemoveLine: (lineId) =>
    set((state) => {
      if (!state.cart) return state;

      const newEdges = state.cart.lines.edges.filter((e) => e.node.id !== lineId);
      const totalQuantity = newEdges.reduce((sum, e) => sum + e.node.quantity, 0);

      return {
        cart: {
          ...state.cart,
          lines: { edges: newEdges },
          totalQuantity,
        },
      };
    }),

  clearCart: () => set({ cart: null }),

  getTotalQuantity: () => get().cart?.totalQuantity ?? 0,

  getLines: () => get().cart?.lines.edges.map((e) => e.node) ?? [],
}));
