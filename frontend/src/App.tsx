import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Verify from "./pages/Verify";
import UserHome from "./pages/UserHome";
import AppLayout from "./components/AppLayout";
import ProductsPage from "./pages/ProductsPage";
import DetailProducts from "./pages/DetailProducts";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import FavoritesPage from "./pages/FavoritesPage";
import { RequireAdmin } from "./guards";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminCatalogs from "./pages/admin/Catalogs";
import AdminOrders from "./pages/admin/Orders";
import AdminCarts from "./pages/admin/Carts";
import AdminProductImages from "./pages/admin/ProductImages";
import AdminRatings from "./pages/admin/Ratings";

// 👇 THÊM MỚI
import PublicProductsPage from "./pages/PublicProductsPage";
import PublicDetailProduct from "./pages/PublicDetailProduct";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/verify" element={<Verify />} />

      {/* Public xem sản phẩm KHÔNG cần đăng nhập, chỉ xem */}
      <Route path="/browse" element={<PublicProductsPage />} />
      <Route path="/browse/:id" element={<PublicDetailProduct />} />

      {/* Private (có Navbar qua AppLayout) */}
      <Route element={<AppLayout />}>
        <Route path="/user" element={<UserHome />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/settings" element={<div />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<DetailProducts />} />
      </Route>

      {/* ADMIN */}
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="catalogs" element={<AdminCatalogs />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="carts" element={<AdminCarts />} />
          <Route path="product-images" element={<AdminProductImages />} />
          <Route path="ratings" element={<AdminRatings />} />
        </Route>
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
