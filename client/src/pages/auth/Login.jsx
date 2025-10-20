import React from "react";
import { Globe, Mail, Lock } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEF6E4]">
      <div className="w-full max-w-md px-6 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-[#FEF6E4] border-4 border-[#E78C1F] rounded-full p-3">
              {/* Icon ly cà phê */}
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
          <form>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3">
                <Mail size={18} className="text-gray-400" />
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full py-2 px-2 outline-none text-gray-700"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-1">
                Mật khẩu
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3">
                <Lock size={18} className="text-gray-400" />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  className="w-full py-2 px-2 outline-none text-gray-700"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-[#E78C1F] hover:bg-[#d27817] text-white font-medium py-2 rounded-lg transition"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
