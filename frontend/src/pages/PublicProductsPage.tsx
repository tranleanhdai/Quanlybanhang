import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "../lib/api";

// --- Types (giản lược, giống ProductsPage) ---
type Product = {
  id: string | number;
  name: string;
  category: string;
  price: number;
  image?: string | null;
};

type PageResult<T> = {
  content: T[];
  page?: number;
  size?: number;
  total?: number;
  totalPages?: number;
};

const PAGE_SIZE = 9;

type SortKey = "featured" | "name-az" | "name-za" | "price-low" | "price-high";

// --- Helpers ---
function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

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
    image: p?.image ?? p?.imageUrl ?? p?.imageURL ?? null,
  };
}

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
    return { content: [], page: 1, size, total: 0, totalPages: 0 };
  }
}

// --- UI nhỏ ---
function SkeletonCard() {
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl animate-pulse">
      <div className="mb-4 h-48 w-full rounded-md bg-white/10" />
      <div className="space-y-2">
        <div className="h-4 w-2/3 rounded bg-white/10" />
        <div className="h-3 w-1/4 rounded bg-white/10" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-5 w-20 rounded bg-white/10" />
          <div className="h-4 w-10 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}

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
        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        Trước
      </button>
      <span className="px-2 text-slate-300 text-sm">
        Trang {page} / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        Sau
      </button>
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  return (
    <Link to={`/browse/${p.id}`} className="group">
      <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition hover:bg-white/10">
        <img
          src={p.image || "/placeholder.svg"}
          alt={p.name}
          className="mb-4 h-48 w-full rounded-md object-cover bg-white/10"
        />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition">
            {p.name}
          </h3>
          <p className="text-xs text-slate-400">{p.category}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-bold text-emerald-300">
              {p.price.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// --- Main ---
export default function PublicProductsPage() {
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
    return items;
  }, [data.content, debouncedQ, selectedCategory, sortBy]);

  const totalPages =
    data.totalPages ||
    Math.max(1, Math.ceil((data.total ?? filtered.length) / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Xem sản phẩm
            </h1>
            <p className="text-slate-300 text-sm">
              Chế độ khách – chỉ xem thông tin, muốn mua hãy đăng nhập / đăng ký.
            </p>
          </div>
          <Link
            to="/"
            className="text-sm text-emerald-300 hover:text-emerald-200 underline"
          >
            ← Về trang chính
          </Link>
        </div>

        {/* Filters giống bản chính nhưng không có favorites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          {/* Search */}
          <div className="space-y-2">
            <label
              htmlFor="search"
              className="text-sm font-medium text-slate-200"
            >
              Tìm kiếm
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Nhập tên sản phẩm..."
                className="w-full rounded-lg border border-white/15 bg-white/10 pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="text-sm font-medium text-slate-200"
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
              className="w-full rounded-lg border border-white/15 bg-slate-800 text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent appearance-none"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-700 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <label
              htmlFor="sort"
              className="text-sm font-medium text-slate-200"
            >
              Sắp xếp
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="w-full rounded-lg border border-white/15 bg-slate-800 text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent appearance-none"
            >
              <option value="featured" className="bg-slate-700 text-white">
                Nổi bật
              </option>
              <option value="name-az" className="bg-slate-700 text-white">
                Tên: A → Z
              </option>
              <option value="name-za" className="bg-slate-700 text-white">
                Tên: Z → A
              </option>
              <option value="price-low" className="bg-slate-700 text-white">
                Giá: Thấp → Cao
              </option>
              <option value="price-high" className="bg-slate-700 text-white">
                Giá: Cao → Thấp
              </option>
            </select>
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-100">
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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
            <p className="text-slate-300">Không tìm thấy sản phẩm phù hợp</p>
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
    </div>
  );
}
