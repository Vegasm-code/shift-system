import React from "react";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = user.username || "Bin";

  const styles = `
    .dashboard-wrapper {
      padding: 40px;
      background: #ffffff;
      min-height: 100vh;
      margin-left: 240px;
      font-family: 'Inter', -apple-system, sans-serif;
    }
    .welcome-header {
      margin-bottom: 40px;
    }
    .welcome-header h1 {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .welcome-header p {
      color: #64748b;
      margin-top: 8px;
      font-size: 16px;
    }

    /* Grid layout cho các thẻ chỉ số */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .stat-card {
      padding: 24px;
      border-radius: 16px;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      background: #ffffff;
      border-color: #e2e8f0;
    }
    .stat-label {
      font-size: 13px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-value {
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
      margin: 12px 0 4px 0;
    }
    .stat-desc {
      font-size: 12px;
      color: #22c55e; /* Màu xanh lá cho chỉ số tích cực */
      font-weight: 600;
    }

    /* Khu vực hoạt động gần đây */
    .recent-activity {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #f1f5f9;
      padding: 24px;
    }
    .activity-item {
      display: flex;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #f8fafc;
    }
    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #eff6ff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      color: #3b82f6;
    }
  `;

  return (
    <div className="dashboard-wrapper">
      <style>{styles}</style>

      <div className="welcome-header">
        <h1>Welcome, {displayName}! 👋</h1>
      </div>

      

      
    </div>
  );
}