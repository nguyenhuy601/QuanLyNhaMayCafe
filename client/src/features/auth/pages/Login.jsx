import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Mail, Lock, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { loginUser } from "../../../services/UserSlice";
import authAPI from "../../../api/authAPI";
import coffeeBg from "../../../assets/cafe.png";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("vi");

  const isVi = language === "vi";

  const text = {
    title: isVi ? "Đăng nhập hệ thống" : "Sign in to dashboard",
    subtitle: isVi
      ? "Sử dụng tài khoản nội bộ để truy cập bảng điều khiển theo vai trò."
      : "Use your company account to access your role-based dashboard.",
    emailLabel: isVi ? "Email công việc" : "Work email",
    emailPlaceholder: isVi ? "you@coffee-factory.vn" : "you@coffee-factory.com",
    passwordLabel: isVi ? "Mật khẩu" : "Password",
    forgotPassword: isVi ? "Quên mật khẩu?" : "Forgot password?",
    rememberMe: isVi ? "Ghi nhớ đăng nhập trên thiết bị này" : "Remember this device",
    submit: loading
      ? isVi
        ? "Đang đăng nhập..."
        : "Signing in..."
      : isVi
      ? "Đăng nhập"
      : "Sign in",
    heroLine1: isVi
      ? "Quản lý toàn bộ quy trình"
      : "Control the entire production flow",
    heroLine2: isVi
      ? "từ đơn hàng đến sản xuất"
      : "from orders to roasting & packaging",
    heroDesc: isVi
      ? "Theo dõi đơn hàng, kế hoạch sản xuất, chất lượng và kho thành phẩm trên một giao diện trực quan, realtime."
      : "Track orders, production plans, quality and finished goods in a single realtime interface.",
    benefit1: isVi
      ? "Theo dõi tiến độ kế hoạch sản xuất theo thời gian thực"
      : "Monitor production plans in real time",
    benefit2: isVi
      ? "Phê duyệt đơn hàng & kế hoạch ngay trên trình duyệt"
      : "Approve orders and plans right in your browser",
    benefit3: isVi
      ? "Phân quyền theo vai trò: Giám đốc, Kế hoạch, QC, Kho, Xưởng trưởng, Tổ trưởng..."
      : "Role-based access for Director, Planning, QC, Warehouse, Factory Manager, Team Leader...",
    footerLeft: isVi
      ? `© ${new Date().getFullYear()} Coffee Factory MES`
      : `© ${new Date().getFullYear()} Coffee Factory MES`,
    footerRight: isVi
      ? "Phiên bản nội bộ · Bảo mật theo vai trò"
      : "Internal version · Role-based security",
  };

