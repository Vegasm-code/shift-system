const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/users", async(req,res)=>{

  const {username,password,role} = req.body;

  await pool.request()
  .input("username",username)
  .input("password",password)
  .input("role",role)
  .query(`
    INSERT INTO users(username,password,role)
    VALUES(@username,@password,@role)
  `);

  res.send({status:"ok"});

});

module.exports = router;