import { useEffect, useMemo, useState, useRef } from "react";
import DataTable from "../../components/admin/DataTable";
import { ProductAPI, CategoryAPI } from "../../lib/adminApi";
import type { Product, Category } from "../../lib/adminApi";
import { uploadImage } from "../../lib/upload";
import { Search, Image as ImageIcon, FileUp } from "lucide-react";

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState<Partial<Product> & { categoryId?: number; file?: File }>({});
  const [editing, setEditing] = useState<Product | null>(null);

  // UI state
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<number | "">("");
  const [importing, setImporting] = useState(false);
  const [importErr, setImportErr] = useState<string | null>(null);

  const pdfInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [ps, cs] = await Promise.all([ProductAPI.list(), CategoryAPI.list()]);
    setItems(ps);
    setCats(cs);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalUrl = (form as any).imageURL?.trim?.();
    if (form.file) {
      const up = await uploadImage(form.file, "products");
      finalUrl = up.url;
    }

    const payload: Partial<Product> = {
      name: form.name,
      description: form.description,
      quantity: Number(form.quantity ?? 0),
      imageURL: finalUrl,
      price: Number(form.price ?? 0),
      category: form.categoryId ? ({ id: form.categoryId } as any) : null,
    };

    if (editing) await ProductAPI.update(editing.id, payload);
    else await ProductAPI.create(payload);

    setForm({});
    setEditing(null);
    await load();
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      quantity: p.quantity,
      imageURL: (p as any).imageURL,
      price: p.price,
      categoryId: p.category?.id,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearForm = () => { setEditing(null); setForm({}); };

  /** ======================================================
   *           IMPORT NHIỀU FILE PDF CÙNG LÚC
   ====================================================== */
  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setImporting(true);
    setImportErr(null);

    try {
      let successCount = 0;
      const errors: string[] = [];

      for (const f of files) {
        try {
          await ProductAPI.importFromPdf(f);
          successCount++;
        } catch (err: any) {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Không import được file PDF này";
          errors.push(`${f.name}: ${msg}`);
        }
      }

      await load();

      alert(`Đã import thành công ${successCount}/${files.length} file.`);

      if (errors.length) {
        setImportErr(errors.join(" | "));
      }
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  // lọc sản phẩm
  const filtered = useMemo(() => {
    let rows = items;
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name?.toLowerCase().includes(s) ||
          String(r.id).includes(s)
      );
    }
    if (catFilter) rows = rows.filter((r) => r.category?.id === catFilter);
    return rows;
  }, [items, q, catFilter]);

  const mainImagePreview = useMemo(() => {
    if (form.file) return URL.createObjectURL(form.file);
    if ((form as any).imageURL) return (form as any).imageURL!;
    return "";
  }, [form.file, (form as any).imageURL]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-gray-500">Quản lý sản phẩm + Import từ PDF.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="w-72 rounded-lg border px-9 py-2"
              placeholder="Tìm theo tên hoặc ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border px-3 py-2"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Tất cả category</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* NÚT IMPORT PDF */}
          <button
            onClick={() => pdfInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <FileUp className="w-4 h-4" /> Import PDF
          </button>

          <input
            type="file"
            ref={pdfInputRef}
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handlePdfChange}
          />
        </div>
      </div>

      {importing && (
        <div className="text-blue-600 text-sm">Đang import PDF…</div>
      )}
      {importErr && (
        <div className="text-red-500 text-sm whitespace-pre-line">
          {importErr}
        </div>
      )}

      {/* FORM TẠO/SỬA */}
      <form
        onSubmit={submit}
        className="grid md:grid-cols-5 gap-4 p-4 bg-white border rounded-xl"
      >
        {/* COL THÔNG TIN */}
        <div className="md:col-span-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded-lg px-3 py-2 col-span-2"
              placeholder="Product name"
              value={form.name ?? ""}
              onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
              required
            />

            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Price"
              type="number"
              min={0}
              value={form.price ?? ""}
              onChange={(e) =>
                setForm((v) => ({ ...v, price: Number(e.target.value) }))
              }
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Quantity"
              type="number"
              min={0}
              value={form.quantity ?? ""}
              onChange={(e) =>
                setForm((v) => ({ ...v, quantity: Number(e.target.value) }))
              }
            />

            <select
              className="border rounded-lg px-3 py-2 col-span-2"
              value={form.categoryId ?? ""}
              onChange={(e) =>
                setForm((v) => ({
                  ...v,
                  categoryId: Number(e.target.value) || undefined,
                }))
              }
            >
              <option value="">— Chọn category —</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              className="border rounded-lg px-3 py-2 col-span-2"
              placeholder="Image URL (ảnh chính)"
              value={(form as any).imageURL ?? ""}
              onChange={(e) =>
                setForm((v) => ({ ...v, imageURL: e.target.value } as any))
              }
            />
          </div>

          <textarea
            className="border rounded-lg px-3 py-2 w-full min-h-24"
            placeholder="Description"
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((v) => ({ ...v, description: e.target.value }))
            }
          />

          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-gray-900 text-white">
              {editing ? "Update" : "Create"}
            </button>
            {editing && (
              <button
                type="button"
                className="px-4 py-2 rounded-lg border"
                onClick={clearForm}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* COL ẢNH */}
        <div className="md:col-span-2 space-y-3">
          <div className="aspect-4/3 w-full rounded-xl border bg-gray-50 flex items-center justify-center overflow-hidden">
            {mainImagePreview ? (
              <img src={mainImagePreview} className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <ImageIcon className="h-10 w-10 mb-1" />
                <span className="text-sm">Preview ảnh chính</span>
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer hover:bg-gray-50">
            <span className="inline-flex shrink-0 rounded-md border px-3 py-1 text-sm font-medium">
              Chọn ảnh
            </span>
            <span className="text-sm text-gray-600 truncate">
              {form.file ? form.file.name : "Chưa chọn ảnh"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                setForm((v) => ({
                  ...v,
                  file: e.target.files?.[0] ?? undefined,
                }))
              }
            />
          </label>
        </div>
      </form>

      {/* BẢNG DỮ LIỆU */}
      <DataTable<Product>
        data={filtered}
        columns={[
          { key: "id", header: "ID", className: "w-20" },
          {
            key: "imageURL",
            header: "Image",
            render: (r) =>
              (r as any).imageURL ? (
                <img
                  src={(r as any).imageURL}
                  alt=""
                  className="h-12 w-12 object-cover rounded-md"
                />
              ) : (
                "—"
              ),
            className: "w-20",
          },
          { key: "name", header: "Name" },
          {
            key: "price",
            header: "Price",
            render: (r) =>
              r.price != null
                ? r.price.toLocaleString("vi-VN") + " ₫"
                : "—",
            className: "w-28 text-right",
          },
          {
            key: "quantity",
            header: "Quantity",
            render: (r) => r.quantity ?? 0,
            className: "w-20 text-right",
          },
          {
            key: "category",
            header: "Category",
            render: (r) => r.category?.name ?? "—",
            className: "w-40",
          },
        ]}
        actions={(row) => (
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded-md border"
              onClick={() => startEdit(row)}
            >
              Edit
            </button>
            <button
              className="px-3 py-1.5 rounded-md border hover:border-red-400 hover:text-red-600"
              onClick={async () => {
                await ProductAPI.remove(row.id);
                await load();
              }}
            >
              Delete
            </button>
          </div>
        )}
      />
    </div>
  );
}
