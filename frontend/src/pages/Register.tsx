import { useState } from "react";
import { register } from "../lib/auth";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    retypePassword: "",
    birthday: "",
    imageURL: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

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
      // =========== VALIDATE FRONTEND ===========

      if (!form.name.trim()) throw new Error("Tên không được để trống");

      if (!form.email.trim()) throw new Error("Email không được để trống");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) throw new Error("Email không hợp lệ");

      if (!form.birthday) throw new Error("Vui lòng chọn ngày sinh");

      // Check đủ 18 tuổi
      const birthDate = new Date(form.birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const mdiff = today.getMonth() - birthDate.getMonth();
      if (mdiff < 0 || (mdiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) throw new Error("Bạn phải đủ 18 tuổi để đăng ký tài khoản");

      if (!form.password || form.password.length < 6)
        throw new Error("Mật khẩu tối thiểu 6 ký tự");

      if (!/[A-Za-z]/.test(form.password))
        throw new Error("Mật khẩu phải chứa ít nhất 1 chữ cái");

      if (form.password !== form.retypePassword)
        throw new Error("Nhập lại mật khẩu không khớp");

      // Payload
      const payload = {
        ...form,
        role: "USER",
        birthday: form.birthday || null,
      };

      const res = await register(payload);

      setMsg(
        res.message ||
          "Đăng ký thành công. Vui lòng kiểm tra email để lấy OTP xác minh."
      );

      setTimeout(() => {
        nav("/verify?email=" + encodeURIComponent(form.email));
      }, 800);
    } catch (err: any) {
      let raw =
        err?.response?.data?.message ||
        err?.response?.data ||
        err.message ||
        "Có lỗi xảy ra";

      const text = String(raw).toLowerCase();
      let message = String(raw);

      // Case backend sau này trả 409
      if (err?.response?.status === 409) {
        message =
          err?.response?.data?.message ||
          "Email này đã được sử dụng, vui lòng dùng email khác.";
      }
      // Case hiện tại: SQL duplicate key
      else if (
        text.includes("duplicate key") ||
        text.includes("unique index") ||
        text.includes("cannot insert duplicate key row") ||
        text.includes("uk6dotkott2kjsp8vw4d0m25fb7")
      ) {
        message = "Email này đã được sử dụng, vui lòng dùng email khác.";
      }

      setMsg(message);
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

      <div className="relative flex min-h-screen flex-col items-center">
        <header className="w-full max-w-6xl px-4 py-8">
          <h1 className="text-center text-3xl font-semibold tracking-tight text-white">
            <span className="bg-linear-to-r from-emerald-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              ShopHub
            </span>
          </h1>
        </header>

        <main className="w-full max-w-4xl px-4 pb-24">
          <div className="mx-auto max-w-2xl rounded-2xl border border-white/15 bg-white/10 p-0 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="p-6 md:p-8">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold text-white">Tạo tài khoản</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Điền thông tin bên dưới để đăng ký.
                </p>

                <form
                  onSubmit={onSubmit}
                  className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {/* Họ tên */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-200">
                      Họ và tên
                    </label>
                    <input
                      name="name"
                      placeholder="Nguyễn Văn A"
                      value={form.name}
                      onChange={onChange}
                      className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/70"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="ban@example.com"
                      value={form.email}
                      onChange={onChange}
                      className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/70"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Số điện thoại
                    </label>
                    <input
                      name="phone"
                      placeholder="09xx..."
                      value={form.phone}
                      onChange={onChange}
                      className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-200">
                      Địa chỉ
                    </label>
                    <input
                      name="address"
                      placeholder="Số nhà, đường, quận/huyện..."
                      value={form.address}
                      onChange={onChange}
                      className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white"
                    />
                  </div>

                  {/* Birthday */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Ngày sinh
                    </label>
                    <input
                      name="birthday"
                      type="date"
                      value={form.birthday}
                      onChange={onChange}
                      className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white"
                    />
                  </div>

                  {/* Image */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Link ảnh (tùy chọn)
                    </label>
                    <input
                      name="imageURL"
                      placeholder="https://..."
                      value={form.imageURL}
                      onChange={onChange}
                      className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPwd ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={onChange}
                        className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 pr-10 text-sm text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                      >
                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">
                      Tối thiểu 6 ký tự & chứa ít nhất 1 chữ cái.
                    </p>
                  </div>

                  {/* Retype Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Nhập lại mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        name="retypePassword"
                        type={showPwd2 ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.retypePassword}
                        onChange={onChange}
                        className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 pr-10 text-sm text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd2((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                      >
                        {showPwd2 ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  {msg && (
                    <div className="md:col-span-2">
                      <p
                        className={`text-sm ${
                          isError ? "text-rose-400" : "text-emerald-300"
                        }`}
                      >
                        {msg}
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-lg bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:brightness-110 disabled:opacity-60"
                    >
                      {loading ? "Đang xử lý..." : "Đăng ký"}
                    </button>

                    <div className="mt-3 text-center text-sm text-slate-300">
                      Đã có tài khoản?{" "}
                      <Link to="/login" className="text-white hover:underline">
                        Đăng nhập
                      </Link>
                    </div>
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
