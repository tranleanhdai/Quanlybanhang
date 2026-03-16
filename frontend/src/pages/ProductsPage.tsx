import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Heart } from "lucide-react";
import { api } from "../lib/api";
import { useFavorites } from "../store/favorites";

// ---------- Types ----------
export type Product = {
  id: string | number;
  name: string;
  category: string;
  price: number;
  rating?: number;
  image?: string | null;
  inStock?: boolean;
};

export type PageResult<T> = {
  content: T[];
  page?: number;
  size?: number;
  total?: number;
  totalPages?: number;
};

// ---------- Helpers ----------
function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const PAGE_SIZE = 9;
type SortKey =
  | "featured"
  | "name-az"
  | "name-za"
  | "price-low"
  | "price-high"
  | "rating";

// ---------- Normalize ----------
function normalizeProduct(p: any): Product {
  const categoryName =
    typeof p?.category === "string"
      ? p.category
      : p?.category?.name ?? p?.categoryName ?? "Unknown";
  return {
    id: p?.id ?? p?.productId ?? String(Math.random()),
    name: p?.name ?? p?.productName ?? "",
    category: categoryName,
    price: Number(p?.price ?? 0),
    rating: typeof p?.rating === "number" ? p.rating : undefined,
    image: p?.image ?? p?.imageUrl ?? p?.imageURL ?? null,
    inStock: typeof p?.inStock === "boolean" ? p.inStock : undefined,
  };
}

