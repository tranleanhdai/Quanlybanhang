import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../lib/auth";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [showPwd1, setShowPwd1] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = params.get("email") || "";
    setEmail(decodeURIComponent(raw).trim());
  }, [params]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setIsError(false);
    try {
      const otpTrim = otp.trim();
      if (!/^[A-Za-z0-9]{6}$/.test(otpTrim)) throw new Error("OTP gồm 6 ký tự A-Z, a-z, 0-9");
      if (newPassword.length < 6 || !/[A-Za-z]/.test(newPassword)) {
        throw new Error("Mật khẩu mới tối thiểu 6 ký tự và có ít nhất 1 chữ cái");
      }
      if (newPassword !== retypePassword) throw new Error("Nhập lại mật khẩu không khớp");

      const res = await resetPassword({
        email,
        input_otp: otpTrim, // KHỚP backend
        newPassword,
        retypePassword,
      });

      if (res.data === true) {
        setMsg(res.message || "Đổi mật khẩu thành công. Đăng nhập lại.");
        setTimeout(() => nav("/login?email=" + encodeURIComponent(email)), 700);
      } else {
        setMsg(res.message || "Không đổi được mật khẩu.");
        setIsError(true);
      }
    } catch (err: any) {
      setMsg(err?.response?.data?.message || err.message || "Có lỗi xảy ra");
      setIsError(true);
    } finally {
      setLoading(false);
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
                <h2 className="text-lg font-semibold text-white">Đặt lại mật khẩu</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Nhập OTP đã gửi tới email và đặt mật khẩu mới.
                </p>

                <form onSubmit={onSubmit} className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-200">Email</label>
                    <input
                      id="email"
                      placeholder="ban@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="otp" className="text-sm font-medium text-slate-200">OTP (6 ký tự)</label>
                    <input
                      id="otp"
                      placeholder="VD: A1B2C3"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/[^A-Za-z0-9]/g, ""))
                      }
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent tracking-widest"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium text-slate-200">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showPwd1 ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 pr-10 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd1((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white transition"
                        aria-label={showPwd1 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPwd1 ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">Tối thiểu 6 ký tự và có ít nhất 1 chữ cái.</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="retypePassword" className="text-sm font-medium text-slate-200">
                      Nhập lại mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        id="retypePassword"
                        type={showPwd2 ? "text" : "password"}
                        placeholder="••••••••"
                        value={retypePassword}
                        onChange={(e) => setRetypePassword(e.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 pr-10 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd2((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white transition"
                        aria-label={showPwd2 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPwd2 ? <EyeOff size={18} /> : <Eye size={18} />}
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
                    {loading ? "Đang đổi..." : "Đổi mật khẩu"}
                  </button>

                  <div className="text-center text-sm text-slate-300">
                    Nhớ mật khẩu rồi?{" "}
                    <Link to="/login" className="text-white hover:underline">Đăng nhập</Link>
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
