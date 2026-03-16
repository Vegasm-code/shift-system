const express = require("express");
const router = express.Router();
const poolPromise = require("../config/db");

/* GET ALL DEPARTMENTS */

router.get("/", async (req,res)=>{

  try{

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT id,name
      FROM departments
      ORDER BY id
    `);

    res.json(result.recordset);

  }catch(err){

    console.error(err);
    res.status(500).send("Server error");

  }

});

router.post("/", async (req,res)=>{

  try{

    const {name} = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input("name",name)
      .query(`
        INSERT INTO departments(name)
        VALUES(@name)
      `);

    res.send({status:"created"});

  }catch(err){

    console.error(err);
    res.status(500).send("Server error");

  }

});

router.put("/:id", async (req,res)=>{

  try{

    const {name} = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input("id",req.params.id)
      .input("name",name)
      .query(`
        UPDATE departments
        SET name=@name
        WHERE id=@id
      `);

    res.send({status:"updated"});

  }catch(err){

    console.error(err);
    res.status(500).send("Server error");

  }

});

router.delete("/:id", async (req,res)=>{

  try{

    const pool = await poolPromise;

    await pool.request()
      .input("id",req.params.id)
      .query(`
        DELETE FROM departments
        WHERE id=@id
      `);

    res.send({status:"deleted"});

  }catch(err){

    console.error(err);
    res.status(500).send("Server error");

  }

});

module.exports = router;