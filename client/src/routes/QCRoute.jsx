import { Routes, Route, Navigate } from "react-router-dom";
import QCLayOut from "../layouts/QCLayout";
import KiemDinhList from "../pages/kiemDinh/KiemDinhList";
import KiemDinhDetail from "../pages/kiemDinh/KiemDinhDetail";

const QCRoute = () => {
  return (
    <Routes>
      <Route element={<QCLayOut />}>
        {/* Route mặc định khi vào /qc */}
        <Route index element={<Navigate to="kiem-dinh" replace />} />  
        <Route path="kiem-dinh" element={<KiemDinhList />} />
        <Route path="kiem-dinh/:id" element={<KiemDinhDetail />} />
      </Route>
    </Routes>
  );
};

export default QCRoute;
