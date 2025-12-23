const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const amqp = require("amqplib");

/** Gửi event sang RabbitMQ */
async function publishEvent(event, payload) {
  const uri = process.env.RABBITMQ_URI || process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
  const connection = await amqp.connect(uri);
  const channel = await connection.createChannel();
  await channel.assertExchange("order_events", "fanout", { durable: false });
  channel.publish(
    "order_events",
    "",
    Buffer.from(JSON.stringify({ event, payload }))
  );
  await channel.close();
  await connection.close();
}

const normalizeStatus = (value = "") =>
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

  "da duyet": "Đã duyệt",
  approved: "Đã duyệt",
  "hoan thanh": "Đã duyệt",
  complete: "Đã duyệt",
  completed: "Đã duyệt",

  "dang giao": "Đang giao",
  delivering: "Đang giao",

  "da huy": "Đã hủy",
  cancelled: "Đã hủy",
  cancel: "Đã hủy",

  "tu choi": "Từ chối",
  rejected: "Từ chối",
};

const normalizeToVietnameseStatus = (value = "") =>
  STATUS_DICTIONARY[normalizeStatus(value)] || value || "";

const PENDING_KEYS = new Set(["cho duyet"]);

/** 🧾 Lấy tất cả đơn hàng */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("khachHang nguoiTao chiTiet.sanPham")
      .sort({ ngayDat: -1 });

    res.status(200).json(
      orders.map((order) => ({
        ...order.toObject(),
        trangThai: normalizeToVietnameseStatus(order.trangThai),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("khachHang nguoiTao chiTiet.sanPham");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.status(200).json({
      ...order.toObject(),
      trangThai: normalizeToVietnameseStatus(order.trangThai),
    });
  } catch (err) {
    console.error("❌ Error fetching order by ID:", err);
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng", error: err.message });
  }
};

/** 🕒 Lấy đơn hàng đang chờ duyệt */
exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("khachHang nguoiTao chiTiet.sanPham")
      .sort({ ngayDat: -1 });

    const result = orders
      .filter((order) => PENDING_KEYS.has(normalizeStatus(order.trangThai)))
      .map((order) => ({
        ...order.toObject(),
        trangThai: "Chờ duyệt",
      }));

    res.status(200).json(result);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Không thể lấy đơn hàng chờ duyệt", error: err.message });
  }
};

