import React, { useState, useEffect } from "react";
import axios from "axios";

// --- PHẦN STYLE TỐI ƯU: SÁT LỀ, THU NHỎ CỘT EMPLOYEE ---
const styles = `
  .preview-container {
    margin-left: 5px; 
    padding: 10px;
    background-color: #fff;
    min-height: 100vh;
    font-family: 'Segoe UI', Arial, sans-serif;
  }
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .table-wrapper {
    overflow: auto;
    max-height: calc(100vh - 100px);
    border: 1px solid #333;
    border-radius: 4px;
  }
  .schedule-table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    font-size: 11px;
    text-align: center;
  }
  
  .schedule-table th {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f8f9fa;
    border: 0.5px solid #444;
    padding: 4px 2px;
  }

  /* Cột Dept */
  .sticky-col-dept {
    position: sticky;
    left: 0;
    z-index: 5;
    background: #fff !important;
    border: 0.5px solid #444 !important;
    width: 25px; 
  }

  /* Cột Employee thu nhỏ 90px */
  .sticky-col-name {
    position: sticky;
    left: 25px; 
    z-index: 5;
    background: #fff !important;
    border: 0.5px solid #444 !important;
    text-align: left !important;
    padding-left: 5px !important;
    width: 90px;
    min-width: 90px;
    max-width: 90px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .schedule-table td {
    border: 0.5px solid #444;
    padding: 2px;
    height: 28px;
  }

  .day-name { font-size: 9px; }
  .day-num { font-size: 11px; font-weight: bold; }
  .weekend-text { color: #d9534f !important; background-color: #fff5f5; }
  .today-col { background-color: #fff3cd !important; outline: 1.5px solid #ffc107; z-index: 2; }

  .dept-cell-text {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 8px;
    font-weight: bold;
    color: #c0392b;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .shift-cell { font-weight: bold; font-size: 10px; }
  .shift-OFF { background-color: #f8d7da !important; color: #721c24; }
  .shift-UP { background-color: #d1ecf1 !important; color: #0c5460; }
  .shift-CT { background-color: #fff3cd !important; color: #856404; }
  .shift-PH { background-color: #d4edda !important; color: #155724; }

  @media print {
    .preview-container { margin-left: 0; padding: 0; }
    .sticky-col-dept, .sticky-col-name { position: static; width: auto; }
    .preview-header button { display: none; }
  }
`;

const SchedulePreview = () => {
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Tạo danh sách ngày hiển thị
  const generateDates = () => {
    const dates = [];
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 24);
    const end = new Date(now.getFullYear(), now.getMonth(), 23);
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };
  
  const dates = generateDates();

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 2. Lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, schedRes] = await Promise.all([
          axios.get("http://localhost:4001/api/employees"),
          axios.get("http://localhost:4001/api/schedules")
        ]);
        setEmployees(empRes.data);
        setSchedules(schedRes.data);
      } catch (err) {
        console.error("Lỗi dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 3. Logic tính tổng ngày OFF thực tế
  const calculateOffCount = (empId) => {
    return dates.reduce((count, date) => {
      const dateStr = date.toISOString().split('T')[0];
      const match = schedules.find(s => s.employee_id === empId && s.work_date.split('T')[0] === dateStr);
      if (match && match.shift_name === "OFF") {
        return count + 1;
      }
      return count;
    }, 0);
  };

  const getShiftName = (empId, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const match = schedules.find(s => s.employee_id === empId && s.work_date.split('T')[0] === dateStr);
    return match ? match.shift_name : "";
  };

  const renderDeptCell = (deptName, currentIndex) => {
    if (currentIndex > 0 && employees[currentIndex - 1].department === deptName) return null;
    let rowSpan = 0;
    for (let i = currentIndex; i < employees.length; i++) {
      if (employees[i].department === deptName) rowSpan++;
      else break;
    }
    return (
      <td className="sticky-col-dept" rowSpan={rowSpan}>
        <div className="dept-cell-text">{deptName || "STAFF"}</div>
      </td>
    );
  };

  if (loading) return <div style={{ padding: "20px" }}>Đang tải...</div>;

  return (
    <div className="preview-container">
      <style>{styles}</style>
      
      <div className="preview-header">
        <h2 style={{ margin: 0, fontSize: "18px" }}>
            📅 Lịch Trực: Tháng {new Date().getMonth() + 1}
        </h2>
        <button onClick={() => window.print()} style={{ padding: "5px 12px", cursor: "pointer", background: "#1e1e2f", color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px" }}>
          🖨️ In Lịch Trực
        </button>
      </div>

      <div className="table-wrapper">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="sticky-col-dept">Dept</th>
              <th className="sticky-col-name">Employee</th>
              <th style={{ width: '30px' }}>OFF</th>
              {dates.map((date, i) => {
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                return (
                  <th key={i} className={`${isWeekend ? "weekend-text" : ""} ${isToday(date) ? "today-col" : ""}`} style={{ width: '32px' }}>
                    <div className="day-name">{dayName}</div>
                    <div className="day-num">{date.getDate()}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, idx) => (
              <tr key={emp.id}>
                {renderDeptCell(emp.department, idx)}
                <td className="sticky-col-name" title={emp.name}>{emp.name}</td>
                
                {/* Cột OFF hiển thị tổng đã tính toán */}
                <td style={{ fontWeight: "bold", color: "#d9534f", background: "#f9f9f9" }}>
                  {calculateOffCount(emp.id)}
                </td>

                {dates.map((date, i) => {
                  const shift = getShiftName(emp.id, date);
                  return (
                    <td key={i} className={`shift-cell shift-${shift} ${isToday(date) ? "today-col" : ""}`}>
                      {shift}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchedulePreview;