import { Routes, Route } from "react-router-dom";
import QCLayout from "../layouts/QCLayout.jsx";
import KiemDinhList from "../pages/KiemDinhList.jsx";
import KiemDinhDetail from "../pages/KiemDinhDetail.jsx";
import KiemDinhProcessed from "../pages/KiemDinhProcessed.jsx";

const QCRoute = () => {
  return (
    <Routes>
      <Route element={<QCLayout />}>
        <Route index element={<KiemDinhList />} />
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
