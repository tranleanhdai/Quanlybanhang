import { useEffect, useMemo, useRef, useState } from "react";
import DataTable from "../../components/admin/DataTable";
import { CartAPI, DetailCartAPI } from "../../lib/adminApi";
import type { Cart, DetailCart } from "../../lib/adminApi";

/* Drawer với layout chống tràn */
function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      {/* backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      {/* panel */}
      <div
        className={[
          "absolute right-0 top-0 h-full w-full",
          "max-w-5xl md:max-w-3xl",
          "bg-white shadow-2xl transition-transform",
          open ? "translate-x-0" : "translate-x-full",
          "overflow-hidden flex flex-col",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b p-4 gap-3">
          <h3 className="text-lg font-semibold truncate min-w-0" title={title}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md border px-3 py-1.5 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}

/** ================= Admin Carts ================= */
export default function AdminCarts() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [details, setDetails] = useState<DetailCart[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [activeCart, setActiveCart] = useState<Cart | null>(null);

  // lưu data lần trước để so sánh
  const prevDataRef = useRef<{ carts: Cart[]; details: DetailCart[] } | null>(null);
  const [changedIds, setChangedIds] = useState<number[]>([]);

  async function loadAll() {
    setLoading(true);
    try {
      const [cs, ds] = await Promise.all([CartAPI.list(), DetailCartAPI.list()]);
      const newCarts = cs ?? [];
      const newDetails = ds ?? [];

      const prev = prevDataRef.current;
      if (prev) {
        const changed: number[] = [];

        // gom detail theo cartId -> count & total
        const buildStats = (list: DetailCart[]) => {
          const map = new Map<
            number,
            { count: number; total: number }
          >();
          list.forEach((d) => {
            const rawId =
              d.cart?.id ??
              (typeof (d as any).cartId === "number" ? (d as any).cartId : undefined);
            if (!rawId) return;
            const cartId = Number(rawId);
            const entry = map.get(cartId) ?? { count: 0, total: 0 };
            const price = Number(d.price) || 0;
            const qty = Number(d.quantity) || 0;
            entry.count += 1;
            entry.total += price * qty;
            map.set(cartId, entry);
          });
          return map;
        };

        const prevStats = buildStats(prev.details);
        const newStats = buildStats(newDetails);

        // set cartIds mới
        const allIds = new Set<number>();
        newCarts.forEach((c) => allIds.add(c.id));
        prev.carts.forEach((c) => allIds.add(c.id));

        allIds.forEach((id) => {
          const prevCart = prev.carts.find((c) => c.id === id);
          const newCart = newCarts.find((c) => c.id === id);
          if (!newCart) {
            // cart bị xoá
            changed.push(id);
            return;
          }
          if (!prevCart) {
            // cart mới
            changed.push(id);
            return;
          }

          const prevS = prevStats.get(id);
          const newS = newStats.get(id);

          const prevTotal =
            typeof prevCart.totalPrice === "number"
              ? prevCart.totalPrice
              : prevS?.total ?? 0;
          const newTotal =
            typeof newCart.totalPrice === "number"
              ? newCart.totalPrice
              : newS?.total ?? 0;

          const prevCount = prevS?.count ?? 0;
          const newCount = newS?.count ?? 0;

          if (prevTotal !== newTotal || prevCount !== newCount) {
            changed.push(id);
          }
        });

        if (changed.length) {
          setChangedIds(changed);
        }
      }

      prevDataRef.current = { carts: newCarts, details: newDetails };
      setCarts(newCarts);
      setDetails(newDetails);
    } finally {
      setLoading(false);
    }
  }

  // fake realtime: 1s refresh một lần
  useEffect(() => {
    loadAll(); // lần đầu
    const timer = setInterval(() => {
      loadAll();
    }, 10000); // 1000ms = 1s
    return () => clearInterval(timer);
  }, []);

  // xoá highlight sau 3 giây
  useEffect(() => {
    if (!changedIds.length) return;
    const t = setTimeout(() => setChangedIds([]), 3000);
    return () => clearTimeout(t);
  }, [changedIds]);

  /** Lọc detail theo cart đang chọn */
  const activeDetails = useMemo(() => {
    if (!activeCart) return [];
    return details.filter((d) => {
      const id =
        d.cart?.id ??
        (typeof (d as any).cartId === "number" ? (d as any).cartId : undefined);
      return id === activeCart.id;
    });
  }, [activeCart, details]);

  /** Tính total của 1 cart từ details (fallback khi totalPrice null) */
  const calcCartTotal = (cartId: number) => {
    const items = details.filter(
      (d) => (d.cart?.id ?? (d as any).cartId) === cartId
    );
    return items.reduce(
      (s, it) =>
        s +
        (Number(it.price) || 0) * (Number(it.quantity) || 0),
      0
    );
  };

  /** Tổng Qty trong drawer */
  const totalQty = useMemo(
    () => activeDetails.reduce((s, d) => s + (Number(d.quantity) || 0), 0),
    [activeDetails]
  );

  const openDrawer = (cart: Cart) => {
    setActiveCart(cart);
    setOpen(true);
  };

  const isChanged = (id: number) => changedIds.includes(id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Carts</h1>
        <button
          className="rounded-md border px-3 py-1.5 hover:bg-gray-50"
          onClick={loadAll}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <DataTable<Cart>
        data={carts}
        columns={[
          { key: "id", header: "ID", className: "w-16" },
          {
            key: "user",
            header: "User",
            render: (r) => (
              <div className="flex items-center gap-2">
                <span
                  className="block max-w-240px truncate"
                  title={r.user?.email ?? r.user?.name ?? "—"}
                >
                  {r.user?.email ?? r.user?.name ?? "—"}
                </span>
                {isChanged(r.id) && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                    Updated
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "totalPrice",
            header: "Total",
            render: (r) => {
              const total =
                typeof r.totalPrice === "number"
                  ? r.totalPrice
                  : calcCartTotal(r.id);
              return total.toLocaleString();
            },
          },
          {
            key: "createdAt",
            header: "Created",
            render: (r) =>
              r.createdAt?.slice(0, 19).replace("T", " ") ?? "—",
            className: "hidden md:table-cell",
          },
        ]}
        actions={(row) => (
          <>
            <button
              className={`mr-2 rounded-md border px-3 py-1.5 hover:bg-gray-50 ${
                isChanged(row.id) ? "border-amber-400" : ""
              }`}
              onClick={() => openDrawer(row)}
            >
              View items
            </button>
            <button
              className="rounded-md border px-3 py-1.5 hover:bg-red-50"
              onClick={async () => {
                if (!confirm(`Delete cart #${row.id}?`)) return;
                await CartAPI.remove(row.id);
                await loadAll();
              }}
            >
              Delete
            </button>
          </>
        )}
      />

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={
          activeCart
            ? `Cart #${activeCart.id} — ${
                activeCart.user?.email ?? "Unknown"
              }`
            : "Cart"
        }
      >
        {/* Summary */}
        <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-gray-500">Items</div>
            <div className="text-lg font-semibold">
              {activeDetails.length}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-gray-500">Qty total</div>
            <div className="text-lg font-semibold">{totalQty}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-gray-500">Cart total</div>
            <div className="text-lg font-semibold">
              {(() => {
                if (!activeCart) return "—";
                const t =
                  typeof activeCart.totalPrice === "number"
                    ? activeCart.totalPrice
                    : calcCartTotal(activeCart.id);
                return t.toLocaleString();
              })()}
            </div>
          </div>
        </div>

        {/* Detail table */}
        <div className="overflow-x-auto">
          <DataTable<DetailCart>
            data={activeDetails}
            columns={[
              { key: "id", header: "ID", className: "w-16" },
              {
                key: "product",
                header: "Product",
                render: (r) =>
                  r.product?.name ??
                  (r.product?.id ? `#${r.product?.id}` : "—"),
              },
              { key: "quantity", header: "Qty" },
              {
                key: "price",
                header: "Price",
                render: (r) =>
                  typeof r.price === "number"
                    ? r.price.toLocaleString()
                    : "—",
              },
              {
                key: "lineTotal",
                header: "Line total",
                render: (r) =>
                  (
                    (Number(r.price) || 0) *
                    (Number(r.quantity) || 0)
                  ).toLocaleString(),
              },
            ]}
          />
        </div>
      </Drawer>
    </div>
  );
}
