import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

export default function AdminMenu() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const displayName = user.username || "Bin";

  // State lưu số lượng đơn chờ duyệt
  const [pendingCount, setPendingCount] = useState(0);

  // Logic lấy số lượng đơn từ Backend
  useEffect(() => {
    const fetchCount = async () => {
      if (isAdmin) {
        try {
          // Thống nhất đường dẫn với Backend (sử dụng /api/shift-requests/count-pending)
          const res = await axios.get("http://localhost:4001/api/shift-requests/count-pending");
          setPendingCount(res.data.count || 0);
        } catch (err) {
          console.error("Lỗi lấy số lượng đơn:", err);
        }
      }
    };

    fetchCount();
    // Tự động làm mới mỗi 60 giây
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const styles = `
    .sidebar { width: 240px; height: 100vh; background: #ffffff; color: #2c3e50; padding: 25px 15px; position: fixed; left: 0; top: 0; z-index: 1000; box-shadow: 2px 0 15px rgba(0,0,0,0.05); border-right: 1px solid #edf2f7; overflow-y: auto; }
    .user-profile { display: flex; align-items: center; gap: 12px; margin-bottom: 30px; padding: 12px; background: #f8fafc; border-radius: 12px; border: 1px solid #edf2f7; }
    .avatar-circle { width: 40px; height: 40px; background: linear-gradient(135deg, #3498db, #2ecc71); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 4px 10px rgba(52, 152, 219, 0.2); }
    .menu-link { color: #64748b; text-decoration: none; padding: 12px 15px; border-radius: 8px; font-size: 14px; transition: all 0.2s; display: flex; align-items: center; gap: 10px; margin-bottom: 4px; font-weight: 500; position: relative; }
    .menu-link:hover { background: #f1f5f9; color: #3498db; }
    .menu-link.active { background: #eff6ff; color: #3b82f6; font-weight: 600; }
    .special-link { background: #4f46e5 !important; color: white !important; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2); }
    .badge { background: #ff4d4f; color: white; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 10px; position: absolute; right: 12px; box-shadow: 0 2px 5px rgba(255, 77, 79, 0.3); }
    .section-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; margin: 20px 0 8px 12px; letter-spacing: 1px; }
    .btn-logout { width: 100%; background: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; padding: 10px; border-radius: 8px; cursor: pointer; margin-top: 30px; font-weight: bold; transition: 0.3s; }
    .btn-logout:hover { background: #f5222d; color: white; }
  `;

  const logout = () => {
    localStorage.removeItem("user");
    window.location = "/login";
  };

  const NavLink = ({ to, children, special, count }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`menu-link ${isActive ? 'active' : ''} ${special ? 'special-link' : ''}`}>
        {children}
        {count > 0 && <span className="badge">{count}</span>}
      </Link>
    );
  };

  return (
    <div className="sidebar">
      <style>{styles}</style>

      <div className="user-profile">
        <div className="avatar-circle">{displayName.charAt(0).toUpperCase()}</div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>{displayName}</div>
          <div style={{ fontSize: "11px", color: "#3498db" }}>
            {isAdmin ? "Administrator" : "Staff Member"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div className="section-label">Main</div>
        <NavLink to="/">🏠 Dashboard</NavLink>

        {isAdmin && (
          <NavLink to="/approvals" special count={pendingCount}>
            🔔 Approve Requests
          </NavLink>
        )}

        <div className="section-label">Scheduling</div>
        {isAdmin && <NavLink to="/schedule">📅 Manage Schedule</NavLink>}
        <NavLink to="/preview">📋 Preview Schedule</NavLink>

        {isAdmin && (
          <>
            <div className="section-label">Infrastructure</div>
            <NavLink to="/departments">🏢 Departments</NavLink>
            <NavLink to="/shifts">⏰ Shifts</NavLink>
            <NavLink to="/employees">👥 Employees</NavLink>

            <div className="section-label">System</div>
            <NavLink to="/users">🛡️ Manage Users</NavLink>
            <NavLink to="/create-user">➕ Create User</NavLink>
            <NavLink to="/audit-logs">📜 Audit Logs</NavLink>
          </>
        )}

        {!isAdmin && (
          <>
            <div className="section-label">Cá nhân</div>
            <NavLink to="/swap-request">🔄 Xin đổi ca</NavLink>
          </>
        )}

        <button onClick={logout} className="btn-logout">
          🚪 Logout
        </button>
      </div>
    </div>
  );
}