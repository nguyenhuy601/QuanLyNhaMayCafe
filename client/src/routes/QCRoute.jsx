import { Routes, Route } from "react-router-dom";
import QCLayout from "../layouts/QCLayout";
import KiemDinhList from "../pages/kiemDinh/KiemDinhList";
import KiemDinhDetail from "../pages/kiemDinh/KiemDinhDetail";
import KiemDinhProcessed from "../pages/kiemDinh/KiemDinhProcessed";

const QCRoute = () => {
  return (
    <Routes>
      <Route element={<QCLayout />}>
        {/* Danh sách yêu cầu chưa kiểm định */}
        <Route path="danh-sach" element={<KiemDinhList />} />
        
        {/* Danh sách QC đã kiểm định (sửa/xóa) */}
        <Route path="kiem-dinh" element={<KiemDinhProcessed />} />
        
        {/* Chi tiết kiểm định từng phiếu */}
        <Route path="kiem-dinh/:id" element={<KiemDinhDetail />} />
      </Route>
    </Routes>
  );
};

export default QCRoute;
