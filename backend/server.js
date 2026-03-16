const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4001;

// ROUTES
const authRoutes = require("./routes/auth.routes");
const employeeRoutes = require("./routes/employee.routes");
const departmentRoutes = require("./routes/departments.routes");
const shiftRoutes = require("./routes/shifts.routes");
const scheduleRoutes = require("./routes/schedule.routes");
const { auditRouter } = require('./routes/auditRoutes');
const requestRoutes = require("./routes/request.routes");



// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use(auditRouter);
app.use("/api/shift-requests", requestRoutes);

// TEST
app.get("/", (req, res) => {
  res.send("Shift System Backend Running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});