import React, { useEffect, useState } from "react";
import { fetchJobs, updateJob } from "../../../services/jobService";
import { fetchTeams, updateTeamStatus } from "../../../services/factoryService";
import { fetchProductionPlans } from "../../../services/planService";

// Phân tích sản phẩm phụ trách từ tên SP trong JWT
const parseCurrentProduct = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }
    const payload = JSON.parse(atob(token.split(".")[1]));
    const sp = (payload.sanPhamPhuTrach || [])[0];
    if (!sp) {
      return null;
    }
    
    const tenSP = sp.tenSP || sp.maSP || sp.productId || "";
    const raw = (tenSP || "").toLowerCase();

    let nhomSanPham = "khac";
    // Tìm kiếm theo từ khóa ngắn, không phụ thuộc dấu tiếng Việt
    // "tan" = hòa tan (nhưng phải không có "xay" để tránh nhầm)
    // "xay" = rang xay
    if (raw.includes("tan") && !raw.includes("xay")) {
      nhomSanPham = "hoatan";
    } else if (raw.includes("xay")) {
      nhomSanPham = "rangxay";
    }

    let nguyenLieu = "";
    // Tìm kiếm nguyên liệu (case-insensitive)
    if (raw.includes("robusta")) {
      nguyenLieu = "robusta";
    } else if (raw.includes("arabica")) {
      nguyenLieu = "arabica";
    } else if (raw.includes("chon") || raw.includes("chồn")) {
      nguyenLieu = "chon";
    }

    return { nhomSanPham, nguyenLieu };
  } catch (err) {
    return null;
  }
};

// Lấy thông tin user từ JWT token
const getCurrentUser = () => {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      return null;
    }
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.id || payload.userId || payload._id,
      email: payload.email,
      role: payload.role,
      hoTen: payload.hoTen || payload.name,
    };
  } catch (err) {
    console.error("Lỗi khi parse token:", err);
    return null;
  }
};

