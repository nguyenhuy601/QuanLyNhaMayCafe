const XuongSanXuat = require("../models/XuongSanXuat");

/**
 * Lấy danh sách tất cả xưởng sản xuất
 */
exports.getXuongs = async (req, res) => {
  try {
    const { trangThai } = req.query;
    
    const filter = {};
    if (trangThai) {
      filter.trangThai = trangThai;
    }

    const xuongs = await XuongSanXuat.find(filter)
      .populate("danhSachTo", "maTo tenTo")
      .sort({ createdAt: -1 });
    
    // Loại bỏ trùng lặp dựa trên _id hoặc tenXuong
    const uniqueXuongs = [];
    const seenIds = new Map();
    const seenNames = new Map();
    
    xuongs.forEach((xuong) => {
      const id = xuong._id?.toString();
      const name = xuong.tenXuong?.trim();
      
      // Ưu tiên dùng _id để loại bỏ trùng
      if (id && !seenIds.has(id)) {
        seenIds.set(id, xuong);
        // Nếu có tên, cũng đánh dấu tên này
        if (name) {
          seenNames.set(name.toLowerCase(), xuong);
        }
        uniqueXuongs.push(xuong);
      } else if (!id && name) {
        // Nếu không có _id, dùng tên để loại bỏ trùng
        const nameKey = name.toLowerCase();
        if (!seenNames.has(nameKey)) {
          seenNames.set(nameKey, xuong);
          uniqueXuongs.push(xuong);
        }
      }
    });
    
    res.status(200).json(uniqueXuongs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Lấy chi tiết 1 xưởng sản xuất theo ID
 */
exports.getXuongById = async (req, res) => {
  try {
    const xuong = await XuongSanXuat.findById(req.params.id)
      .populate("danhSachTo", "maTo tenTo");
    
    if (!xuong) {
      return res.status(404).json({ message: "Không tìm thấy xưởng sản xuất" });
    }
    
    res.status(200).json(xuong);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Tạo mới xưởng sản xuất
 * Hỗ trợ cả object đơn và mảng
 */
exports.createXuong = async (req, res) => {
  try {
    const body = req.body;

    // Trường hợp tạo nhiều xưởng cùng lúc
    if (Array.isArray(body)) {
      const payloads = body.map((item) => {
        const payload = { ...item };
        if (!payload.tenXuong) {
          throw new Error("Tên xưởng là bắt buộc");
        }
        // Tạo mã xưởng tự động nếu chưa có (insertMany không trigger pre-save hook)
        if (!payload.maXuong) {
          const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
          payload.maXuong = `XUONG-${timestamp}-${randomCode}`;
        }
        return payload;
      });

      const xuongs = await XuongSanXuat.insertMany(payloads);
      
      await XuongSanXuat.populate(xuongs, [
        { path: "danhSachTo", select: "maTo tenTo" }
      ]);
      
      return res.status(201).json({ 
        message: `Tạo ${xuongs.length} xưởng sản xuất thành công`, 
        xuongs 
      });
    }

    // Trường hợp tạo 1 xưởng đơn lẻ
    const payload = { ...body };
    if (!payload.tenXuong) {
      return res.status(400).json({ message: "Tên xưởng là bắt buộc" });
    }

    const xuong = await XuongSanXuat.create(payload);
    
    await xuong.populate("danhSachTo", "maTo tenTo");
    
    res.status(201).json({ 
      message: "Tạo xưởng sản xuất thành công", 
      xuong 
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Mã xưởng đã tồn tại", 
        error: err.message 
      });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Cập nhật xưởng sản xuất
 */
exports.updateXuong = async (req, res) => {
  try {
    const payload = { ...req.body };
    
    const xuong = await XuongSanXuat.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    )
      .populate("danhSachTo", "maTo tenTo");

    if (!xuong) {
      return res.status(404).json({ message: "Không tìm thấy xưởng sản xuất" });
    }

    res.status(200).json({ 
      message: "Cập nhật xưởng sản xuất thành công", 
      xuong 
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Mã xưởng đã tồn tại", 
        error: err.message 
      });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Xóa xưởng sản xuất (soft delete)
 */
exports.deleteXuong = async (req, res) => {
  try {
    const xuong = await XuongSanXuat.findByIdAndUpdate(
      req.params.id,
      { trangThai: "Inactive" },
      { new: true }
    );

    if (!xuong) {
      return res.status(404).json({ message: "Không tìm thấy xưởng sản xuất" });
    }

    res.status(200).json({ 
      message: "Đã vô hiệu hóa xưởng sản xuất", 
      xuong 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Xóa vĩnh viễn xưởng sản xuất (hard delete)
 */
exports.hardDeleteXuong = async (req, res) => {
  try {
    const xuong = await XuongSanXuat.findByIdAndDelete(req.params.id);

    if (!xuong) {
      return res.status(404).json({ message: "Không tìm thấy xưởng sản xuất" });
    }

    res.status(200).json({ 
      message: "Đã xóa xưởng sản xuất vĩnh viễn",
      deletedXuong: xuong
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Thêm tổ vào xưởng
 */
exports.addTo = async (req, res) => {
  try {
    const { toId } = req.body;
    
    if (!toId) {
      return res.status(400).json({ message: "ID tổ là bắt buộc" });
    }

    const xuong = await XuongSanXuat.findById(req.params.id);
    if (!xuong) {
      return res.status(404).json({ message: "Không tìm thấy xưởng sản xuất" });
    }

    if (!xuong.danhSachTo.includes(toId)) {
      xuong.danhSachTo.push(toId);
      await xuong.save();
    }

    await xuong.populate("danhSachTo", "maTo tenTo");

    res.status(200).json({ 
      message: "Đã thêm tổ vào xưởng", 
      xuong 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Xóa tổ khỏi xưởng
 */
exports.removeTo = async (req, res) => {
  try {
    const { toId } = req.body;
    
    if (!toId) {
      return res.status(400).json({ message: "ID tổ là bắt buộc" });
    }

    const xuong = await XuongSanXuat.findById(req.params.id);
    if (!xuong) {
      return res.status(404).json({ message: "Không tìm thấy xưởng sản xuất" });
    }

    xuong.danhSachTo = xuong.danhSachTo.filter(
      (id) => id.toString() !== toId.toString()
    );
    await xuong.save();

    await xuong.populate("danhSachTo", "maTo tenTo");

    res.status(200).json({ 
      message: "Đã xóa tổ khỏi xưởng", 
      xuong 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

