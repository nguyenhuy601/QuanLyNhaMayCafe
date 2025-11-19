import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- Login
import Login from "./features/auth/pages/Login.jsx";

// --- Plan Management (Quản lý kế hoạch)
import PlanManagement from "./features/plan/pages/PlanManagement.jsx";

// --- Worker (Công nhân)
import CongNhanLayout from "./features/worker/layouts/CongNhan.jsx";
import WorkerHome from "./features/worker/pages/Home.jsx";
import WorkerShifts from "./features/worker/pages/Shifts.jsx";
import WorkerSalary from "./features/worker/pages/Salary.jsx";

// --- Director (Ban giám đốc)
import BanGiamDocLayout from "./features/director/layouts/BanGiamDocLayout.jsx";
import DirectorHome from "./features/director/pages/Home.jsx";
import ApprovePlan from "./features/director/pages/ApprovePlan.jsx";
import ApproveOrders from "./features/director/pages/ApproveOrders.jsx";
import Reports from "./features/director/pages/Reports.jsx";

// --- Order (Nhân viên bán hàng)
import OrderLayout from "./features/order/layouts/OrderLayout.jsx";
import Order from "./features/order/pages/Order.jsx";
import OrderHome from "./features/order/components/OrderHome.jsx";
import CreateOrder from "./features/order/components/CreateOrder.jsx";
import OrderList from "./features/order/components/OrderList.jsx";
import OrderEdit from "./features/order/components/OrderEdit.jsx";

// --- Xuongtruong
import LayoutXuongTruong from "./features/factory/layouts/XuongTruong.jsx";
import TrangChu from "./features/factory/pages/Dashboard.jsx";
import PhanCong from "./features/factory/pages/PhanCong.jsx";
import ThongKe from "./features/factory/pages/ThongKe.jsx";
import XemKeHoach from "./features/factory/pages/XemKeHoach.jsx";

//Quan ly kho thanh pham
import NhapKhoThanhPham from "./features/warehouseProduct/pages/NhapKhoThanhPham.jsx";

// --- QC routes
import QCRoute from "./features/qc/routes/QCRoute.jsx";

// --- Protected Route Component
import ProtectedRoute from "./shared/components/ProtectedRoute.jsx";

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
            <Route path=":id" element={<OrderEdit />} />
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

        {/* Protected Routes - Xuong Truong */}
        <Route
          path="/factory/*"
          element={
            <ProtectedRoute allowedRoles={["factory"]}>
              <LayoutXuongTruong />
            </ProtectedRoute>
          }
        >
          <Route index element={<TrangChu />} />
          <Route path="phan-cong" element={<PhanCong />} />
          <Route path="thong-ke" element={<ThongKe />} />
          <Route path="xem-ke-hoach" element={<XemKeHoach />} />
        </Route>

        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}