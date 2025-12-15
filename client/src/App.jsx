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
import ApproveMaterialRequests from "./features/director/pages/ApproveMaterialRequests.jsx";
import ApproveMaterialTransactions from "./features/director/pages/ApproveMaterialTransactions.jsx";
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
import WarehouseHeadConfirmIssues from "./features/factory/pages/WarehouseHeadConfirmIssues.jsx";


// --- To truong (Tổ trưởng)
import ToTruongLayout from "./features/teamleader/layouts/ToTruongLayout.jsx";
import ToTruongDashboard from "./features/teamleader/pages/Dashboard.jsx";
import ToTruongAttendance from "./features/teamleader/pages/Attendance.jsx";
import ToTruongShiftAssignment from "./features/teamleader/pages/ShiftAssignment.jsx";
import ToTruongTeams from "./features/teamleader/pages/Teams.jsx";
import FactoryTeams from "./features/factory/pages/Teams.jsx";

//Quan ly kho thanh pham
import WarehouseProductLayout from "./features/warehouseProduct/layout/WarehouseProductLayout.jsx";
import TrangChuWP from './features/warehouseProduct/pages/TrangChuWP.jsx';
import NhapKhoThanhPham from "./features/warehouseProduct/pages/NhapKhoThanhPham.jsx";
import ThongKeWP from './features/warehouseProduct/pages/ThongKeWP';
import XuatKhoThanhPham from './features/warehouseProduct/pages/XuatKhoThanhPham';
import KiemDinhQC from './features/warehouseProduct/pages/KiemDinhQC';

//Quan ly kho nguyen vat lieu
import WarehouseRawMaterialLayout from "./features/warehouseRawMaterial/layout/WarehouseRawMaterialLayout.jsx";
import TrangChuWRM from './features/warehouseRawMaterial/pages/TrangChu.jsx';
import NhapKhoNVL from "./features/warehouseRawMaterial/pages/NhapKhoNVL.jsx";
import XuatKhoNVL from './features/warehouseRawMaterial/pages/XuatKhoNVL.jsx';
import ThongKeWRM from './features/warehouseRawMaterial/pages/ThongKe.jsx';
import KeHoachDaDuyet from './features/warehouseRawMaterial/pages/KeHoachDaDuyet.jsx';
import ThongSoKho from './features/warehouseRawMaterial/pages/ThongSoKho.jsx';

// --- QC routes
import QCRoute from "./features/qc/routes/QCRoute.jsx";

// --- Protected Route Component
import ProtectedRoute from "./shared/components/ProtectedRoute.jsx";

