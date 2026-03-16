import { useEffect, useState } from "react";
import axios from "axios";

export default function ScheduleBoard() {
  const [employees, setEmployees] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [previewMode, setPreviewMode] = useState(false);
  const [shifts, setShifts] = useState([]);
  
  const [filterDept, setFilterDept] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Định mức ngày nghỉ tối đa
  const MAX_OFF_DAYS = 6;

  const styles = `
    .schedule-table { border-collapse: collapse; min-width: 1200px; text-align: center; border: 1px solid #333; }
    .sticky-header { position: sticky; top: 0; background: #f2f2f2; z-index: 4; border: 1px solid #333; }
    .sticky-cell { position: sticky; left: 40px; background: #ffffff; font-weight: bold; z-index: 1; min-width: 140px; border: 1px solid #333; }
    .dept-vertical-cell { 
      background-color: #f8f9fa; border: 1px solid #333 !important; 
      text-align: center; vertical-align: middle; width: 40px; padding: 10px 0; 
      position: sticky; left: 0; z-index: 2;
    }
    .vertical-text { 
      writing-mode: vertical-rl; transform: rotate(180deg); 
      text-transform: uppercase; font-weight: bold; color: #d9534f; 
      letter-spacing: 4px; white-space: nowrap; display: inline-block;
    }
    
    .off-column { font-weight: bold; width: 50px; border: 1px solid #333; transition: all 0.3s; }
    .off-quota-exceeded { background-color: #ff4d4f !important; color: white !important; }
    .off-quota-normal { background-color: #f9f9f9; color: black; }

    select { border: 1px solid #ccc; border-radius: 3px; cursor: pointer; height: 25px; width: 65px; }
    select:disabled { 
      border: none; appearance: none; -webkit-appearance: none; -moz-appearance: none;
      color: black !important; opacity: 1; text-align: center; font-weight: bold; background-image: none;
    }

    .warning-cell { border: 2px solid #ff4d4f !important; position: relative; }
    .warning-dot { position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; background-color: red; border-radius: 50%; border: 1px solid white; z-index: 5; }
    .filter-box { padding: 6px; border-radius: 4px; border: 1px solid #d9534f; font-weight: bold; margin-right: 10px; }
    .search-box { padding: 6px; border-radius: 4px; border: 1px solid #ccc; width: 180px; }
    .control-group { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
  `;

  const filteredEmployees = employees.filter(emp => {
    const matchDept = filterDept === "All" || emp.department === filterDept;
    const matchName = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDept && matchName;
  });

  const uniqueDepts = ["All", ...new Set(employees.map(emp => emp.department).filter(Boolean))];

  const getDeptSpans = (empList) => {
    const spans = {};
    empList.forEach((emp) => {
      const dept = emp.department || "N/A";
      spans[dept] = (spans[dept] || 0) + 1;
    });
    return spans;
  };

  const isBackToBack = (empId, currentDate) => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateKey = prevDate.toISOString().slice(0, 10);
    if (schedule[empId + "-" + prevDateKey] === "C" && schedule[empId + "-" + currentDate] === "A") return true;
    return false;
  };

  const generateDates = () => {
    const dates = [];
    const start = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 24);
    const end = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 23);
    let d = new Date(start);
    while (d <= end) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return dates;
  };

  const dates = generateDates();
  const startMonth = dates[0].toLocaleString("en-US", { month: "long" });
  const endMonth = dates[dates.length - 1].toLocaleString("en-US", { month: "long" });
  const year = dates[dates.length - 1].getFullYear();
  const todayStr = new Date().toDateString();

  useEffect(() => {
    axios.get("http://localhost:4001/api/employees").then(res => setEmployees(res.data));
    axios.get("http://localhost:4001/api/shifts").then(res => setShifts(res.data));
    axios.get("http://localhost:4001/api/schedules").then(res => {
      const data = {};
      res.data.forEach(r => {
        data[r.employee_id + "-" + r.work_date.slice(0, 10)] = r.shift_name || "";
      });
      setSchedule(data);
    });
  }, [selectedMonth]);

  const handleShiftChange = (empId, date, value) => {
    setSchedule(prev => ({ ...prev, [empId + "-" + date]: value }));
  };

  // --- PHẦN QUAN TRỌNG: CẬP NHẬT TÊN ADMIN KHI LƯU ---
  const saveSchedule = async () => {
    try {
      // Lấy thông tin user từ localStorage để biết ai đang lưu
      const userData = JSON.parse(localStorage.getItem("user"));
      const currentAdminName = userData?.username || "Admin";

      await axios.post("http://localhost:4001/api/schedules/save", { 
        schedule,
        adminName: currentAdminName // Truyền username (ví dụ: bin, admin1) xuống Backend
      });
      
      alert(`Schedule saved successfully by ${currentAdminName}`);
    } catch (err) {
      alert("Save failed");
    }
  };

  const getShiftColor = (shift) => {
    const colors = { "PH": "#b7e4c7", "OFF": "#ffb3b3", "CT": "#fff176", "UP": "#b3e5fc" };
    return colors[shift] || "white";
  };

  const countOff = (empId) => {
    return dates.filter(d => schedule[empId + "-" + d.toISOString().slice(0, 10)] === "OFF").length;
  };

  return (
    <div style={{ padding: "20px", overflowX: "auto" }}>
      <style>{styles}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Schedule: {startMonth} - {endMonth} {year}</h2>
          <div className="control-group">
            <select className="filter-box" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
              {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input className="search-box" type="text" placeholder="Search name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <input type="month" value={`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`} onChange={(e) => {
            const [y, m] = e.target.value.split("-");
            setSelectedMonth(new Date(y, m - 1, 1));
          }} />
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={() => setPreviewMode(!previewMode)}>{previewMode ? "🔓 Admin Mode" : "👁️ Preview Mode"}</button>
            <button style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '7px 15px', cursor: 'pointer', borderRadius: '4px' }} onClick={saveSchedule}>💾 Save Schedule</button>
          </div>
        </div>
      </div>

      <table border="1" className="schedule-table">
        <thead>
          <tr>
            <th className="sticky-header" style={{ left: 0, width: '40px' }}>Dept</th>
            <th className="sticky-header" style={{ left: '40px' }}>Employee</th>
            <th className="sticky-header" style={{ position: 'relative', zIndex: 0 }}>OFF</th>
            {dates.map((date, i) => (
              <th key={i} style={{ background: date.toDateString() === todayStr ? "#ffe082" : "#f2f2f2", color: date.getDay() === 0 ? "red" : (date.getDay() === 6 ? "blue" : "black"), padding: '5px' }}>
                {date.toLocaleDateString("en-US", { weekday: "short" })}<br />{date.getDate()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((emp, index) => {
            const deptName = emp.department || "N/A";
            const spans = getDeptSpans(filteredEmployees);
            const isFirstInDept = index === 0 || filteredEmployees[index - 1].department !== deptName;
            
            const offCount = countOff(emp.id);
            const isOverQuota = offCount > MAX_OFF_DAYS;

            return (
              <tr key={emp.id}>
                {isFirstInDept && (
                  <td rowSpan={spans[deptName]} className="dept-vertical-cell">
                    <div className="vertical-text">{deptName}</div>
                  </td>
                )}
                <td className="sticky-cell">{emp.name}</td>
                
                <td className={`off-column ${isOverQuota ? 'off-quota-exceeded' : 'off-quota-normal'}`} 
                    title={isOverQuota ? `Cảnh báo: Đã nghỉ ${offCount}/${MAX_OFF_DAYS} ngày!` : ""}>
                  {offCount}
                </td>

                {dates.map((date, i) => {
                  const dateKey = date.toISOString().slice(0, 10);
                  const shift = schedule[emp.id + "-" + dateKey] || "";
                  const hasWarning = isBackToBack(emp.id, dateKey);

                  return (
                    <td key={i} className={hasWarning ? "warning-cell" : ""} title={hasWarning ? "Cảnh báo ca gãy C -> A" : ""}>
                      {hasWarning && <div className="warning-dot"></div>}
                      <select value={shift} disabled={previewMode} onChange={(e) => handleShiftChange(emp.id, dateKey, e.target.value)} style={{ background: getShiftColor(shift) }}>
                        <option value=""></option>
                        {shifts.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}