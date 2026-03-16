import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { api } from "../lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  Star,
  Truck,
  Shield,
} from "lucide-react";

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

export default function PublicDetailProduct() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(
    null
  );

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        setLoading(true);
        setErr(null);

        const res = await api.get(`/api/product/${id}`);
        const p = normalizeProduct((res as any).data ?? {});

        let gallery: string[] = [];
        try {
          const imgsRes = await api.get(
            `/api/detail-product-image/product/${p.id}`
          );
          const raw = (imgsRes as any).data;
          const arr: DetailImage[] = Array.isArray(raw) ? raw : raw?.data ?? [];
          const primary = p.image || p.imageUrl || null;

          gallery = [primary, ...arr.map(imgFromDetail)].filter(Boolean) as string[];
          gallery = gallery.filter((v, i, a) => a.indexOf(v) === i);
        } catch {
          const primary = p.image || p.imageUrl || null;
          gallery = [primary].filter(Boolean) as string[];
        }

        if (!mounted) return;
        setProduct(p);
        setImages(gallery.length ? gallery : ["/placeholder.svg"]);
        setActiveIdx(0);
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

  // chỉ load summary để hiện số sao (không cho đánh giá)
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
      } catch {
        // im lặng
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const priceText = useMemo(
    () => (product ? `${product.price.toLocaleString("vi-VN")}₫` : "0₫"),
    [product]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-10">
          <div className="h-6 w-40 rounded bg-white/10 animate-pulse mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 h-96 animate-pulse" />
            <div className="space-y-3">
              <div className="h-6 w-64 rounded bg-white/10 animate-pulse" />
              <div className="h-5 w-24 rounded bg-white/10 animate-pulse" />
              <div className="h-8 w-40 rounded bg-white/10 animate-pulse" />
              <div className="h-10 w-56 rounded bg-white/10 animate-pulse" />
              <div className="h-24 w-full rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (err || !product) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-10 text-center">
          <p className="text-slate-300 mb-4">Không tìm thấy sản phẩm.</p>
          <Link to="/browse">
            <Button variant="outline" className="gap-2">
              <ArrowLeft size={16} /> Quay lại danh sách
            </Button>
          </Link>
        </div>
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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-10 space-y-6">
        {/* Back */}
        <div className="flex items-center justify-between">
          <Link to="/browse">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft size={16} /> Quay lại
            </Button>
          </Link>
          <span className="text-xs text-slate-400">
            Chế độ khách – xem thông tin, muốn mua hãy đăng nhập / đăng ký.
          </span>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div
              className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              style={{ aspectRatio: "4 / 3" }}
            >
              <img
                src={images[activeIdx] || "/placeholder.svg"}
                className="h-full w-full object-cover"
                alt={product.name}
              />
            </div>

            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-3">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`relative overflow-hidden rounded-xl border ${
                      i === activeIdx
                        ? "border-emerald-400"
                        : "border-white/10 hover:border-white/30"
                    } bg-white/5`}
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
            <div>
              <p className="text-sm text-slate-400">{product.category}</p>
              <h1 className="text-3xl font-bold text-white">
                {product.name}
              </h1>
            </div>

            {/* Rating (chỉ hiển thị) */}
            <div className="flex items-center gap-2">
              {avgRating && avgRating > 0 && (
                <>
                  <span className="text-sm text-white flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />{" "}
                    {avgRating.toFixed(1)}
                  </span>
                  {typeof reviewsCount === "number" && (
                    <span className="text-sm text-slate-400">
                      ({reviewsCount} đánh giá)
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-emerald-300">
                {priceText}
              </span>
              {typeof product.originalPrice === "number" &&
                product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-slate-400 line-through">
                      {product.originalPrice.toLocaleString("vi-VN")}₫
                    </span>
                    {discount !== null && (
                      <Badge className="bg-rose-600/90">{discount}% OFF</Badge>
                    )}
                  </>
                )}
            </div>

            {/* Stock + perks */}
            <div className="flex flex-wrap items-center gap-3">
              {product.inStock === false ? (
                <Badge className="bg-rose-100 text-rose-800">Hết hàng</Badge>
              ) : typeof product.quantity === "number" &&
                product.quantity > 0 ? (
                <Badge className="bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Còn{" "}
                  {product.quantity}
                </Badge>
              ) : (
                <Badge className="bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Còn hàng
                </Badge>
              )}
              <span className="inline-flex items-center gap-2 text-sm text-slate-400">
                <Truck className="h-4 w-4" /> Giao nhanh 2–5 ngày
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-slate-400">
                <Shield className="h-4 w-4" /> Bảo hành 12 tháng
              </span>
            </div>

            {/* Note không thao tác */}
            <div className="rounded-xl border border-yellow-400/40 bg-yellow-500/10 p-4 text-sm text-yellow-100">
              Đây là chế độ xem thử. Để thêm vào giỏ hàng hoặc đặt mua, hãy
              đăng nhập hoặc tạo tài khoản.
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold mb-2">Mô tả</h3>
              <p className="text-slate-300 text-sm leading-6">
                {product.description || "Chưa có mô tả cho sản phẩm này."}
              </p>
            </div>
          </div>
        </div>

        {/* Specs & Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-lg font-semibold mb-3">Thông số</h3>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-slate-400">{k}</span>
                      <span className="font-medium text-white">
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {product.features && product.features.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold mb-3">Tính năng</h3>
              <ul className="space-y-2 text-sm">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
