// frontend/src/lib/adminApi.ts
import { api } from "./api";

/* =========================
   Kiểu ApiResponse (nếu backend có bọc)
   ========================= */
export type ApiResponse<T> = {
  message?: string;
  code?: number;
  status?: string;
  data: T;
};

/* =========================
   Types theo entity (khớp backend)
   ========================= */
export type Category = { id: number; name: string };

export type UserLite = {
  id: number;
  email?: string;
  name?: string;
};

export type User = {
  id: number;
  email?: string;
  name?: string;
  role?: string;
  createdAt?: string;
};

export type DetailCart = {
  id: number;
  quantity: number;
  price: number;
  cart?: { id: number } | null;
  product?: { id: number; name?: string; imageURL?: string; price?: number } | null;
};

export type Cart = {
  id: number;
  totalPrice?: number | null;
  user?: UserLite | null;
  detailCarts?: DetailCart[];
  createdAt?: string;
  updatedAt?: string;
};

export type Catalog = {
  id: number;
  name: string;
  products?: Product[];
};

export type ProductImage = {
  id: number;
  imageURL: string;
  product?: { id: number };
};

export type Product = {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  imageURL?: string;
  price: number;
  category?: Category | null;
  images?: ProductImage[];
  ratings?: Rating[];
  catalogs?: Catalog[];
};

export type Order = {
  id: number;
  totalPrice: number;
  method?: string;
  status?: string;
  user?: UserLite | null;
  detailOrders?: DetailOrder[];
  payment?: Payment | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Payment = {
  id: number;
  totalPrice: number;
  method?: string;
  checkPayment: boolean;
  order?: { id: number } | null;
};

export type DetailOrder = {
  id: number;
  quantity: number;
  price: number;
  order?: { id: number } | null;
  product?: { id: number; name?: string } | null;
};

export type Rating = {
  id: number;
  rating: number;
  user?: UserLite | null;
  product?: { id: number; name?: string } | null;
};

export type DashboardStats = {
  users: number;
  orders: number;
  revenue: number;
  products: number;
};

/* =========================
   Helper: unwrap mọi kiểu response
   ========================= */
function unwrap<T>(res: any): T {
  // Ưu tiên data.data (ApiResponse), sau đó data, cuối cùng res
  if (res && typeof res === "object") {
    if (res.data && typeof res.data === "object" && "data" in res.data) {
      return (res.data as ApiResponse<T>).data;
    }
    if ("data" in res) return res.data as T;
  }
  return res as T;
}

/* =========================
   Helper CRUD generic
   ========================= */
function makeResource<T>(base: string) {
  return {
    list: async (): Promise<T[]> => {
      const r = await api.get(base);
      const v = unwrap<T[] | ApiResponse<T[]>>(r);
      return Array.isArray(v) ? v : (v as any); // đề phòng backend bọc
    },
    get: async (id: number | string): Promise<T> => {
      const r = await api.get(`${base}/${id}`);
      return unwrap<T>(r);
    },
    create: async (payload: Partial<T>): Promise<T> => {
      const r = await api.post(base, payload);
      return unwrap<T>(r);
    },
    update: async (id: number | string, payload: Partial<T>): Promise<T> => {
      const r = await api.put(`${base}/${id}`, payload);
      return unwrap<T>(r);
    },
    remove: async (id: number | string): Promise<void> => {
      const r = await api.delete(`${base}/${id}`);
      unwrap<void>(r);
    },
  };
}

/* =========================
   API theo controller
   ========================= */
export const CategoryAPI = makeResource<Category>("/api/category");
export const CatalogAPI  = makeResource<Catalog>("/api/catalog");

// ✅ ProductAPI + thêm importFromPdf
export const ProductAPI  = {
  ...makeResource<Product>("/api/product"),

  // Thêm 1 sản phẩm mới từ file PDF (backend: POST /api/product/import-pdf)
  async importFromPdf(file: File): Promise<Product> {
    const fd = new FormData();
    fd.append("file", file);

    const r = await api.post("/api/product/import-pdf", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return unwrap<Product>(r);
  },
};

export const OrderAPI    = makeResource<Order>("/api/order");
export const PaymentAPI  = makeResource<Payment>("/api/payment");
export const CartAPI     = makeResource<Cart>("/api/cart");

export const UserAPI = {
  async list(): Promise<User[]> {
    const r = await api.get("/api/admin/users");
    return unwrap<User[]>(r);
  },
};

export const DetailOrderAPI = makeResource<DetailOrder>("/api/detail_order");
export const DetailCartAPI  = {
  ...makeResource<DetailCart>("/api/detail_cart"),
  /** Lấy chi tiết theo cartId (khớp backend: /api/detail_cart/cartid/{cartid}) */
  async byCart(cartId: number) {
    const r = await api.get(`/api/detail_cart/cartid/${cartId}`);
    return unwrap<DetailCart[]>(r);
  },
};
export const ProductImageAPI = makeResource<ProductImage>("/api/detail-product-image");

export const RatingAPI = {
  ...makeResource<Rating>("/api/rating"),
  byUser: async (userId: number | string) => {
    const r = await api.get(`/api/rating/user/${userId}`);
    return unwrap<Rating[]>(r);
  },
  byProduct: async (productId: number | string) => {
    const r = await api.get(`/api/rating/product/${productId}`);
    return unwrap<Rating[]>(r);
  },
};

/* =========================
   UploadAPI (tuỳ chọn)
   Dùng chung endpoint: POST /api/upload (multipart/form-data)
   Trả về { url, publicId }
   ========================= */
export type UploadResult = { url: string; publicId: string };

export const UploadAPI = {
  async upload(file: File, folder?: string) {
    const fd = new FormData();
    fd.append("file", file);
    if (folder) fd.append("folder", folder);

    const r = await api.post("/api/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Hỗ trợ cả 2 kiểu: bọc ApiResponse hoặc trả thẳng
    const data = unwrap<UploadResult | { url: string; publicId: string }>(r);
    return data as UploadResult;
  },
};

export const DashboardAPI = {
  async stats(): Promise<DashboardStats> {
    // ✅ Đúng URL backend: /api/admin/stats
    const r = await api.get("/api/admin/stats");
    return unwrap<DashboardStats>(r);
  },
};
