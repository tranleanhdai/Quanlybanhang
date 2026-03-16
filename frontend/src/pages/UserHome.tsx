import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Package, Heart, Settings } from "lucide-react";
import { getAuthUser } from "../lib/auth";
import { api } from "../lib/api";
import { useFavorites } from "../store/favorites";

/** ===== Types ===== */
type Fav = {
  id: string | number;
  name: string;
  price: number;
  image?: string | null;
};

type PaidOrder = {
  id: number | string;
  date: string;
  status: string;
  total: number;
};

/** ===== Helpers ===== */
// Format tiền VND
const currency = (n: number) => `${n.toLocaleString("vi-VN")}₫`;

// Chuẩn hoá order từ backend giống OrdersPage
function normalizePaidOrder(raw: any): PaidOrder {
  const created =
    raw.createdAt ??
    raw.created_at ??
    raw.updatedAt ??
    raw.updated_at ??
    "";

  const details = raw.detailOrders ?? raw.detail_orders ?? [];

  const items = Array.isArray(details)
    ? details.map((d: any) => ({
        price: Number(d.price ?? d.unitPrice ?? d.unit_price ?? 0),
        quantity: Number(d.quantity ?? 0),
      }))
    : [];

  const backendTotal = Number(raw.totalPrice ?? raw.total_price ?? 0);
  const computedTotal = items.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );
  const finalTotal = computedTotal > 0 ? computedTotal : backendTotal;

  return {
    id: raw.id,
    date: typeof created === "string" ? created : String(created),
    status:
      typeof raw.status === "string"
        ? raw.status
        : raw.status?.name ?? "PAID",
    total: finalTotal,
  };
}

export default function UserHome() {
  const user = getAuthUser();
  const username = user?.username || "bạn";

  const [paidOrders, setPaidOrders] = useState<PaidOrder[]>([]);
  const [loadingPaid, setLoadingPaid] = useState(false);

  // favorites
  const { items: favItems, count: favCount, load: loadFav } = useFavorites();

  // Load đơn đã thanh toán + favorites
  useEffect(() => {
    const loadPaid = async () => {
      try {
        setLoadingPaid(true);
        const res = await api.get("/api/order/my-paid");
        const data = (res as any).data ?? res;

        const arr = Array.isArray(data)
          ? data
          : Array.isArray((data as any).items)
          ? (data as any).items
          : Array.isArray((data as any).content)
          ? (data as any).content
          : [];

        const normalized: PaidOrder[] = arr.map(normalizePaidOrder);
        setPaidOrders(normalized);
      } catch (e) {
        console.error("loadPaidOrders (home) error", e);
      } finally {
        setLoadingPaid(false);
      }
    };

    loadPaid();
    loadFav().catch(() => {});
  }, [loadFav]);

  // Thống kê nhanh
  const ordersCount = paidOrders.length;
  const totalSpent = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const quickStats = useMemo(
    () => [
      {
        label: "Đơn hàng",
        value: ordersCount ? String(ordersCount) : "—",
        sub: "",
      },
      { label: "Đã chi", value: currency(totalSpent), sub: "" },
      {
        label: "Yêu thích",
        value: favCount ? String(favCount) : "—",
        sub: "",
      },
      { label: "Điểm thưởng", value: "—", sub: "" },
    ],
    [ordersCount, totalSpent, favCount]
  );

  // 3 đơn gần nhất
  const recentOrders = useMemo(() => {
    const sorted = [...paidOrders].sort((a, b) => {
      const ta = Date.parse(a.date || "") || 0;
      const tb = Date.parse(b.date || "") || 0;
      return tb - ta;
    });
    return sorted.slice(0, 3);
  }, [paidOrders]);

  // 3 sản phẩm yêu thích
  const topFavs: Fav[] = useMemo(
    () =>
      favItems.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.imageURL ?? null,
      })),
    [favItems]
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Nền: light / dark */}
      <div className="pointer-events-none absolute inset-0 bg-slate-50 dark:bg-slate-950" />
      {/* glow chỉ cho dark */}
      <div className="pointer-events-none absolute -top-40 -left-40 hidden h-[520px] w-[520px] rounded-full bg-emerald-500/25 blur-3xl dark:block" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 hidden h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl dark:block" />
      {/* grid pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000000_0.5px,transparent_0.5px)] dark:opacity-[0.06] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)]" />

      <div className="relative mx-auto max-w-6xl space-y-8 px-4 py-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Chào mừng trở lại,{" "}
            <span className="text-emerald-600 dark:text-emerald-300">
              {username}
            </span>
            !
          </h1>
          <p className="text-[15px] text-slate-600 dark:text-slate-300">
            Tổng quan nhanh về hoạt động gần đây của bạn.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {quickStats.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/90 bg-white px-5 py-4 shadow-md dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl"
            >
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {s.label}
              </p>
              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {s.value}
              </div>
              {s.sub && (
                <p className="text-xs text-slate-400 dark:text-slate-400">
                  {s.sub}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-md dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-white/10">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Đơn hàng gần đây
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hoạt động mua gần nhất
              </p>
            </div>
            <Link
              to="/orders?tab=completed"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/0 dark:text-slate-100 dark:hover:bg-white/10"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3 p-5">
            {loadingPaid ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Đang tải đơn hàng...
              </p>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Bạn chưa có đơn hàng nào gần đây.
              </p>
            ) : (
              recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Package
                      size={22}
                      className="text-slate-600 dark:text-slate-300"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Đơn #{o.id}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Thanh toán ngày {o.date?.toString().slice(0, 10)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                      {o.status}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {currency(o.total)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            to="/products"
            className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200/90 bg-white p-6 text-center text-slate-800 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
          >
            <ShoppingBag className="h-6 w-6 text-slate-700 dark:text-slate-100" />
            <span className="text-sm font-medium">Tiếp tục mua sắm</span>
          </Link>

          <Link
            to="/favorites"
            className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200/90 bg-white p-6 text-center text-slate-800 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
          >
            <Heart className="h-6 w-6 text-slate-700 dark:text-slate-100" />
            <span className="text-sm font-medium">Xem yêu thích</span>
          </Link>

          <Link
            to="/settings"
            className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200/90 bg-white p-6 text-center text-slate-800 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
          >
            <Settings className="h-6 w-6 text-slate-700 dark:text-slate-100" />
            <span className="text-sm font-medium">Cài đặt tài khoản</span>
          </Link>
        </div>

        {/* Favorites preview */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-md dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-white/10">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Sản phẩm yêu thích
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Những món bạn đã lưu
              </p>
            </div>
            <Link
              to="/favorites"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/0 dark:text-slate-100 dark:hover:bg-white/10"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
            {topFavs.length === 0 ? (
              <p className="col-span-full text-sm text-slate-600 dark:text-slate-400">
                Bạn chưa có sản phẩm yêu thích nào.
              </p>
            ) : (
              topFavs.map((p) => (
                <Link key={p.id} to={`/products/${p.id}`}>
                  <div className="group h-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
                    <div className="mb-3 aspect-4/3 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/10">
                      <img
                        src={p.image || "/placeholder.svg"}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>
                    <p className="line-clamp-1 text-sm font-semibold text-slate-900 transition group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300">
                      {p.name}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                      {currency(p.price)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
