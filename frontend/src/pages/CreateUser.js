import React, { useState } from "react";
import axios from "axios";

export default function CreateUser({ refresh }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [loading, setLoading] = useState(false);

  const styles = `
    .create-user-card { 
      max-width: 450px; 
      background: white; 
      padding: 30px; 
      border-radius: 12px; 
      box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
      border: 1px solid #e0e0e0;
      margin: 20px 0;
    }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #34495e; font-size: 14px; }
    
    .input-field { 
      width: 100%; 
      padding: 12px 15px; 
      border: 1px solid #ddd; 
      border-radius: 8px; 
      font-size: 14px; 
      outline: none; 
      transition: all 0.3s;
      box-sizing: border-box;
    }
    .input-field:focus { border-color: #3498db; box-shadow: 0 0 0 3px rgba(52,152,219,0.1); }
    
    .select-field { 
      width: 100%; 
      padding: 12px; 
      border-radius: 8px; 
      border: 1px solid #ddd; 
      background-color: #f9f9f9; 
      cursor: pointer; 
    }

    .btn-create { 
      width: 100%; 
      padding: 14px; 
      background: linear-gradient(135deg, #3498db, #2980b9); 
      color: white; 
      border: none; 
      border-radius: 8px; 
      font-weight: bold; 
      cursor: pointer; 
      transition: 0.3s; 
      font-size: 16px;
    }
    .btn-create:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-create:disabled { background: #bdc3c7; cursor: not-allowed; }

    .header-title { color: #1e1e2f; margin-top: 0; margin-bottom: 10px; font-size: 22px; }
    .sub-title { color: #888; font-size: 13px; margin-bottom: 25px; }
  `;

  const getAdminName = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.username || "Bin";
  };

  const save = async () => {
    if (!username || !password) return alert("Vui lòng nhập đầy đủ thông tin!");
    
    setLoading(true);
    try {
      await axios.post("http://localhost:4001/api/auth/register", {
        username: username,
        password: password,
        role: role,
        admin_name: getAdminName() // Ghi log người tạo là Bin
      });

      alert(`Đã tạo tài khoản "${username}" thành công!`);
      
      // Reset form
      setUsername("");
      setPassword("");
      setRole("staff");

      if (refresh) refresh();
    } catch (err) {
      const msg = err.response?.data?.message || "Tạo tài khoản thất bại";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user-card">
      <style>{styles}</style>
      
      <h2 className="header-title">➕ Tạo Tài Khoản Mới</h2>
      <p className="sub-title">Cấp quyền truy cập hệ thống cho nhân viên mới.</p>

      <div className="form-group">
        <label>Tên đăng nhập</label>
        <input
          className="input-field"
          placeholder="Ví dụ: binnie_staff"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Mật khẩu</label>
        <input
          className="input-field"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Vai trò hệ thống</label>
        <select
          className="select-field"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="staff">Nhân viên (Staff)</option>
          <option value="admin">Quản trị viên (Admin)</option>
        </select>
      </div>

      <button 
        className="btn-create" 
        onClick={save} 
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : "Tạo Tài Khoản"}
      </button>
    </div>
  );
}