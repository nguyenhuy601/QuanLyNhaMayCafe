import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- Login
import Login from "./pages/auth/Login.jsx";

// --- Plan Management (Quản lý kế hoạch)
import PlanManagement from "./pages/PlanManagement/PlanManagement.jsx";

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

// --- Order (Nhân viên bán hàng)
import OrderLayout from "./layouts/OrderLayout.jsx";
import Order from "./pages/order/Order.jsx";
import OrderHome from"./components/order/OrderHome.jsx";
import CreateOrder from"./components/order/CreateOrder.jsx";
import OrderList from"./components/order/OrderList.jsx";
import OrderEdit from "./pages/order/OrderEdit.jsx";

//Quan ly kho thanh pham
import NhapKhoThanhPham from "./pages/QuanLyKhoThanhPham/NhapKhoThanhPham.jsx";

// --- QC routes
import QCRoute from "./routes/QCRoute";

// --- Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route - Login */}
        <Route path="/login" element={<Login />} />


        {/* Protected Routes - Worker */}
        <Route
          path="/worker"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <CongNhanLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WorkerHome />} />
          <Route path="shifts" element={<WorkerShifts />} />
          <Route path="salary" element={<WorkerSalary />} />
        </Route>

        {/* Protected Routes - Director */}
        <Route
          path="/director"
          element={
            <ProtectedRoute allowedRoles={["director"]}>
              <BanGiamDocLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DirectorHome />} />
          <Route path="approve-plan" element={<ApprovePlan />} />
          <Route path="approve-orders" element={<ApproveOrders />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Protected Routes - QC */}
        <Route  
          path="/qc/*"
          element={
            <ProtectedRoute allowedRoles={["qc"]}>
              <QCRoute />
            </ProtectedRoute>
          }
        />

        {/* Sales (Nhân viên bán hàng) */}
        <Route
          path="/orders/*"
          element={
            <ProtectedRoute allowedRoles={["sales", "orders"]}>
              <OrderLayout />
            </ProtectedRoute>
          }
        >
          {/* Outlet chính (Order.jsx) */}
          <Route element={<Order />}>
            <Route index element={<OrderHome />} />
            <Route path="create" element={<CreateOrder />} />
            <Route path="list" element={<OrderList />} />
            <Route path="/orders/edit/:id" element={<OrderEdit />} />
          </Route>
        </Route>

        {/* Protected Routes - Plan Management */}
        <Route
          path="/plan"
          element={
            <ProtectedRoute allowedRoles={["plan", "plan manager"]}>
              <PlanManagement />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - WareHouse */}
        <Route
          path="/warehouseproduct"
          element={
            <ProtectedRoute allowedRoles={["warehouseproduct"]}>
              <NhapKhoThanhPham />
            </ProtectedRoute>
          }
        />

        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}