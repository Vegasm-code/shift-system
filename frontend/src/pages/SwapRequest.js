import React, { useState, useEffect } from "react";
import axios from "axios";

export default function SwapRequest() {
    const [targetEmpId, setTargetEmpId] = useState("");
    const [date, setDate] = useState("");
    const [reason, setReason] = useState("");
    const [employees, setEmployees] = useState([]);
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        // Lấy danh sách nhân viên để chọn người đổi ca
        axios.get("http://localhost:4001/api/employees").then(res => {
            setEmployees(res.data.filter(e => e.id !== user.emp_id));
        });
    }, [user.emp_id]);

    const handleSubmit = async () => {
    // Kiểm tra chính xác những gì đang có trong localStorage
    console.log("Dữ liệu User hiện tại:", user);

    // THAY ĐỔI: Thử lấy user.id nếu user.emp_id bị trống
    const currentUserId = user.emp_id || user.id; 

    if (!currentUserId) {
        return alert("Lỗi: Không tìm thấy ID của bạn. Vui lòng đăng nhập lại!");
    }
    
    if (!targetEmpId || !date) {
        return alert("Vui lòng chọn ngày và đồng nghiệp!");
    }

    try {
        const res = await axios.post("http://localhost:4001/api/shift-requests/create", {
            employee_id: currentUserId, // Dùng ID đã được kiểm tra
            target_employee_id: parseInt(targetEmpId),
            request_date: date,
            reason: reason
        });

        if (res.data.success) {
            alert("Đã gửi đơn thành công!");
            window.location.reload(); 
        }
    } catch (err) {
        alert("Gửi đơn thất bại: " + (err.response?.data?.message || "Lỗi kết nối"));
    }
};

    return (
        <div className="container mt-5">
            <div className="card p-4 shadow-sm" style={{ maxWidth: '600px', margin: 'auto' }}>
                <h3>🔄 Xin Đổi Ca</h3>
                <div className="mb-3 mt-3">
                    <label>Ngày muốn đổi</label>
                    <input type="date" className="form-control" onChange={e => setDate(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label>Đổi với nhân viên nào?</label>
                    <select className="form-control" onChange={e => setTargetEmpId(e.target.value)}>
                        <option value="">-- Chọn nhân viên --</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                </div>
                <div className="mb-4">
                    <label>Lý do</label>
                    <textarea className="form-control" rows="3" onChange={e => setReason(e.target.value)}></textarea>
                </div>
                <button className="btn btn-primary w-100" onClick={handleSubmit}>Gửi Yêu Cầu</button>
            </div>
        </div>
    );
}