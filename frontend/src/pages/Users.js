import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const limit = 50;

  const API_AUTH = "http://localhost:4001/api/auth/users";

  const styles = `
    .users-container { padding: 30px; background: #f4f7f6; min-height: 100vh; font-family: 'Segoe UI', sans-serif; margin-left: 240px; }
    .users-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 25px; border: 1px solid #e0e0e0; }
    
    .search-bar { width: 100%; max-width: 400px; padding: 12px 15px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; outline: none; transition: 0.3s; }
    .search-bar:focus { border-color: #3498db; box-shadow: 0 0 5px rgba(52,152,219,0.2); }

    .user-table { width: 100%; border-collapse: collapse; }
    .user-table th { background: #1e1e2f; color: white; padding: 15px; text-align: left; font-size: 13px; text-transform: uppercase; }
    .user-table td { padding: 15px; border-bottom: 1px solid #eee; font-size: 14px; }
    
    .role-select { padding: 6px 10px; border-radius: 6px; border: 1px solid #ddd; font-weight: bold; cursor: pointer; }
    .role-admin { color: #e74c3c; border-color: #e74c3c; }
    .role-staff { color: #2ecc71; border-color: #2ecc71; }

    .btn { padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; border: none; font-size: 12px; transition: 0.3s; margin-right: 5px; }
    .btn-edit { background: #3498db; color: white; }
    .btn-pw { background: #f1c40f; color: #333; }
    .btn-del { background: #e74c3c; color: white; }
    .btn-save { background: #2ecc71; color: white; }
    .btn-cancel { background: #95a5a6; color: white; }

    .pagination { display: flex; align-items: center; justify-content: center; gap: 15px; margin-top: 25px; }
    .page-btn { padding: 8px 20px; border-radius: 6px; border: 1px solid #3498db; background: white; color: #3498db; cursor: pointer; font-weight: bold; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-btn:hover:not(:disabled) { background: #3498db; color: white; }
  `;

  // Lấy tên admin đang thực hiện thao tác
  const getAdminName = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.username || "Bin";
  };

  const loadUsers = async () => {
    try {
      const res = await axios.get(`${API_AUTH}?search=${search}&page=${page}&limit=${limit}`);
      setUsers(res.data);
    } catch (err) { console.error("Lỗi tải users:", err); }
  };

  useEffect(() => { loadUsers(); }, [search, page]);

  const deleteUser = async (id, uname) => {
    if (!window.confirm(`Xóa tài khoản ${uname}? Thao tác này không thể hoàn tác.`)) return;
    try {
      await axios.delete(`${API_AUTH}/${id}`, { data: { admin_name: getAdminName() } });
      loadUsers();
    } catch (err) { alert("Lỗi khi xóa người dùng"); }
  };

  const changeRole = async (id, role) => {
    try {
      await axios.put(`${API_AUTH}/${id}`, { role, admin_name: getAdminName() });
      loadUsers();
    } catch (err) { alert("Lỗi phân quyền"); }
  };

  const updateUser = async (id) => {
    try {
      await axios.put(`${API_AUTH}/${id}`, { username: newUsername, admin_name: getAdminName() });
      setEditingUser(null);
      loadUsers();
    } catch (err) { alert("Lỗi cập nhật"); }
  };

  const resetPassword = async (id) => {
    const newPassword = prompt("Nhập mật khẩu mới cho người dùng này:");
    if (!newPassword) return;
    try {
      await axios.put(`${API_AUTH}/${id}/password`, { password: newPassword, admin_name: getAdminName() });
      alert("Đã cập nhật mật khẩu thành công!");
    } catch (err) { alert("Lỗi đặt lại mật khẩu"); }
  };

  return (
    <div className="users-container">
      <style>{styles}</style>
      
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#1e1e2f", margin: 0 }}>🛡️ Quản Lý Tài Khoản</h2>
        <p style={{ color: "#888", fontSize: "14px" }}>Quản lý quyền truy cập và bảo mật hệ thống.</p>
      </div>

      <div className="users-card">
        <input 
          className="search-bar" 
          placeholder="🔍 Tìm theo tên đăng nhập..." 
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
        />

        <table className="user-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>ID</th>
              <th>Tên Đăng Nhập</th>
              <th style={{ width: "150px" }}>Vai Trò</th>
              <th style={{ textAlign: "right" }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ color: "#95a5a6", fontFamily: "monospace" }}>#{u.id}</td>
                <td>
                  {editingUser === u.id ? (
                    <input className="search-bar" style={{ marginBottom: 0, padding: "5px" }} value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                  ) : (
                    <strong style={{ color: "#2c3e50" }}>{u.username}</strong>
                  )}
                </td>
                <td>
                  <select 
                    className={`role-select ${u.role === 'admin' ? 'role-admin' : 'role-staff'}`}
                    value={u.role} 
                    onChange={(e) => changeRole(u.id, e.target.value)}
                  >
                    <option value="admin">ADMIN</option>
                    <option value="staff">STAFF</option>
                  </select>
                </td>
                <td style={{ textAlign: "right" }}>
                  {editingUser === u.id ? (
                    <>
                      <button className="btn btn-save" onClick={() => updateUser(u.id)}>💾 Lưu</button>
                      <button className="btn btn-cancel" onClick={() => setEditingUser(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-edit" onClick={() => { setEditingUser(u.id); setNewUsername(u.username); }}>✏️ Sửa</button>
                      <button className="btn btn-pw" onClick={() => resetPassword(u.id)}>🔑 Đổi Pass</button>
                      <button className="btn btn-del" onClick={() => deleteUser(u.id, u.username)}>🗑️ Xóa</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(page - 1)} disabled={page === 1}>Trang trước</button>
          <span style={{ fontWeight: "bold" }}>Trang {page}</span>
          <button className="page-btn" onClick={() => setPage(page + 1)} disabled={users.length < limit}>Trang sau</button>
        </div>
      </div>
    </div>
  );
}