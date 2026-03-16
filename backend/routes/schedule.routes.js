const express = require("express");
const router = express.Router();
const poolPromise = require("../config/db");
const sql = require("mssql");
const { saveAuditLog } = require("./auditRoutes");

async function getPool() {
    return await poolPromise;
}

router.post("/save", async (req, res) => {
    const { schedule, adminName } = req.body;

    if (!schedule || Object.keys(schedule).length === 0) {
        return res.status(400).json({ error: "No schedule data provided" });
    }

    try {
        const db = await getPool();
        let logDetails = [];

        for (const key in schedule) {
            const parts = key.split("-");
            if (parts.length < 4) continue;

            const empId = parts[0];
            const dateStr = `${parts[1]}-${parts[2]}-${parts[3]}`;
            const newShiftName = schedule[key];

            if (!newShiftName || newShiftName.trim() === "") continue;

            // 1. Lấy ca cũ để so sánh
            const oldSchedule = await db.request()
                .input("emp", sql.Int, empId)
                .input("date", sql.Date, dateStr)
                .query(`
                    SELECT sh.name 
                    FROM schedules s 
                    JOIN shifts sh ON s.shift_id = sh.id 
                    WHERE s.employee_id = @emp AND s.work_date = @date
                `);

            const oldShiftName = oldSchedule.recordset.length > 0 ? oldSchedule.recordset[0].name : "Trống";

            // 2. Chỉ thêm vào log nếu có thay đổi thực sự
            if (oldShiftName !== newShiftName) {
                const empInfo = await db.request()
                    .input("id", sql.Int, empId)
                    .query("SELECT name FROM employees WHERE id = @id");
                
                const empName = empInfo.recordset[0]?.name || `ID ${empId}`;
                logDetails.push(`${empName} (${dateStr}): ${oldShiftName} → ${newShiftName}`);
            }

            // 3. Lấy ID ca mới
            const shiftResult = await db.request()
                .input("name", sql.VarChar, newShiftName)
                .query("SELECT id FROM shifts WHERE name=@name");

            if (shiftResult.recordset.length === 0) continue;
            const shiftId = shiftResult.recordset[0].id;

            // 4. MERGE dữ liệu
            await db.request()
                .input("emp", sql.Int, empId)
                .input("shift", sql.Int, shiftId)
                .input("date", sql.Date, dateStr)
                .query(`
                    MERGE schedules AS target
                    USING (SELECT @emp emp, @date work_date) AS source
                    ON target.employee_id = source.emp AND target.work_date = source.work_date
                    WHEN MATCHED THEN UPDATE SET shift_id = @shift
                    WHEN NOT MATCHED THEN INSERT(employee_id, shift_id, work_date, created_at) VALUES(@emp, @shift, @date, GETDATE());
                `);
        }

        // 5. GHI LOG VÀ GỬI PHẢN HỒI (CHỈ MỘT LẦN)
        if (logDetails.length > 0) {
            const finalDetails = logDetails.join(" | ");
            await saveAuditLog(
                adminName || "Admin",
                "UPDATE_SCHEDULE",
                finalDetails.length > 1000 ? finalDetails.substring(0, 997) + "..." : finalDetails
            );
        }

        // Trả về phản hồi thành công cuối cùng
        return res.json({ message: "saved" });

    } catch (err) {
        console.error("CRITICAL SAVE ERROR:", err);
        // Kiểm tra xem đã gửi phản hồi chưa trước khi gửi lỗi
        if (!res.headersSent) {
            return res.status(500).json({ error: "save failed" });
        }
    }
});

router.get("/", async (req, res) => {
    try {
        const db = await getPool();
        const result = await db.request().query(`
            SELECT 
                s.employee_id,
                CONVERT(VARCHAR(10), s.work_date, 120) as work_date, 
                sh.name as shift_name
            FROM schedules s
            JOIN shifts sh ON s.shift_id = sh.id
        `);
        return res.json(result.recordset);
    } catch (err) {
        console.error("LOAD ERROR:", err);
        if (!res.headersSent) {
            return res.status(500).json({ error: "load failed" });
        }
    }
});

module.exports = router;