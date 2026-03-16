import { useEffect, useState } from "react";
import DataTable from "../../components/admin/DataTable";
import { CategoryAPI } from "../../lib/adminApi";
import type { Category } from "../../lib/adminApi";

export default function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState<Partial<Category>>({});
  const [editing, setEditing] = useState<Category | null>(null);
  const load = async () => setItems(await CategoryAPI.list());
  useEffect(() => { load(); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await CategoryAPI.update(editing.id, form);
    else await CategoryAPI.create(form);
    setForm({}); setEditing(null); await load();
  };
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Categories</h1>
      <form onSubmit={submit} className="grid md:grid-cols-3 gap-3 p-4 border bg-white rounded-2xl">
        <input placeholder="Name" className="border rounded-md px-3 py-2"
               value={form.name ?? ""} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/>
        <div className="md:col-span-3">
          <button className="px-4 py-2 rounded-lg bg-gray-900 text-white">{editing ? "Update" : "Create"}</button>
          {editing && <button type="button" className="ml-2 px-4 py-2 rounded-lg border" onClick={()=>{setEditing(null); setForm({});}}>Cancel</button>}
        </div>
      </form>
      <DataTable<Category>
        data={items}
        columns={[
          { key: "id", header: "ID", className: "w-24" },
          { key: "name", header: "Name" },
        ]}
        actions={(row) => <>
          <button className="px-3 py-1.5 rounded-md border" onClick={() => { setEditing(row); setForm(row); }}>Edit</button>
          <button className="px-3 py-1.5 rounded-md border" onClick={async ()=>{ await CategoryAPI.remove(row.id); await load(); }}>Delete</button>
        </>}
      />
    </div>
  );
}
