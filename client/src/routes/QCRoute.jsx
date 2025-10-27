import { Routes, Route } from "react-router-dom";
import QCLayOut from "../layouts/QCLayout";
import DSKiemDinh from "../pages/kiemDinh/DSKiemDinh";
import ChiTietKiemDinh from "../pages/kiemDinh/ChiTietKiemDinh";

const QCRoute = () => {
  return (
    <Routes>
      <Route element={<QCLayOut />}>
        <Route path="kiem-dinh" element={<DSKiemDinh />} />
        <Route path="kiem-dinh/:id" element={<ChiTietKiemDinh />} />
      </Route>
    </Routes>
  );
};

export default QCRoute;
