const PaymentVoucher = require("../models/PaymentVoucher");

/** Lấy danh sách phiếu thanh toán */
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await PaymentVoucher.find()
      .populate("nhaCungCap nguoiLap nguoiDuyet lienKetPhieu")
      .sort({ ngayLap: -1 });
    res.status(200).json(vouchers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo phiếu thanh toán mới */
exports.createVoucher = async (req, res) => {
  try {
    const voucher = await PaymentVoucher.create(req.body);
    res.status(201).json({ message: "Tạo phiếu thanh toán thành công", voucher });

    // 🚀 TODO: Gửi event PAYMENT_CREATED đến material-service hoặc hr-service để cập nhật trạng thái đã chi
    // RabbitMQ.publish("PAYMENT_CREATED", voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật trạng thái phiếu (đã duyệt / từ chối / đã chi) */
exports.updateVoucherStatus = async (req, res) => {
  try {
    const updated = await PaymentVoucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy phiếu thanh toán" });
    res.status(200).json({ message: "Cập nhật trạng thái phiếu thành công", voucher: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Xóa phiếu (nếu chưa duyệt) */
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await PaymentVoucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Không tìm thấy phiếu" });

    if (voucher.trangThai === "Đã duyệt")
      return res.status(400).json({ message: "Không thể xóa phiếu đã duyệt" });

    await PaymentVoucher.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa phiếu thanh toán thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
