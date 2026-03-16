// src/pages/Home.tsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-emerald-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Chào mừng đến với ShopHub
            </h1>
            <p className="text-lg text-slate-300">
              Khám phá các sản phẩm tuyệt vời, quản lý tài khoản của bạn và tận
              hưởng trải nghiệm mua sắm mượt mà.
            </p>
          </div>

          {/* 🔥 Nút xem nhanh sản phẩm – KHÔNG cần đăng nhập */}
          <div className="flex justify-center">
            <Link
              to="/browse"
              className="inline-flex items-center rounded-full bg-linear-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:brightness-110 transition"
            >
              Xem sản phẩm ngay (không cần đăng nhập)
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl">
              <h3 className="text-lg font-semibold mb-2">Đã có tài khoản?</h3>
              <p className="text-sm text-slate-400 mb-4">
                Đăng nhập để xem hồ sơ và đơn hàng của bạn.
              </p>
              <Link
                to="/login"
                className="block w-full rounded-lg bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-medium text-center text-white shadow hover:brightness-110 transition"
              >
                Đăng nhập
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl">
              <h3 className="text-lg font-semibold mb-2">Người mới?</h3>
              <p className="text-sm text-slate-400 mb-4">
                Tạo tài khoản ngay hôm nay để bắt đầu mua sắm.
              </p>
              <Link
                to="/register"
                className="block w-full rounded-lg bg-linear-to-r from-sky-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-center text-white shadow hover:brightness-110 transition"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
