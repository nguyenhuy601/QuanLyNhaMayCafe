import { Routes, Route } from "react-router-dom";
import KhoNVLLayout from "../layouts/KhoNVLLayout";
import ChonKeHoachNhap from "../pages/khoNVL/ChonKeHoach";
import PhieuNhap from "../pages/khoNVL/PhieuNhap";

const KhoNVLRoute = () => {
  return (
    <Routes>
      <Route element={<KhoNVLLayout />}>
        <Route path="phieu-nhap" element={<ChonKeHoachNhap />} />
        <Route path="nhap-kho/tao-phieu" element={<PhieuNhap     />} />
      </Route>
    </Routes>
  );
};

export default KhoNVLRoute;
