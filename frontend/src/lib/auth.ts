// frontend/src/lib/auth.ts
import { api, setAuthToken } from "./api";

/** ===== Kiểu dữ liệu chung từ backend ===== */
export type ApiResponse<T> = {
  message: string;
  code: number;
  status: string;
  data: T;
};

export type LoginData = {
  message: string;
  token: string;
  refresh_token: string;
  tokenType: "Bearer";
  id: number;
  username: string;
  role: "ROLE_USER" | "ROLE_ADMIN" | string;
};

/** ===== Khóa lưu trữ (dùng sessionStorage, MỖI TAB RIÊNG) ===== */
const TOKEN_KEY = "token";
const USER_KEY = "user";

/** ===== Helpers ===== */
function safeJSONParse<T = any>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

/** Lấy user hiện tại từ sessionStorage (nếu có) */
export function getAuthUser():
  | { id: number; username?: string; role?: string }
  | null {
  const u = safeJSONParse<{ id: number; username?: string; role?: string }>(
    sessionStorage.getItem(USER_KEY)
  );
  if (!u?.id) return null;
  return u;
}

/** Lấy token hiện tại (nếu có) */
export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

/** Có đang đăng nhập không */
export function isLoggedIn(): boolean {
  return !!sessionStorage.getItem(TOKEN_KEY);
}

/** Dùng khi app khởi động lại (giữ phiên trong CÙNG TAB) */
export function hydrateAuthFromStorage() {
  const saved = sessionStorage.getItem(TOKEN_KEY);
  if (saved) setAuthToken(saved);
}

/** ===== API Auth ===== */
export async function register(payload: any) {
  const { data } = await api.post("/api/user/register", payload);
  return data as ApiResponse<{ message: string; user: any }>;
}

/**
 * Login:
 * - Thêm role mặc định "USER" (uppercase) nếu phía FE không truyền.
 * - Lưu token vào sessionStorage + set vào axios.
 * - Lưu thông tin user (id, username, role) để các phần khác (giỏ hàng) dùng.
 */
export async function login(payload: {
  email: string;
  password: string;
  role?: string;
}): Promise<ApiResponse<any>> {
  const body = { ...payload, role: (payload.role ?? "USER").toUpperCase() };

  // gọi API
  const { data } = await api.post("/api/user/login", body);

  const res = data as ApiResponse<any>;

  // lấy phần data bên trong (backend của bạn: res.data = { token, id, username, role, ... }
  const raw = res?.data ?? data;

  // cố gắng lấy token/id/username/role theo nhiều kiểu cho chắc
  const token =
    raw?.token ??
    raw?.accessToken ??
    raw?.jwt ??
    raw?.data?.token;

  const id =
    raw?.id ??
    raw?.userId ??
    raw?.user?.id;

  const username =
    raw?.username ??
    raw?.user?.username ??
    raw?.email;

  const role =
    raw?.role ??
    raw?.user?.role ??
    "ROLE_USER";

  // --- LƯU TOKEN VÀ USER VÀO SESSION STORAGE ---
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
  }

  if (id != null) {
    const userPayload = { id, username, role };
    sessionStorage.setItem(USER_KEY, JSON.stringify(userPayload));
  }

  return res;
}

/** Verify OTP: backend dùng khóa `input_otp` */
export async function verifyOtp(payload: { email: string; input_otp: string }) {
  const { data } = await api.post("/api/user/verify", payload);
  return data as ApiResponse<boolean>;
}

export async function resendVerify(payload: { email: string }) {
  const { data } = await api.post("/api/user/resend-verify", payload);
  return data as ApiResponse<string>;
}

/** Quên mật khẩu */
export async function requestPasswordReset(payload: { email: string }) {
  const { data } = await api.post("/api/user/reset-password", payload);
  return data as ApiResponse<string>;
}

export async function resendPasswordReset(payload: { email: string }) {
  const { data } = await api.post("/api/user/resend-reset-password", payload);
  return data as ApiResponse<string>;
}

/** Đặt lại mật khẩu (OtpDTO cũng dùng `input_otp`) */
export async function resetPassword(payload: {
  email: string;
  input_otp: string;
  newPassword: string;
  retypePassword: string;
}) {
  const { data } = await api.post("/api/user/reset", payload);
  return data as ApiResponse<boolean>;
}

/** Đăng xuất sạch sẽ */
export function logout() {
  // Xóa auth trong sessionStorage (theo tab)
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);

  // Nếu trước đây có dùng localStorage cho cart id, dòng này vẫn OK (xóa nếu có)
  localStorage.removeItem("qlbh_cart_id");

  setAuthToken(undefined);
}

/** Khởi tạo token cho axios nếu reload trang trong cùng tab */
hydrateAuthFromStorage();
