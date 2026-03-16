const express = require('express');
const router = express.Router();
const sql = require('mssql');
const poolPromise = require("../config/db"); // 1. Import poolPromise giống các file khác

// API lấy danh sách nhật ký
router.get('/api/audit-logs', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query`
            SELECT 
                id,
                admin_name AS admin, -- Đặt alias là 'admin' để Frontend dễ đọc
                action_type AS action,
                details,
                created_at
            FROM audit_logs 
            ORDER BY created_at DESC
        `;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send("Lỗi khi lấy nhật ký: " + err.message);
    }
});

// 2. Cập nhật hàm ghi log để sử dụng poolPromise
const saveAuditLog = async (adminName, actionType, details) => {
    try {
        const pool = await poolPromise; // ĐẢM BẢO LẤY KẾT NỐI Ở ĐÂY
        await pool.request()
            .input('adminName', sql.NVarChar, adminName)
            .input('actionType', sql.NVarChar, actionType)
            .input('details', sql.NVarChar, details)
            .query(`
                INSERT INTO audit_logs (admin_name, action_type, details, created_at)
                VALUES (@adminName, @actionType, @details, GETDATE())
            `);
        console.log("✅ Audit Log: Đã ghi nhật ký thành công.");
    } catch (err) {
        console.error("❌ Audit Log Error:", err);
    }
};

module.exports = {
    auditRouter: router,
    saveAuditLog: saveAuditLog
};