// Redirect by role
  const redirectByRole = (role) => {
    const roleMap = {
      admin: "/admin",
      worker: "/worker",
      director: "/director",
      qc: "/qc",
      plan: "/plan",
      orders: "/orders",
      xuongtruong: "/xuongtruong",
      totruong: "/totruong",
      khonvl: "/warehouse-raw-material",
      khotp: "/khotp",
      warehouseproduct: "/khotp", // Redirect warehouseproduct to khotp
    };

    const path = roleMap[role?.toLowerCase()] || "/login";
    navigate(path, { replace: true });
  };

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Gọi API login từ authAPI.js
      const data = await authAPI.login(email, password);

      // Lưu token và role theo phiên (per-tab) để có thể đăng nhập nhiều tài khoản ở nhiều tab
      if (data.token) {
        sessionStorage.setItem("token", data.token);
        localStorage.setItem("token", data.token); // fallback cho các chỗ cũ nếu cần
        window.userToken = data.token;
      }

      if (data.role) {
        sessionStorage.setItem("role", data.role);
        localStorage.setItem("role", data.role); // fallback
        window.userRole = data.role;
      }

      // Lưu email để dùng sau (để tìm user trong Danh sách nhân sự)
      if (email) {
        sessionStorage.setItem("userEmail", email);
        localStorage.setItem("userEmail", email); // fallback
      }

      // Lưu vào Redux store
      dispatch(loginUser({ 
        user: { id: data.user?.id, email: data.user?.email || email, role: data.role },
        token: data.token 
      }));

      console.log("✅ Login successful, token saved:", !!data.token);
      console.log("🔑 Token stored in:", sessionStorage.getItem("token") ? "sessionStorage" : "localStorage");

      // Redirect theo role
      redirectByRole(data.role);

    } catch (err) {
      const message = err.response?.data?.message || "Có lỗi xảy ra";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#3b2413] via-[#2a160c] to-[#120907] px-4 py-6 overflow-hidden">
      <div className="relative w-full max-w-5xl z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 rounded-3xl overflow-hidden bg-[#1B120C]/80 shadow-2xl border border-amber-900/40 backdrop-blur-xl">
          {/* Cột trái: branding với background ảnh cà phê */}
          <div
            className="hidden md:flex md:col-span-2 flex-col justify-between p-8 text-white bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(15,10,7,0.75), rgba(10,6,4,0.9)), url(${coffeeBg})`,
            }}
          >
            <div>
              <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium tracking-[0.2em] uppercase mb-6 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Nền tảng quản lý nhà máy cà phê
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold leading-snug mb-4">
                {text.heroLine1}
                <span className="block text-[#FBBF77]">{text.heroLine2}</span>
              </h1>

              <p className="text-sm text-amber-100/90 leading-relaxed max-w-sm">
                {text.heroDesc}
              </p>
            </div>

            <div className="mt-10 space-y-4 text-xs text-amber-100/80">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 text-[11px] font-semibold">
                  1
                </span>
                <span>{text.benefit1}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-300 text-[11px] font-semibold">
                  2
                </span>
                <span>{text.benefit2}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/10 text-sky-300 text-[11px] font-semibold">
                  3
                </span>
                <span>{text.benefit3}</span>
              </div>
            </div>
          </div>

          {/* Cột phải: form đăng nhập */}
          <div className="md:col-span-3 bg-[#FDF7F1]/95 backdrop-blur-xl px-6 py-8 sm:px-10 sm:py-10">
            {/* Logo + ngôn ngữ */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#C47133] to-[#F59E0B] flex items-center justify-center shadow-md shadow-amber-500/40">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth={1.6}
                    className="w-6 h-6"
                  >
                    <path
                      d="M3 10.5C3 7.462 5.462 5 8.5 5h7A5.5 5.5 0 0 1 21 10.5c0 3.038-2.462 5.5-5.5 5.5H12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 19.5C6 17.567 7.567 16 9.5 16h1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.23em] uppercase text-[#FBBF77]">
                    Coffee Factory
                  </p>
                  <p className="text-sm font-semibold text-[#1F2933]">
                    Manufacturing Control Center
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLanguage((prev) => (prev === "vi" ? "en" : "vi"))}
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-200/80 px-3 py-1.5 text-[11px] font-medium text-amber-800 hover:bg-amber-50/70 transition select-none bg-amber-50/40"
              >
                <Globe size={14} />
                {isVi ? "English" : "Tiếng Việt"}
              </button>
            </div>

            {/* Tiêu đề */}
            <div className="mb-7">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#3B2413] tracking-tight">
                {text.title}
              </h2>
              <p className="mt-1.5 text-sm text-[#6B4B33]">
                {text.subtitle}
              </p>
            </div>

            {/* Thông báo lỗi */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 flex items-start gap-2.5">
                <AlertCircle size={18} className="mt-0.5 text-red-500" />
                <p className="text-xs sm:text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleLogin}>
              {/* Email */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-medium text-[#4B321C]">
                  <span>{text.emailLabel}</span>
                </label>
                <div className="flex items-center rounded-xl border border-amber-100 bg-[#FFF8F1] px-3 py-2.5 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 transition">
                  <Mail size={18} className="text-amber-500" />
                  <input
                    type="email"
                    placeholder={text.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="ml-2 w-full border-none bg-transparent text-sm text-[#3B2413] placeholder:text-amber-300 outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-[#4B321C]">
                  <span>{text.passwordLabel}</span>
                </div>
                <div className="flex items-center rounded-xl border border-amber-100 bg-[#FFF8F1] px-3 py-2.5 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 transition">
                  <Lock size={18} className="text-amber-500" />
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="ml-2 w-full border-none bg-transparent text-sm text-[#3B2413] placeholder:text-amber-300 outline-none"
                  />
                </div>
              </div>

              {/* Ghi nhớ / nút */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    disabled={loading}
                    className="h-3.5 w-3.5 rounded border-amber-300 text-amber-700 focus:ring-amber-500"
                  />
                  <label
                    htmlFor="remember"
                    className="text-xs text-[#6B4B33] select-none"
                  >
                    {text.rememberMe}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#C47133] via-[#E18833] to-[#F59E0B] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/40 hover:from-[#B36225] hover:via-[#D97706] hover:to-[#F97316] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {text.submit}
              </button>
            </form>

            {/* Footer nhỏ */}
            <div className="mt-6 text-[11px] text-[#93735A] flex items-center justify-between">
              <span>{text.footerLeft}</span>
              <span>{text.footerRight}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;