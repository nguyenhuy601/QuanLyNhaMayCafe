const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Account = require("../models/Account");
const axios = require("axios");

const GATEWAY_URL = process.env.GATEWAY_URL || "http://api-gateway:4000";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";
// Log JWT_SECRET info (first 4 chars only for security)
if (!process.env.JWT_SECRET_LOGGED) {
  console.log(`🔑 [auth-service] JWT_SECRET configured: ${JWT_SECRET.substring(0, 4)}... (length: ${JWT_SECRET.length})`);
  process.env.JWT_SECRET_LOGGED = "true";
}
const VALID_ROLES = [
  "admin",
  "worker",
  "director",
  "qc",
  "plan",
  "orders",
  "xuongtruong", // Xưởng trưởng
  "totruong",    // Tổ trưởng
  "khonvl",      // Kho nguyên vật liệu
  "khotp",       // Kho thành phẩm (thay thế warehouseproduct)
];

/** Register a new account */
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if email already exists
    const existing = await Account.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Validate role (default = worker)
    const requestedRole = role || "worker";
    if (!VALID_ROLES.includes(requestedRole)) {
      return res.status(400).json({ message: "Role không phù hợp" });
    }
    const finalRole = requestedRole;

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create account
    const account = await Account.create({
      email,
      password: hashed,
      role: finalRole,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: account._id, role: finalRole },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Register successfully",
      token,
      role: finalRole,
    });
  } catch (err) {
    console.error("❌ [register error]", err);
    res.status(500).json({ error: err.message });
  }
};

/** Login */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const account = await Account.findOne({ email });
    if (!account)
      return res.status(404).json({ message: "Account not found" });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    if (!VALID_ROLES.includes(account.role)) {
      return res.status(403).json({ message: "Role không phù hợp" });
    }

    const token = jwt.sign(
      { 
        id: account._id, 
        role: account.role,
        sanPhamPhuTrach: account.sanPhamPhuTrach || [], // Lưu vào JWT để dùng khi cần
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, role: account.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Verify JWT token */
exports.verifyToken = async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Missing token" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false });
  }
};

/** Lấy thông tin account theo ID */
exports.getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).select("-password");
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }
    res.status(200).json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Admin gán sản phẩm phụ trách cho xưởng trưởng */
