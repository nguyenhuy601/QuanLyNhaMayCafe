import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createProductionPlan, fetchProductionPlans, deleteProductionPlan } from "../../../services/planService";
import { fetchMaterials } from "../../../services/productService";
import { fetchXuongs } from "../../../services/factoryService";

const CreatePlanModal = ({ onClose, orders }) => {
  const [formData, setFormData] = useState({
    maDonHang: "",
    tenSanPham: "",
    soLuongCanSanXuat: "",
    donVi: "kg", // Đơn vị của sản phẩm (kg hoặc túi)
    loaiTui: null, // Loại túi (500g, 1kg, hop)
    ngayBatDauDuKien: "",
    ngayKetThucDuKien: "",
    xuongPhuTrach: "",
  });

  const [materials, setMaterials] = useState([]);
  const [xuongs, setXuongs] = useState([]);

  // RADIO STATE CHO 3 NHÓM
  const [selectedBean, setSelectedBean] = useState(null);
  const [selectedBag, setSelectedBag] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);

  // ----------------------------------------
  // 1) Load NVL và Xưởng từ backend
  // ----------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const [materialsList, xuongsList] = await Promise.all([
          fetchMaterials(),
          fetchXuongs()
        ]);
        setMaterials(materialsList || []);
        
        // Loại bỏ trùng lặp dựa trên _id hoặc tenXuong
        const uniqueXuongs = [];
        const seenIds = new Set();
        const seenNames = new Set();
        
        (xuongsList || []).forEach((xuong) => {
          const id = xuong._id;
          const name = xuong.tenXuong || xuong.maXuong;
          
          // Chỉ thêm nếu chưa thấy _id hoặc tên
          if (id && !seenIds.has(id) && !seenNames.has(name)) {
            seenIds.add(id);
            seenNames.add(name);
            uniqueXuongs.push(xuong);
          } else if (!id && name && !seenNames.has(name)) {
            seenNames.add(name);
            uniqueXuongs.push(xuong);
          }
        });
        
        setXuongs(uniqueXuongs);
      } catch (error) {
        // Vẫn load materials nếu xuongs lỗi
        const materialsList = await fetchMaterials();
        setMaterials(materialsList || []);
      }
    }
    load();
  }, []);

  // ----------------------------------------
  // 2) Tự fill dữ liệu đơn hàng
  // ----------------------------------------
  useEffect(() => {
    if (orders && orders.length > 0) {
      const firstOrder = orders[0];
      const donVi = firstOrder.chiTiet?.[0]?.donVi || "kg";
      const loaiTui = firstOrder.chiTiet?.[0]?.loaiTui;
      const totalThanhPham = orders.reduce(
        (sum, o) => sum + (o.chiTiet?.[0]?.soLuong || 0),
        0
      );

      setFormData({
        maDonHang:
          orders.length === 1
            ? firstOrder.maDH
            : orders.map((o) => o.maDH).join(", "),
        tenSanPham:
          orders.length === 1
            ? firstOrder.chiTiet?.[0]?.sanPham?.tenSP || "Không có"
            : `Nhiều đơn (${orders.length})`,
        soLuongCanSanXuat: totalThanhPham,
        donVi: donVi,
        loaiTui: loaiTui, // Lưu loại túi để hiển thị
        ngayBatDauDuKien: "",
        ngayKetThucDuKien: "",
        xuongPhuTrach: "",
      });
    }
  }, [orders]);

  // ----------------------------------------
  // 3) Submit
  // ----------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.xuongPhuTrach) {
      alert("⚠️ Vui lòng chọn xưởng sản xuất!");
      return;
    }

    // Lấy đơn vị từ formData trước khi sử dụng
    const donVi = formData.donVi || "kg";
    const soLuongCanSanXuat = Number(formData.soLuongCanSanXuat);

    // Kiểm tra đã chọn NVL chưa
    if (!selectedBean) {
      alert("⚠️ Vui lòng chọn hạt cà phê (NVL thô)!");
      return;
    }
    
    if (donVi === "túi" && !selectedBag) {
      alert("⚠️ Vui lòng chọn bao bì!");
      return;
    }
    
    if (donVi === "túi" && !selectedLabel) {
      alert("⚠️ Vui lòng chọn tem nhãn!");
      return;
    }

    // Decode token
    const token = localStorage.getItem("token");
    let currentUserId = null;

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      currentUserId = decoded.id || decoded._id;
    } catch (err) {
      // Silent fail
    }

    // Build NVL list từ radio và tính số lượng riêng từng loại
    const nvlCanThiet = [];

    // Tính số lượng riêng từng loại
    let soLuongNVLTho = 0; // NVL thô (hạt cà phê) - kg
    let soLuongBaoBi = 0; // Bao bì - túi
    let soLuongTemNhan = 0; // Tem nhãn

    // Xác định trọng lượng túi từ loaiTui trong order hoặc selectedBag
    let trongLuongTui = 1; // Mặc định 1kg
    const loaiTui = orders?.[0]?.chiTiet?.[0]?.loaiTui;
    const isHop = loaiTui === "hop"; // Kiểm tra nếu là hộp (sản phẩm hòa tan)
    
    if (donVi === "túi" && !isHop) {
      // Chỉ xử lý túi bạc (500g, 1kg), không xử lý hộp ở đây
      if (loaiTui === "500g") {
        trongLuongTui = 0.5;
      } else if (loaiTui === "1kg") {
        trongLuongTui = 1;
      } else if (selectedBag) {
        // Fallback: đoán từ selectedBag
        const bagItem = materials.find((m) => m._id === selectedBag);
        if (bagItem) {
          const bagName = bagItem.tenSP?.toLowerCase() || "";
          const bagCode = bagItem.maSP?.toLowerCase() || "";
          
          if (bagName.includes("500g") || bagName.includes("500") || bagCode.includes("500") || bagCode === "nvl_bag_500g") {
            trongLuongTui = 0.5; // 500g = 0.5kg
          } else if (bagName.includes("1kg") || bagName.includes("1000") || bagCode.includes("1000") || bagCode === "nvl_bag_1kg") {
            trongLuongTui = 1; // 1kg
          }
        }
      }
    }

    // Hàm tính số lượng NVL dựa trên đơn vị và loại NVL
    const calculateNVLQuantity = (item, isBag = false, isLabel = false) => {
      if (donVi === "kg") {
        if (isBag) {
          // Bao bì: khi đơn vị là kg, không cần bao bì
          return 0;
        } else if (isLabel) {
          // Tem nhãn: khi đơn vị là kg, không cần tem nhãn
          return 0;
        } else {
          // NVL thô: số lượng NVL = số lượng sản phẩm * 1.1
          return Math.round(soLuongCanSanXuat * 1.1);
        }
      } else if (donVi === "túi") {
        if (isBag) {
          // Bao bì: số lượng hộp/túi = số lượng sản phẩm
          return soLuongCanSanXuat;
        } else if (isLabel) {
          // Tem nhãn: số lượng = số lượng hộp/túi
          return soLuongCanSanXuat;
        } else {
          // NVL thô
          if (isHop) {
            // Sản phẩm hòa tan (hộp): tính theo công thức riêng
            // Giả sử mỗi hộp chứa khoảng 0.5kg cà phê hòa tan (có thể điều chỉnh)
            const trongLuongHop = 0.5; // kg/hộp
            return Math.round(soLuongCanSanXuat * trongLuongHop * 1.1);
          } else {
            // Túi bạc: tính theo trọng lượng túi
            // Số lượng NVL (kg) = (số lượng túi * trọng lượng túi) * 1.1
            return Math.round(soLuongCanSanXuat * trongLuongTui * 1.1);
          }
        }
      }
      return 0;
    };

    const pushNVL = (id, isBag = false, isLabel = false) => {
      if (!id) return;
      const item = materials.find((m) => m._id === id);
      if (!item) return;

      const soLuong = calculateNVLQuantity(item, isBag, isLabel);
      
      // Đối với bao bì và tem nhãn, luôn cập nhật số lượng khi đã chọn
      if (isBag || isLabel) {
        // Luôn cập nhật số lượng riêng từng loại khi đã chọn
        if (isBag) {
          soLuongBaoBi = soLuong;
        } else if (isLabel) {
          soLuongTemNhan = soLuong;
        }
        
        // Chỉ thêm vào nvlCanThiet khi soLuong > 0
        if (soLuong > 0) {
          nvlCanThiet.push({
            productId: item._id,
            tenNVL: item.tenSP,
            maSP: item.maSP,
            soLuong: soLuong,
            loai: "nguyenvatlieu",
          });
        }
      } else {
        // NVL thô: chỉ thêm khi soLuong > 0
        if (soLuong > 0) {
          nvlCanThiet.push({
            productId: item._id,
            tenNVL: item.tenSP,
            maSP: item.maSP,
            soLuong: soLuong,
            loai: "nguyenvatlieu",
          });

          soLuongNVLTho = soLuong;
        }
      }
    };

    pushNVL(selectedBean, false, false); // Hạt cà phê (NVL thô)
    pushNVL(selectedBag, true, false); // Túi/bao bì
    pushNVL(selectedLabel, false, true); // Tem/nhãn

    // Debug: Log số lượng để kiểm tra
    console.log("📊 Debug - Số lượng NVL sau pushNVL:", {
      donVi,
      soLuongCanSanXuat,
      selectedBag: selectedBag ? "Đã chọn" : "Chưa chọn",
      selectedLabel: selectedLabel ? "Đã chọn" : "Chưa chọn",
      soLuongBaoBi,
      soLuongTemNhan,
      soLuongNVLTho,
      nvlCanThiet: nvlCanThiet.map(nvl => ({ tenNVL: nvl.tenNVL, maSP: nvl.maSP, soLuong: nvl.soLuong }))
    });

    // Xóa các kế hoạch cũ bị từ chối có cùng đơn hàng
    try {
      const allPlans = await fetchProductionPlans();
      const orderIds = orders.map(o => o._id?.toString() || o.maDH);
      
      // Tìm các kế hoạch có cùng đơn hàng và trạng thái "Từ chối"
      const rejectedPlans = allPlans.filter(plan => {
        if (plan.trangThai !== "Từ chối") return false;
        
        // Kiểm tra xem kế hoạch có chứa đơn hàng nào trong danh sách không
        if (plan.donHangLienQuan && Array.isArray(plan.donHangLienQuan)) {
          return plan.donHangLienQuan.some(dh => {
            const planOrderId = dh.orderId?.toString() || dh.maDonHang;
            return orderIds.includes(planOrderId);
          });
        }
        return false;
      });

      // Xóa từng kế hoạch bị từ chối
      for (const rejectedPlan of rejectedPlans) {
        if (rejectedPlan._id) {
          await deleteProductionPlan(rejectedPlan._id);
          console.log(`✅ Đã xóa kế hoạch bị từ chối: ${rejectedPlan.maKeHoach || rejectedPlan._id}`);
        }
      }
    } catch (error) {
      console.warn("⚠️ Không thể xóa kế hoạch cũ bị từ chối:", error);
      // Không chặn việc tạo kế hoạch mới nếu xóa thất bại
    }

    const payload = {
      donHangLienQuan: orders.map((o) => ({
        orderId: o._id,
        maDonHang: o.maDH,
        tenKhachHang: o.khachHang?.tenKH || "",
        tongTien: o.tongTien || 0,
      })),

      sanPham: {
        productId: orders[0].chiTiet[0].sanPham._id,
        tenSanPham: orders[0].chiTiet[0].sanPham.tenSP,
        maSP: orders[0].chiTiet[0].sanPham.maSP,
        loai: orders[0].chiTiet[0].sanPham.loai,
      },

      soLuongCanSanXuat: Number(formData.soLuongCanSanXuat),
      donVi: formData.donVi || "kg", // Lưu đơn vị
      soLuongNVLUocTinh: nvlCanThiet.reduce((sum, nvl) => sum + (nvl.soLuong || 0), 0), // Tính từ bảng thống kê
      soLuongNVLThucTe: nvlCanThiet.reduce((sum, nvl) => sum + (nvl.soLuong || 0), 0), // Tổng số lượng NVL thực tế đã tính
      soLuongNVLTho: soLuongNVLTho || 0, // Số lượng NVL thô (hạt cà phê) - kg
      soLuongBaoBi: soLuongBaoBi || 0, // Số lượng bao bì - túi
      soLuongTemNhan: soLuongTemNhan || 0, // Số lượng tem nhãn
      ngayBatDauDuKien: new Date(formData.ngayBatDauDuKien),
      ngayKetThucDuKien: new Date(formData.ngayKetThucDuKien),

      xuongPhuTrach: formData.xuongPhuTrach,
      nguoiLap: currentUserId,

      nvlCanThiet,
      ghiChu: "",
    };

    // Debug: Log payload trước khi gửi
    console.log("📤 Debug - Payload gửi lên:", {
      soLuongBaoBi: payload.soLuongBaoBi,
      soLuongTemNhan: payload.soLuongTemNhan,
      soLuongNVLTho: payload.soLuongNVLTho,
      donVi: payload.donVi,
      soLuongCanSanXuat: payload.soLuongCanSanXuat
    });

    const result = await createProductionPlan(payload);

    if (result.success) {
      alert("✅ Tạo kế hoạch thành công!");
      onClose();
    } else {
      alert("❌ Lỗi tạo kế hoạch: " + result.message);
    }
  };

  // ----------------------------------------
  // 4) Nhóm NVL theo mã sản phẩm
  // ----------------------------------------
  const nvlHat = materials.filter((m) => m.maSP.includes("BEAN"));
  
  // Kiểm tra sản phẩm có phải hòa tan không
  const isHoaTan = orders && orders.length > 0 && orders[0].chiTiet?.[0]?.sanPham?.tenSP 
    ? orders[0].chiTiet[0].sanPham.tenSP.toLowerCase().includes("hòa tan") || 
      orders[0].chiTiet[0].sanPham.tenSP.toLowerCase().includes("instant")
    : false;

  // Filter bao bì theo loại sản phẩm
  const nvlTui = materials.filter((m) => {
    if (isHoaTan) {
      // Sản phẩm hòa tan: chỉ hiển thị Hộp chứa 20 gói và Gói nhỏ 15g
      return m.maSP === "NVL_MASTER_BOX" || m.maSP === "NVL_SACHET_15G";
    } else {
      // Sản phẩm khác: hiển thị 3 loại túi
      return m.maSP === "NVL_BAG_500G" || 
             m.maSP === "NVL_BAG_1KG" || 
             m.maSP === "NVL_PREMIUM_BAG";
    }
  });
  
  const nvlTem = materials.filter((m) => m.maSP.includes("LABEL"));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
  <div className="bg-gradient-to-br from-amber-700 to-amber-800 rounded-2xl w-full max-w-5xl relative shadow-2xl 
      max-h-[90vh] flex flex-col overflow-hidden">

    {/* Nút đóng */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-white hover:text-gray-200 z-20"
    >
      <X size={24} />
    </button>

    {/* Header cố định */}
    <div className="p-6 pb-3 border-b border-amber-600">
      <h2 className="text-2xl font-bold text-white text-center">
        Phiếu kế hoạch sản xuất
      </h2>
    </div>

    {/* Body scrollable */}
    <div className="p-6 overflow-y-auto flex-1">
      <form
        id="create-plan-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Left info */}
        <div className="space-y-4">
          {[
            ["Mã đơn hàng", "maDonHang"],
            ["Tên sản phẩm", "tenSanPham"],
            ["Số lượng cần sản xuất", "soLuongCanSanXuat"],
          ].map(([label, key]) => {
            // Xác định đơn vị hiển thị cho số lượng
            let displayValue = formData[key];
            if (key === "soLuongCanSanXuat") {
              const donVi = formData.donVi;
              const loaiTui = formData.loaiTui;
              
              if (loaiTui === "hop") {
                displayValue = `${formData[key]} Hộp`;
              } else if (donVi === "túi") {
                if (loaiTui === "500g") {
                  displayValue = `${formData[key]} túi 500g`;
                } else if (loaiTui === "1kg") {
                  displayValue = `${formData[key]} túi 1kg`;
                } else {
                  displayValue = `${formData[key]} túi`;
                }
              } else {
                displayValue = `${formData[key]} ${donVi || "kg"}`;
              }
            }
            
            return (
              <div key={key}>
                <label className="text-white text-sm font-medium mb-1 block">{label}</label>
                <input
                  type="text"
                  value={displayValue}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-lg bg-amber-600 text-white font-medium border border-amber-500"
                />
              </div>
            );
          })}
          
          {/* Bảng thống kê NVL - Cải thiện UI */}
          <div className="mt-6 p-4 bg-gradient-to-br from-amber-900 to-amber-800 rounded-xl border-2 border-amber-600 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-yellow-300 rounded-full"></div>
              <label className="text-white text-base font-bold">Thống kê Nguyên vật liệu</label>
            </div>
            
            <div className="space-y-3">
              {/* NVL thô */}
              <div className="flex items-center justify-between p-3 bg-amber-800 bg-opacity-50 rounded-lg border border-amber-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white text-sm font-medium">NVL thô (hạt cà phê)</span>
                </div>
                <span className="text-yellow-200 font-bold text-sm">
                  {(() => {
                    if (!selectedBean) {
                      return "0 kg";
                    }
                    const donVi = formData.donVi || "kg";
                    const soLuong = Number(formData.soLuongCanSanXuat) || 0;
                    if (donVi === "kg") {
                      return `${Math.round(soLuong * 1.1)} kg`;
                    } else if (donVi === "túi") {
                      const loaiTui = orders?.[0]?.chiTiet?.[0]?.loaiTui;
                      const isHop = loaiTui === "hop";
                      
                      if (isHop) {
                        // Sản phẩm hòa tan (hộp): tính theo công thức riêng
                        const trongLuongHop = 0.5; // kg/hộp
                        return `${Math.round(soLuong * trongLuongHop * 1.1)} kg`;
                      } else {
                        // Túi bạc: tính theo trọng lượng túi
                        let trongLuongTui = 1;
                        if (loaiTui === "500g") {
                          trongLuongTui = 0.5;
                        } else if (loaiTui === "1kg") {
                          trongLuongTui = 1;
                        } else if (selectedBag) {
                          const bagItem = materials.find((m) => m._id === selectedBag);
                          if (bagItem) {
                            const bagCode = bagItem.maSP?.toLowerCase() || "";
                            if (bagCode === "nvl_bag_500g" || bagCode.includes("500")) {
                              trongLuongTui = 0.5;
                            } else if (bagCode === "nvl_bag_1kg" || bagCode.includes("1kg") || bagCode.includes("1000")) {
                              trongLuongTui = 1;
                            }
                          }
                        }
                        return `${Math.round(soLuong * trongLuongTui * 1.1)} kg`;
                      }
                    }
                    return "0 kg";
                  })()}
                </span>
              </div>
              
              {/* Bao bì */}
              <div className="flex items-center justify-between p-3 bg-amber-800 bg-opacity-50 rounded-lg border border-amber-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-white text-sm font-medium">Bao bì - túi</span>
                </div>
                <span className="text-yellow-200 font-bold text-sm">
                  {(() => {
                    if (!selectedBag) {
                      return "0 túi";
                    }
                    const donVi = formData.donVi || "kg";
                    const soLuong = Number(formData.soLuongCanSanXuat) || 0;
                    const loaiTui = orders?.[0]?.chiTiet?.[0]?.loaiTui || formData.loaiTui;
                    const isHop = loaiTui === "hop";
                    
                    // Hiển thị số lượng khi đã chọn bao bì
                    // Nếu đơn vị là túi hoặc có loaiTui, hiển thị số lượng
                    if (donVi === "túi" || loaiTui) {
                      return `${soLuong} ${isHop ? "hộp" : "túi"}`;
                    }
                    // Nếu đơn vị là kg và không có loaiTui, vẫn hiển thị số lượng nếu đã chọn
                    return `${soLuong} túi`;
                  })()}
                </span>
              </div>
              
              {/* Tem nhãn */}
              <div className="flex items-center justify-between p-3 bg-amber-800 bg-opacity-50 rounded-lg border border-amber-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-white text-sm font-medium">Tem nhãn</span>
                </div>
                <span className="text-yellow-200 font-bold text-sm">
                  {(() => {
                    if (!selectedLabel) {
                      return "0 cái";
                    }
                    const donVi = formData.donVi || "kg";
                    const soLuong = Number(formData.soLuongCanSanXuat) || 0;
                    const loaiTui = orders?.[0]?.chiTiet?.[0]?.loaiTui || formData.loaiTui;
                    
                    // Hiển thị số lượng khi đã chọn tem nhãn
                    // Nếu đơn vị là túi hoặc có loaiTui, hiển thị số lượng
                    if (donVi === "túi" || loaiTui) {
                      return `${soLuong} cái`;
                    }
                    // Nếu đơn vị là kg và không có loaiTui, vẫn hiển thị số lượng nếu đã chọn
                    return `${soLuong} cái`;
                  })()}
                </span>
              </div>
            </div>
            
            {/* Tổng kết */}
            <div className="mt-4 pt-3 border-t border-amber-700">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-semibold">Tổng NVL cần thiết:</span>
                <span className="text-yellow-300 font-bold">
                  {(() => {
                    if (!selectedBean) {
                      return "0 kg";
                    }
                    const donVi = formData.donVi || "kg";
                    const soLuong = Number(formData.soLuongCanSanXuat) || 0;
                    let total = 0;
                    
                    if (donVi === "kg") {
                      total = Math.round(soLuong * 1.1);
                    } else if (donVi === "túi") {
                      const loaiTui = orders?.[0]?.chiTiet?.[0]?.loaiTui;
                      const isHop = loaiTui === "hop";
                      
                      if (isHop) {
                        // Sản phẩm hòa tan (hộp): tính theo công thức riêng
                        const trongLuongHop = 0.5; // kg/hộp
                        total = Math.round(soLuong * trongLuongHop * 1.1);
                      } else {
                        // Túi bạc: tính theo trọng lượng túi
                        let trongLuongTui = 1;
                        if (loaiTui === "500g") {
                          trongLuongTui = 0.5;
                        } else if (loaiTui === "1kg") {
                          trongLuongTui = 1;
                        } else if (selectedBag) {
                          const bagItem = materials.find((m) => m._id === selectedBag);
                          if (bagItem) {
                            const bagCode = bagItem.maSP?.toLowerCase() || "";
                            if (bagCode === "nvl_bag_500g" || bagCode.includes("500")) {
                              trongLuongTui = 0.5;
                            } else if (bagCode === "nvl_bag_1kg" || bagCode.includes("1kg") || bagCode.includes("1000")) {
                              trongLuongTui = 1;
                            }
                          }
                        }
                        total = Math.round(soLuong * trongLuongTui * 1.1);
                      }
                    }
                    
                    return `${total} kg`;
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-white text-sm font-medium mb-1 block">
              Ngày bắt đầu: <span className="text-red-300">*</span>
            </label>
            <input
              type="date"
              value={formData.ngayBatDauDuKien}
              onChange={(e) =>
                setFormData({ ...formData, ngayBatDauDuKien: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg bg-amber-600 text-white font-medium border border-amber-500 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              required
            />
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-1 block">
              Ngày kết thúc: <span className="text-red-300">*</span>
            </label>
            <input
              type="date"
              value={formData.ngayKetThucDuKien}
              onChange={(e) =>
                setFormData({ ...formData, ngayKetThucDuKien: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg bg-amber-600 text-white font-medium border border-amber-500 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              required
            />
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-1 block">
              Xưởng phụ trách: <span className="text-red-300">*</span>
            </label>
            <select
              value={formData.xuongPhuTrach}
              onChange={(e) =>
                setFormData({ ...formData, xuongPhuTrach: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg bg-amber-600 text-white font-medium border border-amber-500 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              required
            >
              <option value="">-- Chọn xưởng --</option>
              {xuongs.length > 0 ? (
                xuongs.map((xuong) => (
                  <option key={xuong._id} value={xuong.tenXuong || xuong.maXuong}>
                    {xuong.tenXuong || xuong.maXuong}
                  </option>
                ))
              ) : (
                <>
                  <option value="Factory Arabica">Factory Arabica</option>
                  <option value="Factory Robusta">Factory Robusta</option>
                  <option value="Factory Civet">Factory Civet</option>
                  <option value="Factory Instant">Factory Instant</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* NVL SECTION */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-amber-800 to-amber-900 p-6 rounded-xl border-2 border-amber-700 shadow-lg">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-6 bg-yellow-300 rounded-full"></div>
            <h3 className="text-xl font-bold text-white">Nguyên vật liệu cần thiết</h3>
          </div>

          {/* Group A - Hạt cà phê */}
          <div className="mb-5">
            <h4 className="font-bold text-yellow-200 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">A</span>
              Hạt cà phê
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {nvlHat.map((n) => (
                <label 
                  key={n._id} 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedBean === n._id 
                      ? "bg-green-600 border-2 border-green-400" 
                      : "bg-amber-700 bg-opacity-50 border-2 border-transparent hover:bg-amber-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="bean"
                    checked={selectedBean === n._id}
                    onChange={() => setSelectedBean(n._id)}
                    className="w-4 h-4 text-green-500"
                  />
                  <div className="flex-1">
                    <span className="text-white font-medium block">{n.tenSP}</span>
                    <span className="text-amber-200 text-xs">{n.maSP}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Group B - Bao bì */}
          <div className="mb-5">
            <h4 className="font-bold text-yellow-200 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">B</span>
              Bao bì – Túi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {nvlTui.map((n) => (
                <label 
                  key={n._id} 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedBag === n._id 
                      ? "bg-blue-600 border-2 border-blue-400" 
                      : "bg-amber-700 bg-opacity-50 border-2 border-transparent hover:bg-amber-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="bag"
                    checked={selectedBag === n._id}
                    onChange={() => setSelectedBag(n._id)}
                    className="w-4 h-4 text-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-white font-medium block">{n.tenSP}</span>
                    <span className="text-amber-200 text-xs">{n.maSP}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Group C - Tem nhãn */}
          <div>
            <h4 className="font-bold text-yellow-200 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">C</span>
              Tem – Nhãn
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {nvlTem.map((n) => (
                <label 
                  key={n._id} 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedLabel === n._id 
                      ? "bg-purple-600 border-2 border-purple-400" 
                      : "bg-amber-700 bg-opacity-50 border-2 border-transparent hover:bg-amber-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="label"
                    checked={selectedLabel === n._id}
                    onChange={() => setSelectedLabel(n._id)}
                    className="w-4 h-4 text-purple-500"
                  />
                  <div className="flex-1">
                    <span className="text-white font-medium block">{n.tenSP}</span>
                    <span className="text-amber-200 text-xs">{n.maSP}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>

    {/* Footer cố định */}
    <div className="p-5 border-t-2 border-amber-600 flex justify-center gap-4 bg-gradient-to-r from-amber-900 to-amber-800">
      <button
        type="button"
        onClick={onClose}
        className="px-8 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg border border-amber-500"
      >
        Hủy
      </button>
      <button
        form="create-plan-form"
        type="submit"
        className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg border-2 border-yellow-400"
      >
        ✓ Xác nhận tạo kế hoạch
      </button>
    </div>

  </div>
</div>

  );
};

export default CreatePlanModal;
