import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Shifts() {
  const [shifts, setShifts] = useState([]);
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const API = "http://localhost:4001/api/shifts";

  const styles = `
    .shifts-container { padding: 30px; background: #f4f7f6; min-height: 100vh; font-family: 'Segoe UI', sans-serif; margin-left: 240px; }
    .shifts-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 25px; border: 1px solid #e0e0e0; }
    
    .add-section { display: flex; gap: 10px; margin-bottom: 25px; align-items: center; background: #ebf2f7; padding: 15px; border-radius: 8px; }
    .shift-input { padding: 10px; border: 1px solid #ccc; border-radius: 6px; outline: none; }
    .shift-input:focus { border-color: #3498db; }
    
    .btn { padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; border: none; transition: 0.3s; display: flex; align-items: center; gap: 5px; }
    .btn-add { background: #2ecc71; color: white; }
    .btn-add:hover { background: #27ae60; }
    .btn-edit { background: #3498db; color: white; font-size: 12px; }
    .btn-save { background: #27ae60; color: white; font-size: 12px; }
    .btn-del { background: #e74c3c; color: white; font-size: 12px; }
    .btn-cancel { background: #95a5a6; color: white; font-size: 12px; }

    .shifts-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .shifts-table th { background: #1e1e2f; color: white; padding: 15px; text-align: left; font-size: 13px; text-transform: uppercase; }
    .shifts-table td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px; }
    .shifts-table tr:hover { background: #f9fbff; }
    
    .time-badge { background: #f0f3f5; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-weight: 600; color: #2c3e50; }
  `;

  // Lấy tên admin đang đăng nhập để ghi log
  const getAdminName = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.username || "Bin";
  };

  const load = async () => {
    try {
      const res = await axios.get(API);
      setShifts(res.data);
    } catch (err) { console.error("Lỗi tải ca trực:", err); }
  };

  useEffect(() => { load(); }, []);

  function formatTime(t) {
    if (!t) return "--:--";
    // Xử lý nếu t là định dạng ISO hoặc chỉ là chuỗi HH:mm
    if (t.includes("T")) return new Date(t).toISOString().substring(11, 16);
    return t.substring(0, 5);
  }

  const add = async () => {
    if (!name) return alert("Vui lòng nhập tên ca!");
    try {
      await axios.post(API, {
        name,
        start_time: start,
        end_time: end,
        admin_name: getAdminName() // Gửi tên để Backend ghi Log
      });
      setName(""); setStart(""); setEnd("");
      load();
    } catch (err) { alert("Lỗi thêm ca trực"); }
  };

  const del = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ca trực này?")) return;
    try {
      await axios.delete(`${API}/${id}`, { data: { admin_name: getAdminName() } });
      load();
    } catch (err) { alert("Lỗi khi xóa"); }
  };

  const startEdit = (s) => {
    setEditId(s.id);
    setEditData({
      name: s.name,
      start: formatTime(s.start_time),
      end: formatTime(s.end_time)
    });
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${API}/${id}`, {
        name: editData.name,
        start_time: editData.start,
        end_time: editData.end,
        admin_name: getAdminName() // Gửi tên khi cập nhật
      });
      setEditId(null);
      load();
    } catch (err) { alert("Lỗi lưu chỉnh sửa"); }
  };

  return (
    <div className="shifts-container">
      <style>{styles}</style>
      
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#1e1e2f", margin: 0 }}>⏰ Quản Lý Ca Trực</h2>
        <p style={{ color: "#888", fontSize: "14px" }}>Thiết lập thời gian làm việc cho các ca A, B, C...</p>
      </div>

      <div className="shifts-card">
        <div className="add-section">
          <input className="shift-input" style={{flex: 2}} placeholder="Tên ca (vd: Ca A)" value={name} onChange={(e) => setName(e.target.value)} />
          <div style={{display:'flex', alignItems:'center', gap: '5px'}}>
            <label style={{fontSize:'12px', fontWeight:'bold'}}>Từ:</label>
            <input className="shift-input" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div style={{display:'flex', alignItems:'center', gap: '5px'}}>
            <label style={{fontSize:'12px', fontWeight:'bold'}}>Đến:</label>
            <input className="shift-input" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <button className="btn btn-add" onClick={add}>＋ Thêm Ca</button>
        </div>

        <table className="shifts-table">
          <thead>
            <tr>
              <th>Tên Ca</th>
              <th>Giờ Bắt Đầu</th>
              <th>Giờ Kết Thúc</th>
              <th style={{textAlign: 'center'}}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((s) => {
              const editing = editId === s.id;
              return (
                <tr key={s.id}>
                  <td>
                    {editing ? (
                      <input className="shift-input" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                    ) : (
                      <strong style={{color: '#2c3e50'}}>{s.name}</strong>
                    )}
                  </td>
                  <td>
                    {editing ? (
                      <input className="shift-input" type="time" value={editData.start} onChange={(e) => setEditData({ ...editData, start: e.target.value })} />
                    ) : (
                      <span className="time-badge">{formatTime(s.start_time)}</span>
                    )}
                  </td>
                  <td>
                    {editing ? (
                      <input className="shift-input" type="time" value={editData.end} onChange={(e) => setEditData({ ...editData, end: e.target.value })} />
                    ) : (
                      <span className="time-badge">{formatTime(s.end_time)}</span>
                    )}
                  </td>
                  <td style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {editing ? (
                      <>
                        <button className="btn btn-save" onClick={() => saveEdit(s.id)}>💾 Lưu</button>
                        <button className="btn btn-cancel" onClick={() => setEditId(null)}>✖ Hủy</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-edit" onClick={() => startEdit(s)}>✏️ Sửa</button>
                        <button className="btn btn-del" onClick={() => del(s.id)}>🗑️ Xóa</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}