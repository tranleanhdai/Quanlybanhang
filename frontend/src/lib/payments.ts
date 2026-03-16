import { api } from "./api";

export type CheckoutData = {
  checkoutUrl?: string;
  expiredAt?: number;
  qrUrl?: string;      // fallback (dev)
  qrBase64?: string;   // ✅ chuẩn PayOS
  error?: any;
  message?: string;
};

export const PaymentsAPI = {
  async createQR(orderId: number): Promise<CheckoutData> {
    const res = await api.post("/api/payment/qr", { orderId });
    const data = (res as any).data ?? res;

    const checkoutUrl = data?.checkoutUrl ?? data?.data?.checkoutUrl ?? undefined;
    const expiredAt   = data?.expiredAt   ?? data?.data?.expiredAt   ?? undefined;

    // nhận cả 2 trường, ưu tiên base64
    const qrBase64 = data?.qrBase64 ?? data?.data?.qrBase64 ?? undefined;
    const qrUrl    = data?.qrUrl    ?? data?.data?.qrUrl    ?? data?.data?.qrCode ?? undefined;

    return {
      checkoutUrl,
      expiredAt,
      qrBase64,
      qrUrl,
      error: data?.error,
      message: data?.message || data?.desc,
    };
  },

  async status(orderId: number): Promise<{ status: "PAID" | "PENDING" }> {
    const res = await api.get(`/api/payment/${orderId}/status`);
    const data = (res as any).data ?? res;
    return { status: (data?.status || "PENDING") as "PAID" | "PENDING" };
  },
};
