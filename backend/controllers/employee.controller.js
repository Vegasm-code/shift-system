const { getConnection, sql } = require("../config/db");

// GET employees
exports.getEmployees = async (req, res) => {

    try {

        const pool = await getConnection();

        const result = await pool.request().query(`
            SELECT * FROM employees
        `);

        res.json(result.recordset);

    } catch (err) {

        console.error(err);
        res.status(500).send("Server error");

    }
};

// CREATE employee
exports.createEmployee = async (req, res) => {

    try {

        const { name, email, phone } = req.body;

        const pool = await getConnection();

        await pool.request()
            .input("name", sql.VarChar, name)
            .input("email", sql.VarChar, email)
            .input("phone", sql.VarChar, phone)
            .query(`
                INSERT INTO employees (name,email,phone)
                VALUES (@name,@email,@phone)
            `);

        res.json({ message: "Employee created" });

    } catch (err) {

        console.error(err);
        res.status(500).send("Server error");

    }
};