const express = require("express");
const router = express.Router();
const poolPromise = require("../config/db");


/* ===============================
   LOGIN
================================ */

router.post("/login", async (req, res) => {

  try {

    const { username, password } = req.body;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("username", username)
      .input("password", password)
      .query(`
        SELECT id, username, role
        FROM users
        WHERE username=@username
        AND password=@password
      `);

    if (result.recordset.length === 0) {
      return res.status(401).send("Invalid login");
    }

    res.json(result.recordset[0]);

  } catch (err) {

    console.error("LOGIN ERROR:", err);
    res.status(500).send("Server error");

  }

});


/* ===============================
   REGISTER
================================ */

router.post("/register", async (req, res) => {

  try {

    const { username, password, role } = req.body;

    const pool = await poolPromise;

    // kiểm tra username tồn tại
    const check = await pool.request()
      .input("username", username)
      .query(`
        SELECT id
        FROM users
        WHERE username=@username
      `);

    if (check.recordset.length > 0) {

      return res.status(400).json({
        message: "Username already exists"
      });

    }

    // insert user
    await pool.request()
      .input("username", username)
      .input("password", password)
      .input("role", role)
      .query(`
        INSERT INTO users(username,password,role)
        VALUES(@username,@password,@role)
      `);

    res.json({ message: "User created" });

  } catch (err) {

    console.error("REGISTER ERROR:", err);
    res.status(500).send("Server error");

  }

});


/* ===============================
   GET USERS (SEARCH + PAGINATION)
================================ */

router.get("/users", async (req, res) => {

  try {

    const { search = "", page = 1, limit = 5 } = req.query;

    const offset = (page - 1) * limit;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("search", `%${search}%`)
      .query(`
        SELECT id,username,role
        FROM users
        WHERE username LIKE @search
        ORDER BY id
        OFFSET ${offset} ROWS
        FETCH NEXT ${limit} ROWS ONLY
      `);

    res.json(result.recordset);

  } catch (err) {

    console.error("GET USERS ERROR:", err);
    res.status(500).send("Server error");

  }

});


/* ===============================
   DELETE USER
================================ */

router.delete("/users/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const pool = await poolPromise;

    await pool.request()
      .input("id", id)
      .query(`
        DELETE FROM users
        WHERE id=@id
      `);

    res.send({ status: "deleted" });

  } catch (err) {

    console.error("DELETE USER ERROR:", err);
    res.status(500).send("Server error");

  }

});


/* ===============================
   UPDATE USER (USERNAME + ROLE)
================================ */

router.put("/users/:id", async (req, res) => {

  try {

    const { username, role } = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input("id", req.params.id)
      .input("username", username || null)
      .input("role", role || null)
      .query(`
        UPDATE users
        SET
          username = COALESCE(@username, username),
          role = COALESCE(@role, role)
        WHERE id=@id
      `);

    res.send({ status: "updated" });

  } catch (err) {

    console.error("UPDATE USER ERROR:", err);
    res.status(500).send("Server error");

  }

});

/* ===============================
   RESET PASSWORD
================================ */

router.put("/users/:id/password", async (req, res) => {

  try {

    const { password } = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input("id", req.params.id)
      .input("password", password)
      .query(`
        UPDATE users
        SET password=@password
        WHERE id=@id
      `);

    res.send({ status: "password updated" });

  } catch (err) {

    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).send("Server error");

  }

});


module.exports = router;