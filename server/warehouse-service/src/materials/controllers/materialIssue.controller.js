const MaterialIssue = require("../../models/MaterialIssue");
const { updateProductQuantity } = require("../../utils/productClient");

exports.getAllIssues = async (req, res) => {
  try {
    const list = await MaterialIssue.find();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createIssue = async (req, res) => {
  try {
    const issue = await MaterialIssue.create({
      ...req.body,
      ngayXuat: new Date(),
      trangThai: "Đã xuất kho",
    });
    
    // Lấy token từ request header để forward khi gọi API
    const authHeader = req.headers.authorization;
    const token = authHeader ? (authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`) : null;
    
    // Tự động giảm số lượng tồn kho cho từng nguyên vật liệu
    if (issue.chiTiet && Array.isArray(issue.chiTiet)) {
      for (const item of issue.chiTiet) {
        if (item.sanPham && item.soLuong) {
          try {
            await updateProductQuantity(item.sanPham, -item.soLuong, token); // Giảm số lượng
          } catch (err) {
            console.error(`❌ Error updating quantity for product ${item.sanPham}:`, err.message);
            // Không throw error để không block việc tạo phiếu xuất
          }
        }
      }
    }
    
    res.status(201).json({ message: "Xuất NVL thành công", issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
