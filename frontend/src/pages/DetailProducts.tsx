// frontend/src/pages/DetailProducts.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { api } from "../lib/api";
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  CheckCircle2,
  Star,
  Truck,
  Shield,
} from "lucide-react";
import { useCart } from "../store/cart";
import { useFavorites } from "../store/favorites";

/** ==== Types ==== */
type DetailImage = {
  id: number | string;
  url?: string;
  imageUrl?: string;
  image?: string;
  imageURL?: string;
};

type Product = {
  id: number | string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  rating?: number | null;
  reviews?: number | null;
  image?: string | null;
  imageUrl?: string | null;
  inStock?: boolean | null;
  description?: string | null;
  specifications?: Record<string, string> | null;
  features?: string[] | null;
  quantity?: number | null;
};

type RatingSummary = {
  avg: number;
  count: number;
};

/** ==== Helpers ==== */
function normalizeCategory(c: any): string {
  if (!c) return "Unknown";
  if (typeof c === "string") return c;
  return c?.name ?? c?.categoryName ?? "Unknown";
}
function normalizeProduct(p: any): Product {
  return {
    id: p?.id ?? p?.productId,
    name: p?.name ?? p?.productName ?? "Unnamed product",
    category: normalizeCategory(p?.category),
    price: Number(p?.price ?? 0),
    originalPrice:
      typeof p?.originalPrice === "number" ? p.originalPrice : null,
    rating: typeof p?.rating === "number" ? p.rating : null,
    reviews: typeof p?.reviews === "number" ? p.reviews : null,
    image: p?.image ?? p?.imageUrl ?? p?.imageURL ?? null,
    imageUrl: p?.imageUrl ?? p?.image ?? p?.imageURL ?? null,
    inStock: typeof p?.inStock === "boolean" ? p.inStock : null,
    description: p?.description ?? p?.desc ?? "",
    specifications: p?.specifications ?? null,
    features: Array.isArray(p?.features) ? p.features : null,
    quantity:
      typeof p?.quantity === "number"
        ? p.quantity
        : typeof p?.stock === "number"
        ? p.stock
        : typeof p?.available === "number"
        ? p.available
        : null,
  };
}
const imgFromDetail = (x: DetailImage) =>
  x?.url || x?.imageUrl || x?.image || x?.imageURL || null;

/** ==== Star rating UI ==== */
function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onChange}
          onClick={onChange ? () => onChange(s) : undefined}
          className={
            "p-0.5 " + (onChange ? "transition-transform hover:scale-110" : "")
          }
        >
          <Star
            className={
              s <= value
                ? "h-5 w-5 fill-amber-400 text-amber-400"
                : "h-5 w-5 text-slate-500"
            }
          />
        </button>
      ))}
    </div>
  );
}

