// FULL FIXED VERSION – cart.ts

import { create } from "zustand";
import { CartAPI } from "../lib/cartApi";
import type { CartItem } from "../lib/cartApi";

type CartState = {
  items: CartItem[];
  loading: boolean;
  load: () => Promise<void>;
  add: (productId: number, qty?: number, price?: number) => Promise<void>;
  setQty: (itemId: number, qty: number) => Promise<void>;
  remove: (itemId: number) => Promise<void>;
  clearLocalCartId: () => void;
};

export const useCart = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const cart = await CartAPI.createCartIfNeeded();
      const items = await CartAPI.getItems(cart.id);
      set({ items });
    } finally {
      set({ loading: false });
    }
  },

  add: async (productId, qty = 1, price) => {
    await CartAPI.addItem(productId, qty, price);
    await get().load();
  },

  setQty: async (itemId, qty) => {
    if (qty <= 0) {
      await CartAPI.removeItem(itemId);
    } else {
      await CartAPI.updateItemQuantity(itemId, qty);
    }
    await get().load();
  },

  remove: async (itemId) => {
    await CartAPI.removeItem(itemId);
    await get().load();
  },

  clearLocalCartId: () => {
    CartAPI.clearStoredCartId();
    set({ items: [] });
  },
}));
