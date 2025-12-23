import { toVietnameseStatus } from "../../../utils/statusMapper";

// Utility helpers to normalize objects returned from director endpoints
// so the UI can rely on consistent property names regardless of backend shape.

const getSafeDate = (value) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().split("T")[0];
  } catch {
    return value;
  }
};

export async function enrichOrderData(order) {
  if (!order) return null;

  const customerName =
    order.customerName ||
    order.khachHang?.tenKH ||
    order.customer?.name ||
    order.customer?.fullName ||
    "Khách hàng";

  const customerPhone =
    order.customerPhone ||
    order.khachHang?.soDienThoai ||
    order.customer?.phone ||
    order.phone ||
    "";

  const chiTiet = Array.isArray(order.chiTiet)
    ? order.chiTiet.map((item) => ({
        productName:
          item.productName ||
          item.sanPham?.tenSP ||
          item.sanPham?.name ||
          item.tenSP ||
          "Sản phẩm",
        soLuong: item.soLuong ?? item.quantity ?? 0,
        donVi: item.donVi !== null && item.donVi !== undefined ? item.donVi : null, // Giữ nguyên null nếu không có để hiển thị "null"
        loaiTui: item.loaiTui || null, // Lưu loaiTui để hiển thị "Hộp" khi loaiTui = "hop"
        donGia: item.donGia ?? item.price ?? 0,
      }))
    : [];

  return {
    ...order,
    customerName,
    customerPhone,
    chiTiet,
    trangThai: toVietnameseStatus(order.trangThai),
  };
}

export async function enrichPlanData(plan) {
  if (!plan) return null;

  const productName =
    plan.productName ||
    plan.product?.tenSP ||
    plan.product?.name ||
    plan.sanPham?.tenSP ||
    plan.sanPham?.tenSanPham ||
    "Sản phẩm";

  const materialName =
    plan.materialName ||
    plan.material?.tenNguyenLieu ||
    plan.material?.name ||
    plan.nguyenLieu?.tenNguyenLieu ||
    plan.nvlCanThiet?.[0]?.tenNVL ||
    "Nguyên liệu";

  const workshopName =
    plan.workshopName ||
    plan.workshop?.name ||
    plan.xuong?.tenXuong ||
    plan.workshop ||
    plan.xuongPhuTrach ||
    "Xưởng";

  const soLuongCanSanXuat =
    plan.soLuongCanSanXuat ??
    plan.soLuong ??
    plan.quantity ??
    plan.chiTiet?.soLuong ??
    0;

  const soLuongBaoBi = plan.soLuongBaoBi ?? 0;
  const soLuongTemNhan = plan.soLuongTemNhan ?? 0;

  const startDate = getSafeDate(
    plan.startDate ||
      plan.ngayBatDau ||
      plan.thoiGian?.start ||
      plan.ngayBD ||
      plan.ngayBatDauDuKien
  );
  const endDate = getSafeDate(
    plan.endDate ||
      plan.ngayKetThuc ||
      plan.thoiGian?.end ||
      plan.ngayKT ||
      plan.ngayKetThucDuKien
  );

  return {
    ...plan,
    productName,
    materialName,
    workshopName,
    soLuongCanSanXuat,
    soLuongBaoBi,
    soLuongTemNhan,
    startDate,
    endDate,
    trangThai: toVietnameseStatus(plan.trangThai),
  };
}

