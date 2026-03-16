import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);

  const API_EMP = "http://localhost:4001/api/employees";
  const API_DEPT = "http://localhost:4001/api/departments";

  const styles = `
    .emp-container { padding: 30px; background: #f4f7f6; min-height: 100vh; font-family: 'Segoe UI', sans-serif; margin-left: 240px; }
    .emp-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 25px; border: 1px solid #e0e0e0; }
    
    .action-bar { display: flex; gap: 12px; margin-bottom: 25px; align-items: center; background: #fff; padding: 15px; border-radius: 8px; border: 1px dashed #3498db; }
    .form-input { padding: 10px 15px; border: 1px solid #ddd; border-radius: 6px; outline: none; font-size: 14px; }
    .form-select { padding: 10px; border: 1px solid #ddd; border-radius: 6px; background: white; cursor: pointer; }
    
    .btn { padding: 9px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; border: none; transition: 0.3s; display: inline-flex; align-items: center; gap: 6px; }
    .btn-add { background: #3498db; color: white; }
    .btn-add:hover { background: #2980b9; }
    .btn-edit { background: #f39c12; color: white; font-size: 12px; }
    .btn-update { background: #27ae60; color: white; font-size: 12px; }
    .btn-del { background: #e74c3c; color: white; font-size: 12px; }
    .btn-cancel { background: #95a5a6; color: white; font-size: 12px; }

    .emp-table { width: 100%; border-collapse: collapse; }
    .emp-table th { background: #1e1e2f; color: white; padding: 15px; text-align: left; font-size: 13px; text-transform: uppercase; }
    .emp-table td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px; color: #2c3e50; }
    .emp-table tr:hover { background: #f8fbff; }
    
    .dept-badge { background: #e8f4fd; color: #2980b9; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .id-text { color: #95a5a6; font-family: monospace; font-weight: bold; }
  `;

  const getAdminName = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.username || "Bin";
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        axios.get(API_EMP),
        axios.get(API_DEPT)
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (err) { console.error("Lỗi tải dữ liệu:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const addEmployee = async () => {
    if (!name || !departmentId) return alert("Vui lòng nhập đủ tên và phòng ban!");
    try {
      await axios.post(API_EMP, {
        name,
        department_id: departmentId,
        admin_name: getAdminName()
      });
      setName(""); setDepartmentId("");
      loadData();
    } catch (err) { alert("Lỗi khi thêm nhân viên"); }
  };

  const deleteEmployee = async (id, empName) => {
    if (!window.confirm(`Xóa nhân viên ${empName}?`)) return;
    try {
      await axios.delete(`${API_EMP}/${id}`, { data: { admin_name: getAdminName() } });
      loadData();
    } catch (err) { alert("Lỗi khi xóa"); }
  };

  const startEdit = (emp) => {
    setEditId(emp.id);
    setEditName(emp.name);
    setEditDepartmentId(emp.department_id);
  };

  const updateEmployee = async () => {
    try {
      await axios.put(`${API_EMP}/${editId}`, {
        name: editName,
        department_id: editDepartmentId,
        admin_name: getAdminName()
      });
      setEditId(null);
      loadData();
    } catch (err) { alert("Lỗi cập nhật nhân viên"); }
  };

  return (
    <div className="emp-container">
      <style>{styles}</style>
      
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#1e1e2f", margin: 0 }}>👥 Quản Lý Nhân Viên</h2>
        <p style={{ color: "#888", fontSize: "14px" }}>Danh sách nhân viên casino theo từng bộ phận.</p>
      </div>

      <div className="emp-card">
        <div className="action-bar">
          <input className="form-input" style={{flex: 1}} placeholder="Họ tên nhân viên..." value={name} onChange={(e) => setName(e.target.value)} />
          <select className="form-select" style={{width: '200px'}} value={departmentId} onChange={(e)=>setDepartmentId(e.target.value)}>
            <option value="">-- Chọn phòng ban --</option>
            {departments.map(d=>(<option key={d.id} value={d.id}>{d.name}</option>))}
          </select>
          <button className="btn btn-add" onClick={addEmployee}>＋ Thêm mới</button>
        </div>

        <table className="emp-table">
          <thead>
            <tr>
              <th style={{width: '80px'}}>ID</th>
              <th>Họ và Tên</th>
              <th>Phòng Ban</th>
              <th style={{textAlign: 'center'}}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(e => {
              const isEditing = editId === e.id;
              return (
                <tr key={e.id}>
                  <td className="id-text">#{e.id}</td>
                  <td>
                    {isEditing ? (
                      <input className="form-input" value={editName} onChange={(ev)=>setEditName(ev.target.value)} />
                    ) : (
                      <strong>{e.name}</strong>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select className="form-select" value={editDepartmentId} onChange={(ev)=>setEditDepartmentId(ev.target.value)}>
                        {departments.map(d=>(<option key={d.id} value={d.id}>{d.name}</option>))}
                      </select>
                    ) : (
                      <span className="dept-badge">{e.department || "N/A"}</span>
                    )}
                  </td>
                  <td style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {isEditing ? (
                      <>
                        <button className="btn btn-update" onClick={updateEmployee}>💾 Lưu</button>
                        <button className="btn btn-cancel" onClick={() => setEditId(null)}>✖ Hủy</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-edit" onClick={()=>startEdit(e)}>✏️ Sửa</button>
                        <button className="btn btn-del" onClick={() => deleteEmployee(e.id, e.name)}>🗑️ Xóa</button>
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