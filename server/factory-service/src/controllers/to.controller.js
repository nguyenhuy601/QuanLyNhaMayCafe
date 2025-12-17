const ToSanXuat = require("../models/ToSanXuat");

/**
 * Lấy danh sách tất cả tổ sản xuất
 */
exports.getTos = async (req, res) => {
  try {
    const { xuongId, trangThai, nhomSanPham, nguyenLieu } = req.query;
    
    const filter = {};
    if (xuongId) {
      filter.$or = [
        { xuong: xuongId },
        { "xuongInfo.id": xuongId },
      ];
    }
    if (trangThai) {
      filter.trangThai = trangThai;
    }
    if (nhomSanPham) {
      filter.nhomSanPham = nhomSanPham;
    }
    if (nguyenLieu) {
      filter.nguyenLieu = nguyenLieu;
    }

    const tos = await ToSanXuat.find(filter)
      .sort({ createdAt: -1 });
    
    // Nếu tổ chưa có nhomSanPham, tự động suy ra từ xuongInfo
    const tosWithAutoDetected = tos.map(to => {
      const toObj = to.toObject ? to.toObject() : to;
      
      // Nếu chưa có nhomSanPham, tự động suy ra
      if (!toObj.nhomSanPham || toObj.nhomSanPham === "khac") {
        if (toObj.xuongInfo && toObj.xuongInfo.tenXuong) {
          const tenXuong = (toObj.xuongInfo.tenXuong || "").toLowerCase();
          
          if (tenXuong.includes("hòa tan") || tenXuong.includes("hoa tan")) {
            toObj.nhomSanPham = "hoatan";
          } else if (tenXuong.includes("rang xay") || tenXuong.includes("rangxay") || 
                     tenXuong.includes("arabica") || tenXuong.includes("robusta") || 
                     tenXuong.includes("civet")) {
            toObj.nhomSanPham = "rangxay";
          }
          
          // Tự động suy ra nguyenLieu
          if (!toObj.nguyenLieu) {
            if (tenXuong.includes("arabica")) {
              toObj.nguyenLieu = "arabica";
            } else if (tenXuong.includes("robusta")) {
              toObj.nguyenLieu = "robusta";
            } else if (tenXuong.includes("civet") || tenXuong.includes("chồn") || tenXuong.includes("chon")) {
              toObj.nguyenLieu = "chon";
            }
          }
        }
      }
      
      return toObj;
    });

    // =============================
    // Lọc theo xưởng trưởng (nếu có)
    // =============================
    let result = tosWithAutoDetected;

    try {
      if (
        req.user &&
        req.user.role &&
        Array.isArray(req.user.sanPhamPhuTrach) &&
        req.user.sanPhamPhuTrach.length > 0
      ) {
        const normalize = (str = "") =>
          str
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "");

        const roleNorm = normalize(req.user.role);
        if (roleNorm.includes("xuongtruong")) {
          const products = req.user.sanPhamPhuTrach.map((sp) => {
            const name = normalize(sp.tenSP || sp.maSP || "");
            const p = {};
            if (name.includes("rangxay")) p.nhom = "rangxay";
            if (name.includes("hoatan")) p.nhom = "hoatan";
            if (name.includes("arabica")) p.nl = "arabica";
            if (name.includes("robusta")) p.nl = "robusta";
            if (name.includes("civet") || name.includes("chon")) p.nl = "chon";
            p.raw = name;
            return p;
          });

          const visible = result.filter((to) => {
            const teamNhom = to.nhomSanPham;
            const teamNL = to.nguyenLieu;

            return products.some((p) => {
              if (!p.nhom && !p.nl) return false;
              if (!teamNhom) return false;

              const matchNhom = p.nhom ? teamNhom === p.nhom : true;

              let matchNL;
              if (!teamNL || teamNL === "") {
                // tổ không phân loại nguyên liệu -> chỉ cần khớp theo nhóm sản phẩm
                matchNL = true;
              } else {
                matchNL = p.nl ? teamNL === p.nl : true;
              }

              return matchNhom && matchNL;
            });
          });

          // Nếu lọc ra được ít nhất 1 tổ thì dùng kết quả đã lọc,
          // nếu không thì giữ nguyên (tránh trả mảng rỗng do logic chưa khớp)
          if (visible.length > 0) {
            result = visible;
          }
        }
      }
    } catch (filterErr) {
      console.warn("⚠️ [factory-service] Error when filtering teams by xuongtruong:", filterErr.message);
    }
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Lấy chi tiết 1 tổ sản xuất theo ID
 */
exports.getToById = async (req, res) => {
  try {
    const to = await ToSanXuat.findById(req.params.id);
    
    if (!to) {
      return res.status(404).json({ message: "Không tìm thấy tổ sản xuất" });
    }
    
    res.status(200).json(to);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Tạo mới tổ sản xuất
 * Hỗ trợ cả:
 * - Body là 1 object: { maTo, tenTo, toTruong, thanhVien, moTa, xuong, xuongInfo, trangThai }
 * - Body là 1 mảng các object JSON như trên để tạo hàng loạt
 */
exports.createTo = async (req, res) => {
  try {
    const body = req.body;

    // Trường hợp tạo nhiều tổ cùng lúc: req.body là mảng
    if (Array.isArray(body)) {
      const payloads = body.map((item) => {
        const payload = { ...item };

        // Validate required fields
        if (!payload.tenTo) {
          throw new Error("Tên tổ là bắt buộc");
        }

        // Tạo mã tổ tự động nếu chưa có (insertMany không trigger pre-save hook)
        if (!payload.maTo) {
          const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
          payload.maTo = `TO-${randomCode}`;
        }

        // Nếu có xuongInfo nhưng chưa có xuong ObjectId, giữ nguyên xuongInfo
        if (payload.xuongInfo && !payload.xuong) {
          // Giữ nguyên xuongInfo
        }

        return payload;
      });

      const tos = await ToSanXuat.insertMany(payloads);
      
      return res.status(201).json({ 
        message: `Tạo ${tos.length} tổ sản xuất thành công`, 
        tos 
      });
    }

    // Trường hợp tạo 1 tổ đơn lẻ: req.body là object
    const payload = { ...body };

    // Validate required fields
    if (!payload.tenTo) {
      return res.status(400).json({ message: "Tên tổ là bắt buộc" });
    }

    // Nếu có xuongInfo nhưng chưa có xuong ObjectId, lưu vào xuongInfo
    if (payload.xuongInfo && !payload.xuong) {
      // Giữ nguyên xuongInfo
    }

    const to = await ToSanXuat.create(payload);
    
    res.status(201).json({ 
      message: "Tạo tổ sản xuất thành công", 
      to 
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Mã tổ đã tồn tại", 
        error: err.message 
      });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Cập nhật tổ sản xuất
 */
exports.updateTo = async (req, res) => {
  try {
    const payload = { ...req.body };
    
    const to = await ToSanXuat.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!to) {
      return res.status(404).json({ message: "Không tìm thấy tổ sản xuất" });
    }

    res.status(200).json({ 
      message: "Cập nhật tổ sản xuất thành công", 
      to 
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Mã tổ đã tồn tại", 
        error: err.message 
      });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Xóa tổ sản xuất (soft delete - đổi trạng thái)
 */
exports.deleteTo = async (req, res) => {
  try {
    const to = await ToSanXuat.findByIdAndUpdate(
      req.params.id,
      { trangThai: "Inactive" },
      { new: true }
    );

    if (!to) {
      return res.status(404).json({ message: "Không tìm thấy tổ sản xuất" });
    }

    res.status(200).json({ 
      message: "Đã vô hiệu hóa tổ sản xuất", 
      to 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Xóa vĩnh viễn tổ sản xuất (hard delete)
 */
exports.hardDeleteTo = async (req, res) => {
  try {
    const to = await ToSanXuat.findByIdAndDelete(req.params.id);

    if (!to) {
      return res.status(404).json({ message: "Không tìm thấy tổ sản xuất" });
    }

    res.status(200).json({ 
      message: "Đã xóa tổ sản xuất vĩnh viễn" 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Thêm tổ trưởng vào tổ
 * Body: { id, hoTen, email, role, maNV }
 */
exports.addToTruong = async (req, res) => {
  try {
    const { id, hoTen, email, role, maNV } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: "ID tổ trưởng là bắt buộc" });
    }

    const to = await ToSanXuat.findById(req.params.id);
    if (!to) {
      return res.status(404).json({ message: "Không tìm thấy tổ sản xuất" });
    }

    // 1. Xóa tổ trưởng cũ khỏi tổ hiện tại (nếu có)
    to.toTruong = [];

    // 2. Xóa tổ trưởng này khỏi các tổ khác (đảm bảo mỗi tổ trưởng chỉ ở 1 tổ)
    await ToSanXuat.updateMany(
      { 
        _id: { $ne: req.params.id }, // Loại trừ tổ hiện tại
        "toTruong.id": id 
      },
      { 
        $pull: { toTruong: { id: id } } 
      }
    );

    // 3. Thêm tổ trưởng mới vào tổ hiện tại
    to.toTruong.push({
      id,
      hoTen: hoTen || "",
      email: email || "",
      role: role || "",
      maNV: maNV || "",
    });
    
    await to.save();

    res.status(200).json({ 
      message: "Đã gán tổ trưởng vào tổ", 
      to 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Xóa tổ trưởng khỏi tổ
 * Body: { id } - ID của tổ trưởng cần xóa
 */
exports.removeToTruong = async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: "ID tổ trưởng là bắt buộc" });
    }

    const to = await ToSanXuat.findById(req.params.id);
    if (!to) {
      return res.status(404).json({ message: "Không tìm thấy tổ sản xuất" });
    }

    to.toTruong = to.toTruong.filter(
      (toTruong) => toTruong.id !== id
    );
    await to.save();

    res.status(200).json({ 
      message: "Đã xóa tổ trưởng khỏi tổ", 
      to 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Thêm thành viên vào tổ
 * Body: { id, hoTen, email, role, maNV }
 */
exports.addThanhVien = async (req, res) => {
  try {
    const { id, hoTen, email, role, maNV } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: "ID thành viên là bắt buộc" });
    }

    const to = await ToSanXuat.findById(req.params.id);
    if (!to) {
      return res.status(404).json({ message: "Không tìm thấy tổ sản xuất" });
    }

    // Đảm bảo mỗi công nhân chỉ thuộc 1 tổ:
    // 1) Gỡ thành viên này khỏi các tổ khác (ngoài tổ hiện tại)
    await ToSanXuat.updateMany(
      {
        _id: { $ne: req.params.id },
        "thanhVien.id": id,
      },
      {
        $pull: { thanhVien: { id: id } },
      }
    );

    // Kiểm tra đã có trong danh sách chưa
    const existing = to.thanhVien.find((t) => t.id === id);
    if (!existing) {
      to.thanhVien.push({
        id,
        hoTen: hoTen || "",
        email: email || "",
        role: role || "",
        maNV: maNV || "",
      });
      await to.save();
    }

    res.status(200).json({ 
      message: "Đã thêm thành viên vào tổ", 
      to 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Xóa thành viên khỏi tổ
 * Body: { id } - ID của thành viên cần xóa
 */
exports.removeThanhVien = async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: "ID thành viên là bắt buộc" });
    }

    const to = await ToSanXuat.findById(req.params.id);
    if (!to) {
      return res.status(404).json({ message: "Không tìm thấy tổ sản xuất" });
    }

    to.thanhVien = to.thanhVien.filter(
      (thanhVien) => thanhVien.id !== id
    );
    await to.save();

    res.status(200).json({ 
      message: "Đã xóa thành viên khỏi tổ", 
      to 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

