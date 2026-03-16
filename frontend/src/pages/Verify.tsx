import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resendVerify, verifyOtp } from "../lib/auth";

export default function Verify() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string>(""); // tổng hợp từ 6 ô
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // refs cho 6 input
  const inputsRef = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  useEffect(() => {
    const raw = params.get("email") || "";
    setEmail(decodeURIComponent(raw).trim());
  }, [params]);

  // tiện: sync 6 ô theo state otp
  const cells = Array.from({ length: 6 }).map((_, i) => otp[i] || "");

  function setCell(index: number, char: string) {
    const clean = char.replace(/[^A-Za-z0-9]/g, "");
    if (!clean) return;

    const arr = otp.split("");
    arr[index] = clean[0]; // chỉ 1 ký tự
    const next = arr.join("").padEnd(6, "").slice(0, 6);
    setOtp(next);

    // focus ô tiếp theo
    if (index < 5) inputsRef.current[index + 1]?.focus();
  }

  function onChangeCell(e: React.ChangeEvent<HTMLInputElement>, i: number) {
    const val = e.target.value;
    if (val.length > 1) {
      // người dùng dán nhiều ký tự vào 1 ô
      onPasteCells(val, i);
      return;
    }
    if (val === "") {
      // xóa
      const arr = otp.split("");
      arr[i] = "";
      setOtp(arr.join(""));
      return;
    }
    setCell(i, val);
  }

  function onKeyDownCell(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key === "Backspace" && !cells[i] && i > 0) {
      // nếu đang rỗng và backspace -> lùi focus
      inputsRef.current[i - 1]?.focus();
      const arr = otp.split("");
      arr[i - 1] = "";
      setOtp(arr.join(""));
    }
    if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputsRef.current[i + 1]?.focus();
  }

  function onPasteCells(raw: string, startIdx = 0) {
    const only = raw.replace(/[^A-Za-z0-9]/g, "");
    if (!only) return;
    const arr = otp.split("");
    for (let k = 0; k < 6 - startIdx && k < only.length; k++) {
      arr[startIdx + k] = only[k];
    }
    const next = arr.join("").slice(0, 6);
    setOtp(next);
    // focus ô cuối cùng có ký tự
    const last = Math.min(startIdx + only.length - 1, 5);
    inputsRef.current[last]?.focus();
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setIsError(false);
    try {
      const emailTrim = email.trim();
      const otpTrim = otp.trim().replace(/[^A-Za-z0-9]/g, "");

      if (!emailTrim) throw new Error("Thiếu email.");
      if (!/^[A-Za-z0-9]{6}$/.test(otpTrim)) {
        throw new Error("OTP gồm 6 ký tự A–Z, a–z, 0–9.");
      }

      // khớp backend: input_otp
      const res = await verifyOtp({ email: emailTrim, input_otp: otpTrim });

      if (res.data === true) {
        setMsg("✅ Xác minh thành công. Đang chuyển hướng đăng nhập...");
        setTimeout(() => nav("/login?email=" + encodeURIComponent(emailTrim)), 1000);
      } else {
        setMsg(res.message || "❌ OTP không đúng hoặc đã hết hiệu lực. Hãy dùng mã mới nhất trong email.");
        setIsError(true);
      }
    } catch (err: any) {
      const raw =
        err?.response?.data?.message || err?.response?.data || err?.message || "";
      if (typeof raw === "string" && raw.includes("Row was updated or deleted")) {
        setMsg("⚠️ OTP này đã bị thay thế hoặc hết hiệu lực (vừa resend). Bấm 'Gửi lại OTP' để nhận mã mới.");
      } else {
        setMsg(String(raw || "Có lỗi xảy ra"));
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    try {
      setResending(true);
      setMsg(null);
      setIsError(false);
      await resendVerify({ email: email.trim() });
      setMsg("📩 Đã gửi lại OTP. Vui lòng dùng đúng mã mới nhất trong email.");
      setOtp("");
      inputsRef.current[0]?.focus();
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
                <h2 className="text-lg font-semibold text-white">Xác minh tài khoản</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Chúng tôi đã gửi mã OTP đến email dưới đây. Nhập đúng 6 ký tự để hoàn tất xác minh.
                </p>

                <form onSubmit={onVerify} className="mt-5 space-y-5">
                  {/* Email (readonly) */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-200">Email</label>
                    <input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                      title={email}
                    />
                  </div>

                  {/* OTP 6 ô */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Mã OTP</label>
                    <div className="flex items-center gap-2">
                      {cells.map((c, i) => (
                        <input
  key={i}
  // trước: ref={(el) => (inputsRef.current[i] = el)}
  ref={(el) => { inputsRef.current[i] = el; }}  // <- có dấu ngoặc nhọn, không return gì
  value={c}
  onChange={(e) => onChangeCell(e, i)}
  onKeyDown={(e) => onKeyDownCell(e, i)}
  onPaste={(e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    onPasteCells(text, i);
  }}
  inputMode="text"
  autoCapitalize="off"
  autoCorrect="off"
  spellCheck={false}
  maxLength={1}
  className="h-12 w-12 text-center text-lg tracking-widest rounded-lg border border-white/15 bg-white/10 text-white outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
/>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">Gồm 6 ký tự A–Z, a–z, 0–9.</p>
                  </div>

                  {msg && (
                    <p className={`text-sm ${isError ? "text-rose-400" : "text-emerald-300"}`}>
                      {msg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.replace(/[^A-Za-z0-9]/g, "").length !== 6}
                    className="w-full rounded-lg bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-900/30 transition hover:brightness-110 disabled:opacity-60"
                  >
                    {loading ? "Đang xác minh..." : "Xác minh"}
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
