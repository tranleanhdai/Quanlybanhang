// frontend/src/pages/admin/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { DashboardAPI, UserAPI } from "../../lib/adminApi";
import type { DashboardStats, User } from "../../lib/adminApi";
import { Input } from "../../components/ui/input";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const s = await DashboardAPI.stats();
        setStats(s);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoadingStats(false);
      }
    };

    const loadUsers = async () => {
      try {
        const us = await UserAPI.list();
        setUsers(us);
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadStats();
    loadUsers();
  }, []);

  const cards = [
    { label: "Users", value: stats?.users?.toString() },
    { label: "Orders", value: stats?.orders?.toString() },
    {
      label: "Revenue",
      value:
        stats != null
          ? stats.revenue.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })
          : undefined,
    },
    { label: "Products", value: stats?.products?.toString() },
  ];

  const filteredUsers = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((u) => {
      const name = u.name?.toLowerCase() ?? "";
      const email = u.email?.toLowerCase() ?? "";
      return name.includes(keyword) || email.includes(keyword);
    });
  }, [users, q]);

  const usersToShow = useMemo(() => {
    return [...filteredUsers]
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
      .slice(0, 10);
  }, [filteredUsers]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      {/* 4 ô stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="p-5 rounded-2xl bg-white border shadow-sm"
          >
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className="mt-1 text-2xl font-semibold">
              {loadingStats ? "…" : c.value ?? "0"}
            </div>
          </div>
        ))}
      </div>

      {/* Danh sách Users */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Users</h2>

          {/* Ô tìm kiếm rõ hơn */}
          <Input
            className="max-w-xs h-9 px-3 border border-gray-300 bg-white text-sm placeholder:text-gray-600 shadow-sm"
            placeholder="Tìm theo tên hoặc email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  ID
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Email
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Name
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Đang tải người dùng…
                  </td>
                </tr>
              ) : usersToShow.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Không có người dùng nào.
                  </td>
                </tr>
              ) : (
                usersToShow.map((u) => (
                  <tr key={u.id} className="border-t last:border-b">
                    <td className="px-4 py-2">{u.id}</td>
                    <td className="px-4 py-2">{u.email ?? "—"}</td>
                    <td className="px-4 py-2">{u.name ?? "—"}</td>
                    <td className="px-4 py-2 uppercase text-xs text-gray-500">
                      {u.role ?? "USER"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
