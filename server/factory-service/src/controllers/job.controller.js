const Job = require("../models/Job");

// Helper: xác định nhóm sản phẩm dựa trên tên công việc / mô tả
const detectNhomSanPham = (jobLike) => {
  const text = `${jobLike.tenCongViec || ""} ${jobLike.moTa || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (text.includes("hoa tan")) {
    return "hoatan";
  }
  if (text.includes("rang xay")) {
    return "rangxay";
  }
  // Mặc định: nhóm hạt
  return "hat";
};

// Lấy danh sách công việc
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy chi tiết 1 công việc
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Không tìm thấy công việc" });
    }
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo mới công việc
// Hỗ trợ cả:
// - Body là 1 object:  { tenCongViec, soLuongNhanVien, listNhanVien, to, moTa, thoiGianBatDau, thoiGianKetThuc }
// - Body là 1 mảng các object JSON như trên để tạo hàng loạt
exports.createJob = async (req, res) => {
  try {
    const body = req.body;

    // Trường hợp tạo nhiều job cùng lúc: req.body là mảng
    if (Array.isArray(body)) {
      const payloads = body.map((item) => {
        const payload = { ...item };

        if (!payload.soLuongNhanVien && Array.isArray(payload.listNhanVien)) {
          payload.soLuongNhanVien = payload.listNhanVien.length;
        }

        // Nếu chưa set nhomSanPham, tự động phân loại theo nội dung
        if (!payload.nhomSanPham) {
          payload.nhomSanPham = detectNhomSanPham(payload);
        }

        return payload;
      });

      const jobs = await Job.insertMany(payloads);
      return res
        .status(201)
        .json({ message: "Tạo danh sách công việc thành công", jobs });
    }

    // Trường hợp tạo 1 job đơn lẻ: req.body là object
    const payload = { ...body };

    // Khi tạo mới, cho phép bỏ trống listNhanVien và soLuongNhanVien => giữ mặc định 0
    // Nếu có gửi kèm listNhanVien ngay từ đầu thì cũng có thể dùng luôn
    if (!payload.soLuongNhanVien && Array.isArray(payload.listNhanVien)) {
      payload.soLuongNhanVien = payload.listNhanVien.length;
    }

    // Nếu chưa set nhomSanPham, tự động phân loại
    if (!payload.nhomSanPham) {
      payload.nhomSanPham = detectNhomSanPham(payload);
    }

    const job = await Job.create(payload);
    res.status(201).json({ message: "Tạo công việc thành công", job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật công việc
exports.updateJob = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (Array.isArray(payload.listNhanVien) && !payload.soLuongNhanVien) {
      payload.soLuongNhanVien = payload.listNhanVien.length;
    }

    const job = await Job.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });

    if (!job) {
      return res.status(404).json({ message: "Không tìm thấy công việc" });
    }

    res.status(200).json({ message: "Cập nhật công việc thành công", job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa công việc
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Không tìm thấy công việc" });
    }
    res.status(200).json({ message: "Đã xóa công việc" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


