const express = require('express');
const router = express.Router();
const sql = require('mssql');
const poolPromise = require('../config/db'); // Kết nối tới database shiftsystem

// ---------------------------------------------------------
// 1. API ĐẾM SỐ ĐƠN CHỜ DUYỆT (Dùng cho Badge thông báo ở Menu)
// ---------------------------------------------------------
router.get('/count-pending', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT COUNT(*) as total 
            FROM shift_requests 
            WHERE status = 'pending'
        `);
        res.json({ count: result.recordset[0].total });
    } catch (err) {
        console.error("Lỗi đếm đơn:", err.message);
        res.status(500).json({ message: "Lỗi Server: " + err.message });
    }
});

// ---------------------------------------------------------
// 2. LẤY DANH SÁCH ĐƠN (JOIN với bảng employees để lấy tên)
// ---------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT r.*, e1.name as employee_name, e2.name as target_employee_name 
            FROM shift_requests r
            LEFT JOIN employees e1 ON r.employee_id = e1.id
            LEFT JOIN employees e2 ON r.target_employee_id = e2.id
            WHERE r.status = 'pending'
            ORDER BY r.created_at DESC
        `);
        res.json(result.recordset);
    } catch (err) { 
        res.status(500).send("Lỗi lấy danh sách: " + err.message); 
    }
});

// ---------------------------------------------------------
// 3. GỬI ĐƠN ĐỔI CA MỚI (Từ phía nhân viên)
// ---------------------------------------------------------
router.post('/create', async (req, res) => {
    const { employee_id, target_employee_id, request_date, reason } = req.body;
    
    // Kiểm tra dữ liệu đầu vào để tránh lỗi NULL trong DB
    if (!employee_id || !target_employee_id) {
        return res.status(400).json({ success: false, message: "Thiếu ID nhân viên!" });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('empId', sql.Int, employee_id)
            .input('targetId', sql.Int, target_employee_id)
            .input('reqDate', sql.Date, request_date)
            .input('reason', sql.NVarChar, reason)
            .query(`
                INSERT INTO shift_requests (employee_id, target_employee_id, request_date, reason, status, created_at)
                VALUES (@empId, @targetId, @reqDate, @reason, 'pending', GETDATE())
            `);
        res.json({ success: true, message: "Gửi đơn thành công!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi lưu đơn: " + err.message });
    }
});

// ---------------------------------------------------------
// 4. XỬ LÝ DUYỆT (ĐẢO CA) HOẶC TỪ CHỐI (Từ phía Admin)
// ---------------------------------------------------------
router.put('/:id', async (req, res) => {
    const { status } = req.body;
    const requestId = req.params.id;

    try {
        const pool = await poolPromise;
        
        if (status === 'approved') {
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // Bước A: Lấy thông tin ID của 2 người và ngày cần đổi từ đơn
                const reqData = await transaction.request()
                    .input('id', sql.Int, requestId)
                    .query("SELECT employee_id, target_employee_id, request_date FROM shift_requests WHERE id = @id");

                if (reqData.recordset.length === 0) throw new Error("Không tìm thấy đơn!");
                
                const { employee_id, target_employee_id, request_date } = reqData.recordset[0];

                if (!employee_id || !target_employee_id) {
                    throw new Error("Dữ liệu ID bị NULL, không thể đảo ca!");
                }

                // Bước B: Hoán đổi employee_id trong bảng schedules
                // Lưu ý quan trọng: Sử dụng 'work_date' vì đây là tên cột thực tế trong DB của bạn
                await transaction.request()
                    .input('emp1', sql.Int, employee_id)
                    .input('emp2', sql.Int, target_employee_id)
                    .input('reqDate', sql.Date, request_date)
                    .query(`
                        UPDATE schedules SET employee_id = -999 WHERE employee_id = @emp1 AND work_date = @reqDate;
                        UPDATE schedules SET employee_id = @emp1 WHERE employee_id = @emp2 AND work_date = @reqDate;
                        UPDATE schedules SET employee_id = @emp2 WHERE employee_id = -999 AND work_date = @reqDate;
                    `);

                // Bước C: Cập nhật trạng thái đơn thành 'approved'
                await transaction.request().input('id', sql.Int, requestId)
                    .query("UPDATE shift_requests SET status = 'approved' WHERE id = @id");

                await transaction.commit();
                res.json({ success: true, message: "Phê duyệt và đảo ca thành công!" });
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } else {
            // Trường hợp Reject đơn (chỉ cập nhật trạng thái đơn, không đụng đến lịch trực)
            await pool.request().input('id', sql.Int, requestId)
                .query("UPDATE shift_requests SET status = 'rejected' WHERE id = @id");
            res.json({ success: true, message: "Đã từ chối đơn." });
        }
    } catch (err) {
        console.error("Lỗi xử lý đơn:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;