/** 🆕 Tạo đơn hàng mới (FE gọi trực tiếp) */
exports.createOrder = async (req, res) => {
  try {
    const { khachHang, chiTiet, ngayYeuCauGiao, diaChiGiao, ghiChu } = req.body;

    // ============================================
    // VALIDATION: Ràng buộc cơ bản
    // ============================================
    
    // 1. Kiểm tra thông tin khách hàng
    if (!khachHang) {
      return res.status(400).json({ message: "Thiếu thông tin khách hàng." });
    }
    
    if (!khachHang.tenKH || khachHang.tenKH.trim() === "") {
      return res.status(400).json({ message: "Tên khách hàng không được để trống." });
    }
    
    if (!khachHang.sdt || khachHang.sdt.trim() === "") {
      return res.status(400).json({ message: "Số điện thoại khách hàng không được để trống." });
    }
    
    // Kiểm tra định dạng số điện thoại (ít nhất 10 số)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(khachHang.sdt.replace(/\s+/g, ""))) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số." });
    }

    // 2. Kiểm tra chi tiết đơn hàng
    if (!Array.isArray(chiTiet) || chiTiet.length === 0) {
      return res.status(400).json({ message: "Đơn hàng phải có ít nhất một sản phẩm." });
    }

    // 3. Kiểm tra ngày giao
    if (!ngayYeuCauGiao) {
      return res.status(400).json({ message: "Ngày yêu cầu giao hàng không được để trống." });
    }
    
    const ngayHienTai = new Date();
    ngayHienTai.setHours(0, 0, 0, 0); // Chuẩn hóa về 00:00:00 để so sánh chính xác
    const ngayGiao = new Date(ngayYeuCauGiao);
    ngayGiao.setHours(0, 0, 0, 0); // Chuẩn hóa về 00:00:00 để so sánh chính xác
    
    if (isNaN(ngayGiao.getTime())) {
      return res.status(400).json({ message: "Ngày yêu cầu giao hàng không hợp lệ." });
    }
    
    // Ngày giao phải cách ngày hiện tại ít nhất 15 ngày
    const soNgay = Math.floor((ngayGiao - ngayHienTai) / (1000 * 60 * 60 * 24));
    if (soNgay < 15) {
      return res.status(400).json({ message: `Ngày yêu cầu giao hàng phải cách ngày hiện tại ít nhất 15 ngày. Hiện tại: ${soNgay} ngày.` });
    }

    const customer = await Customer.findOneAndUpdate(
      { sdt: khachHang.sdt },
      {
        tenKH: khachHang.tenKH,
        sdt: khachHang.sdt,
        email: khachHang.email || "",
        diaChi: khachHang.diaChi || "",
      },
      { upsert: true, new: true }
    );

    let tongTien = 0;
    const chiTietDonHang = [];

    // 4. Kiểm tra từng sản phẩm trong chi tiết
    for (let i = 0; i < chiTiet.length; i++) {
      const item = chiTiet[i];
      
      // Kiểm tra sản phẩm có tồn tại
      if (!item.sanPham) {
        return res.status(400).json({ message: `Sản phẩm thứ ${i + 1}: Thiếu thông tin sản phẩm.` });
      }
      
      console.log("📦 Checking item:", item);
      const product = await Product.findById(item.sanPham);
      console.log("🔎 Found product:", product);
      if (!product) {
        return res.status(404).json({ message: `Không tìm thấy sản phẩm với ID ${item.sanPham}` });
      }

      // Kiểm tra số lượng
      const soLuong = parseInt(item.soLuong, 10);
      if (isNaN(soLuong) || soLuong <= 0) {
        return res.status(400).json({ message: `Sản phẩm "${product.tenSP}": Số lượng phải là số nguyên dương.` });
      }
      
      if (soLuong > 1000000) {
        return res.status(400).json({ message: `Sản phẩm "${product.tenSP}": Số lượng quá lớn (tối đa 1,000,000).` });
      }

      // Kiểm tra đơn giá
      if (!product.donGia || product.donGia <= 0) {
        return res.status(400).json({ message: `Sản phẩm "${product.tenSP}": Đơn giá không hợp lệ.` });
      }

      // Kiểm tra đơn vị
      const donVi = item.donVi || null;
      if (donVi !== null && donVi !== undefined && donVi !== "" && !["kg", "túi"].includes(donVi)) {
        return res.status(400).json({ message: `Sản phẩm "${product.tenSP}": Đơn vị không hợp lệ. Chỉ chấp nhận "kg" hoặc "túi".` });
      }

      // Kiểm tra loại túi (nếu đơn vị là túi)
      let loaiTui = null;
      if (donVi === "túi") {
        if (item.loaiTui) {
          if (!["500g", "1kg", "hop"].includes(item.loaiTui)) {
            return res.status(400).json({ message: `Sản phẩm "${product.tenSP}": Loại túi không hợp lệ. Chỉ chấp nhận "500g", "1kg" hoặc "hop".` });
          }
          loaiTui = item.loaiTui;
        }
      } else if (item.loaiTui) {
        // Nếu đơn vị không phải túi nhưng có loaiTui thì bỏ qua
        loaiTui = null;
      }

      const donGia = product.donGia;
      const thanhTien = soLuong * donGia;
      
      // Kiểm tra tổng tiền không quá lớn
      if (thanhTien > 1000000000000) { // 1 tỷ tỷ
        return res.status(400).json({ message: `Sản phẩm "${product.tenSP}": Thành tiền quá lớn.` });
      }
      
      tongTien += thanhTien;

      chiTietDonHang.push({
        sanPham: product._id,
        soLuong,
        donVi: donVi, // Lưu đơn vị (có thể null)
        loaiTui: loaiTui, // Lưu loại túi: "500g", "1kg" (túi bạc), hoặc "hop" (hộp - sản phẩm hòa tan)
        donGia,
        thanhTien,
      });
    }

    // 5. Kiểm tra tổng tiền đơn hàng
    if (tongTien <= 0) {
      return res.status(400).json({ message: "Tổng tiền đơn hàng phải lớn hơn 0." });
    }
    
    if (tongTien > 10000000000000) { // 10 tỷ tỷ
      return res.status(400).json({ message: "Tổng tiền đơn hàng quá lớn." });
    }

    // 6. Kiểm tra địa chỉ giao (nếu có)
    if (diaChiGiao && diaChiGiao.trim().length > 500) {
      return res.status(400).json({ message: "Địa chỉ giao hàng không được vượt quá 500 ký tự." });
    }

    // 7. Kiểm tra ghi chú (nếu có)
    if (ghiChu && ghiChu.trim().length > 1000) {
      return res.status(400).json({ message: "Ghi chú không được vượt quá 1000 ký tự." });
    }

    const latestOrder = await Order.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;
    if (latestOrder && latestOrder.maDH) {
      const num = parseInt(latestOrder.maDH.replace("DH", ""));
      if (!isNaN(num)) nextNumber = num + 1;
    }
    const maDH = `DH${String(nextNumber).padStart(3, "0")}`;

    const order = await Order.create({
      maDH,
      khachHang: customer._id,
      chiTiet: chiTietDonHang,
      tongTien,
      ghiChu: ghiChu || "",
      ngayYeuCauGiao,
      diaChiGiao,
      ngayDat: new Date(),
      // Don't force a specific string here — let the Order model default handle the initial status
      // (models across services use different enums; using the model default prevents enum validation errors)
      nguoiTao: req.user?.id || null,
    });

    console.log(`✅ Order ${maDH} created successfully`);
    res.status(201).json({
      message: "Tạo đơn hàng thành công",
      order: {
        ...order.toObject(),
        trangThai: normalizeToVietnameseStatus(order.trangThai),
      },
    });

    await publishEvent("ORDER_CREATED", order);

  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng", error: err.message });
  }
};

/** ✏️ Cập nhật đơn hàng */
exports.updateOrder = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      trangThai: req.body.trangThai
        ? normalizeToVietnameseStatus(req.body.trangThai)
        : undefined,
    };
    const updated = await Order.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });
    res
      .status(200)
      .json({
        message: "Cập nhật đơn hàng thành công",
        order: {
          ...updated.toObject(),
          trangThai: normalizeToVietnameseStatus(updated.trangThai),
        },
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra ID có hợp lệ không
    if (!id) {
      return res.status(400).json({ message: "Thiếu ID đơn hàng." });
    }

    // Tìm đơn hàng
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    // Thực hiện xóa
    await Order.findByIdAndDelete(id);

    res.status(200).json({ message: "Xóa đơn hàng thành công." });
  } catch (error) {
    console.error("❌ Lỗi khi xóa đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi xóa đơn hàng.", error });
  }
};