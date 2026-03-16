import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { getAuthUser, logout } from "../../lib/auth";

const items = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/carts", label: "Carts" },
  { to: "/admin/product-images", label: "Product Images" },
  { to: "/admin/ratings", label: "Ratings" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const role = (user?.role || "unknown").toString();

  const handleLogout = () => {
    // Xóa token + user trong sessionStorage (và dọn token cũ trong localStorage)
    logout();

    // Điều hướng về trang login (hoặc "/")
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen border-r bg-white">
          <div className="p-4 font-bold text-lg">Admin Panel</div>
          <nav className="px-2 space-y-1">
            {items.map(({ to, label, end }) => (
              <NavLink
                key={to}
                end={end}
                to={to}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg transition ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "hover:bg-gray-100 text-gray-800"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-white flex items-center justify-between px-4">
            <div className="font-semibold">Admin</div>

            <div className="flex items-center gap-4 text-sm text-gray-700">
              <span className="hidden sm:block">
                Role: {role}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-700 transition"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
