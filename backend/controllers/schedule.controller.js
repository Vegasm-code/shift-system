const { sql, getConnection } = require("../config/db");

exports.getSchedules = async (req, res) => {

    try {

        const pool = await getConnection();

        const result = await pool.request().query(`
            SELECT 
                s.id,
                s.employee_id,
                s.shift_id,
                s.work_date,
                e.name
            FROM schedules s
            JOIN employees e ON e.id = s.employee_id
        `);

        res.json(result.recordset);

    } catch (err) {

        console.error(err);
        res.status(500).send("Server Error");

    }

};


exports.updateSchedule = async (req, res) => {

    const { employee_id, work_date, shift_id } = req.body;

    try {

        const pool = await getConnection();

        await pool.request()
            .input("employee_id", sql.Int, employee_id)
            .input("work_date", sql.Date, work_date)
            .input("shift_id", sql.Int, shift_id)
            .query(`
                MERGE schedules AS target
                USING (SELECT @employee_id AS employee_id, @work_date AS work_date) AS source
                ON target.employee_id = source.employee_id AND target.work_date = source.work_date
                WHEN MATCHED THEN
                    UPDATE SET shift_id = @shift_id
                WHEN NOT MATCHED THEN
                    INSERT (employee_id, work_date, shift_id)
                    VALUES (@employee_id, @work_date, @shift_id);
            `);

        res.json({ message: "Schedule updated" });

    } catch (err) {

        console.error(err);
        res.status(500).send("Server Error");

    }

};