// --- Admin feature
import AdminLayout from "./features/admin/layouts/AdminLayout.jsx";
import Admin from "./features/admin/pages/Admin.jsx";
import AdminOverview from "./features/admin/components/AdminOverview.jsx";
import UserList from "./features/admin/components/UserList.jsx";
import AccountManager from "./features/admin/components/AccountManager.jsx";
import XuongTruongManager from "./features/admin/components/XuongTruongManager.jsx";
import UserForm from "./features/admin/components/UserForm.jsx";
import RoleList from "./features/admin/components/RoleList.jsx";
import RoleForm from "./features/admin/components/RoleForm.jsx";
import DepartmentList from "./features/admin/components/DepartmentList.jsx";
import DepartmentForm from "./features/admin/components/DepartmentForm.jsx";
import PositionList from "./features/admin/components/PositionList.jsx";
import PositionForm from "./features/admin/components/PositionForm.jsx";

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
          <Route path="approve-material-requests" element={<ApproveMaterialTransactions />} />
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

        {/* Protected Routes - Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route element={<Admin />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/create" element={<UserForm />} />
            <Route path="users/:id" element={<UserForm />} />
            <Route path="accounts" element={<AccountManager />} />
            <Route path="xuong-truong" element={<XuongTruongManager />} />
            <Route path="roles" element={<RoleList />} />
            <Route path="roles/create" element={<RoleForm />} />
            <Route path="roles/:id" element={<RoleForm />} />
            <Route path="departments" element={<DepartmentList />} />
            <Route path="departments/create" element={<DepartmentForm />} />
            <Route path="departments/:id" element={<DepartmentForm />} />
            <Route path="positions" element={<PositionList />} />
            <Route path="positions/create" element={<PositionForm />} />
            <Route path="positions/:id" element={<PositionForm />} />
          </Route>
        </Route>

        {/* Protected Routes - Kho Thành Phẩm (khotp) */}
        <Route
          path="/khotp/*"
          element={
            <ProtectedRoute allowedRoles={["khotp"]}>
              <WarehouseProductLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TrangChuWP />} />
          <Route path="nhap-kho" element={<NhapKhoThanhPham />} />
          <Route path="xuat-kho" element={<XuatKhoThanhPham />} />
          <Route path="thong-ke" element={<ThongKeWP />} />
          <Route path="kiem-dinh-qc" element={<KiemDinhQC />} />
        </Route>

        {/* Protected Routes - Kho Nguyên Vật Liệu (khonvl) */}
        <Route
          path="/khonvl/*"
          element={
            <ProtectedRoute allowedRoles={["khonvl"]}>
              <WarehouseProductLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TrangChuWP />} />
          <Route path="nhap-kho" element={<NhapKhoThanhPham />} />
          <Route path="xuat-kho" element={<XuatKhoThanhPham />} />
          <Route path="thong-ke" element={<ThongKeWP />} />
        </Route>

        {/* Protected Routes - WareHouse (backward compatibility - redirect to khotp) */}
        <Route
          path="/warehouseproduct/*"
          element={
            <ProtectedRoute allowedRoles={["khotp"]}>
              <WarehouseProductLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TrangChuWP />} />
          <Route path="nhap-kho" element={<NhapKhoThanhPham />} />
          <Route path="xuat-kho" element={<XuatKhoThanhPham />} />
          <Route path="thong-ke" element={<ThongKeWP />} />
          <Route path="kiem-dinh-qc" element={<KiemDinhQC />} />
        </Route>

        {/* Protected Routes - Kho Nguyên Vật Liệu (warehouseRawMaterial) */}
        <Route
          path="/warehouse-raw-material/*"
          element={
            <ProtectedRoute allowedRoles={["khonvl"]}>
              <WarehouseRawMaterialLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TrangChuWRM />} />
          <Route path="ke-hoach" element={<KeHoachDaDuyet />} />
          <Route path="thong-so-kho" element={<ThongSoKho />} />
          <Route path="nhap-kho" element={<NhapKhoNVL />} />
          <Route path="xuat-kho" element={<XuatKhoNVL />} />
          <Route path="thong-ke" element={<ThongKeWRM />} />
        </Route>

        {/* Protected Routes - Xưởng trưởng */}
        <Route
          path="/xuongtruong/*"
          element={
            <ProtectedRoute allowedRoles={["xuongtruong"]}>
              <LayoutXuongTruong />
            </ProtectedRoute>
          }
        >
          <Route index element={<TrangChu />} />
          <Route path="phan-cong" element={<PhanCong />} />
          <Route path="thong-ke" element={<ThongKe />} />
          <Route path="xem-ke-hoach" element={<XemKeHoach />} />
          <Route path="thong-tin-to" element={<FactoryTeams />} />
          <Route path="duyet-nvl" element={<WarehouseHeadConfirmIssues />} />
        </Route>

        {/* Protected Routes - Tổ trưởng */}
        <Route
          path="/totruong"
          element={
            <ProtectedRoute allowedRoles={["totruong"]}>
              <ToTruongLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ToTruongDashboard />} />
          <Route path="cham-cong" element={<ToTruongAttendance />} />
          <Route path="phan-cong-ca" element={<ToTruongShiftAssignment />} />
          <Route path="to-nhom" element={<ToTruongTeams />} />
        </Route>

        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}