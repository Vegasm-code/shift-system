import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ApprovalPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Định nghĩa màu sắc cho các loại ca trực (dựa trên bảng shifts của bạn)
  const getShiftBadgeStyle = (shiftId) => {
    switch (shiftId) {
      case 5: // Giả sử 5 là ID của ca OFF trong DB của bạn
        return { backgroundColor: "#ffebee", color: "#d32f2f", label: "XIN NGHỈ (OFF)" };
      default:
        return { backgroundColor: "#e3f2fd", color: "#1976d2", label: "ĐỔI CA / TĂNG CA" };
    }
  };

  const styles = `
    .approval-page { padding: 30px; background-color: #f9fafe; min-height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .page-title { margin: 0; color: #2c3e50; font-size: 24px; font-weight: 700; }
    
    .request-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    
    .request-card { 
      background: white; border-radius: 12px; padding: 20px; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #edf2f7;
      transition: all 0.2s ease;
    }
    .request-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
    
    .badge { padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 15px; display: inline-block; }
    .status-badge { background: #fef3c7; color: #92400e; margin-left: 8px; }
    
    .info-item { margin-bottom: 12px; display: flex; align-items: center; font-size: 14px; }
    .info-label { color: #718096; width: 100px; font-weight: 600; }
    .info-value { color: #2d3748; font-weight: 700; }
    
    .action-group { display: flex; gap: 10px; margin-top: 20px; border-top: 1px solid #edf2f7; padding-top: 15px; }
    .btn { flex: 1; padding: 10px; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
    .btn-approve { background-color: #48bb78; color: white; }
    .btn-reject { background-color: #f56565; color: white; }
    .btn:hover { opacity: 0.9; }
    
    .empty-state { text-align: center; padding: 100px; color: #a0aec0; }
  `;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Gọi API lấy dữ liệu từ bảng shift_requests
      const res = await axios.get("http://localhost:4001/api/shift-requests");
      setRequests(res.data);
    } catch (err) {
      console.error("Lỗi khi tải yêu cầu:", err);
      // Dữ liệu giả lập nếu API chưa sẵn sàng để bạn test giao diện
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id, status) => {
    const actionText = status === 'approved' ? "DUYỆT" : "TỪ CHỐI";
    if (!window.confirm(`Bạn có chắc muốn ${actionText} yêu cầu này?`)) return;

    try {
      await axios.put(`http://localhost:4001/api/shift-requests/${id}`, { status });
      alert("Cập nhật trạng thái thành công!");
      fetchRequests(); // Tải lại danh sách sau khi xử lý
    } catch (err) {
      alert("Không thể cập nhật yêu cầu. Vui lòng kiểm tra lại server!");
    }
  };

  return (
    <div className="approval-page">
      <style>{styles}</style>
      
      <div className="page-header">
        <h1 className="page-title">Approval Management</h1>
        <button onClick={fetchRequests} className="btn" style={{ width: 'auto', background: '#edf2f7', color: '#4a5568' }}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Đang tải yêu cầu...</div>
      ) : requests.length > 0 ? (
        <div className="request-grid">
          {requests.map((req) => {
            const typeStyle = getShiftBadgeStyle(req.shift_id);
            return (
              <div key={req.id} className="request-card">
                <span className="badge" style={{ backgroundColor: typeStyle.backgroundColor, color: typeStyle.color }}>
                  {typeStyle.label}
                </span>
                <span className="badge status-badge">{req.status}</span>
                
                <div className="info-item">
                  <span className="info-label">Nhân viên:</span>
                  <span className="info-value">{req.employee_name || `ID: ${req.employee_id}`}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Ngày trực:</span>
                  <span className="info-value">
                    {new Date(req.request_date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                <div className="info-item">
                  <span className="info-label">Ghi chú:</span>
                  <span className="info-value" style={{ fontWeight: 'normal' }}>{req.reason || "Không có ghi chú"}</span>
                </div>

                <div className="action-group">
                  <button className="btn btn-approve" onClick={() => handleProcess(req.id, 'approved')}>APPROVE</button>
                  <button className="btn btn-reject" onClick={() => handleProcess(req.id, 'rejected')}>REJECT</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h3>☕ Hiện không có yêu cầu nào chờ phê duyệt.</h3>
          <p>Tất cả các yêu cầu đã được xử lý xong.</p>
        </div>
      )}
    </div>
  );
}