/** Card nhỏ cho sản phẩm gợi ý */
function RelatedProductCard({ p }: { p: Product }) {
  return (
    <Link to={`/products/${p.id}`} className="group">
      <div className="h-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl">
        <div
          className="mb-3 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-white/10"
          style={{ aspectRatio: "4 / 3" }}
        >
          <img
            src={p.image || p.imageUrl || "/placeholder.svg"}
            alt={p.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-1">
          <p className="line-clamp-2 text-sm font-semibold text-slate-900 transition group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300">
            {p.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {p.category}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-300">
              {p.price.toLocaleString("vi-VN")}₫
            </span>
            {typeof p.rating === "number" && p.rating > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                ★ {p.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/** ==== Page ==== */
export default function DetailProducts() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  // số lượng & cảnh báo vượt tồn kho
  const [qty, setQty] = useState(1);
  const [flash, setFlash] = useState<string | null>(null);

  // rating
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(
    null
  );
  const [myRating, setMyRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMsg, setRatingMsg] = useState<string | null>(null);

  // ✅ Sản phẩm gợi ý
  const [related, setRelated] = useState<Product[]>([]);
  const [relatedErr, setRelatedErr] = useState<string | null>(null);

  const navigate = useNavigate();
  const addToCart = useCart((s) => s.add);

  // favorites store
  const { toggle: toggleFav, ids: favIds, load: loadFav } = useFavorites();

  useEffect(() => {
    loadFav().catch(() => {});
  }, [loadFav]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        setLoading(true);
        setErr(null);

        // 1) lấy product
        const res = await api.get(`/api/product/${id}`);
        const p = normalizeProduct((res as any).data ?? {});

        // 2) gallery = ảnh chính + ảnh chi tiết
        let gallery: string[] = [];
        try {
          const imgsRes = await api.get(
            `/api/detail-product-image/product/${p.id}`
          );
          const raw = (imgsRes as any).data;
          const arr: DetailImage[] = Array.isArray(raw) ? raw : raw?.data ?? [];
          const primary = p.image || p.imageUrl || null;

          gallery = [
            primary,
            ...arr.map(imgFromDetail),
          ].filter(Boolean) as string[];
          gallery = gallery.filter((v, i, a) => a.indexOf(v) === i);
        } catch {
          const primary = p.image || p.imageUrl || null;
          gallery = [primary].filter(Boolean) as string[];
        }

        if (!mounted) return;
        setProduct(p);
        setImages(gallery.length ? gallery : ["/placeholder.svg"]);
        setActiveIdx(0);
        setQty(1);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Không tải được sản phẩm");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) run();
    return () => {
      mounted = false;
    };
  }, [id]);

  // load rating summary
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/api/rating/product/${id}/summary`);
        const data = (res as any).data ?? res;
        if (!mounted) return;
        setRatingSummary({
          avg: Number(data?.avg ?? 0),
          count: Number(data?.count ?? 0),
        });
      } catch (e) {
        console.error("[rating summary] error:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // ✅ Load sản phẩm gợi ý (khi đã có product)
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        setRelatedErr(null);
        const res = await api.get(`/api/product/${id}/related`);
        const raw = (res as any).data ?? res;
        const arr = Array.isArray(raw) ? raw : raw?.data ?? [];
        const mapped = (arr.map(normalizeProduct) as Product[]).filter(
          (p: Product) => String(p.id) !== String(id)
        );
        if (!mounted) return;
        setRelated(mapped);
      } catch (e) {
        console.error("[related products] error:", e);
        if (!mounted) return;
        setRelatedErr("Không tải được sản phẩm gợi ý.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmitRating = async () => {
    if (!id || !myRating) return;
    try {
      setRatingLoading(true);
      setRatingMsg(null);
      await api.post(`/api/rating/product/${id}`, { rating: myRating });
      const res = await api.get(`/api/rating/product/${id}/summary`);
      const data = (res as any).data ?? res;
      setRatingSummary({
        avg: Number(data?.avg ?? 0),
        count: Number(data?.count ?? 0),
      });
      setRatingMsg("Cảm ơn bạn đã đánh giá!");
    } catch (e) {
      console.error("[rating submit] error:", e);
      setRatingMsg("Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setRatingLoading(false);
      setTimeout(() => setRatingMsg(null), 2500);
    }
  };

  // 💰 Hiển thị giá VNĐ
  const priceText = useMemo(
    () => (product ? `${product.price.toLocaleString("vi-VN")}₫` : "0₫"),
    [product]
  );

  /** ==== tồn kho & clamp ==== */
  const rawQty = product?.quantity;
  const hasQty = typeof rawQty === "number" && rawQty > 0;
  const isOut = product?.inStock === false;
  const maxQty = hasQty ? (rawQty as number) : Number.MAX_SAFE_INTEGER;

  const clamp = (n: number) => {
    if (!Number.isFinite(n)) return 1;
    if (isOut) return 0;
    return hasQty ? Math.min(Math.max(1, n), maxQty) : Math.max(1, n);
  };

  const setQtySafe = (next: number) => {
    let n = !Number.isFinite(next) ? 1 : next;
    if (!isOut && !hasQty) {
      setQty(Math.max(1, n));
      return;
    }
    const clamped = clamp(n);
    if (hasQty && clamped !== n) {
      setFlash(`Không đủ hàng. Tối đa ${rawQty} sản phẩm.`);
      setTimeout(() => setFlash(null), 2000);
    }
    setQty(clamped);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5" />
          <div className="space-y-3">
            <div className="h-6 w-64 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-8 w-40 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-10 w-56 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-24 w-full animate-pulse rounded bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (err || !product) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-slate-600 dark:text-slate-300">
          Không tìm thấy sản phẩm.
        </p>
        <Link to="/products">
          <Button variant="outline" className="gap-2">
            <ArrowLeft size={16} /> Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  const discount =
    typeof product.originalPrice === "number" &&
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : null;

  const avgRating =
    ratingSummary && ratingSummary.count > 0
      ? ratingSummary.avg
      : product.rating ?? null;
  const reviewsCount =
    ratingSummary && ratingSummary.count > 0
      ? ratingSummary.count
      : product.reviews ?? null;

  const isFavorite = favIds.has(product.id);

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Link to="/products">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft size={16} /> Quay lại
          </Button>
        </Link>
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div
            className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5"
            style={{ aspectRatio: "4 / 3" }}
          >
            <img
              src={images[activeIdx] || "/placeholder.svg"}
              className="h-full w-full object-cover"
              alt={product.name}
            />
          </div>

          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`relative overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-white/5 ${
                    i === activeIdx
                      ? "border-emerald-400"
                      : "border-slate-200 hover:border-slate-400 dark:border-white/10 dark:hover:border-white/40"
                  }`}
                  style={{ aspectRatio: "16/9" }}
                  aria-label={`Ảnh ${i + 1}`}
                >
                  <img
                    src={src}
                    className="h-full w-full object-cover"
                    alt={`thumb-${i}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {product.category}
              </p>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {product.name}
              </h1>
            </div>
            <Button
              variant="ghost"
              className="p-2"
              onClick={() =>
                toggleFav({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image ?? product.imageUrl ?? null,
                })
              }
            >
              <Heart
                size={20}
                className={
                  isFavorite
                    ? "fill-pink-500 text-pink-500"
                    : "text-slate-500 dark:text-white"
                }
              />
            </Button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            {avgRating && avgRating > 0 && (
              <>
                <span className="flex items-center gap-1 text-sm text-slate-900 dark:text-white">
                  <Star className="h-4 w-4 text-yellow-400" />{" "}
                  {avgRating.toFixed(1)}
                </span>
                {typeof reviewsCount === "number" && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    ({reviewsCount} đánh giá)
                  </span>
                )}
              </>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-300">
              {priceText}
            </span>
            {typeof product.originalPrice === "number" &&
              product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-slate-500 line-through dark:text-slate-400">
                    {product.originalPrice.toLocaleString("vi-VN")}₫
                  </span>
                  {discount !== null && (
                    <Badge className="bg-rose-600/90 text-white">
                      {discount}% OFF
                    </Badge>
                  )}
                </>
              )}
          </div>

          {/* Stock + perks */}
          <div className="flex flex-wrap items-center gap-3">
            {product.inStock === false ? (
              <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-100">
                Hết hàng
              </Badge>
            ) : typeof product.quantity === "number" &&
              product.quantity > 0 ? (
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100">
                <CheckCircle2 className="mr-1 h-4 w-4" /> Còn{" "}
                {product.quantity}
              </Badge>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100">
                <CheckCircle2 className="mr-1 h-4 w-4" /> Còn hàng
              </Badge>
            )}
            <span className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Truck className="h-4 w-4" /> Giao nhanh 2–5 ngày
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Shield className="h-4 w-4" /> Bảo hành 12 tháng
            </span>
          </div>

          {/* Quantity + Actions */}
          <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="text-sm text-slate-700 dark:text-slate-300">
              Số lượng
            </div>

            <div className="pointer-events-auto inline-flex items-center rounded-lg border border-slate-300 bg-white dark:border-white/15 dark:bg-white/5">
              <button
                type="button"
                aria-label="Giảm"
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-white/80 dark:hover:bg-white/10"
                onClick={() => setQtySafe(qty - 1)}
                disabled={product.inStock === false || qty <= 1}
              >
                −
              </button>

              <input
                type="number"
                inputMode="numeric"
                min={product.inStock === false ? 0 : 1}
                max={
                  typeof product.quantity === "number"
                    ? product.quantity
                    : undefined
                }
                step={1}
                className="w-20 appearance-textfield bg-transparent px-2 py-2 text-center font-semibold outline-none
                           [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={product.inStock === false ? 0 : qty}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setQty(1);
                    return;
                  }
                  const n = parseInt(raw, 10);
                  setQtySafe(Number.isNaN(n) ? 1 : n);
                }}
                onBlur={() => setQtySafe(qty)}
                disabled={product.inStock === false}
                aria-label="Số lượng"
                onWheel={(e) =>
                  (e.currentTarget as HTMLInputElement).blur()
                }
              />

              <button
                type="button"
                aria-label="Tăng"
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-white/80 dark:hover:bg-white/10"
                onClick={() => setQtySafe(qty + 1)}
                disabled={
                  product.inStock === false ||
                  (typeof product.quantity === "number" &&
                    qty >= product.quantity)
                }
              >
                +
              </button>
            </div>

            {flash && (
              <div className="text-sm text-rose-600 dark:text-rose-300">
                {flash}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                className="w-full gap-2"
                disabled={
                  product.inStock === false ||
                  qty < 1 ||
                  (typeof product.quantity === "number" &&
                    qty > product.quantity)
                }
                onClick={async () => {
                  try {
                    const pid = Number(product.id);
                    await addToCart(pid, qty, product.price);
                    navigate("/cart");
                  } catch (e: any) {
                    console.error("[AddToCart] failed:", e?.message, e);
                    alert(
                      "Không thể thêm vào giỏ. Vui lòng đăng nhập hoặc thử lại."
                    );
                  }
                }}
              >
                <ShoppingCart size={18} /> Thêm vào giỏ
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Share2 size={18} /> Chia sẻ
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
              Mô tả
            </h3>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {product.description || "Chưa có mô tả cho sản phẩm này."}
            </p>
          </div>
        </div>
      </div>

      {/* Specs & Features */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {product.specifications &&
          Object.keys(product.specifications).length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                Thông số
              </h3>
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      {k}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {product.features && product.features.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              Tính năng
            </h3>
            <ul className="space-y-2 text-sm">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span className="text-slate-700 dark:text-slate-200">
                    {f}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Reviews / Rating */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
            Đánh giá
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {ratingSummary
              ? `Trung bình ${ratingSummary.avg.toFixed(
                  1
                )} / 5 • ${ratingSummary.count} lượt đánh giá`
              : "Chưa có đánh giá nào cho sản phẩm này."}
          </p>
        </div>

        <div className="max-w-sm space-y-3">
          <StarRating value={myRating} onChange={setMyRating} />
          <Button
            disabled={!myRating || ratingLoading}
            onClick={handleSubmitRating}
            className="mt-1"
          >
            {ratingLoading ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
          {ratingMsg && (
            <p className="text-sm text-emerald-600 dark:text-emerald-300">
              {ratingMsg}
            </p>
          )}
        </div>
      </div>

      {/* ✅ SẢN PHẨM GỢI Ý */}
      {related.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Sản phẩm gợi ý
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Dựa trên cùng danh mục / sản phẩm tương tự
            </span>
          </div>
          {relatedErr && (
            <p className="mb-2 text-sm text-rose-600 dark:text-rose-300">
              {relatedErr}
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <RelatedProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
