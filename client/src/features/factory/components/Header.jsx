import React, { useState } from "react";
import { Search, Bell, Settings, User } from "lucide-react";
import useCurrentUser from "../../../hooks/useCurrentUser";

// Parse thông tin sản phẩm phụ trách từ tenSP / maSP
const parseProductInfo = (nameRaw = "") => {
  if (!nameRaw) return null;
  const name = nameRaw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  let nhom = "khac";
  if (name.includes("hoa tan")) nhom = "hoatan";
  else if (name.includes("rang xay")) nhom = "rangxay";

  let nguyenLieu = "";
  if (name.includes("robusta")) nguyenLieu = "Robusta";
  else if (name.includes("arabica")) nguyenLieu = "Arabica";
  else if (name.includes("chon")) nguyenLieu = "Chồn";

  const nhomLabel =
    nhom === "hoatan" ? "Hòa tan" : nhom === "rangxay" ? "Rang xay" : "";

  return {
    nhomSanPham: nhom,
    nguyenLieu,
    label:
      nguyenLieu && nhomLabel ? `${nguyenLieu} · ${nhomLabel}` : nguyenLieu || nhomLabel,
  };
};

export default function Header() {
  const { currentUser, loading } = useCurrentUser();
  // Ưu tiên sessionStorage để tránh bị ảnh hưởng bởi tab khác
  const role = (
    sessionStorage.getItem("role") ||
    localStorage.getItem("role") ||
    ""
  ).toLowerCase();

  // Lấy sản phẩm phụ trách từ JWT (nếu có) và phân tích thông tin
  let managedProductsLabel = "";
  try {
    const token =
      sessionStorage.getItem("token") ||
      localStorage.getItem("token") ||
      window.userToken;
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const sanPhamPhuTrach = payload.sanPhamPhuTrach || [];
      const first = sanPhamPhuTrach[0];
      const name = first?.tenSP || first?.maSP || first?.productId;
      const parsed = parseProductInfo(name);
      managedProductsLabel = parsed?.label || "";
    }
  } catch (e) {
    // ignore decode errors
  }

  const roleLabel =
    role === "xuongtruong"
      ? "Xưởng trưởng"
      : role === "totruong"
      ? "Tổ trưởng"
      : role || "Vai trò";

  return (
    <header className="bg-gradient-to-r from-amber-700 to-amber-800 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3 bg-amber-600/60 px-4 py-2 rounded-xl w-full max-w-md">
        <Search size={18} className="text-white" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="bg-transparent outline-none text-sm w-full placeholder:text-amber-100/70"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-amber-600/60 transition-colors">
          <Bell size={20} />
        </button>
        <button className="p-2 rounded-lg hover:bg-amber-600/60 transition-colors">
          <Settings size={20} />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-amber-600">
          <div className="w-11 h-11 bg-amber-500 rounded-full flex items-center justify-center">
            <User size={22} />
          </div>
          <div className="leading-tight">
            <p className="font-semibold truncate max-w-[220px]">
              {loading ? (
                "Đang tải..."
              ) : (
                currentUser?.hoTen || currentUser?.email || "Your Name"
              )}
            </p>
            <p className="text-xs text-amber-200 max-w-[260px] truncate" title={managedProductsLabel ? `${roleLabel} · Phụ trách: ${managedProductsLabel}` : roleLabel}>
              {roleLabel}
              {managedProductsLabel ? ` · Phụ trách: ${managedProductsLabel}` : ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
