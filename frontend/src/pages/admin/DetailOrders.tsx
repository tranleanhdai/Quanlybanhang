import { useEffect, useState } from "react";
import DataTable from "../../components/admin/DataTable";
import { DetailOrderAPI } from "../../lib/adminApi";
import type { DetailOrder } from "../../lib/adminApi";

export default function AdminDetailOrders() {
  const [items, setItems] = useState<DetailOrder[]>([]);
  const load = async () => setItems(await DetailOrderAPI.list());
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Detail Orders</h1>
      <DataTable<DetailOrder>
        data={items}
        columns={[
          { key: "id", header: "ID", className: "w-16" },
          { key: "order", header: "Order", render: r => r.order?.id ?? "—" },
          { key: "product", header: "Product", render: r => r.product?.name ?? r.product?.id ?? "—" },
          { key: "quantity", header: "Qty" },
          { key: "price", header: "Price", render: r => r.price?.toLocaleString() ?? "—" },
        ]}
      />
    </div>
  );
}
