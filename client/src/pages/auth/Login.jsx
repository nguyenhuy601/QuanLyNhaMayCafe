import React, { useState } from "react";
import { Globe, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";

import authAPI from "../../api/authAPI";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Hàm redirect theo role
  const redirectByRole = (role) => {
    const roleMap = {
      worker: "/worker",
      "công nhân": "/worker",
      director: "/director",
      "giám đốc": "/director",
      qc: "/qc",
      "quality control": "/qc",
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
      // Gọi API login
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng nhập thất bại");
      }

      const data = await response.json();

      // Lưu token và role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      window.userToken = data.token;
      window.userRole = data.role;

      // Redirect theo role
      redirectByRole(data.role);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEF6E4]">
      <div className="w-full max-w-md px-6 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-[#FEF6E4] border-4 border-[#E78C1F] rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="#E78C1F"
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h8m-8 4h6a4 4 0 004-4V8H8v8zm8-8V4H8v4"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Hệ thống Quản lý Nhà máy Cà phê
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            Đăng nhập để truy cập hệ thống
          </p>

          <button className="flex items-center gap-2 mx-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
            <Globe size={16} />
            English
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:border-[#E78C1F] transition">
                <Mail size={18} className="text-gray-400" />
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full py-2 px-2 outline-none text-gray-700 bg-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-1">
                Mật khẩu
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:border-[#E78C1F] transition">
                <Lock size={18} className="text-gray-400" />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full py-2 px-2 outline-none text-gray-700 bg-transparent"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E78C1F] hover:bg-[#d27817] text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
          <p className="text-xs text-gray-600 font-medium mb-2">
            🔐 Chức năng bảo mật
          </p>
          <div className="space-y-1 text-xs text-gray-500">
            <p>✅ Redirect tự động theo role</p>
            <p>✅ Protected routes cho từng role</p>
            <p>✅ Token được lưu an toàn</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;