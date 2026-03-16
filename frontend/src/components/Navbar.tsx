import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { logout } from "../lib/auth";

export default function Navbar() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  function signOut() {
    logout();
    nav("/login");
  }

  const baseLink =
    "text-sm font-medium text-slate-300 hover:text-white transition px-3 py-1.5 rounded-md";
  const active = "text-white border-b border-emerald-400/70 pb-1";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <Link
          to="/user"
          className="text-lg font-semibold tracking-tight bg-linear-to-r from-emerald-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent"
        >
          ShopHub
        </Link>

        {/* Mobile menu */}
        <button
          className="md:hidden inline-flex items-center gap-2 rounded-md border border-white/10 px-2 py-1 text-slate-300 hover:bg-white/10"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive ? `${baseLink} ${active}` : baseLink
            }
          >
            Mua sắm
          </NavLink>


          {/* ⭐ NEW: Đơn hàng */}
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              isActive ? `${baseLink} ${active}` : baseLink
            }
          >
            Đơn hàng
          </NavLink>

          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              isActive ? `${baseLink} ${active}` : baseLink
            }
          >
            Yêu thích
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? `${baseLink} ${active}` : baseLink
            }
          >
            Cài đặt
          </NavLink>

          <button
            onClick={signOut}
            className="ml-3 inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <LogOut size={16} /> <span>Đăng xuất</span>
          </button>
        </nav>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-slate-900/80 backdrop-blur-lg">
          <div className="mx-auto max-w-6xl px-4 py-2 flex flex-col space-y-1">
            <Link
              to="/products"
              className={baseLink}
              onClick={() => setOpen(false)}
            >
              Mua sắm
            </Link>

            {/* ⭐ NEW: Mobile Đơn hàng */}
            <Link
              to="/orders"
              className={baseLink}
              onClick={() => setOpen(false)}
            >
              Đơn hàng
            </Link>

            <Link
              to="/favorites"
              className={baseLink}
              onClick={() => setOpen(false)}
            >
              Yêu thích
            </Link>

            <Link
              to="/settings"
              className={baseLink}
              onClick={() => setOpen(false)}
            >
              Cài đặt
            </Link>

            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="inline-flex items-center gap-2 py-2 text-slate-300 hover:text-white"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
