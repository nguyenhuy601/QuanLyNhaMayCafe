//import Login from "./pages/auth/Login";

//function App() {
 // return <Login />;
  
//}

//export default App
// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- Worker (Công nhân)
import CongNhanLayout from "./layouts/CongNhan.jsx";
import WorkerHome from "./pages/worker/Home.jsx";
import WorkerShifts from "./pages/worker/Shifts.jsx";
import WorkerSalary from "./pages/worker/Salary.jsx";

// --- Director (Ban giám đốc)
import BanGiamDocLayout from "./layouts/BanGiamDocLayout.jsx";
import DirectorHome from "./pages/director/Home.jsx";
import ApprovePlan from "./pages/director/ApprovePlan.jsx";
import ApproveOrders from "./pages/director/ApproveOrders.jsx";
import Reports from "./pages/director/Reports.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Worker */}
        <Route path="/worker" element={<CongNhanLayout />}>
          <Route index element={<WorkerHome />} />
          <Route path="shifts" element={<WorkerShifts />} />
          <Route path="salary" element={<WorkerSalary />} />
        </Route>

        {/* Director */}
        <Route path="/director" element={<BanGiamDocLayout />}>
          <Route index element={<DirectorHome />} />
          <Route path="approve-plan" element={<ApprovePlan />} />
          <Route path="approve-orders" element={<ApproveOrders />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Mặc định điều hướng vào director (bạn đổi lại nếu muốn) */}
        <Route path="*" element={<Navigate to="/director" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
