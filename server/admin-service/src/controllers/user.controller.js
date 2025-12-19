const User = require("../models/User");
const Department = require("../models/Department");
const amqp = require("amqplib");
const axios = require("axios");

const GATEWAY_URL = process.env.GATEWAY_URL || "http://api-gateway:4000";

/** Publish event to RabbitMQ */
async function publishEvent(event, payload) {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertExchange("user_events", "fanout", { durable: false });
  channel.publish("user_events", "", Buffer.from(JSON.stringify({ event, payload })));
  await channel.close();
  await connection.close();
}

/** Lấy danh sách người dùng */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo người dùng mới */
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    
    // Nếu là xưởng trưởng và có phòng ban, tự động gán vào xưởng
    if (user.role && Array.isArray(user.role) && user.role.length > 0) {
      // Lấy role name để kiểm tra
      const Role = require("../models/Role");
      const roles = await Role.find({ _id: { $in: user.role } });
      const roleNames = roles.map(r => (r.tenRole || "").toLowerCase());
      const isXuongTruong = roleNames.some(r => 
        r.includes("xuongtruong") || 
        r.includes("xưởng trưởng") ||
        r === "xuongtruong"
      );
      
      if (isXuongTruong && user.phongBan && user.phongBan.length > 0) {
        try {
          // Lấy tên phòng ban
          const departments = await Department.find({ _id: { $in: user.phongBan } });
          const departmentNames = departments.map(d => d.tenPhong);
          
          // Tìm xưởng có tên trùng với phòng ban
          const token = req.headers.authorization || req.headers.Authorization;
          if (token) {
            const headers = { Authorization: token };
            const xuongsResponse = await axios.get(
              `${GATEWAY_URL}/factory/xuong`,
              { headers }
            );
            const xuongs = Array.isArray(xuongsResponse.data) ? xuongsResponse.data : [];
            
            for (const deptName of departmentNames) {
              const xuong = xuongs.find(x => 
                x.tenXuong && deptName && 
                (x.tenXuong.toLowerCase().includes(deptName.toLowerCase()) ||
                 deptName.toLowerCase().includes(x.tenXuong.toLowerCase()))
              );
              
              if (xuong) {
                // Kiểm tra xưởng trưởng chưa có trong xưởng
                const existingXT = xuong.xuongTruong?.find(xt => 
                  xt.id === user._id.toString() || xt.email === user.email
                );
                
                if (!existingXT) {
                  // Thêm xưởng trưởng vào xưởng
                  const xuongTruongData = {
                    id: user._id.toString(),
                    hoTen: user.hoTen,
                    email: user.email,
                    role: "xuongtruong"
                  };
                  
                  // Lấy danh sách xưởng trưởng hiện tại và thêm mới
                  const currentXT = Array.isArray(xuong.xuongTruong) ? xuong.xuongTruong : [];
                  await axios.put(
                    `${GATEWAY_URL}/factory/xuong/${xuong._id}`,
                    { xuongTruong: [...currentXT, xuongTruongData] },
                    { headers }
                  );
                  console.log(`✅ Đã tự động gán xưởng trưởng ${user.hoTen} vào xưởng ${xuong.tenXuong}`);
                }
              }
            }
          }
        } catch (xuongErr) {
          console.warn("⚠️ Không thể tự động gán xưởng trưởng vào xưởng:", xuongErr.message);
          // Không block response nếu lỗi
        }
      }
    }
    
    res.status(201).json({ message: "Tạo người dùng thành công", user });

    // Gửi event sang auth-service (không block response nếu lỗi)
    publishEvent("USER_CREATED", user).catch((err) => {
      console.error("⚠️ Failed to publish USER_CREATED event:", err.message);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo nhiều người dùng cùng lúc (bulk create) */
exports.createUsersBulk = async (req, res) => {
  try {
    const { users: usersData } = req.body;
    
    if (!Array.isArray(usersData) || usersData.length === 0) {
      return res.status(400).json({ error: "Cần cung cấp mảng users với ít nhất 1 phần tử" });
    }

    const createdUsers = [];
    const errors = [];

    for (let i = 0; i < usersData.length; i++) {
      try {
        const user = await User.create(usersData[i]);
        createdUsers.push(user);
        
        // Nếu là xưởng trưởng và có phòng ban, tự động gán vào xưởng
        if (user.role && Array.isArray(user.role) && user.role.length > 0) {
          const Role = require("../models/Role");
          const roles = await Role.find({ _id: { $in: user.role } });
          const roleNames = roles.map(r => (r.tenRole || "").toLowerCase());
          const isXuongTruong = roleNames.some(r => 
            r.includes("xuongtruong") || 
            r.includes("xưởng trưởng") ||
            r === "xuongtruong"
          );
          
          if (isXuongTruong && user.phongBan && user.phongBan.length > 0) {
            try {
              const departments = await Department.find({ _id: { $in: user.phongBan } });
              const departmentNames = departments.map(d => d.tenPhong);
              
              const token = req.headers.authorization || req.headers.Authorization;
              if (token) {
                const headers = { Authorization: token };
                const xuongsResponse = await axios.get(
                  `${GATEWAY_URL}/factory/xuong`,
                  { headers }
                );
                const xuongs = Array.isArray(xuongsResponse.data) ? xuongsResponse.data : [];
                
                for (const deptName of departmentNames) {
                  const xuong = xuongs.find(x => 
                    x.tenXuong && deptName && 
                    (x.tenXuong.toLowerCase().includes(deptName.toLowerCase()) ||
                     deptName.toLowerCase().includes(x.tenXuong.toLowerCase()))
                  );
                  
                  if (xuong) {
                    const existingXT = xuong.xuongTruong?.find(xt => 
                      xt.id === user._id.toString() || xt.email === user.email
                    );
                    
                    if (!existingXT) {
                      const xuongTruongData = {
                        id: user._id.toString(),
                        hoTen: user.hoTen,
                        email: user.email,
                        role: "xuongtruong"
                      };
                      
                      const currentXT = Array.isArray(xuong.xuongTruong) ? xuong.xuongTruong : [];
                      await axios.put(
                        `${GATEWAY_URL}/factory/xuong/${xuong._id}`,
                        { xuongTruong: [...currentXT, xuongTruongData] },
                        { headers }
                      );
                      console.log(`✅ Đã tự động gán xưởng trưởng ${user.hoTen} vào xưởng ${xuong.tenXuong}`);
                    }
                  }
                }
              }
            } catch (xuongErr) {
              console.warn(`⚠️ Không thể tự động gán xưởng trưởng cho user ${i + 1}:`, xuongErr.message);
            }
          }
        }
        
        // Gửi event cho từng user (không block)
        publishEvent("USER_CREATED", user).catch((err) => {
          console.error(`⚠️ Failed to publish USER_CREATED event for user ${i + 1}:`, err.message);
        });
      } catch (err) {
        errors.push({
          index: i,
          data: usersData[i],
          error: err.message,
        });
      }
    }

    res.status(201).json({
      message: `Đã tạo ${createdUsers.length}/${usersData.length} người dùng`,
      created: createdUsers.length,
      total: usersData.length,
      users: createdUsers,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật người dùng */
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
    res.status(200).json({ message: "Cập nhật người dùng thành công", user: updated });
    
    // Gửi event sang auth-service (không block response nếu lỗi)
    publishEvent("USER_UPDATED", updated).catch((err) => {
      console.error("⚠️ Failed to publish USER_UPDATED event:", err.message);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Xóa người dùng */
exports.deleteUser = async (req, res) => {
  try {
    // Soft delete: chỉ chuyển trạng thái sang Inactive để giữ lịch sử
    const deleted = await User.findByIdAndUpdate(
      req.params.id,
      { trangThai: "Inactive" },
      { new: true }
    );
    if (!deleted) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
    res.status(200).json({ message: "Đã vô hiệu hóa người dùng", user: deleted });
    
    // Gửi event sang auth-service (không block response nếu lỗi)
    // Có thể xử lý như "user deactivated" ở service khác
    publishEvent("USER_DELETED", { _id: req.params.id, trangThai: "Inactive" }).catch(
      (err) => {
        console.error("⚠️ Failed to publish USER_DELETED event:", err.message);
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
