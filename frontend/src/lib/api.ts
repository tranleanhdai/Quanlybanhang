// src/lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

// Lấy token: MỖI TAB RIÊNG (sessionStorage)
function getToken(): string | null {
  return sessionStorage.getItem("token") || null;
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// (không bắt buộc) log lỗi response để dễ debug khi cần
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // eslint-disable-next-line no-console
    console.error(
      "[API] Error:",
      err?.response?.status,
      err?.response?.data || err?.message
    );
    return Promise.reject(err);
  }
);

// Hàm này được auth.ts gọi
export function setAuthToken(token?: string) {
  if (token) {
    // chỉ lưu vào sessionStorage => không share giữa tabs
    sessionStorage.setItem("token", token);
  } else {
    sessionStorage.removeItem("token");
  }

  // Dọn luôn token cũ trong localStorage (nếu còn)
  localStorage.removeItem("token");
}
