import { useEffect, useState } from "react";
import DataTable from "../../components/admin/DataTable";
import { RatingAPI } from "../../lib/adminApi";
import type { Rating } from "../../lib/adminApi";

export default function AdminRatings() {
  const [items, setItems] = useState<Rating[]>([]);
  const [form, setForm]   = useState<Partial<Rating> & { userId?: number; productId?: number }>({});
  const [editing, setEditing] = useState<Rating | null>(null);

  const load = async () => setItems(await RatingAPI.list());
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Rating> = {
      rating: Number(form.rating ?? 0),
      user: form.userId ? { id: form.userId } as any : undefined,
      product: form.productId ? { id: form.productId } as any : undefined,
    };
    if (editing) await RatingAPI.update(editing.id, payload);
    else await RatingAPI.create(payload);
    setForm({}); setEditing(null); await load();
  };

  const startEdit = (r: Rating) => {
    setEditing(r);
    setForm({
      rating: r.rating,
      userId: r.user?.id,
      productId: r.product?.id,
    } as any);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Ratings</h1>

      <form onSubmit={submit} className="grid md:grid-cols-4 gap-3 p-4 border bg-white rounded-2xl">
        <input className="border rounded-md px-3 py-2" placeholder="Stars (1-5)" type="number"
               value={form.rating ?? ""} onChange={e=>setForm(v=>({...v, rating:Number(e.target.value)}))}/>
        <input className="border rounded-md px-3 py-2" placeholder="userId"
               value={form.userId ?? ""} onChange={e=>setForm(v=>({...v, userId:Number(e.target.value)}))}/>
        <input className="border rounded-md px-3 py-2" placeholder="productId"
               value={form.productId ?? ""} onChange={e=>setForm(v=>({...v, productId:Number(e.target.value)}))}/>
        <div>
          <button className="px-4 py-2 rounded-lg bg-gray-900 text-white">{editing ? "Update" : "Create"}</button>
          {editing && <button type="button" className="ml-2 px-4 py-2 rounded-lg border" onClick={()=>{setEditing(null); setForm({});}}>Cancel</button>}
        </div>
      </form>

      <DataTable<Rating>
        data={items}
        columns={[
          { key: "id", header: "ID", className: "w-16" },
          { key: "rating", header: "Stars" },
          { key: "user", header: "User", render: r => r.user?.email ?? r.user?.id ?? "—" },
          { key: "product", header: "Product", render: r => r.product?.name ?? r.product?.id ?? "—" },
        ]}
        actions={(row) => <>
          <button className="px-3 py-1.5 rounded-md border" onClick={()=>startEdit(row)}>Edit</button>
          <button className="px-3 py-1.5 rounded-md border" onClick={async ()=>{ await RatingAPI.remove(row.id); await load(); }}>Delete</button>
        </>}
      />
    </div>
  );
}
