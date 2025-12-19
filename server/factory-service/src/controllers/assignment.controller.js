const WorkAssignment = require("../models/WorkAssignment");
const ProductionLog = require("../models/ProductionLog");
const ToSanXuat = require("../models/ToSanXuat");

/** Lấy danh sách phân công - Xưởng trưởng chỉ xem kế hoạch có sản phẩm phụ trách, Tổ trưởng chỉ xem phân công của tổ mình */
exports.getAssignments = async (req, res) => {
  try {
    let filter = {};
    
    // Nếu là tổ trưởng, chỉ hiển thị phân công của tổ mình
    if (req.user?.role === "totruong" || req.user?.role === "teamleader") {
      // Convert ID về string để so sánh với toTruong.id (String trong DB)
      const leaderId = req.user?.id?.toString() || req.user?._id?.toString();
      const leaderEmail = req.user?.email?.toLowerCase();

      if (leaderId || leaderEmail) {
        // Tìm các tổ có toTruong trùng id hoặc email
        // Lưu ý: toTruong.id trong DB là String, nên cần so sánh string với string
        
        // Thử nhiều cách query để đảm bảo tìm được
        let teams = [];
        
        // Cách 1: Dùng $elemMatch với $or
        const teamFilter1 = {
          toTruong: {
            $elemMatch: {
              $or: [
                leaderId ? { id: leaderId } : null,
                leaderEmail ? { email: leaderEmail } : null,
              ].filter(Boolean),
            },
          },
        };
        teams = await ToSanXuat.find(teamFilter1).select("_id maTo tenTo toTruong");
        
        // Cách 2: Nếu không tìm thấy, thử query trực tiếp với toTruong.id
        if (!teams.length && leaderId) {
          const teamFilter2 = {
            "toTruong.id": leaderId
          };
          teams = await ToSanXuat.find(teamFilter2).select("_id maTo tenTo toTruong");
        }
        
        // Cách 3: Nếu vẫn không tìm thấy, thử query với toTruong.email
        if (!teams.length && leaderEmail) {
          const teamFilter3 = {
            "toTruong.email": leaderEmail
          };
          teams = await ToSanXuat.find(teamFilter3).select("_id maTo tenTo toTruong");
        }
        
        if (!teams.length) {
          // Không set filter, sẽ trả về tất cả assignments
          // TODO: Cần gán tổ trưởng vào tổ trong database để lọc đúng
        } else {
          const teamIds = teams.map((t) => t._id.toString());
          // Lọc phân công có tổ thuộc danh sách trên
          filter["congViec.to.id"] = { $in: teamIds };
        }
      } else {
        // Nếu không xác định được tổ, trả về mảng rỗng
        return res.status(200).json([]);
      }
    }
    // Nếu là xưởng trưởng, chỉ hiển thị kế hoạch có sản phẩm trong danh sách phụ trách
    else if (req.user?.role === "xuongtruong" && req.user?.sanPhamPhuTrach?.length > 0) {
      const productIds = req.user.sanPhamPhuTrach.map(sp => sp.productId).filter(Boolean);
      
      if (productIds.length > 0) {
        filter["keHoach.sanPham.productId"] = { $in: productIds };
      } else {
        // Nếu không có productId nào hợp lệ, trả về mảng rỗng
        return res.status(200).json([]);
      }
    }
    
    const list = await WorkAssignment.find(filter).sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (err) {
    console.error('Error in getAssignments:', err);
    res.status(500).json({ error: err.message });
  }
};

/** Tổ trưởng chỉ xem phân công của tổ mình */
exports.getAssignmentsByTeam = async (req, res) => {
  try {
    // Xác định tổ mà tổ trưởng phụ trách dựa trên thông tin tài khoản
    const leaderId = req.user?.id?.toString() || req.user?._id?.toString();
    const leaderEmail = req.user?.email?.toLowerCase();

    if (!leaderId && !leaderEmail) {
      return res.status(403).json({
        message: "Không xác định được tổ của bạn. Vui lòng liên hệ quản trị viên.",
      });
    }

    // Tìm các tổ có toTruong trùng id hoặc email
    const teamFilter = {
      toTruong: {
        $elemMatch: {
          $or: [
            leaderId ? { id: leaderId } : null,
            leaderEmail ? { email: leaderEmail } : null,
          ].filter(Boolean),
        },
      },
    };

    const teams = await ToSanXuat.find(teamFilter).select("_id maTo tenTo");
    if (!teams.length) {
      return res.status(200).json([]);
    }

    const teamIds = teams.map((t) => t._id.toString());

    // Tìm các phân công có tổ thuộc danh sách trên
    const list = await WorkAssignment.find({
      "congViec.to.id": { $in: teamIds },
    }).sort({ createdAt: -1 });
    
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Xưởng trưởng tạo phân công cho tổ */
exports.createAssignment = async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.ngay = req.body.ngay || req.body.ngayPhanCong || new Date();
    payload.trangThai = req.body.trangThai || "Dang thuc hien";

    if (!payload.nguoiLap && req.user) {
      payload.nguoiLap = {
        id: req.user.id || req.user._id,
        hoTen: req.user.employee?.hoTen || req.user.hoTen || req.user.username,
        position: req.user.role || req.user.position,
      };
    }

    const assignment = await WorkAssignment.create(payload);
    
    // Chuyển trạng thái các tổ được phân công thành "Dang san xuat" (đang sản xuất)
    if (assignment.congViec && Array.isArray(assignment.congViec)) {
      const ToSanXuat = require("../models/ToSanXuat");
      
      for (const cv of assignment.congViec) {
        if (cv.to?.id) {
          try {
            const team = await ToSanXuat.findById(cv.to.id);
            if (team) {
              team.trangThai = "Dang san xuat";
              await team.save();
              console.log(`✅ Đã chuyển trạng thái tổ ${team.tenTo || cv.to.id} thành "Dang san xuat"`);
            }
          } catch (teamError) {
            console.error(`❌ Lỗi cập nhật trạng thái tổ ${cv.to.id}:`, teamError.message);
            // Không block response nếu lỗi
          }
        }
      }
    }
    
    res.status(201).json({ message: "Phân công thành công", assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Tổ trưởng tạo phân công ca làm đơn giản cho tổ của mình
 * Body tối thiểu: { date, shift, tasks, worker: { id, hoTen, email, maNV, role }, team: { id, tenTo } }
 */
exports.createAssignmentByTeamLeader = async (req, res) => {
  try {
    const { date, shift, tasks, worker, team } = req.body;

    if (!worker || !worker.id) {
      return res.status(400).json({ message: "Thiếu thông tin công nhân" });
    }
    if (!team || !team.id) {
      return res.status(400).json({ message: "Thiếu thông tin tổ" });
    }

    const payload = {
      ngay: date ? new Date(date) : new Date(),
      caLam: {
        id: "",
        tenCa: shift || "Ca không xác định",
      },
      congViec: [
        {
          to: {
            id: team.id,
            tenTo: team.tenTo || team.name || "",
          },
          moTa: tasks || "",
        },
      ],
      nguoiLap: {
        id: req.user?.id || req.user?._id,
        hoTen: req.user?.employee?.hoTen || req.user?.hoTen || req.user?.username,
        position: "totruong",
      },
      trangThai: "Dang thuc hien",
      nhanSu: [
        {
          id: worker.id,
          hoTen: worker.hoTen || worker.name || "",
          email: worker.email || "",
          maNV: worker.maNV || "",
          role: worker.role || "worker",
        },
      ],
      ghiChu: tasks || "",
    };

    const assignment = await WorkAssignment.create(payload);
    res
      .status(201)
      .json({ message: "Phân công ca làm thành công", assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật trạng thái phân công (hoàn thành / hủy) */
exports.updateAssignment = async (req, res) => {
  try {
    const updated = await WorkAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật phân công thành công", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Xóa một phân công công việc theo ID */
exports.deleteAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    
    if (!assignmentId) {
      return res.status(400).json({ message: "Thiếu ID phân công" });
    }

    const assignment = await WorkAssignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ message: "Không tìm thấy phân công công việc" });
    }

    // Xóa assignment
    await WorkAssignment.findByIdAndDelete(assignmentId);
    
    // Nếu assignment có tổ được phân công, có thể reset trạng thái tổ về "Active" nếu không còn assignment nào khác
    if (assignment.congViec && Array.isArray(assignment.congViec)) {
      for (const cv of assignment.congViec) {
        if (cv.to?.id) {
          try {
            // Kiểm tra xem tổ này còn assignment nào khác đang "Dang thuc hien" không
            const otherAssignments = await WorkAssignment.find({
              "congViec.to.id": cv.to.id,
              trangThai: "Dang thuc hien",
              _id: { $ne: assignmentId }
            });
            
            // Nếu không còn assignment nào, reset trạng thái tổ về "Active"
            if (otherAssignments.length === 0) {
              const team = await ToSanXuat.findById(cv.to.id);
              if (team && team.trangThai === "Dang san xuat") {
                team.trangThai = "Active";
                await team.save();
                console.log(`✅ Đã reset trạng thái tổ ${team.tenTo || cv.to.id} về "Active"`);
              }
            }
          } catch (teamError) {
            console.error(`❌ Lỗi cập nhật trạng thái tổ ${cv.to.id}:`, teamError.message);
            // Không block response nếu lỗi
          }
        }
      }
    }
    
    console.log(`✅ Đã xóa phân công công việc ${assignmentId}`);
    res.status(200).json({ 
      message: "Đã xóa phân công công việc thành công",
      deletedAssignment: assignment
    });
  } catch (err) {
    console.error("❌ Error deleting assignment:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/** Xóa tất cả phân công công việc theo planId */
exports.deleteAssignmentsByPlanId = async (req, res) => {
  try {
    const planId = req.params.planId;
    
    if (!planId) {
      return res.status(400).json({ message: "Thiếu planId" });
    }

    // Xóa tất cả WorkAssignment có keHoach.planId trùng với planId
    const result = await WorkAssignment.deleteMany({
      "keHoach.planId": planId.toString()
    });

    
    res.status(200).json({ 
      message: `Đã xóa ${result.deletedCount} phân công công việc`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("❌ Error deleting assignments by planId:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/** Ghi nhận kết quả sản xuất cho một phân công */
exports.submitProductionLog = async (req, res) => {
  try {
    const { assignmentId, soLuongHoanThanh, soLuongLoi, ghiChu, chiTietLoi } = req.body;

    const assignment = await WorkAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Không tìm thấy phân công" });
    }

    const logPayload = {
      phanCong: assignment._id,
      keHoach: assignment.keHoach,
      xuong: assignment.xuong,
      to: req.body.to || assignment.congViec?.[0]?.to,
      ca: assignment.caLam,
      ngay: req.body.ngay || assignment.ngay || new Date(),
      sanPham: assignment.keHoach?.sanPham,
      soLuongThucTe: soLuongHoanThanh,
      soLuongLoi: soLuongLoi || 0,
      soLuongDat: req.body.soLuongDat || assignment.keHoach?.soLuongCanSanXuat || 0,
      ghiChu,
      chiTietLoi: chiTietLoi || [],
      nguoiGhi: req.body.nguoiGhi || {
        id: req.user?.id || req.user?._id,
        hoTen: req.user?.employee?.hoTen || req.user?.hoTen || req.user?.username,
      },
    };

    const log = await ProductionLog.create(logPayload);

    await WorkAssignment.findByIdAndUpdate(assignmentId, { trangThai: "Hoan thanh" });

    res.status(201).json({ message: "Đã ghi nhận kết quả sản xuất", log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
