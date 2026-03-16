// frontend/src/pages/Login.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../lib/auth";

export default function Login() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const prefill = params.get("email");
    if (prefill) setForm((s) => ({ ...s, email: prefill }));
  }, [params]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setIsError(false);
    try {
      const res = await login({ email: form.email, password: form.password });

      setMsg(res.message || "Đăng nhập thành công");

      // Lấy role & username từ response
      const roleRaw = (res?.data?.role || res?.data?.user?.role || "ROLE_USER") as string;
      const role = roleRaw.toUpperCase();
      const username = (res?.data?.username || res?.data?.user?.username || "") as string;

      // Nếu bạn còn dùng role/username ở chỗ khác thì sync sang localStorage cho tiện
      try {
        localStorage.setItem("role", role);
        localStorage.setItem("username", username);
      } catch {}

      if (role.includes("ADMIN")) nav("/admin");
      else nav("/user");
    } catch (err: any) {
      const m =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại";
      setMsg(m);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Nền */}
      <div className="pointer-events-none absolute inset-0 bg-slate-950" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] background-image:radial-gradient(#ffffff_1px,transparent_1px) background-size:18px_18px" />

      {/* Nội dung */}
      <div className="relative flex min-h-screen flex-col items-center">
        {/* Logo */}
        <header className="w-full max-w-6xl px-4 py-8">
          <h1 className="text-center text-3xl font-semibold tracking-tight text-white">
            <span className="bg-linear-to-r from-emerald-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              ShopHub
            </span>
          </h1>
        </header>

        <main className="w-full max-w-4xl px-4 pb-24">
          <div className="mx-auto max-w-xl rounded-2xl border border-white/15 bg-white/10 p-0 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="p-6 md:p-8">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold text-white">Đăng nhập</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Nhập thông tin để truy cập tài khoản của bạn
                </p>

                <form onSubmit={onSubmit} className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-200">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="ban@example.com"
                      value={form.email}
                      onChange={onChange}
                      required
                      className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-slate-200">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={onChange}
                        required
                        className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 pr-10 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white transition"
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {msg && (
                    <p className={`text-sm ${isError ? "text-rose-400" : "text-emerald-300"}`}>
                      {msg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-900/30 transition hover:brightness-110 disabled:opacity-60"
                  >
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </button>

                  <div className="text-center text-sm">
                    <Link to="/forgot" className="text-slate-200 hover:underline">
                      Quên mật khẩu?
                    </Link>
                  </div>
                </form>

                <div className="mt-4 text-center text-sm text-slate-300">
                  Chưa có tài khoản?{" "}
                  <Link to="/register" className="text-white hover:underline">
                    Đăng ký
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-auto w-full px-4 pb-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} ShopHub
        </footer>
      </div>
    </div>
  );
}
