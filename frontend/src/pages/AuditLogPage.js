import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const styles = `
    .audit-container { padding: 30px; background: #f4f7f6; min-height: 100vh; font-family: 'Segoe UI', sans-serif; margin-left: 240px; }
    .header-box { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .audit-card { 
      background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); 
      overflow: hidden; border: 1px solid #e0e0e0;
    }
    .audit-table { width: 100%; border-collapse: collapse; text-align: left; }
    .audit-table th { background: #1e1e2f; color: white; padding: 15px; font-size: 14px; text-transform: uppercase; }
    .audit-table td { padding: 15px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333; }
    .audit-table tr:hover { background: #f9fbff; }
    
    .badge-action { 
      padding: 5px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; 
      color: white; display: inline-block; text-transform: uppercase;
    }
    .bg-update { background: #3498db; }
    .bg-approve { background: #2ecc71; }
    .bg-reject { background: #e74c3c; }
    .bg-delete { background: #95a5a6; }
    
    .timestamp { color: #888; font-style: italic; white-space: nowrap; font-size: 12px; }
    .admin-highlight { font-weight: 700; color: #2980b9; background: #eaf2f8; padding: 2px 6px; border-radius: 4px; }
    .details-text { line-height: 1.6; color: #444; }
    .refresh-btn { 
      background: #1e1e2f; color: white; border: none; padding: 10px 20px; 
      border-radius: 6px; cursor: pointer; font-weight: 600; transition: 0.3s;
    }
    .refresh-btn:hover { background: #3e3e5a; }
  `;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4001/api/audit-logs");
      setLogs(res.data);
    } catch (err) {
      console.error("Không thể lấy nhật ký:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sửa lỗi .includes() bằng cách kiểm tra type tồn tại
  const getActionClass = (type) => {
    if (!type) return "bg-delete";
    const t = type.toUpperCase();
    if (t.includes("UPDATE")) return "bg-update";
    if (t.includes("APPROVE")) return "bg-approve";
    if (t.includes("REJECT")) return "bg-reject";
    return "bg-delete";
  };

  return (
    <div className="audit-container">
      <style>{styles}</style>
      
      <div className="header-box">
        <h2 style={{ margin: 0, color: "#1e1e2f" }}>📋 System Audit Log</h2>
        <button className="refresh-btn" onClick={fetchLogs}>
          {loading ? "🔄 Đang tải..." : "🔄 Refresh Logs"}
        </button>
      </div>

      <div className="audit-card">
        {loading ? (
          <div style={{ padding: "50px", textAlign: "center" }}>Đang tải nhật ký hệ thống...</div>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th style={{ width: "180px" }}>Thời gian</th>
                <th style={{ width: "130px" }}>Hành động</th>
                <th>Chi tiết thay đổi từ Admin</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.id || index}>
                  <td className="timestamp">
                    <div>{new Date(log.created_at).toLocaleTimeString("vi-VN")}</div>
                    <div>{new Date(log.created_at).toLocaleDateString("vi-VN")}</div>
                  </td>
                  <td>
                    <span className={`badge-action ${getActionClass(log.action_type || log.action)}`}>
                      {log.action_type || log.action || "LOG"}
                    </span>
                  </td>
                  <td className="details-text">
                    <span className="admin-highlight">{log.admin_name || "Admin"}</span>
                    {" đã "}
                    <span style={{ fontWeight: 500 }}>
                      {log.action?.toLowerCase().includes("update") ? "cập nhật: " : "thực hiện: "}
                    </span>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && logs.length === 0 && (
          <div style={{ padding: "50px", textAlign: "center", color: "#999" }}>
            Chưa có dữ liệu nhật ký nào được ghi lại.
          </div>
        )}
      </div>
    </div>
  );
}