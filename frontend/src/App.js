import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import CreateUser from "./pages/CreateUser";
import ScheduleBoard from "./components/ScheduleBoard";
import AdminMenu from "./components/AdminMenu";
import Users from "./pages/Users";
import Departments from "./pages/Departments";
import Shifts from "./pages/Shifts";
import ApprovalPage from './pages/ApprovalPage';
import AuditLogPage from './pages/AuditLogPage';
import SchedulePreview from "./components/SchedulePreview";

// THÊM DÒNG NÀY: Import trang đổi ca (Hãy đảm bảo bạn đã tạo file này trong thư mục pages)
import SwapRequest from "./pages/SwapRequest"; 

function PrivateRoute({ children }) {
  const user = localStorage.getItem("user");
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}

export default function App() {
  const user = localStorage.getItem("user");

  return (
    <BrowserRouter>
      {/* Chỉ hiện Menu khi đã đăng nhập */}
      {user && <AdminMenu />}

      <div style={{ marginLeft: user ? "240px" : "0", padding: "20px", transition: "0.3s" }}>
        <Routes>
          {/* Route công khai */}
          <Route path="/login" element={<Login />} />

          {/* Các Route cần đăng nhập (PrivateRoute) */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/departments" element={<PrivateRoute><Departments /></PrivateRoute>} />
          <Route path="/shifts" element={<PrivateRoute><Shifts /></PrivateRoute>} />
          <Route path="/schedule" element={<PrivateRoute><ScheduleBoard /></PrivateRoute>} />
          <Route path="/employees" element={<PrivateRoute><Employees /></PrivateRoute>} />
          <Route path="/create-user" element={<PrivateRoute><CreateUser /></PrivateRoute>} />
          <Route path="/approvals" element={<PrivateRoute><ApprovalPage /></PrivateRoute>} />
          <Route path="/audit-logs" element={<PrivateRoute><AuditLogPage /></PrivateRoute>} />
          <Route path="/preview" element={<PrivateRoute><SchedulePreview /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
          
          {/* Route cho trang đổi ca của Staff */}
          <Route path="/swap-request" element={<PrivateRoute><SwapRequest /></PrivateRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}