import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
import cors from "cors";
import http from "http";

import { initSocket } from "./sockets/socket.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import documentRoutes from "./routes/document.routes.js";
import employeeProfileRoutes from "./routes/employeeProfile.routes.js";
import { seedAdmin } from "./utils/seedAdmin.js";

const app = express();
const server = http.createServer(app);

await seedAdmin();
initSocket(server);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/attendance", attendanceRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/employee-profiles", employeeProfileRoutes);

app.get("/", (req, res) =>
  res.json({ status: "ok", message: "Attendance API running" }),
);

// centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: true, message: "Internal server error" });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
