const express = require("express");
const router = express.Router();
const poolPromise = require("../config/db");

/* GET ALL SHIFTS */

router.get("/", async (req,res)=>{

  try{

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT id,name,start_time,end_time
      FROM shifts
      ORDER BY name
    `);

    res.json(result.recordset);

  }catch(err){

    console.error(err);
    res.status(500).send("Server error");

  }

});


/* CREATE SHIFT */

router.post("/", async (req,res)=>{

  try{

    const {name,start_time,end_time} = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input("name",name)
      .input("start_time",start_time)
      .input("end_time",end_time)
      .query(`
        INSERT INTO shifts(name,start_time,end_time)
        VALUES(@name,@start_time,@end_time)
      `);

    res.send({status:"created"});

  }catch(err){

    console.error(err);
    res.status(500).send("Server error");

  }

});


/* UPDATE SHIFT */

router.put("/:id", async (req,res)=>{

  try{

    const {name,start_time,end_time} = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input("id",req.params.id)
      .input("name",name)
      .input("start_time",start_time)
      .input("end_time",end_time)
      .query(`
        UPDATE shifts
        SET name=@name,
            start_time=@start_time,
            end_time=@end_time
        WHERE id=@id
      `);

    res.send({status:"updated"});

  }catch(err){

    console.error(err);
    res.status(500).send("Server error");

  }

});


/* DELETE SHIFT */

router.delete("/:id", async (req,res)=>{

  try{

    const pool = await poolPromise;

    await pool.request()
      .input("id",req.params.id)
      .query(`
        DELETE FROM shifts
        WHERE id=@id
      `);

    res.send({status:"deleted"});

  }catch(err){

    console.error(err);
    res.status(500).send("Server error");

  }

});

module.exports = router;