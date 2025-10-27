import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- Login
import Login from "./pages/auth/Login.jsx";

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

// --- QC routes
import QCRoute from "./routes/QCRoute";
import KhoNVLRoute from "./routes/KhoNVLRoute";


// --- Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/qc/*" element={<QCRoute />} />
      </Routes>
    </BrowserRouter>
  );
}