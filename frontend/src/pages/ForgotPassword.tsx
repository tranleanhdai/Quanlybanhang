import { useState } from "react";
import { requestPasswordReset, resendPasswordReset } from "../lib/auth";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setIsError(false);
    try {
      const res = await requestPasswordReset({ email: email.trim() });
      setMsg(res.message || "Đã gửi OTP đặt lại mật khẩu vào email.");
      setTimeout(() => nav("/reset?email=" + encodeURIComponent(email.trim())), 600);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || err.message || "Không gửi được OTP");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setResending(true);
    setIsError(false);
    try {
      const res = await resendPasswordReset({ email: email.trim() });
      setMsg(res.message || "Đã gửi lại OTP");
    } catch (err: any) {
      setMsg(err?.response?.data?.message || err.message || "Không gửi lại được OTP");
      setIsError(true);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Nền tối + glow + grid */}
      <div className="pointer-events-none absolute inset-0 bg-slate-950" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] background-image:radial-gradient(#ffffff_1px,transparent_1px) background-size:18px_18px" />

      {/* Nội dung */}
      <div className="relative flex min-h-screen flex-col items-center">
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
                <h2 className="text-lg font-semibold text-white">Quên mật khẩu</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Nhập email để nhận OTP đặt lại mật khẩu.
                </p>

                <form onSubmit={onSubmit} className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-200">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="ban@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                    />
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
                    {loading ? "Đang gửi..." : "Gửi OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={onResend}
                    disabled={!email || resending}
                    className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-white/15 transition disabled:opacity-60"
                  >
                    {resending ? "Đang gửi lại..." : "Gửi lại OTP"}
                  </button>

                  <div className="text-center text-sm text-slate-300">
                    Nhớ mật khẩu rồi?{" "}
                    <Link to="/login" className="text-white hover:underline">
                      Đăng nhập
                    </Link>
                  </div>
                </form>
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
