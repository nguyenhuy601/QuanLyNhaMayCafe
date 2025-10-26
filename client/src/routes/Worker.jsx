// client/src/routes/index.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// ✅ Import layout & pages cho Công nhân
import CongNhanLayout from "@/layouts/CongNhan";
import WorkerHome from "@/pages/worker/Home";
import WorkerShifts from "@/pages/worker/Shifts";
import WorkerSalary from "@/pages/worker/Salary";

// (Tuỳ bạn có thể import thêm route khác như Login, Dashboard... ở đây)

export default function AppRoutes() {
  return (
    <Routes>
      {/* Các route khác (nếu có) */}
      {/* <Route path="/login" element={<Login />} /> */}

      {/* ✅ Route dành cho actor Công nhân */}
      <Route path="/worker" element={<CongNhanLayout />}>
        <Route index element={<WorkerHome />} />
        <Route path="shifts" element={<WorkerShifts />} />
        <Route path="salary" element={<WorkerSalary />} />
      </Route>

      {/* ✅ Nếu không khớp route nào, tự quay về /worker */}
      <Route path="*" element={<Navigate to="/worker" replace />} />
    </Routes>
  );
}
