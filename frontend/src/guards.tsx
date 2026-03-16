// src/guards.tsx
import { Navigate, Outlet } from "react-router-dom";
import { getAuthUser, isLoggedIn } from "./lib/auth";

export function RequireAuth() {
  const loggedIn = isLoggedIn();
  if (!loggedIn) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const loggedIn = isLoggedIn();
  const user = getAuthUser();

  if (!loggedIn || !user) return <Navigate to="/login" replace />;

  const role = (user.role || "").toUpperCase();
  if (!role.includes("ADMIN")) return <Navigate to="/" replace />;

  return <Outlet />;
}
