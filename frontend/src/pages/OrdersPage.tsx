import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { useCart } from "../store/cart";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  ArrowRight,
} from "lucide-react";

import PaymentModal from "../components/PaymentModal";
import { PaymentsAPI } from "../lib/payments";
import { api } from "../lib/api";
import { CartAPI } from "../lib/cartApi";

/* ====== Types ====== */

type PaidOrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type PaidOrder = {
  id: number | string;
  date: string;
  status: string;
  total: number;
  trackingNumber?: string | null;
  items: PaidOrderItem[];
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
    case "PAID":
      return "bg-green-100 text-green-800";
    case "Shipped":
    case "PENDING":
      return "bg-blue-100 text-blue-800";
    case "Processing":
      return "bg-yellow-100 text-yellow-800";
    case "FAILED":
    case "Cancelled":
    case "CANCELED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Đọc tab hiện tại từ query ?tab=cart|completed
  const searchParams = new URLSearchParams(location.search);
  const initialTabParam = searchParams.get("tab");
  const initialTab: "cart" | "completed" =
    initialTabParam === "completed" ? "completed" : "cart";

  const { items, load, setQty, remove, loading, clear } = useCart() as any;

  // Tab state
  const [tab, setTab] = useState<"cart" | "completed">(initialTab);

  // Payment modal state
  const [payOpen, setPayOpen] = useState(false);
  const [payData, setPayData] = useState<{
    orderId: number;
    qrUrl?: string | null;
    checkoutUrl?: string | null;
  }>({
    orderId: 0,
    qrUrl: null,
    checkoutUrl: null,
  });

  const [paySuccess, setPaySuccess] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  // Đơn hàng đã thanh toán
  const [paidOrders, setPaidOrders] = useState<PaidOrder[]>([]);
  const [loadingPaid, setLoadingPaid] = useState(false);
  const [paidErr, setPaidErr] = useState<string | null>(null);

  useEffect(() => {
    load();
    loadPaidOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ====== CART CALC ====== */

  const subtotal = useMemo(
    () =>
      items.reduce(
        (s: number, it: any) =>
          s + Number(it.price || 0) * Number(it.quantity || 0),
        0
      ),
    [items]
  );

  const shipping = subtotal > 100_000 ? 0 : 25_000; // free ship nếu > 100k
  const total = subtotal + shipping;

  const updateQuantity = (id: number, quantity: number) => setQty(id, quantity);

  /* ====== ORDER CREATE + PAYMENT ====== */

  const createOrderFromCart = async (): Promise<number> => {
    const payload = {
      totalPrice: Number(total.toFixed(0)),
      method: "SEPAY",
    };

    const res = await api.post("/api/order/create-from-cart", payload);
    const data = (res as any).data ?? res;

    const oid = data?.id ?? data?.order?.id;
    if (typeof oid === "number") return oid;

    throw new Error("Không tạo được đơn hàng từ giỏ.");
  };

  const handleCheckout = async () => {
    try {
      if (!items?.length) {
        alert("Giỏ hàng trống.");
        return;
      }

      const orderId = await createOrderFromCart();
      const data = await PaymentsAPI.createQR(orderId);

      setPayData({
        orderId,
        qrUrl: null,
        checkoutUrl: data?.checkoutUrl ?? null,
      });

      setPaySuccess(false);
      setShowFireworks(false);
      setPayOpen(true);
    } catch (e: any) {
      console.error("Checkout error:", e);
      alert(e?.message || "Không thể khởi tạo thanh toán.");
    }
  };

  /* ====== LOAD PAID ORDERS ====== */

  function normalizePaidOrder(raw: any): PaidOrder {
    const created =
      raw.createdAt ??
      raw.created_at ??
      raw.updatedAt ??
      raw.updated_at ??
      "";

    const details = raw.detailOrders ?? raw.detail_orders ?? [];

    const items: PaidOrderItem[] = Array.isArray(details)
      ? details.map((d: any) => ({
          name:
            d.product?.name ??
            `Sản phẩm #${d.productId ?? d.product_id ?? ""}`,
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
      trackingNumber: raw.payment?.orderCode ?? null,
      items,
    };
  }

  async function loadPaidOrders() {
    try {
      setLoadingPaid(true);
      setPaidErr(null);

      const res = await api.get("/api/order/my-paid");
      const data = (res as any).data ?? res;

      const arr = Array.isArray(data)
        ? data
        : Array.isArray((data as any).items)
        ? (data as any).items
        : Array.isArray((data as any).content)
        ? (data as any).content
        : [];

      setPaidOrders(arr.map(normalizePaidOrder));
    } catch (e: any) {
      setPaidErr("Không tải được đơn hàng đã thanh toán");
    } finally {
      setLoadingPaid(false);
    }
  }

  /* ====== EXPORT INVOICE ====== */
  const handleExportInvoice = (orderId: number | string) => {
    const base = (api.defaults.baseURL || "").replace(/\/+$/, "");
    const url = `${base}/api/order/${orderId}/invoice`;
    window.open(url, "_blank");
  };

  /* ====== Tab change + sync URL ====== */

  const handleTabChange = (next: "cart" | "completed") => {
    setTab(next);
    const params = new URLSearchParams(location.search);
    params.set("tab", next);
    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    );
  };

  /* ============================================================== */
  /* ======================  UI BẮT ĐẦU TỪ ĐÂY  ==================== */
  /* ============================================================== */

  return (
    <div className="relative space-y-6">
      {/* ========== Overlay pháo hoa ========== */}
      {showFireworks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl bg-linear-to-br from-emerald-500 via-sky-500 to-indigo-500 p-8 text-center text-white shadow-2xl">
            <h2 className="relative mb-2 text-3xl font-bold">
              Thanh toán thành công!
            </h2>
            <p className="relative mb-6 text-sm text-emerald-50/90">
              Cảm ơn bạn đã mua sắm tại ShopHub 💚
            </p>

            <button
              onClick={() => {
                setShowFireworks(false);
                navigate("/products");
              }}
              className="relative inline-flex items-center justify-center rounded-full bg-white px-6 py-2 font-semibold text-emerald-700 shadow-lg transition hover:bg-white/90"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      )}

      {/* Banner nhỏ nếu thanh toán thành công */}
      {paySuccess && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
          Thanh toán thành công! Cảm ơn bạn đã mua sắm tại ShopHub.
        </div>
      )}

      {/* ========== Header ========== */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Đơn hàng
        </h1>
        <p className="text-[15px] text-slate-600 dark:text-slate-300">
          Quản lý giỏ hàng và các đơn đã thanh toán
        </p>
      </div>

      {/* ========== Tabs ========== */}
      <div className="relative inline-flex rounded-xl border border-slate-200/90 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur">
        <div
          className={`absolute inset-1 w-1/2 rounded-lg bg-emerald-500/10 shadow-sm transition-transform duration-300 ease-out dark:bg-emerald-500/15 ${
            tab === "cart" ? "translate-x-0" : "translate-x-full"
          }`}
        />
        <button
          onClick={() => handleTabChange("cart")}
          className={`relative z-10 flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
            tab === "cart"
              ? "text-emerald-700 dark:text-emerald-50"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          Giỏ hàng của tôi
        </button>

        <button
          onClick={() => handleTabChange("completed")}
          className={`relative z-10 flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
            tab === "completed"
              ? "text-emerald-700 dark:text-emerald-50"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          Đơn hàng đã thanh toán
        </button>
      </div>

      {/* TAB 1: GIỎ HÀNG */}
      {tab === "cart" && (
        <div className="space-y-4 pt-4">
          {loading ? (
            <div className="py-20 text-center text-slate-500 dark:text-slate-400">
              Đang tải giỏ hàng...
            </div>
          ) : !items.length ? (
            <Card className="border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-white/5">
              <CardContent className="py-12 pt-6 text-center">
                <p className="mb-4 text-slate-600 dark:text-slate-400">
                  Giỏ hàng trống
                </p>
                <Link to="/products">
                  <Button>Bắt đầu mua sắm</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-2">
                <Link
                  to="/products"
                  className="inline-flex -ml-2 items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
                >
                  <ArrowLeft size={16} /> Tiếp tục mua sắm
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Items trong giỏ */}
                <div className="space-y-4 lg:col-span-2">
                  <Card className="border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-white/5">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                        Sản phẩm ({items.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                        >
                          <img
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.name}
                            className="h-20 w-20 rounded object-cover"
                          />

                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900 dark:text-white">
                              {item.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {Number(item.price).toLocaleString("vi-VN")}₫
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 rounded border border-slate-200 bg-white dark:border-white/15 dark:bg-white/5">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                className="p-1 hover:bg-slate-100 dark:hover:bg-white/10"
                              >
                                <Minus size={16} />
                              </button>

                              <span className="w-8 text-center">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="p-1 hover:bg-slate-100 dark:hover:bg-white/10"
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            <span className="font-semibold text-slate-900 dark:text-white">
                              {(item.price * item.quantity).toLocaleString(
                                "vi-VN"
                              )}
                              ₫
                            </span>

                            <button
                              onClick={() => remove(item.id)}
                              className="rounded p-1 text-red-600 hover:bg-red-600/10"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Summary */}
                <div>
                  <Card className="sticky top-24 border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-white/5">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                        Tóm tắt đơn hàng
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">
                            Tạm tính
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {subtotal.toLocaleString("vi-VN")}₫
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">
                            Vận chuyển
                          </span>
                          <span>
                            {shipping === 0 ? (
                              <Badge className="bg-green-600 text-white">
                                FREE
                              </Badge>
                            ) : (
                              `${shipping.toLocaleString("vi-VN")}₫`
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between border-t pt-3 text-lg font-bold text-slate-900 dark:text-white">
                        <span>Tổng</span>
                        <span>{total.toLocaleString("vi-VN")}₫</span>
                      </div>

                      <Button className="w-full" onClick={handleCheckout}>
                        Tiến hành thanh toán
                      </Button>

                      <Link to="/products" className="block">
                        <Button className="w-full" variant="outline">
                          Tiếp tục mua sắm
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: ĐƠN HÀNG ĐÃ THANH TOÁN */}
      {tab === "completed" && (
        <div className="space-y-4 pt-4">
          {loadingPaid ? (
            <div className="py-20 text-center text-slate-500 dark:text-slate-400">
              Đang tải đơn hàng đã thanh toán...
            </div>
          ) : paidErr ? (
            <Card className="border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg:white/5">
              <CardContent className="py-12 pt-6 text-center">
                <p className="mb-3 text-red-500">Lỗi: {paidErr}</p>
                <Button variant="outline" onClick={loadPaidOrders}>
                  Thử lại
                </Button>
              </CardContent>
            </Card>
          ) : paidOrders.length === 0 ? (
            <Card className="border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-white/5">
              <CardContent className="py-12 pt-6 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-500" />
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Bạn chưa có đơn hàng đã thanh toán
                </p>
              </CardContent>
            </Card>
          ) : (
            paidOrders.map((order) => (
              <Card
                key={order.id}
                className="border border-slate-200 bg-white shadow-md transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-white/5"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                        Đơn #{order.id}
                      </CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Thanh toán ngày {order.date.toString().slice(0, 10)}
                      </p>
                    </div>

                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Danh sách sản phẩm */}
                  {order.items.length > 0 && (
                    <div className="border-t pt-3 text-sm text-slate-700 dark:text-slate-300">
                      <p className="font-medium">Sản phẩm:</p>
                      <ul className="space-y-1">
                        {order.items.map((it, idx) => (
                          <li
                            key={idx}
                            className="flex justify-between text-xs sm:text-sm"
                          >
                            <span>
                              {it.quantity}× {it.name}
                            </span>
                            <span className="font-medium">
                              {it.price.toLocaleString("vi-VN")}₫
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {order.trackingNumber && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Mã đơn / orderCode:{" "}
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">
                          {order.trackingNumber}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Tổng + nút hành động */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Tổng: {order.total.toLocaleString("vi-VN")}₫
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Xuất hóa đơn */}
                      <Button
                        onClick={() => handleExportInvoice(order.id)}
                        className="bg-emerald-600 text-white border border-emerald-700 hover:bg-emerald-700 hover:border-emerald-800 shadow-md"
                      >
                        Xuất hóa đơn
                      </Button>

                      {/* Mua lại */}
                      <Link to="/products">
                        <Button className="bg-blue-600 text-white border border-blue-700 hover:bg-blue-700 hover:border-blue-800 shadow-md gap-2">
                          Mua lại
                          <ArrowRight size={16} className="ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* MODAL THANH TOÁN */}
      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        orderId={payData.orderId}
        qrUrl={payData.qrUrl}
        checkoutUrl={payData.checkoutUrl}
        onPaid={async () => {
          setPayOpen(false);

          // Clear cart + clear cartId
          if (clear) await clear();
          CartAPI.clearStoredCartId();

          await load();
          await loadPaidOrders();

          setPaySuccess(true);
          setShowFireworks(true);
        }}
        poll={async (oid) => {
          const s = await PaymentsAPI.status(oid);
          return s.status as "PAID" | "PENDING";
        }}
      />
    </div>
  );
}
