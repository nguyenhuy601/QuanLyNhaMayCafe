const normalizeStatusKey = (value = "") =>
  value
    .toString()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const STATUS_DICTIONARY = {
  "cho duyet": "Chờ duyệt",
  "chua duyet": "Chờ duyệt",
  "dang cho duyet": "Chờ duyệt",
  pending: "Chờ duyệt",
  "cho phe duyet": "Chờ duyệt",

  "da duyet": "Đã duyệt",
  approved: "Đã duyệt",
  complete: "Đã duyệt",
  completed: "Đã duyệt",
  "hoan thanh": "Đã duyệt",

  "dang giao": "Đang giao",
  shipping: "Đang giao",
  delivering: "Đang giao",

  "tu choi": "Từ chối",
  rejected: "Từ chối",
  reject: "Từ chối",
  "da tu choi": "Từ chối",

  "da huy": "Đã hủy",
  cancelled: "Đã hủy",
  cancel: "Đã hủy",
  huy: "Đã hủy",

  draft: "Nháp",
  nhap: "Nháp",
};

export const toVietnameseStatus = (value = "") => {
  const key = normalizeStatusKey(value);
  return STATUS_DICTIONARY[key] || value || "";
};

export { normalizeStatusKey };

