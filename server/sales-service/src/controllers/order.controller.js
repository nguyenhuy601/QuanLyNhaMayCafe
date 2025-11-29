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

    if (!khachHang || !khachHang.sdt || !Array.isArray(chiTiet) || chiTiet.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin khách hàng hoặc sản phẩm." });
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

    for (const item of chiTiet) {
      console.log("📦 Checking item:", item);
      const product = await Product.findById(item.sanPham);
      console.log("🔎 Found product:", product);
      if (!product) {
        return res.status(404).json({ message: `Không tìm thấy sản phẩm với ID ${item.sanPham}` });
      }

      const soLuong = parseInt(item.soLuong, 10);
      const donVi = item.donVi || null; // Giữ null nếu không có để tương thích với dữ liệu cũ
      const loaiTui = (donVi === "túi" && item.loaiTui) ? item.loaiTui : null; // Lưu loại túi: "500g", "1kg", hoặc "hop" (hộp) nếu đơn vị là túi
      const donGia = product.donGia;
      const thanhTien = soLuong * donGia;
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