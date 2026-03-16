import { create } from "zustand";
import { api } from "../lib/api";

export type FavoriteProduct = {
  id: number | string;
  name: string;
  price: number;
  imageURL?: string | null;
};

type FavoriteState = {
  items: FavoriteProduct[];
  ids: Set<number | string>;
  count: number;
  loading: boolean;
  load: () => Promise<void>;
  toggle: (p: {
    id: number | string;
    name: string;
    price: number;
    image?: string | null;
    imageURL?: string | null;
  }) => Promise<void>;
};

export const useFavorites = create<FavoriteState>((set, get) => ({
  items: [],
  ids: new Set(),
  count: 0,
  loading: false,

  async load() {
    try {
      set({ loading: true });
      const res = await api.get("/api/favorites");
      const raw = (res as any).data ?? res;

      const items: FavoriteProduct[] = Array.isArray(raw)
        ? raw.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price ?? 0),
            imageURL: p.imageURL ?? p.imageUrl ?? p.image ?? null,
          }))
        : [];

      const ids = new Set<number | string>(items.map((i) => i.id));
      set({ items, ids, count: items.length, loading: false });
    } catch (e) {
      console.error("[favorites] load error:", e);
      set({ loading: false });
    }
  },

  async toggle(p) {
    const { ids, items } = get();
    const id = p.id;
    const nextIds = new Set(ids);
    let nextItems = [...items];

    const existingIdx = nextItems.findIndex((x) => x.id === id);
    const isFav = existingIdx !== -1;

    try {
      if (isFav) {
        await api.delete(`/api/favorites/${id}`);
        nextIds.delete(id);
        if (existingIdx !== -1) nextItems.splice(existingIdx, 1);
      } else {
        await api.post(`/api/favorites/${id}`);
        nextIds.add(id);
        nextItems = [
          {
            id,
            name: p.name,
            price: p.price,
            imageURL: p.imageURL ?? p.image ?? null,
          },
          ...nextItems,
        ];
      }

      set({
        ids: nextIds,
        items: nextItems,
        count: nextItems.length,
      });
    } catch (e) {
      console.error("[favorites] toggle error:", e);
    }
  },
}));
