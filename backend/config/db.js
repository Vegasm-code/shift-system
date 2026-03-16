const sql = require("mssql");

const config = {
  user: "binnie",
  password: "Veg@sm789",
  server: "192.168.10.23",
  database: "shiftsystem",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ SQL Server connected");
    return pool;
  })
  .catch(err => console.log("❌ DB Connection Failed:", err));

module.exports = poolPromise;