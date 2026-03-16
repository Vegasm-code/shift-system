const express = require("express");
const router = express.Router();
const poolPromise = require("../config/db");
const sql = require("mssql"); // Thêm thư viện mssql để định nghĩa kiểu dữ liệu nếu cần

/* ===============================
   LẤY DANH SÁCH NHÂN VIÊN
================================ */
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        e.id,
        e.name,
        e.department_id,
        d.name AS department
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      -- Sắp xếp theo tên phòng ban trước, sau đó đến tên nhân viên
      -- Việc này giúp Frontend gộp ô (rowspan) chính xác
      ORDER BY d.name ASC, e.name ASC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("GET EMPLOYEES ERROR:", err);
    res.status(500).send("Server error");
  }
});

/* ===============================
   THÊM NHÂN VIÊN MỚI
================================ */
router.post("/", async (req, res) => {
  try {
    const { name, department_id } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("name", sql.VarChar, name)
      .input("department_id", sql.Int, department_id)
      .query(`
        INSERT INTO employees(name, department_id, created_at)
        VALUES(@name, @department_id, GETDATE())
      `);

    res.send({ success: true });
  } catch (err) {
    console.error("ADD EMPLOYEE ERROR:", err);
    res.status(500).send("Server error");
  }
});

/* ===============================
   CẬP NHẬT NHÂN VIÊN
================================ */
router.put("/:id", async (req, res) => {
  try {
    const { name, department_id } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("name", sql.VarChar, name)
      .input("department_id", sql.Int, department_id)
      .query(`
        UPDATE employees
        SET name = @name,
            department_id = @department_id
        WHERE id = @id
      `);

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE EMPLOYEE ERROR:", err);
    res.status(500).send("Server error");
  }
});

/* ===============================
   XÓA NHÂN VIÊN
================================ */
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        -- Lưu ý: Nếu có ràng buộc khóa ngoại với bảng schedules, 
        -- bạn có thể cần xóa dữ liệu ở bảng schedules trước.
        DELETE FROM employees WHERE id=@id
      `);

    res.send({ success: true });
  } catch (err) {
    console.error("DELETE EMPLOYEE ERROR:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;