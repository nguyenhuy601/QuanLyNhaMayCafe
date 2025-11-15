const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const amqp = require("amqplib");

/** Gửi event sang RabbitMQ */
async function publishEvent(event, payload) {
  const connection = await amqp.connect(process.env.RABBITMQ_URI);
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

/** 🧾 Lấy tất cả đơn hàng */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("khachHang nguoiTao chiTiet.sanPham")
      .sort({ ngayDat: -1 });

    res.status(200).json(orders);
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

    res.status(200).json(order);
  } catch (err) {
    console.error("❌ Error fetching order by ID:", err);
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng", error: err.message });
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
      const donGia = product.donGia;
      const thanhTien = soLuong * donGia;
      tongTien += thanhTien;

      chiTietDonHang.push({
        sanPham: product._id,
        soLuong,
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
    res.status(201).json({ message: "Tạo đơn hàng thành công", order });

    await publishEvent("ORDER_CREATED", order);

  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng", error: err.message });
  }
};

/** ✏️ Cập nhật đơn hàng */
exports.updateOrder = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res
      .status(200)
      .json({ message: "Cập nhật đơn hàng thành công", order: updated });
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