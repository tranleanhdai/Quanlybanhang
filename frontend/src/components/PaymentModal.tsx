import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  orderId: number;
  qrUrl?: string | null;         // nếu có data:image... thì ưu tiên
  checkoutUrl?: string | null;   // URL ảnh QR (SePay VietQR MBBank)
  error?: any;
  errorDesc?: string | null;
  onPaid: () => void;
  poll: (orderId: number) => Promise<"PAID" | "PENDING">;
};

export default function PaymentModal({
  open,
  onClose,
  orderId,
  qrUrl,
  checkoutUrl,
  error,
  errorDesc,
  onPaid,
  poll,
}: Props) {
  const iv = useRef<number | null>(null);
  const isBase64QR = !!qrUrl && qrUrl.startsWith("data:image");

  useEffect(() => {
    if (!open || !orderId) return;
    iv.current = window.setInterval(async () => {
      try {
        const s = await poll(orderId);
        if (s === "PAID") {
          if (iv.current) clearInterval(iv.current);
          onPaid();
        }
      } catch {
        // ignore
      }
    }, 2000) as unknown as number;

    return () => {
      if (iv.current) clearInterval(iv.current);
    };
  }, [open, orderId, onPaid, poll]);

  if (!open) return null;

  const imageSrc = isBase64QR
    ? (qrUrl as string)
    : checkoutUrl
    ? checkoutUrl
    : null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 text-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold">Quét QR để thanh toán</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-center">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="QR thanh toán"
              className="mx-auto w-64 h-64 object-contain bg-white rounded-xl p-3"
            />
          ) : (
            <div className="text-sm text-slate-300">
              Không tạo được QR. Bạn có thể thử lại hoặc liên hệ hỗ trợ.
            </div>
          )}

          {(error || errorDesc) && (
            <div className="text-xs text-rose-300">
              {String(errorDesc || error)}
            </div>
          )}

          <p className="text-xs text-slate-400">
            Sau khi bạn chuyển khoản thành công (đúng nội dung ví dụ DH65),
            trạng thái đơn hàng sẽ tự cập nhật.
          </p>
        </div>
      </div>
    </div>
  );
}