// ---------- API ----------
async function fetchCategories(): Promise<string[]> {
  try {
    const res = await api.get("/api/category");
    const data = res.data;
    const names: string[] = Array.isArray(data)
      ? data
          .map((c: any) =>
            typeof c === "string" ? c : c?.name ?? c?.categoryName ?? ""
          )
          .filter(Boolean)
      : [];
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

async function fetchProducts(params: {
  page: number;
  size: number;
  search?: string;
  category?: string;
  sort?: string;
}): Promise<PageResult<Product>> {
  const { page, size, search, category, sort } = params;
  try {
    const res = await api.get("/api/product", {
      params: { page, size, search, category, sort },
    });
    const data = res.data;

    if (Array.isArray(data?.content)) {
      const items = data.content.map(normalizeProduct);
      const totalItems = data.total ?? data.totalElements ?? items.length;
      const effectiveSize = data.size ?? size ?? 1;
      return {
        content: items,
        page: (data.number ?? page) + 1,
        size: data.size ?? size,
        total: totalItems,
        totalPages:
          data.totalPages ?? Math.ceil(totalItems / effectiveSize),
      };
    }
    if (Array.isArray(data)) {
      return {
        content: data.map(normalizeProduct),
        page: 1,
        size: data.length,
        total: data.length,
        totalPages: 1,
      };
    }
    return { content: [], page: 1, size, total: 0, totalPages: 0 };
  } catch {
    return {
      content: [],
      page: 1,
      size,
      total: 0,
      totalPages: 0,
    };
  }
}

// ---------- UI ----------
function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-white"
      >
        Trước
      </button>
      <span className="px-2 text-sm text-slate-600 dark:text-slate-300">
        Trang {page} / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-white"
      >
        Sau
      </button>
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  const { toggle, ids } = useFavorites();
  const [avgRating, setAvgRating] = useState<number | null>(
    typeof p.rating === "number" ? p.rating : null
  );
  const [ratingCount, setRatingCount] = useState<number | null>(null);

  const isFav = ids.has(p.id);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/api/rating/product/${p.id}/summary`);
        const data = (res as any).data ?? res;
        if (!mounted) return;
        if (typeof data?.avg === "number") setAvgRating(data.avg);
        if (typeof data?.count === "number") setRatingCount(data.count);
      } catch (e) {
        console.error("[rating summary] error:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [p.id]);

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image ?? undefined,
    });
  };

  return (
    <Link to={`/products/${p.id}`} className="group">
      <div className="relative h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl">
        {/* Heart */}
        <button
          type="button"
          onClick={handleToggleFav}
          className="absolute right-3 top-3 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-black/40 dark:hover:bg-black/60"
          aria-label="Yêu thích"
        >
          <Heart
            size={18}
            className={
              isFav
                ? "fill-pink-500 text-pink-500"
                : "text-slate-400 group-hover:text-pink-400 dark:text-slate-200"
            }
          />
        </button>

        <img
          src={p.image || "/placeholder.svg"}
          alt={p.name}
          className="mb-4 h-48 w-full rounded-md bg-slate-100 object-cover dark:bg-white/10"
        />
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900 transition group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300">
              {p.name}
            </h3>
            {p.inStock === false && (
              <span className="rounded-full border border-rose-400/40 bg-rose-50 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-500/15 dark:text-rose-200">
                Hết hàng
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {p.category}
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-300">
              {p.price.toLocaleString("vi-VN")}₫
            </span>
            {avgRating && avgRating > 0 ? (
              <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                ★ {avgRating.toFixed(1)}
                <span className="text-slate-400">
                  ({ratingCount ?? 0} đánh giá)
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="h-full animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl">
      <div className="mb-4 h-48 w-full rounded-md bg-slate-100 dark:bg-white/10" />
      <div className="space-y-2">
        <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-white/10" />
        <div className="h-3 w-1/4 rounded bg-slate-100 dark:bg-white/10" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-5 w-20 rounded bg-slate-100 dark:bg-white/10" />
          <div className="h-4 w-10 rounded bg-slate-100 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

// ---------- Main ----------
export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(params.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(
    params.get("cat") ?? "All"
  );
  const [sortBy, setSortBy] = useState<SortKey>(
    (params.get("sort") as SortKey) ?? "featured"
  );
  const [page, setPage] = useState(Number(params.get("page") ?? 1));
  const debouncedQ = useDebounced(searchTerm, 350);

  const sortParam = useMemo(() => {
    switch (sortBy) {
      case "name-az":
        return "name,asc";
      case "name-za":
        return "name,desc";
      case "price-low":
        return "price,asc";
      case "price-high":
        return "price,desc";
      case "rating":
        return "rating,desc";
      default:
        return undefined;
    }
  }, [sortBy]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PageResult<Product>>({
    content: [],
    page: 1,
    size: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [categoryList, setCategoryList] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategoryList);
  }, []);

  const categories = useMemo(() => {
    if (categoryList.length > 0) return ["All", ...categoryList];
    const set = new Set<string>(["All"]);
    for (const p of data.content) set.add(p.category);
    return Array.from(set);
  }, [categoryList, data.content]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedQ) next.set("q", debouncedQ);
    if (selectedCategory !== "All") next.set("cat", selectedCategory);
    if (sortBy !== "featured") next.set("sort", sortBy);
    if (page !== 1) next.set("page", String(page));
    setParams(next, { replace: true });
  }, [debouncedQ, selectedCategory, sortBy, page, setParams]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProducts({
      page: page - 1,
      size: PAGE_SIZE,
      search: debouncedQ || undefined,
      category: selectedCategory !== "All" ? selectedCategory : undefined,
      sort: sortParam,
    })
      .then((res) => mounted && setData(res))
      .catch((e) => mounted && setError(e.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [debouncedQ, selectedCategory, sortParam, page]);

  const filtered = useMemo(() => {
    let items = [...data.content];
    if (selectedCategory !== "All")
      items = items.filter((p) => p.category === selectedCategory);
    if (debouncedQ) {
      const q = debouncedQ.toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (sortBy === "name-az") items.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "name-za") items.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === "price-low") items.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") items.sort((a, b) => b.price - a.price);
    if (sortBy === "rating")
      items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return items;
  }, [data.content, debouncedQ, selectedCategory, sortBy]);

  const totalPages =
    data.totalPages ||
    Math.max(1, Math.ceil((data.total ?? filtered.length) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sản phẩm
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Khám phá bộ sưu tập sản phẩm chất lượng cao
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl">
        {/* Search */}
        <div className="space-y-2">
          <label
            htmlFor="search"
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Tìm kiếm
          </label>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Nhập tên sản phẩm..."
              className="w-full rounded-lg border border-slate-300 bg-white px-9 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-emerald-400/70 dark:border-white/15 dark:bg-white/5 dark:text-white"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label
            htmlFor="category"
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Danh mục
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-transparent focus:ring-2 focus:ring-emerald-400/70 dark:border-white/15 dark:bg-slate-900 dark:text-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <label
            htmlFor="sort"
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Sắp xếp
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-transparent focus:ring-2 focus:ring-emerald-400/70 dark:border-white/15 dark:bg-slate-900 dark:text-white"
          >
            <option value="featured">Nổi bật</option>
            <option value="name-az">Tên: A → Z</option>
            <option value="name-za">Tên: Z → A</option>
            <option value="price-low">Giá: Thấp → Cao</option>
            <option value="price-high">Giá: Cao → Thấp</option>
            <option value="rating">Đánh giá cao</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {error && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:backdrop-blur-xl">
          Không tìm thấy sản phẩm phù hợp
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          )}
        </>
      )}
    </div>
  );
}
