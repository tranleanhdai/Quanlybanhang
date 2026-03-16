import { useEffect, useMemo, useRef, useState } from "react";
import DataTable from "../../components/admin/DataTable";
import { ProductImageAPI, ProductAPI } from "../../lib/adminApi";
import type { ProductImage, Product } from "../../lib/adminApi";
import { uploadImage } from "../../lib/upload";
import { Search, Image as ImageIcon, UploadCloud, ChevronDown } from "lucide-react";

export default function AdminProductImages() {
  const [items, setItems] = useState<ProductImage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<{ productId?: number; files?: File[] }>({});
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [productFilter, setProductFilter] = useState<number | "">("");

  const load = async () => {
    const [imgs, ps] = await Promise.all([ProductImageAPI.list(), ProductAPI.list()]);
    setItems(imgs);
    setProducts(ps);
  };
  useEffect(() => { load(); }, []);

  // ------- ProductPicker (search theo tên hoặc ID) -------
  function ProductPicker(props: {
    products: Product[];
    value?: number;
    onChange: (id?: number) => void;
  }) {
    const { products, value, onChange } = props;
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [hi, setHi] = useState(0); // highlight index
    const boxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // click outside để đóng
    useEffect(() => {
      const h = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, []);

    // đồng bộ hiển thị khi có value
    useEffect(() => {
      if (!value) { setInput(""); return; }
      const p = products.find(p => p.id === value);
      setInput(p ? `${p.name} (#${p.id})` : String(value));
    }, [value, products]);

    // danh sách gợi ý
    const list = useMemo(() => {
      const s = input.trim().toLowerCase();
      if (!s) return products.slice(0, 10);
      return products
        .filter(p =>
          p.name?.toLowerCase().includes(s) ||
          String(p.id).toLowerCase().startsWith(s)
        )
        .slice(0, 10);
    }, [input, products]);

    const pick = (id?: number) => {
      onChange(id);
      setOpen(false);
      // cập nhật text hiển thị
      if (id) {
        const p = products.find(x => x.id === id);
        setInput(p ? `${p.name} (#${p.id})` : String(id));
      }
      // focus lại cho mượt
      requestAnimationFrame(() => inputRef.current?.blur());
    };

    const onInputChange = (v: string) => {
      setInput(v);
      setOpen(true);
      setHi(0);

      // nếu gõ toàn số và trùng ID → chọn luôn
      if (/^\d+$/.test(v)) {
        const id = Number(v);
        if (products.some(p => p.id === id)) {
          pick(id);
          return;
        }
      }
      // không còn khớp trực tiếp → chưa chọn (giữ value hiện tại)
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (!open && (e.key === "ArrowDown" || e.key === "Enter")) setOpen(true);

      if (e.key === "ArrowDown") { e.preventDefault(); setHi(i => Math.min(i + 1, Math.max(list.length - 1, 0))); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setHi(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter") {
        e.preventDefault();
        const chosen = list[hi];
        if (chosen) pick(chosen.id as number);
        else if (/^\d+$/.test(input)) pick(Number(input));
      }
      if (e.key === "Escape") setOpen(false);
    };

    return (
      <div className="relative" ref={boxRef}>
        <div className="relative flex">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            className="w-full rounded-l-lg border px-9 py-2"
            placeholder="Tìm tên sản phẩm hoặc nhập ID…"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
          />
          <button
            type="button"
            className="rounded-r-lg border border-l-0 px-3"
            onClick={() => { setOpen(v => !v); inputRef.current?.focus(); }}
            title="Mở/đóng gợi ý"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {open && (
          <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg border bg-white shadow">
            {list.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">Không tìm thấy</div>
            ) : (
              list.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50 ${
                    i === hi ? "bg-gray-100" : ""
                  }`}
                  onMouseEnter={() => setHi(i)}
                  onClick={() => pick(p.id as number)}
                >
                  <span className="truncate">{p.name}</span>
                  <span className="ml-3 shrink-0 text-xs text-gray-500">#{p.id}</span>
                </button>
              ))
            )}
          </div>
        )}

        <div className="mt-1 text-xs text-gray-500">
          Gõ <code>ID</code> nếu biết, hoặc gõ <code>tên</code> để tìm nhanh. Enter để chọn.
        </div>
      </div>
    );
  }
  // ---------------- end ProductPicker ----------------

  // lọc bảng theo toolbar
  const filtered = useMemo(() => {
    let rows = items;
    if (productFilter) rows = rows.filter(r => r.product?.id === productFilter);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      rows = rows.filter(r =>
        String(r.id).includes(s) ||
        products.find(p => p.id === r.product?.id)?.name?.toLowerCase().includes(s)
      );
    }
    return rows;
  }, [items, products, q, productFilter]);

  // Drag & Drop: nhận nhiều file
  const onDrop: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
    if (!list.length) return;
    setForm(v => ({ ...v, files: [...(v.files ?? []), ...list] }));
  };

  const removeFile = (idx: number) => {
    setForm(v => ({ ...v, files: (v.files ?? []).filter((_, i) => i !== idx) }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId || !(form.files?.length)) return;
    setLoading(true);
    try {
      const uploads = await Promise.all(form.files.map(f => uploadImage(f, "products")));
      await Promise.all(
        uploads.map(up => ProductImageAPI.create({
          imageURL: up.url,
          product: { id: form.productId } as any,
        }))
      );
      setForm({});
      await load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header + toolbar (giữ nguyên) */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Product Images</h1>
          <p className="text-sm text-gray-500">Ảnh chi tiết cho đúng sản phẩm (master/detail).</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="w-72 rounded-lg border px-9 py-2"
              placeholder="Tìm theo ID ảnh hoặc tên sản phẩm…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border px-3 py-2"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Tất cả sản phẩm</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>)}
          </select>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="grid md:grid-cols-5 gap-4 p-4 bg-white border rounded-2xl">
        {/* Cột chọn product + dropzone */}
        <div className="md:col-span-2 space-y-3">
          <ProductPicker
            products={products}
            value={form.productId}
            onChange={(id) => setForm(v => ({ ...v, productId: id }))}
          />

          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-6 cursor-pointer hover:bg-gray-50"
          >
            <UploadCloud className="h-8 w-8 text-gray-400" />
            <div className="text-sm text-gray-600">
              Kéo–thả <b>nhiều ảnh</b> vào đây hoặc bấm để chọn
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const list = Array.from(e.target.files || []);
                if (list.length) setForm(v => ({ ...v, files: [...(v.files ?? []), ...list] }));
              }}
            />
          </label>
          <p className="text-xs text-gray-500">Hỗ trợ .jpg .png .webp (upload qua Cloudinary)</p>

          <button
            className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-60"
            disabled={loading || !form.productId || !(form.files?.length)}
          >
            {loading ? "Uploading..." : `Create images${form.files?.length ? ` (${form.files.length})` : ""}`}
          </button>
        </div>

        {/* Cột hướng dẫn + preview grid */}
        <div className="md:col-span-3 space-y-3">
          <div className="rounded-xl border p-4 bg-gray-50">
            <div className="flex items-center gap-2 text-gray-700">
              <ImageIcon className="h-5 w-5" />
              <span className="font-medium">Hướng dẫn</span>
            </div>
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Ảnh chính của sản phẩm tạo ở màn <b>Products</b> (trường <code>imageURL</code>).</li>
              <li>Ảnh chi tiết (gallery) tạo ở đây và liên kết bằng <b>Product</b>.</li>
              <li>Có thể chọn <b>nhiều ảnh</b> cho cùng một sản phẩm rồi tạo 1 lần.</li>
            </ul>
          </div>

          {!!form.files?.length && (
            <div className="rounded-xl border p-3">
              <div className="mb-2 text-sm text-gray-600">Preview ({form.files.length} ảnh)</div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {form.files.map((f, idx) => (
                  <div key={idx} className="relative">
                    <img src={URL.createObjectURL(f)} className="h-24 w-full object-cover rounded-md" />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-white border rounded-full px-2 text-xs shadow"
                      onClick={() => removeFile(idx)}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Bảng */}
      <DataTable<ProductImage>
        data={filtered}
        columns={[
          {
            key: "product",
            header: "Product",
            render: (r) => {
              const p = products.find(x => x.id === r.product?.id);
              return p ? `${p.name} (#${p.id})` : r.product?.id ?? "—";
            },
          },
          {
            key: "imageURL",
            header: "Image",
            render: (r) =>
              r.imageURL ? <img src={r.imageURL} className="h-16 w-16 object-cover rounded-md" /> : "—",
            className: "w-24"
          },
        ]}
        actions={(row) => (
          <button
            className="px-3 py-1.5 rounded-md border hover:border-red-400 hover:text-red-600"
            onClick={async () => { await ProductImageAPI.remove(row.id); await load(); }}
          >
            Delete
          </button>
        )}
      />
    </div>
  );
}
