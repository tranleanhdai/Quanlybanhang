// frontend/src/components/AppLayout.tsx
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, ShoppingCart, LogOut } from "lucide-react";
import { useCart } from "../store/cart";
import { logout } from "../lib/auth";

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { items } = useCart();
  const cartCount = items.length;

  const navItems = [
    { to: "/products", label: "Mua sắm" },
    { to: "/orders", label: "Đơn hàng" },
    { to: "/favorites", label: "Yêu thích" },
    { to: "/settings", label: "Cài đặt" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          
          {/* Logo */}
          <Link to="/user" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-tr from-emerald-500 to-sky-500 text-white shadow-sm">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              ShopHub
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    active
                      ? "text-slate-900 dark:text-slate-50"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Cart + Logout (đã xoá nút ThemeToggle) */}
          <div className="flex items-center gap-3">

            {/* Giỏ hàng */}
            <Link
              to="/cart"
              className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800 sm:inline-flex"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Đăng xuất */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
