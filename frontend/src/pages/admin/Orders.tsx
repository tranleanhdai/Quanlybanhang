import { useEffect, useMemo, useState } from "react";
import DataTable from "../../components/admin/DataTable";
import { OrderAPI } from "../../lib/adminApi";
import type { Order } from "../../lib/adminApi";
import { api } from "../../lib/api";

function normalizeList<T = any>(raw: any): T[] {
  if (!raw) return [];
  const v = (raw as any).data ?? raw;
  if (Array.isArray(v)) return v as T[];
  const candidates = [
    (v as any).items,
    (v as any).results,
    (v as any).records,
    (v as any).rows,
    (v as any).content,
    (v as any).data,
  ].filter(Boolean);
  for (const c of candidates) if (Array.isArray(c)) return c as T[];
  if (typeof v === "object") return [v as T];
  return [];
}

// Helper: tính status hiển thị cho 1 order
function getOrderStatus(o: Order): string {
  const anyO = o as any;

  // Nếu backend có gắn payment vào order
  const p = anyO.payment;
  if (p?.checkPayment) return "PAID";
  if (p?.status) return String(p.status);

  // Fallback: nếu order.status có, dùng; không thì PENDING
  return anyO.status || "PENDING";
}

type StatusFilter = "ALL" | "PAID" | "PENDING" | "FAILED";
type SortBy = "DATE_DESC" | "DATE_ASC" | "TOTAL_DESC" | "TOTAL_ASC";

export default function AdminOrders() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // search + filter + sort
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortBy>("DATE_DESC");

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await OrderAPI.list();
      setItems(normalizeList<Order>(res));
    } catch (e: any) {
      console.error("[AdminOrders] load error:", e);
      setErr(e?.message || "Không tải được danh sách đơn hàng");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ===== Export CSV =====
  const handleExportCsv = async () => {
    try {
      const res = await api.get("/api/order/export", {
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orders.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error("[AdminOrders] export error:", e);
      alert("Không export được CSV đơn hàng");
    }
  };

  // Áp dụng search + filter + sort
  const displayItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const filtered = items.filter((o) => {
      const status = getOrderStatus(o);

      // Filter status
      if (statusFilter !== "ALL" && status !== statusFilter) return false;

      // Search theo id hoặc user email
      if (!keyword) return true;
      const idMatch = String(o.id).includes(keyword);
      const email = o.user?.email?.toLowerCase() || "";
      const emailMatch = email.includes(keyword);

      return idMatch || emailMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aTotal = typeof a.totalPrice === "number" ? a.totalPrice : 0;
      const bTotal = typeof b.totalPrice === "number" ? b.totalPrice : 0;

      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      switch (sortBy) {
        case "TOTAL_ASC":
          return aTotal - bTotal;
        case "TOTAL_DESC":
          return bTotal - aTotal;
        case "DATE_ASC":
          return aDate - bDate || (Number(a.id) - Number(b.id));
        case "DATE_DESC":
        default:
          return bDate - aDate || (Number(b.id) - Number(a.id));
      }
    });

    return sorted;
  }, [items, search, statusFilter, sortBy]);

  return (
    <div className="space-y-4">
      {/* Header + controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold">Orders</h1>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Tìm theo ID hoặc email user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border px-3 py-1.5 text-sm md:w-64"
          />

          {/* Filter status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-md border px-2 py-1.5 text-sm"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-md border px-2 py-1.5 text-sm"
          >
            <option value="DATE_DESC">Mới nhất trước</option>
            <option value="DATE_ASC">Cũ nhất trước</option>
            <option value="TOTAL_DESC">Tổng tiền: cao → thấp</option>
            <option value="TOTAL_ASC">Tổng tiền: thấp → cao</option>
          </select>

          <button
            className="px-3 py-1.5 rounded-md border hover:bg-white/5"
            onClick={handleExportCsv}
          >
            Export CSV
          </button>

          <button
            className="px-3 py-1.5 rounded-md border hover:bg-white/5"
            onClick={load}
          >
            Reload
          </button>
        </div>
      </div>

      {err && <div className="text-sm text-rose-400">{err}</div>}

      {loading ? (
        <div className="text-slate-400">Đang tải...</div>
      ) : (
        <DataTable<Order>
          data={Array.isArray(displayItems) ? displayItems : []}
          columns={[
            { key: "id", header: "ID", className: "w-16" },
            {
              key: "user",
              header: "User",
              render: (r) =>
                r?.user?.email ??
                (typeof r?.user?.id === "number" ? `#${r.user.id}` : "—"),
            },
            {
              key: "method",
              header: "Method",
              render: (r) => r?.method ?? "—",
            },
            {
              key: "status",
              header: "Status",
              render: (r) => {
                const s = getOrderStatus(r);
                const color =
                  s === "PAID"
                    ? "text-emerald-500"
                    : s === "FAILED"
                    ? "text-rose-500"
                    : "text-amber-400";
                return <span className={color}>{s}</span>;
              },
            },
            {
              key: "totalPrice",
              header: "Total",
              render: (r) =>
                typeof r?.totalPrice === "number"
                  ? r.totalPrice.toLocaleString()
                  : "—",
            },
          ]}
          actions={(row) => (
            <button
              className="px-3 py-1.5 rounded-md border hover:bg-white/5"
              onClick={async () => {
                await OrderAPI.remove(row.id as any);
                await load();
              }}
            >
              Delete
            </button>
          )}
        />
      )}
    </div>
  );
}
