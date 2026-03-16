import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Departments() {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // --- CSS STYLE ĐỒNG BỘ GIAO DIỆN ---
  const styles = `
    .dept-container { padding: 30px; background: #f4f7f6; min-height: 100vh; font-family: 'Segoe UI', sans-serif; margin-left: 240px; }
    .dept-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; border: 1px solid #e0e0e0; }
    .input-group { display: flex; gap: 10px; margin-bottom: 25px; }
    .dept-input { flex: 1; padding: 10px 15px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; outline: none; }
    .dept-input:focus { border-color: #3498db; }
    .add-btn { background: #2ecc71; color: white; border: none; padding: 10px 25px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: 0.3s; }
    .add-btn:hover { background: #27ae60; }
    
    .dept-table { width: 100%; border-collapse: collapse; text-align: left; margin-top: 10px; }
    .dept-table th { background: #1e1e2f; color: white; padding: 15px; font-size: 13px; text-transform: uppercase; }
    .dept-table td { padding: 15px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333; }
    .dept-table tr:hover { background: #f9fbff; }
    
    .del-btn { background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; }
    .del-btn:hover { background: #c0392b; }
    .id-badge { background: #eee; padding: 2px 8px; border-radius: 4px; font-family: monospace; color: #666; }
  `;

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:4001/api/departments");
      setList(res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Lấy tên admin để ghi log khi tạo/xóa
  const getAdminName = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.username || "Bin";
  };

  const create = async () => {
    if (!name.trim()) return alert("Vui lòng nhập tên phòng ban!");
    
    try {
      await axios.post("http://localhost:4001/api/departments", {
        name,
        admin_name: getAdminName() // Gửi kèm tên để lưu log
      });
      setName("");
      load();
    } catch (err) {
      alert("Không thể thêm phòng ban");
    }
  };

  const del = async (id, deptName) => {
    if (!window.confirm(`Xác nhận xóa phòng ban: ${deptName}?`)) return;

    try {
      await axios.delete(`http://localhost:4001/api/departments/${id}`, {
        data: { admin_name: getAdminName() } // Gửi tên admin khi thực hiện xóa
      });
      load();
    } catch (err) {
      alert("Lỗi khi xóa phòng ban");
    }
  };

  return (
    <div className="dept-container">
      <style>{styles}</style>
      
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#1e1e2f", margin: 0 }}>🏢 Quản Lý Phòng Ban</h2>
        <p style={{ color: "#888", fontSize: "14px" }}>Thêm hoặc xóa các bộ phận làm việc trong hệ thống.</p>
      </div>

      <div className="dept-card">
        <div className="input-group">
          <input
            className="dept-input"
            value={name}
            placeholder="Nhập tên phòng ban mới (vd: BAR, TECH...)"
            onChange={(e) => setName(e.target.value)}
          />
          <button className="add-btn" onClick={create}>＋ Thêm mới</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>Đang tải dữ liệu...</div>
        ) : (
          <table className="dept-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>ID</th>
                <th>Tên Phòng Ban</th>
                <th style={{ width: "120px", textAlign: "center" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id}>
                  <td><span className="id-badge">#{d.id}</span></td>
                  <td style={{ fontWeight: "600" }}>{d.name}</td>
                  <td style={{ textAlign: "center" }}>
                    <button className="del-btn" onClick={() => del(d.id, d.name)}>
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && !loading && (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", color: "#999" }}>Chưa có phòng ban nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}