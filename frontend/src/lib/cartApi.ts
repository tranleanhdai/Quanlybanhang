// FULL FIXED VERSION – cartApi.ts

import { api } from "./api";
import { getAuthUser } from "./auth";

export type Cart = { id: number; user?: { id?: number } | null; totalPrice?: number };

export type CartItem = {
  id: number;
  cartId: number;
  productId: number;
  name?: string;
  imageUrl?: string;
  price: number;
  quantity: number;
};

const CART_ID_KEY = "qlbh_cart_id";

// =========================================
// Helpers
// =========================================
function safeParse<T = any>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): any | null {
  try {
    const raw = token.split(".")[1];
    const json = atob(raw.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function readUserIdOrThrow(): number {
  const u = getAuthUser();
  if (u?.id != null) return Number(u.id);

  const rawSess = sessionStorage.getItem("user");
  const sessUser = safeParse<any>(rawSess);
  if (sessUser?.id != null) return Number(sessUser.id);

  const uLocal =
    safeParse<any>(localStorage.getItem("user")) ||
    safeParse<any>(localStorage.getItem("auth_user"));
  if (uLocal?.id != null) return Number(uLocal.id);

  const token =
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("access_token");

  if (token) {
    const p = decodeJwtPayload(token);
    if (p?.id) return Number(p.id);
    if (p?.userId) return Number(p.userId);
  }

  throw new Error("Không xác định được userId. Đăng nhập lại.");
}

export function getStoredCartId() {
  const s = localStorage.getItem(CART_ID_KEY);
  const n = s ? Number(s) : NaN;
  return Number.isFinite(n) ? n : null;
}

function setStoredCartId(id: number) {
  localStorage.setItem(CART_ID_KEY, String(id));
}

export function clearStoredCartId() {
  localStorage.removeItem(CART_ID_KEY);
}

// =========================================
// CREATE CART IF NEEDED
// =========================================

async function createCartIfNeeded(): Promise<Cart> {
  const userId = readUserIdOrThrow();

  const oldId = getStoredCartId();
  if (oldId) {
    try {
      const { data } = await api.get<Cart>(`/api/cart/${oldId}`);
      if (!data?.user?.id) {
        await api.put(`/api/cart/${oldId}`, { user: { id: userId } });
      }
      return data;
    } catch {
      clearStoredCartId();
    }
  }

  // Create fresh cart
  const { data } = await api.post<Cart>("/api/cart", { userId });
  setStoredCartId(data.id);
  return data;
}

// =========================================
// GET ITEMS
// =========================================

async function getItems(cartId: number): Promise<CartItem[]> {
  const { data } = await api.get<any[]>(`/api/detail_cart/cartid/${cartId}`);
  return (data ?? []).map(raw => normalizeItem(raw, cartId));
}

// Normalize
function normalizeItem(raw: any, cartId: number): CartItem {
  const cid = raw?.cart?.id ?? raw?.cartId ?? raw?.cart_id ?? cartId;
  const pid =
    raw?.product?.id ?? raw?.productId ?? raw?.product_id;

  return {
    id: Number(raw.id),
    cartId: Number(cid),
    productId: Number(pid),
    name: raw?.product?.name ?? raw?.name ?? `SP #${pid}`,
    imageUrl:
      raw?.product?.imageURL ??
      raw?.product?.imageUrl ??
      raw?.imageUrl ??
      raw?.imageURL,
    price: Number(raw?.price ?? raw?.product?.price ?? 0),
    quantity: Number(raw?.quantity ?? 1),
  };
}

// =========================================
// ADD / UPDATE / REMOVE
// =========================================

async function addItem(productId: number, quantity = 1, price?: number) {
  const cart = await createCartIfNeeded();
  await api.post("/api/detail_cart", {
    cart: { id: cart.id },
    product: { id: productId },
    quantity,
    ...(price != null ? { price } : {})
  });
}

async function updateItemQuantity(itemId: number, quantity: number) {
  await api.put(`/api/detail_cart/${itemId}`, { quantity });
}

async function removeItem(itemId: number) {
  await api.delete(`/api/detail_cart/${itemId}`);
}

export const CartAPI = {
  getStoredCartId,
  clearStoredCartId,
  createCartIfNeeded,
  getItems,
  addItem,
  updateItemQuantity,
  removeItem,
};
