import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Hàm xử lý login
  const handleLogin = async (e) => {
    // Ngăn trang web bị tải lại khi submit form
    if (e) e.preventDefault();
    
    if (!username || !password) return;

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4001/api/auth/login",
        { username, password }
      );

      localStorage.setItem("user", JSON.stringify(res.data));
      window.location = "/";
    } catch (err) {
      alert("Tài khoản hoặc mật khẩu không đúng!");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f0f2f5", // Nền sáng nhẹ
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    card: {
      padding: "40px",
      backgroundColor: "#fff",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      width: "100%",
      maxWidth: "350px",
      textAlign: "center",
    },
    input: {
      padding: "12px",
      width: "100%",
      marginBottom: "15px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.3s",
    },
    button: {
      padding: "12px",
      width: "100%",
      background: "linear-gradient(135deg, #3498db, #2980b9)",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "16px",
      transition: "opacity 0.3s",
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ color: "#1e293b", marginBottom: "30px" }}>🔐 Admin Login</h2>
        
        {/* Bao bọc bằng thẻ form để tự động nhận sự kiện Enter */}
        <form onSubmit={handleLogin}>
          <input
            style={styles.input}
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
          
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button 
            type="submit" // Đổi thành type submit
            disabled={loading}
            style={{ 
              ...styles.button, 
              opacity: loading ? 0.7 : 1,
              marginTop: "10px"
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "12px", color: "#94a3b8" }}>
          Hệ thống quản lý nội bộ - Casino Admin
        </p>
      </div>
    </div>
  );
}