exports.assignProductsToManager = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { sanPhamPhuTrach } = req.body;

    // Kiểm tra account có tồn tại không
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    // Kiểm tra role phải là xưởng trưởng
    if (account.role !== "xuongtruong") {
      return res.status(400).json({ 
        message: "Chỉ có thể gán sản phẩm phụ trách cho xưởng trưởng. Vui lòng đổi role của account thành 'xuongtruong' trước." 
      });
    }

    // Validate danh sách sản phẩm
    if (!Array.isArray(sanPhamPhuTrach)) {
      return res.status(400).json({ 
        message: "sanPhamPhuTrach phải là mảng" 
      });
    }

    // Kiểm tra: chỉ cho phép 1 sản phẩm
    if (sanPhamPhuTrach.length > 1) {
      return res.status(400).json({ 
        message: "Một xưởng trưởng chỉ có thể phụ trách 1 sản phẩm duy nhất" 
      });
    }

    // Kiểm tra: chỉ cho phép 1 sản phẩm
    if (sanPhamPhuTrach.length !== 1) {
      return res.status(400).json({ 
        message: "Mỗi xưởng trưởng chỉ có thể phụ trách 1 sản phẩm duy nhất" 
      });
    }

    // Nếu có sản phẩm được gán, kiểm tra xem sản phẩm đó đã được gán cho account khác chưa
    const productId = sanPhamPhuTrach[0].productId;
    if (productId) {
      // Tìm account khác đã có sản phẩm này (trừ account hiện tại)
      const existingAccount = await Account.findOne({
        _id: { $ne: accountId },
        role: "xuongtruong",
        "sanPhamPhuTrach.productId": productId
      });

      if (existingAccount) {
        return res.status(400).json({ 
          message: `Sản phẩm này đã được gán cho tài khoản ${existingAccount.email}. Một sản phẩm chỉ có thể được gán cho 1 tài khoản duy nhất.` 
        });
      }
    }

    // Cập nhật danh sách sản phẩm phụ trách (chỉ lưu khi role là xuongtruong)
    account.sanPhamPhuTrach = sanPhamPhuTrach;
    
    // Đồng bộ với xưởng: Tìm xưởng có xưởng trưởng này và cập nhật sản phẩm phụ trách
    // Đồng thời lấy thông tin tổ trưởng từ các tổ thuộc xưởng
    let toTruongInfo = [];
    try {
      const token = req.headers.authorization || req.headers.Authorization;
      if (token) {
        const headers = { Authorization: token };
        
        // Lấy danh sách xưởng
        const xuongsResponse = await axios.get(
          `${GATEWAY_URL}/factory/xuong`,
          { headers }
        );
        const xuongs = Array.isArray(xuongsResponse.data) ? xuongsResponse.data : [];
        
        // Chuẩn hóa accountId để so sánh (convert sang string)
        const accountIdStr = accountId.toString();
        
        // Cách 1: Tìm xưởng có xưởng trưởng này trong xuongTruong array
        let xuong = xuongs.find(x => {
          if (!Array.isArray(x.xuongTruong) || x.xuongTruong.length === 0) {
            return false;
          }
          return x.xuongTruong.some(xt => {
            const xtId = xt.id ? xt.id.toString() : '';
            const xtEmail = xt.email ? xt.email.toLowerCase().trim() : '';
            const accountEmail = account.email ? account.email.toLowerCase().trim() : '';
            return xtId === accountIdStr || xtEmail === accountEmail;
          });
        });
        
        if (xuong) {
          console.log(`✅ Tìm thấy xưởng theo xuongTruong: ${xuong.tenXuong}`);
        }
        
        // Cách 2: Nếu không tìm thấy, tìm theo phòng ban của user
        if (!xuong) {
          try {
            // Lấy thông tin user từ admin-service
            const usersResponse = await axios.get(
              `${GATEWAY_URL}/admin/users`,
              { headers }
            );
            const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
            const user = users.find(u => u.email === account.email);
            
            if (user && user.phongBan && Array.isArray(user.phongBan) && user.phongBan.length > 0) {
              // Lấy thông tin phòng ban
              const departmentsResponse = await axios.get(
                `${GATEWAY_URL}/admin/departments`,
                { headers }
              );
              const departments = Array.isArray(departmentsResponse.data) ? departmentsResponse.data : [];
              
              // Tìm phòng ban của user
              const userDept = departments.find(d => 
                user.phongBan.some(pb => 
                  (typeof pb === 'string' && pb === d._id) || 
                  (typeof pb === 'object' && pb._id === d._id) ||
                  (typeof pb === 'object' && pb.toString() === d._id.toString())
                )
              );
              
              if (userDept && userDept.tenPhong) {
                // Tìm xưởng có tên trùng với tên phòng ban
                xuong = xuongs.find(x => 
                  x.tenXuong && 
                  x.tenXuong.trim() === userDept.tenPhong.trim()
                );
                
                if (xuong) {
                  console.log(`✅ Tìm thấy xưởng theo phòng ban: ${xuong.tenXuong}`);
                }
              }
            }
          } catch (userErr) {
            console.warn("⚠️ Không thể lấy thông tin user để tìm xưởng:", userErr.message);
          }
        }
        
        if (xuong) {
          // Lấy thông tin user để có đầy đủ thông tin xưởng trưởng
          let xuongTruongData = null;
          try {
            const usersResponse = await axios.get(
              `${GATEWAY_URL}/admin/users`,
              { headers }
            );
            const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
            const user = users.find(u => u.email === account.email);
            
            if (user) {
              xuongTruongData = {
                id: accountId.toString(),
                hoTen: user.hoTen || user.name || account.email,
                email: account.email,
                role: account.role || 'xuongtruong',
              };
              console.log(`✅ Đã lấy thông tin xưởng trưởng: ${xuongTruongData.hoTen || xuongTruongData.email}`);
            } else {
              // Fallback: dùng thông tin từ account
              xuongTruongData = {
                id: accountId.toString(),
                hoTen: account.email.split('@')[0] || account.email,
                email: account.email,
                role: account.role || 'xuongtruong',
              };
            }
          } catch (userErr) {
            console.warn("⚠️ Không thể lấy thông tin user, dùng thông tin từ account:", userErr.message);
            xuongTruongData = {
              id: accountId.toString(),
              hoTen: account.email.split('@')[0] || account.email,
              email: account.email,
              role: account.role || 'xuongtruong',
            };
          }
          
          // Lấy danh sách tổ thuộc xưởng này
          try {
            const teamsResponse = await axios.get(
              `${GATEWAY_URL}/factory/to`,
              { headers, params: { xuongId: xuong._id } }
            );
            const teams = Array.isArray(teamsResponse.data) ? teamsResponse.data : [];
            
            // Lấy tổ trưởng đầu tiên từ tổ đầu tiên (mỗi xưởng chỉ có 1 tổ trưởng)
            let toTruongData = null;
            
            if (teams.length > 0) {
              const firstTeam = teams[0];
              if (firstTeam.toTruong && Array.isArray(firstTeam.toTruong) && firstTeam.toTruong.length > 0) {
                const firstToTruong = firstTeam.toTruong[0];
                toTruongData = {
                  id: firstToTruong.id || '',
                  hoTen: firstToTruong.hoTen || '',
                  email: firstToTruong.email || '',
                  role: firstToTruong.role || 'totruong',
                  maNV: firstToTruong.maNV || '',
                  tenTo: firstTeam.tenTo || '',
                  maTo: firstTeam.maTo || ''
                };
                console.log(`✅ Đã lấy thông tin tổ trưởng: ${toTruongData.hoTen || toTruongData.email} từ tổ ${firstTeam.tenTo}`);
              }
            }
            
            // Cập nhật xưởng: xưởng trưởng, sản phẩm phụ trách (chỉ 1) và tổ trưởng (chỉ 1)
            const updateData = {
              xuongTruong: [xuongTruongData], // Lưu xưởng trưởng vào array
              sanPhamPhuTrach: sanPhamPhuTrach[0] || null, // Chỉ lấy sản phẩm đầu tiên
            };
            
            if (toTruongData) {
              updateData.toTruong = toTruongData;
            }
            
            await axios.put(
              `${GATEWAY_URL}/factory/xuong/${xuong._id}`,
              updateData,
              { headers }
            );
            console.log(`✅ Đã đồng bộ xưởng trưởng, sản phẩm phụ trách và tổ trưởng với xưởng ${xuong.tenXuong}`);
            
            // Lưu vào toTruongInfo cho account (để dùng trong JWT)
            if (toTruongData) {
              toTruongInfo = [toTruongData];
            }
          } catch (teamsErr) {
            console.warn("⚠️ Không thể lấy thông tin tổ trưởng:", teamsErr.message);
            // Vẫn cập nhật xưởng trưởng và sản phẩm phụ trách dù không lấy được tổ trưởng
            await axios.put(
              `${GATEWAY_URL}/factory/xuong/${xuong._id}`,
              { 
                xuongTruong: [xuongTruongData],
                sanPhamPhuTrach: sanPhamPhuTrach[0] || null
              },
              { headers }
            );
            console.log(`✅ Đã đồng bộ xưởng trưởng và sản phẩm phụ trách với xưởng ${xuong.tenXuong}`);
          }
        } else {
          // Cách 3: Tự động tạo xưởng mới nếu không tìm thấy
          console.log(`⚠️ Không tìm thấy xưởng cho xưởng trưởng ${account.email}. Tự động tạo xưởng mới...`);
          
          try {
            // Lấy thông tin user để có tên xưởng
            let tenXuong = `Xưởng sản xuất ${sanPhamPhuTrach[0]?.tenSP || 'Chưa xác định'}`;
            let xuongTruongData = {
              id: accountId.toString(),
              hoTen: account.email.split('@')[0] || account.email,
              email: account.email,
              role: account.role || 'xuongtruong',
            };
            
            try {
              const usersResponse = await axios.get(
                `${GATEWAY_URL}/admin/users`,
                { headers }
              );
              const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
              const user = users.find(u => u.email === account.email);
              
              if (user) {
                xuongTruongData.hoTen = user.hoTen || user.name || xuongTruongData.hoTen;
                
                // Nếu user có phòng ban, dùng tên phòng ban làm tên xưởng
                if (user.phongBan && Array.isArray(user.phongBan) && user.phongBan.length > 0) {
                  const departmentsResponse = await axios.get(
                    `${GATEWAY_URL}/admin/departments`,
                    { headers }
                  );
                  const departments = Array.isArray(departmentsResponse.data) ? departmentsResponse.data : [];
                  const userDept = departments.find(d => 
                    user.phongBan.some(pb => 
                      (typeof pb === 'string' && pb === d._id) || 
                      (typeof pb === 'object' && pb._id === d._id) ||
                      (typeof pb === 'object' && pb.toString() === d._id.toString())
                    )
                  );
                  if (userDept && userDept.tenPhong) {
                    tenXuong = userDept.tenPhong;
                  }
                }
              }
            } catch (userErr) {
              console.warn("⚠️ Không thể lấy thông tin user, dùng tên mặc định:", userErr.message);
            }
            
            // Tạo xưởng mới
            const newXuongResponse = await axios.post(
              `${GATEWAY_URL}/factory/xuong`,
              {
                tenXuong: tenXuong,
                xuongTruong: [xuongTruongData],
                sanPhamPhuTrach: sanPhamPhuTrach[0] || null,
                trangThai: "Active"
              },
              { headers }
            );
            
            xuong = newXuongResponse.data?.xuong || newXuongResponse.data;
            console.log(`✅ Đã tạo xưởng mới: ${tenXuong} cho xưởng trưởng ${account.email}`);
            
            // Lấy danh sách tổ thuộc xưởng mới (có thể chưa có)
            try {
              const teamsResponse = await axios.get(
                `${GATEWAY_URL}/factory/to`,
                { headers, params: { xuongId: xuong._id } }
              );
              const teams = Array.isArray(teamsResponse.data) ? teamsResponse.data : [];
              
              // Lấy tổ trưởng đầu tiên từ tổ đầu tiên (nếu có)
              let toTruongData = null;
              
              if (teams.length > 0) {
                const firstTeam = teams[0];
                if (firstTeam.toTruong && Array.isArray(firstTeam.toTruong) && firstTeam.toTruong.length > 0) {
                  const firstToTruong = firstTeam.toTruong[0];
                  toTruongData = {
                    id: firstToTruong.id || '',
                    hoTen: firstToTruong.hoTen || '',
                    email: firstToTruong.email || '',
                    role: firstToTruong.role || 'totruong',
                    maNV: firstToTruong.maNV || '',
                    tenTo: firstTeam.tenTo || '',
                    maTo: firstTeam.maTo || ''
                  };
                  
                  // Cập nhật lại xưởng với thông tin tổ trưởng
                  await axios.put(
                    `${GATEWAY_URL}/factory/xuong/${xuong._id}`,
                    { toTruong: toTruongData },
                    { headers }
                  );
                  
                  toTruongInfo = [toTruongData];
                  console.log(`✅ Đã cập nhật tổ trưởng cho xưởng mới: ${toTruongData.hoTen || toTruongData.email}`);
                }
              }
            } catch (teamsErr) {
              console.warn("⚠️ Không thể lấy thông tin tổ trưởng cho xưởng mới:", teamsErr.message);
            }
          } catch (createErr) {
            console.error("❌ Không thể tạo xưởng mới:", createErr.message);
            console.warn(`⚠️ Vui lòng thủ công thêm xưởng trưởng ${account.email} vào xưởng hoặc tạo xưởng mới.`);
          }
        }
      }
    } catch (xuongErr) {
      console.warn("⚠️ Không thể đồng bộ với xưởng:", xuongErr.message);
      // Không block response nếu lỗi đồng bộ xưởng
    }
    
    // Lưu thông tin tổ trưởng vào account
    if (toTruongInfo.length > 0) {
      account.toTruongInfo = toTruongInfo;
      console.log(`✅ Đã lưu thông tin ${toTruongInfo.length} tổ trưởng vào account ${account.email}`);
    }
    
    await account.save();

    res.status(200).json({ 
      message: "Đã cập nhật sản phẩm phụ trách thành công",
      account: {
        _id: account._id,
        email: account.email,
        role: account.role,
        sanPhamPhuTrach: account.sanPhamPhuTrach || [],
        toTruongInfo: account.toTruongInfo || [],
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Lấy danh sách account (admin) */
exports.getAccounts = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) {
      filter.role = role;
    }
    
    const accounts = await Account.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.status(200).json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Admin cập nhật role của account */
exports.updateAccountRole = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role là bắt buộc" });
    }

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    // Cập nhật role
    account.role = role;
    
    // Nếu đổi từ xuongtruong sang role khác, xóa sanPhamPhuTrach
    if (account.role !== "xuongtruong" && account.sanPhamPhuTrach?.length > 0) {
      account.sanPhamPhuTrach = undefined;
    }
    
    await account.save();

    res.status(200).json({ 
      message: "Đã cập nhật role thành công",
      account: {
        _id: account._id,
        email: account.email,
        role: account.role,
        sanPhamPhuTrach: account.sanPhamPhuTrach || [],
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Admin tạo account mới */
exports.createAccount = async (req, res) => {
  try {
    const { email, password, role, isActive } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email và password là bắt buộc" });
    }

    // Check if email already exists
    const existing = await Account.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Validate role
    const finalRole = role || "worker";
    if (!VALID_ROLES.includes(finalRole)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create account
    const account = await Account.create({
      email,
      password: hashed,
      role: finalRole,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      message: "Tạo tài khoản thành công",
      account: {
        _id: account._id,
        email: account.email,
        role: account.role,
        isActive: account.isActive,
        sanPhamPhuTrach: account.sanPhamPhuTrach || [],
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    res.status(500).json({ error: err.message });
  }
};

/** Admin cập nhật account */
exports.updateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { email, password, role, isActive } = req.body;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    // Update email if provided
    if (email && email !== account.email) {
      const existing = await Account.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }
      account.email = email;
    }

    // Update password if provided
    if (password) {
      account.password = await bcrypt.hash(password, 10);
    }

    // Update role if provided
    if (role) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ message: "Role không hợp lệ" });
      }
      account.role = role;
      
      // Nếu đổi từ xuongtruong sang role khác, xóa sanPhamPhuTrach
      if (account.role !== "xuongtruong" && account.sanPhamPhuTrach?.length > 0) {
        account.sanPhamPhuTrach = undefined;
      }
    }

    // Update isActive if provided
    if (isActive !== undefined) {
      account.isActive = isActive;
    }

    await account.save();

    res.status(200).json({
      message: "Cập nhật tài khoản thành công",
      account: {
        _id: account._id,
        email: account.email,
        role: account.role,
        isActive: account.isActive,
        sanPhamPhuTrach: account.sanPhamPhuTrach || [],
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    res.status(500).json({ error: err.message });
  }
};

/** Admin xóa account */
exports.deleteAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    // Không cho phép xóa admin
    if (account.role === "admin") {
      return res.status(400).json({ message: "Không thể xóa tài khoản admin" });
    }

    await Account.findByIdAndDelete(accountId);

    res.status(200).json({ message: "Đã xóa tài khoản thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};