export default function PhanCong() {
  const [tab, setTab] = useState("danh-sach");
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    ngay: "",
    tenTo: "",
    maKH: "",
    congViec: "", // Lưu ID công việc
  });

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [currentProduct, setCurrentProduct] = useState(null);
  const [teams, setTeams] = useState([]);
  const [allTeams, setAllTeams] = useState([]); // Lưu tất cả tổ để filter
  const [plans, setPlans] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [teamsError, setTeamsError] = useState("");
  const [plansError, setPlansError] = useState("");

  // Load danh sách công việc từ backend
  useEffect(() => {
    const loadJobs = async () => {
      setLoadingJobs(true);
      setJobsError("");
      try {
        const data = await fetchJobs();
        setJobs(Array.isArray(data) ? data : []);
        const product = parseCurrentProduct();
        setCurrentProduct(product);
      } catch (err) {
        setJobsError("Không thể tải danh sách công việc");
      } finally {
        setLoadingJobs(false);
      }
    };

    loadJobs();
  }, []);

  // Lọc công việc theo sản phẩm phụ trách (Hòa tan / Rang xay)
  const filteredJobs = React.useMemo(() => {
    // Đảm bảo jobs là mảng
    if (!Array.isArray(jobs)) {
      return [];
    }

    // Nếu không có currentProduct hoặc nhomSanPham là "khac", hiển thị tất cả
    if (!currentProduct || !currentProduct.nhomSanPham || currentProduct.nhomSanPham === "khac") {
      return jobs;
    }

    const filtered = jobs.filter((job) => {
      // Chỉ giữ lại job có nhomSanPham khớp với sản phẩm phụ trách
      // Bỏ qua job không có nhomSanPham hoặc khác nhomSanPham
      if (!job.nhomSanPham) {
        return false;
      }
      return job.nhomSanPham === currentProduct.nhomSanPham;
    });
    return filtered;
  }, [jobs, currentProduct]);

  // Load danh sách tổ và kế hoạch
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      setTeamsError("");
      setPlansError("");
      try {
        const [teamsData, plansData] = await Promise.allSettled([
          fetchTeams(),
          fetchProductionPlans(),
        ]);
        
        // Xử lý kết quả teams
        if (teamsData.status === 'fulfilled') {
          setAllTeams(Array.isArray(teamsData.value) ? teamsData.value : []);
          console.log('✅ Loaded teams:', teamsData.value?.length || 0);
        } else {
          const error = teamsData.reason;
          console.error("❌ Lỗi khi tải danh sách tổ:", error);
          setTeamsError(
            error.response?.status === 403
              ? "Bạn không có quyền truy cập danh sách tổ"
              : error.response?.status === 401
              ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
              : `Không thể tải danh sách tổ: ${error.message || "Lỗi không xác định"}`
          );
          setAllTeams([]);
        }
        
        // Xử lý kết quả plans
        if (plansData.status === 'fulfilled') {
          setPlans(Array.isArray(plansData.value) ? plansData.value : []);
        } else {
          const error = plansData.reason;
          console.error("❌ Lỗi khi tải danh sách kế hoạch:", error);
          setPlansError(`Không thể tải danh sách kế hoạch: ${error.message || "Lỗi không xác định"}`);
          setPlans([]);
        }
      } catch (err) {
        console.error("Lỗi không mong đợi khi tải dữ liệu:", err);
        setTeamsError("Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Lọc tổ dựa trên nhomSanPham và nguyenLieu của tổ (ưu tiên) hoặc từ công việc
  useEffect(() => {
    if (allTeams.length === 0) {
      setTeams([]);
      return;
    }

    // Hàm sắp xếp tổ theo chức năng (định nghĩa ở đầu để dùng chung)
    const sortTeamsByFunction = (teamsArray) => {
      if (!Array.isArray(teamsArray) || teamsArray.length === 0) return [];
      
      return [...teamsArray].sort((a, b) => {
        const getPriority = (tenTo) => {
          if (!tenTo) return 99;
          const ten = String(tenTo).toLowerCase();
          // Thứ tự ưu tiên: Sàng lọc -> Chuẩn bị -> Rang -> Ủ nghỉ -> Xay -> Chiết xuất -> Sấy -> Đóng gói -> Dán nhãn -> Đóng hộp
          if (ten.includes("sàng lọc") || ten.includes("sang loc")) return 1;
          if (ten.includes("chuẩn bị") || ten.includes("chuan bi") || ten.includes("phối trộn") || ten.includes("phoi tron")) return 2;
          if (ten.includes("rang")) return 3;
          if (ten.includes("ủ nghỉ") || ten.includes("u nghi")) return 4;
          if (ten.includes("xay")) return 5;
          if (ten.includes("chiết xuất") || ten.includes("chiet xuat") || ten.includes("cô đặc") || ten.includes("co dac")) return 6;
          if (ten.includes("sấy") || ten.includes("say")) return 7;
          if (ten.includes("đóng gói") || ten.includes("dong goi") || ten.includes("sachet")) return 8;
          if (ten.includes("dán nhãn") || ten.includes("dan nhan")) return 9;
          if (ten.includes("đóng hộp") || ten.includes("dong hop")) return 10;
          return 99; // Các tổ khác xếp cuối
        };
        
        const priorityA = getPriority(a?.tenTo);
        const priorityB = getPriority(b?.tenTo);
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // Nếu cùng priority, sắp xếp theo tên
        const tenA = String(a?.tenTo || "");
        const tenB = String(b?.tenTo || "");
        return tenA.localeCompare(tenB, "vi");
      });
    };

    if (!currentProduct || !currentProduct.nhomSanPham || currentProduct.nhomSanPham === "khac") {
      // Nếu không có sản phẩm phụ trách hoặc là "khac", hiển thị tất cả tổ (đã sắp xếp)
      console.log('📋 Hiển thị tất cả tổ (không có sản phẩm phụ trách hoặc là "khac")');
      const sortedAllTeams = sortTeamsByFunction(allTeams);
      setTeams(sortedAllTeams);
      return;
    }

    // Ưu tiên lọc theo nhomSanPham và nguyenLieu của tổ (nếu có)
    let filteredTeams = allTeams.filter((team) => {
      // Nếu tổ có nhomSanPham, kiểm tra khớp với sản phẩm phụ trách
      if (team.nhomSanPham && team.nhomSanPham !== "khac") {
        if (team.nhomSanPham !== currentProduct.nhomSanPham) {
          return false;
        }
        
        // Nếu có nguyenLieu trong sản phẩm phụ trách, kiểm tra khớp
        if (currentProduct.nguyenLieu && team.nguyenLieu) {
          // Nếu tổ có nguyenLieu cụ thể, phải khớp
          if (team.nguyenLieu !== currentProduct.nguyenLieu) {
            return false;
          }
        }
        
        return true;
      }
      
      // Nếu tổ chưa có nhomSanPham, tự động suy ra từ xuongInfo.tenXuong
      if (team.xuongInfo && team.xuongInfo.tenXuong) {
        const tenXuong = (team.xuongInfo.tenXuong || "").toLowerCase();
        let teamNhomSanPham = "khac";
        
        if (tenXuong.includes("hòa tan") || tenXuong.includes("hoa tan")) {
          teamNhomSanPham = "hoatan";
        } else if (tenXuong.includes("rang xay") || tenXuong.includes("rangxay") || 
                   tenXuong.includes("arabica") || tenXuong.includes("robusta") || 
                   tenXuong.includes("civet")) {
          teamNhomSanPham = "rangxay";
        }
        
        if (teamNhomSanPham !== currentProduct.nhomSanPham) {
          return false;
        }
        
        // Kiểm tra nguyenLieu nếu có
        if (currentProduct.nguyenLieu) {
          if (tenXuong.includes("arabica") && currentProduct.nguyenLieu !== "arabica") {
            return false;
          } else if (tenXuong.includes("robusta") && currentProduct.nguyenLieu !== "robusta") {
            return false;
          } else if ((tenXuong.includes("civet") || tenXuong.includes("chồn") || tenXuong.includes("chon")) 
                     && currentProduct.nguyenLieu !== "chon") {
            return false;
          }
        }
        
        return true;
      }
      
      // Nếu không có thông tin để suy ra, giữ lại (sẽ filter tiếp bằng công việc)
      return true;
    });

    console.log(`📊 Sau khi lọc theo nhomSanPham: ${filteredTeams.length} tổ từ ${allTeams.length} tổ`);

    // Nếu sau khi lọc theo nhomSanPham vẫn còn nhiều tổ, sắp xếp và hiển thị
    if (filteredTeams.length > 0 && filteredTeams.length < allTeams.length) {
      // Đã có kết quả lọc tốt, sắp xếp và sử dụng kết quả này
      const sortedFilteredTeams = sortTeamsByFunction(filteredTeams);
      console.log(`✅ Hiển thị ${sortedFilteredTeams.length} tổ phù hợp với sản phẩm phụ trách (đã sắp xếp)`);
      setTeams(sortedFilteredTeams);
      return;
    }

    // Nếu không có tổ nào khớp theo nhomSanPham, fallback: lọc theo công việc
    if (filteredTeams.length === 0 && Array.isArray(filteredJobs) && filteredJobs.length > 0) {
      const relevantTeamIds = new Set();
      
      filteredJobs.forEach((job) => {
        if (job && job.to) {
          let teamId = null;
          if (typeof job.to === "object" && job.to._id) {
            teamId = job.to._id.toString();
          } else if (typeof job.to === "string") {
            teamId = job.to;
          } else if (job.to && job.to.toString) {
            teamId = job.to.toString();
          }
          
          if (teamId) {
            relevantTeamIds.add(teamId);
          }
        }
      });

      if (relevantTeamIds.size > 0) {
        filteredTeams = allTeams.filter((team) => {
          const teamIdStr = team._id ? team._id.toString() : null;
          return teamIdStr && relevantTeamIds.has(teamIdStr);
        });
        console.log(`✅ Fallback: Hiển thị ${filteredTeams.length} tổ từ công việc`);
      }
    }

    // Sắp xếp tổ theo chức năng (sấy, đóng gói, rang, xay, v.v.)
    const teamsToSort = filteredTeams.length > 0 ? filteredTeams : allTeams;
    const sortedTeams = sortTeamsByFunction(teamsToSort);

    console.log(`✅ Đã sắp xếp ${sortedTeams.length} tổ theo chức năng`);
    setTeams(sortedTeams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTeams, filteredJobs, currentProduct]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ngay, tenTo, maKH, congViec } = formData;
    if (!ngay || !tenTo || !maKH || !congViec) {
      setError("⚠️ Vui lòng nhập đầy đủ tất cả thông tin trước khi lưu!");
      return;
    }

    // Lấy thông tin user hiện tại từ token
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      setError("⚠️ Không thể xác định người dùng. Vui lòng đăng nhập lại!");
      return;
    }

    // Tìm công việc được chọn để lấy tên
    const selectedJob = filteredJobs.find(job => job._id === congViec);
    const tenCongViec = selectedJob ? selectedJob.tenCongViec : congViec;

    // Tìm tổ được chọn để cập nhật trạng thái (tìm trong cả teams và allTeams)
    const selectedTeam = teams.find(team => 
      team.tenTo === tenTo || team.maTo === tenTo || 
      (team._id && team._id.toString() === tenTo)
    ) || allTeams.find(team => 
      team.tenTo === tenTo || team.maTo === tenTo || 
      (team._id && team._id.toString() === tenTo)
    );
    
    console.log("🔍 Tìm tổ:", { tenTo, selectedTeam: selectedTeam ? selectedTeam.tenTo : "Không tìm thấy" });
    
    // Tạo dữ liệu phân công
    const assignmentData = {
      ...formData,
      congViec: tenCongViec,
      congViecId: congViec,
      nguoi: {
        id: currentUser.id,
        hoTen: currentUser.hoTen || currentUser.email,
        email: currentUser.email,
        role: currentUser.role,
      },
    };

    // Cập nhật trạng thái tổ thành "Dang san xuat" nếu có tổ được chọn
    if (selectedTeam && selectedTeam._id) {
      try {
        console.log(`🔄 Đang cập nhật trạng thái tổ ${selectedTeam.tenTo} (ID: ${selectedTeam._id})...`);
        await updateTeamStatus(selectedTeam._id, "Dang san xuat");
        console.log(`✅ Đã cập nhật trạng thái tổ ${selectedTeam.tenTo} thành "Đang sản xuất"`);
        
        // Cập nhật lại danh sách tổ để phản ánh trạng thái mới
        const updatedTeams = teams.map(team => 
          team._id && team._id.toString() === selectedTeam._id.toString()
            ? { ...team, trangThai: "Dang san xuat" }
            : team
        );
        setTeams(updatedTeams);
        
        // Cập nhật allTeams cũng
        const updatedAllTeams = allTeams.map(team => 
          team._id && team._id.toString() === selectedTeam._id.toString()
            ? { ...team, trangThai: "Dang san xuat" }
            : team
        );
        setAllTeams(updatedAllTeams);
      } catch (err) {
        console.error("❌ Lỗi khi cập nhật trạng thái tổ:", err);
        console.error("❌ Chi tiết lỗi:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        // Không chặn việc lưu phân công nếu cập nhật trạng thái thất bại
      }
    } else {
      console.warn("⚠️ Không tìm thấy tổ để cập nhật trạng thái:", tenTo);
    }

    // Cập nhật công việc với thông tin tổ phụ trách
    if (selectedJob && selectedJob._id && selectedTeam && selectedTeam._id) {
      try {
        console.log(`🔄 Đang cập nhật công việc ${selectedJob.tenCongViec} với tổ ${selectedTeam.tenTo}...`);
        const updatedJob = await updateJob(selectedJob._id, {
          to: selectedTeam._id,
        });
        
        if (updatedJob) {
          console.log(`✅ Đã cập nhật tổ phụ trách cho công việc ${selectedJob.tenCongViec}`);
          
          // Cập nhật lại danh sách công việc để hiển thị tổ phụ trách
          setJobs((prev) => 
            prev.map((job) => 
              job._id && job._id.toString() === selectedJob._id.toString()
                ? { 
                    ...job, 
                    to: selectedTeam._id,
                    toInfo: {
                      id: selectedTeam._id,
                      tenTo: selectedTeam.tenTo,
                      maTo: selectedTeam.maTo,
                    }
                  }
                : job
            )
          );
        }
      } catch (err) {
        console.error("❌ Lỗi khi cập nhật công việc:", err);
        // Không chặn việc lưu phân công nếu cập nhật công việc thất bại
      }
    }

    setJobs((prev) => [...prev, assignmentData]);
    setError("");
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setTab("danh-sach");
    }, 1500);

    setFormData({
      ngay: "",
      tenTo: "",
      maKH: "",
      congViec: "",
    });
  };

  const tabButtonClass = (current) =>
    `px-5 py-2.5 rounded-2xl font-semibold transition ${
      tab === current
        ? "bg-amber-600 text-white shadow"
        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
    }`;

  const inputClass =
    "mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500";

  // Định dạng lại thời gian hiển thị, bỏ phần sau :00.000Z
  const formatJobTime = (value) => {
    if (!value) return "-";

    // Nếu là Date object, chuyển sang ISO string
    const raw = value instanceof Date ? value.toISOString() : String(value);

    // Trường hợp ISO: 2025-12-02T08:00:00.000Z
    if (raw.includes("T")) {
      const [datePart, timePart = ""] = raw.split("T");
      const [hh = "", mm = ""] = timePart.split(":");
      if (datePart && hh && mm) {
        return `${datePart} ${hh}:${mm}`;
      }
      return datePart;
    }

    // Trường hợp đã ở dạng "YYYY-MM-DD HH:mm"
    return raw;
  };

  // Nhóm công việc theo loại sản phẩm (chỉ trên danh sách đã lọc)
  // Ưu tiên dùng field job.nhomSanPham từ backend; nếu không có thì fallback theo tên/mô tả
  const groupedJobs = React.useMemo(() => {
    const groups = {
      "Cà phê hạt": [],
      "Cà phê rang xay": [],
      "Cà phê hòa tan": [],
    };

    filteredJobs.forEach((job) => {
      let groupKey = "Cà phê hạt";

      if (job.nhomSanPham === "hoatan") {
        groupKey = "Cà phê hòa tan";
      } else if (job.nhomSanPham === "rangxay") {
        groupKey = "Cà phê rang xay";
      } else if (!job.nhomSanPham) {
        // Fallback: suy ra từ tên công việc / mô tả nếu chưa có nhomSanPham
        const text = `${job.tenCongViec || ""} ${job.moTa || ""}`.toLowerCase();
        if (text.includes("hòa tan")) {
          groupKey = "Cà phê hòa tan";
        } else if (text.includes("rang xay")) {
          groupKey = "Cà phê rang xay";
        }
      }

      groups[groupKey].push(job);
    });

    return groups;
  }, [filteredJobs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button className={tabButtonClass("danh-sach")} onClick={() => setTab("danh-sach")}>
          Danh sách công việc
        </button>
        <button className={tabButtonClass("tao")} onClick={() => setTab("tao")}>
          Phân công
        </button>
      </div>

      {tab === "danh-sach" && (
        <div className="bg-white border border-amber-100 rounded-3xl shadow">
          <div className="p-4 border-b border-amber-100 flex items-center justify-between">
            <h2 className="font-semibold text-amber-800">
              Danh sách công việc theo nhóm sản phẩm
            </h2>
            {loadingJobs && (
              <span className="text-xs text-amber-500">Đang tải...</span>
            )}
          </div>
          {jobsError && (
            <div className="px-4 py-2 text-sm text-red-600">{jobsError}</div>
          )}

          {!loadingJobs && filteredJobs.length === 0 && (
            <div className="px-4 py-4 text-center text-amber-500 text-sm">
              {jobs.length === 0
                ? "Chưa có công việc nào trong hệ thống."
                : "Không có công việc phù hợp với sản phẩm phụ trách của bạn."}
            </div>
          )}

          {!loadingJobs && filteredJobs.length > 0 && (
            <div className="space-y-6 p-4">
              {Object.entries(groupedJobs).map(
                ([groupName, groupJobs]) => {
                  // Nếu có sản phẩm phụ trách thì chỉ hiển thị đúng nhóm tương ứng
                  if (currentProduct?.nhomSanPham === "hoatan" && groupName !== "Cà phê hòa tan") {
                    return null;
                  }
                  if (currentProduct?.nhomSanPham === "rangxay" && groupName !== "Cà phê rang xay") {
                    return null;
                  }

                  // Chỉ render nhóm có dữ liệu
                  if (groupJobs.length === 0) {
                    return null;
                  }
                  return (
                    <div
                      key={groupName}
                      className="border border-amber-100 rounded-2xl overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-amber-50 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-amber-800">
                            {groupName}
                          </h3>
                          <p className="text-xs text-amber-500">
                            {groupJobs.length} công việc
                          </p>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-amber-900">
                          <thead className="bg-amber-700 text-white">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold">
                                Tên công việc
                              </th>
                              <th className="px-4 py-3 text-left font-semibold">
                                Tổ phụ trách
                              </th>
                              <th className="px-4 py-3 text-left font-semibold">
                                Số lượng NV
                              </th>
                              <th className="px-4 py-3 text-left font-semibold">
                                Thời gian bắt đầu
                              </th>
                              <th className="px-4 py-3 text-left font-semibold">
                                Thời gian kết thúc
                              </th>
                              <th className="px-4 py-3 text-left font-semibold">
                                Mô tả
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-100 bg-white">
                            {groupJobs.map((job) => (
                              <tr key={job._id} className="hover:bg-amber-50/60">
                                <td className="px-4 py-3 font-semibold">
                                  {job.tenCongViec}
                                </td>
                                <td className="px-4 py-3">
                                  {(() => {
                                    // Nếu có toInfo (đã được populate), hiển thị tên tổ
                                    if (job.toInfo && job.toInfo.tenTo) {
                                      return job.toInfo.tenTo;
                                    }
                                    // Nếu to là object có tenTo
                                    if (job.to && typeof job.to === 'object' && job.to.tenTo) {
                                      return job.to.tenTo;
                                    }
                                    // Tìm tổ từ danh sách allTeams dựa trên ID
                                    if (job.to) {
                                      const teamId = typeof job.to === 'object' && job.to._id 
                                        ? job.to._id.toString() 
                                        : job.to.toString();
                                      const team = allTeams.find(t => 
                                        t._id && t._id.toString() === teamId
                                      );
                                      if (team) {
                                        return team.tenTo || team.maTo || "-";
                                      }
                                    }
                                    return "-";
                                  })()}
                                </td>
                                <td className="px-4 py-3">
                                  {job.soLuongNhanVien ?? 0}
                                </td>
                                <td className="px-4 py-3">
                                  {formatJobTime(job.thoiGianBatDau)}
                                </td>
                                <td className="px-4 py-3">
                                  {formatJobTime(job.thoiGianKetThuc)}
                                </td>
                                <td
                                  className="px-4 py-3 max-w-xs truncate"
                                  title={job.moTa}
                                >
                                  {job.moTa || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}

      {tab === "tao" && (
        <div className="bg-white border border-amber-100 rounded-3xl shadow p-6">
          <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-amber-800">Ngày phân công</label>
              <input
                type="date"
                name="ngay"
                value={formData.ngay}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-amber-800">Tên tổ</label>
              <select
                name="tenTo"
                value={formData.tenTo}
                onChange={handleChange}
                className={inputClass}
                required
                disabled={loadingData}
              >
                <option value="">-- Chọn tổ --</option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id || team.tenTo || team.maTo}>
                    {team.tenTo} {team.maTo ? `(${team.maTo})` : ""}
                  </option>
                ))}
              </select>
              {loadingData && (
                <p className="text-xs text-amber-500 mt-1">Đang tải danh sách tổ...</p>
              )}
              {teamsError && (
                <p className="text-xs text-red-600 mt-1">{teamsError}</p>
              )}
              {!loadingData && !teamsError && teams.length === 0 && allTeams.length === 0 && (
                <p className="text-xs text-amber-500 mt-1">Không có tổ nào trong hệ thống</p>
              )}
              {!loadingData && !teamsError && teams.length > 0 && (
                <p className="text-xs text-amber-400 mt-1">
                  {currentProduct?.nhomSanPham && currentProduct.nhomSanPham !== "khac"
                    ? `Hiển thị ${teams.length} tổ phù hợp với sản phẩm phụ trách`
                    : `Hiển thị ${teams.length} tổ`}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-amber-800">Mã kế hoạch</label>
              <select
                name="maKH"
                value={formData.maKH}
                onChange={handleChange}
                className={inputClass}
                required
                disabled={loadingData}
              >
                <option value="">-- Chọn mã kế hoạch --</option>
                {plans.map((plan) => (
                  <option key={plan._id} value={plan.maKH || plan._id}>
                    {plan.maKH || plan._id} {plan.sanPham?.tenSanPham ? `- ${plan.sanPham.tenSanPham}` : ""}
                  </option>
                ))}
              </select>
              {loadingData && (
                <p className="text-xs text-amber-500 mt-1">Đang tải danh sách kế hoạch...</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-amber-800">Tên công việc</label>
              <select
                name="congViec"
                value={formData.congViec}
                onChange={handleChange}
                className={inputClass}
                required
                disabled={loadingJobs}
              >
                <option value="">-- Chọn công việc --</option>
                {filteredJobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.tenCongViec} {job.moTa ? `- ${job.moTa.substring(0, 50)}${job.moTa.length > 50 ? '...' : ''}` : ''}
                  </option>
                ))}
              </select>
              {loadingJobs && (
                <p className="text-xs text-amber-500 mt-1">Đang tải danh sách công việc...</p>
              )}
              {!loadingJobs && filteredJobs.length === 0 && (
                <p className="text-xs text-amber-500 mt-1">
                  {jobs.length === 0
                    ? "Chưa có công việc nào trong hệ thống"
                    : "Không có công việc phù hợp với sản phẩm phụ trách"}
                </p>
              )}
            </div>

            {error && (
              <div className="md:col-span-2 text-center text-red-600 font-semibold">{error}</div>
            )}

            <div className="md:col-span-2 flex justify-center">
              <button
                type="submit"
                className="px-10 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 font-semibold text-white shadow hover:shadow-lg transition"
              >
                Lưu phân công
              </button>
            </div>
          </form>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-amber-900 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
            ✅ Tạo bảng phân công thành công
          </div>
        </div>
      )}
    </div>
  );
}
