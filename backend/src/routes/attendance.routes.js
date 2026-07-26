import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/rbac.middleware.js";
import {
  checkIn,
  checkOut,
  myAttendance,
  getAllAttendance,
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.use(authenticate);

router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/me", myAttendance);
router.get("/", authorizeRoles("ADMIN", "MANAGER"), getAllAttendance);

export default router;
