const CaLamViec = require("../models/CaLamViec");

/**
 * Lấy danh sách tất cả ca làm việc
 */
exports.getCas = async (req, res) => {
  try {
    const { trangThai } = req.query;
    
    const filter = {};
    if (trangThai) {
      filter.trangThai = trangThai;
    }

    const cas = await CaLamViec.find(filter).sort({ gioBatDau: 1 });
    
    res.status(200).json(cas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Lấy chi tiết 1 ca làm việc theo ID
 */
exports.getCaById = async (req, res) => {
  try {
    const ca = await CaLamViec.findById(req.params.id);
    
    if (!ca) {
      return res.status(404).json({ message: "Không tìm thấy ca làm việc" });
    }
    
    res.status(200).json(ca);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Tạo mới ca làm việc
 * Hỗ trợ cả object đơn và mảng
 */
exports.createCa = async (req, res) => {
  try {
    const body = req.body;

    // Trường hợp tạo nhiều ca cùng lúc
    if (Array.isArray(body)) {
      const payloads = body.map((item) => {
        const payload = { ...item };
        if (!payload.tenCa || !payload.gioBatDau || !payload.gioKetThuc) {
          throw new Error("Tên ca, giờ bắt đầu và giờ kết thúc là bắt buộc");
        }
        return payload;
      });

      const cas = await CaLamViec.insertMany(payloads);
      
      return res.status(201).json({ 
        message: `Tạo ${cas.length} ca làm việc thành công`, 
        cas 
      });
    }

    // Trường hợp tạo 1 ca đơn lẻ
    const payload = { ...body };
    if (!payload.tenCa || !payload.gioBatDau || !payload.gioKetThuc) {
      return res.status(400).json({ 
        message: "Tên ca, giờ bắt đầu và giờ kết thúc là bắt buộc" 
      });
    }

    const ca = await CaLamViec.create(payload);
    
    res.status(201).json({ 
      message: "Tạo ca làm việc thành công", 
      ca 
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Mã ca đã tồn tại", 
        error: err.message 
      });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Cập nhật ca làm việc
 */
exports.updateCa = async (req, res) => {
  try {
    const payload = { ...req.body };
    
    const ca = await CaLamViec.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!ca) {
      return res.status(404).json({ message: "Không tìm thấy ca làm việc" });
    }

    res.status(200).json({ 
      message: "Cập nhật ca làm việc thành công", 
      ca 
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Mã ca đã tồn tại", 
        error: err.message 
      });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Xóa ca làm việc (soft delete)
 */
exports.deleteCa = async (req, res) => {
  try {
    const ca = await CaLamViec.findByIdAndUpdate(
      req.params.id,
      { trangThai: "Inactive" },
      { new: true }
    );

    if (!ca) {
      return res.status(404).json({ message: "Không tìm thấy ca làm việc" });
    }

    res.status(200).json({ 
      message: "Đã vô hiệu hóa ca làm việc", 
      ca 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

