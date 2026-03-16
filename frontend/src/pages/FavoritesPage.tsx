// frontend/src/pages/FavoritesPage.tsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useFavorites } from "../store/favorites";

const currency = (n: number) => `${n.toLocaleString("vi-VN")}₫`;

export default function FavoritesPage() {
  const { items, load, toggle, ids } = useFavorites();

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  // TRƯỜNG HỢP CHƯA CÓ YÊU THÍCH
  if (!items.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Yêu thích
        </h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl">
          <p className="mb-3 text-slate-600 dark:text-slate-300">
            Bạn chưa lưu sản phẩm yêu thích nào.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
          >
            Bắt đầu mua sắm
          </Link>
        </div>
      </div>
    );
  }

  // TRƯỜNG HỢP CÓ YÊU THÍCH
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Yêu thích
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Những sản phẩm bạn đã đánh dấu yêu thích.
          </p>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Tổng cộng {items.length} sản phẩm
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => {
          const isFav = ids.has(p.id);
          return (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="group relative"
            >
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl">
                {/* Nút tim */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggle({
                      id: p.id,
                      name: p.name,
                      price: p.price,
                      imageURL: p.imageURL ?? null,
                    });
                  }}
                  className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-sm hover:bg-slate-50 dark:border-white/15 dark:bg-black/40 dark:hover:bg-black/60"
                >
                  <Heart
                    size={18}
                    className={
                      isFav
                        ? "text-pink-500 fill-pink-500"
                        : "text-slate-400 group-hover:text-pink-400 dark:text-slate-200"
                    }
                  />
                </button>

                {/* Ảnh sản phẩm */}
                <img
                  src={p.imageURL || "/placeholder.svg"}
                  alt={p.name}
                  className="mb-4 h-44 w-full rounded-md bg-slate-100 object-cover dark:bg-white/10"
                />

                {/* Thông tin sản phẩm */}
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-900 transition group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300">
                    {p.name}
                  </h3>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-300">
                    {currency(p.price)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
