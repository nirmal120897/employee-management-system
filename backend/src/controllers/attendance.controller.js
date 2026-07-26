import prisma from "../config/db.js";
import { getIO } from "../sockets/socket.js";
import { SOCKET_EVENTS } from "../sockets/socketEvents.js";

const STANDARD_WORK_HOURS = 8;

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// POST /api/attendance/check-in
export const checkIn = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { start, end } = getTodayRange();

    const existing = await prisma.attendance.findFirst({
      where: { userId, date: { gte: start, lte: end } },
    });

    if (existing) {
      return res
        .status(409)
        .json({ error: true, message: "Already checked in today" });
    }

    const record = await prisma.attendance.create({
      data: { userId, checkIn: new Date(), date: new Date() },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Broadcast only after the DB write succeeded
    const io = getIO();
    io.emit(SOCKET_EVENTS.EMPLOYEE_CHECKED_IN, { record });
    io.emit(SOCKET_EVENTS.ATTENDANCE_UPDATED, { type: "check-in", record });

    return res
      .status(201)
      .json({ error: false, message: "Checked in successfully", data: record });
  } catch (error) {
    console.error("checkIn error", error);
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong" });
  }
};

// POST /api/attendance/check-out
export const checkOut = async (req, res) => {
  try {
    const userId = req.user.user_id;
    console.log("[checkOut] called by userId:", userId);
    const { start, end } = getTodayRange();

    const record = await prisma.attendance.findFirst({
      where: { userId, date: { gte: start, lte: end } },
    });

    console.log("[checkOut] existing record found:", record);
    if (!record) {
      return res.status(400).json({
        error: true,
        message: "You must check in before checking out",
      });
    }
    if (record.checkOut) {
      return res
        .status(409)
        .json({ error: true, message: "Already checked out today" });
    }

    const checkOutTime = new Date();
    const diffMs = checkOutTime - new Date(record.checkIn);
    const workingHours = +(diffMs / (1000 * 60 * 60)).toFixed(2);
    const overtimeHours =
      workingHours > STANDARD_WORK_HOURS
        ? +(workingHours - STANDARD_WORK_HOURS).toFixed(2)
        : 0;

    const updated = await prisma.attendance.update({
      where: { id: record.id },
      data: { checkOut: checkOutTime, workingHours, overtimeHours },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const io = getIO();
    io.emit(SOCKET_EVENTS.EMPLOYEE_CHECKED_OUT, { record: updated });
    io.emit(SOCKET_EVENTS.ATTENDANCE_UPDATED, {
      type: "check-out",
      record: updated,
    });

    return res.status(200).json({
      error: false,
      message: "Checked out successfully",
      data: updated,
    });
  } catch (error) {
    console.error("checkOut error", error);
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong" });
  }
};

// GET /api/attendance/me?page=1&limit=10
export const myAttendance = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const where = { userId: req.user.user_id };

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.attendance.count({ where }),
    ]);

    return res.status(200).json({
      error: false,
      data: records,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("myAttendance error", error);
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong" });
  }
};

// GET /api/attendance?page=1&limit=10 - ADMIN all, MANAGER own staff
export const getAllAttendance = async (req, res) => {
  try {
    const requester = req.user;
    const { page, limit, skip } = getPagination(req.query);
    let userFilter = {};

    if (requester.role === "MANAGER") {
      const staffList = await prisma.user.findMany({
        where: { managerId: requester.user_id },
        select: { id: true },
      });
      userFilter = { userId: { in: staffList.map((s) => s.id) } };
    }

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where: userFilter,
        include: { user: { select: { name: true, email: true, role: true } } },
        orderBy: { date: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.attendance.count({ where: userFilter }),
    ]);

    return res.status(200).json({
      error: false,
      data: records,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("getAllAttendance error", error);
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong" });
  }
};
