import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

// POST /api/auth/register
// Note: Only ADMIN should create MANAGER/ADMIN accounts in a real flow.
// Public register defaults everyone to STAFF for safety.
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: true, message: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: true, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return res.status(201).json({
      error: false,
      message: "Registered successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("register error", error);
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: true, message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const payload = {
      user_id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ user_id: user.id });

    return res.status(200).json({
      error: false,
      message: "Login successful",
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("login error", error);
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong" });
  }
};

// GET /api/auth/me  (protected)
export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.user_id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    return res.status(200).json({ error: false, data: user });
  } catch (error) {
    console.error("me error", error);
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong" });
  }
};

// POST /api/auth/refresh
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ error: true, message: "Refresh token required" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.user_id },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken({
      user_id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res
      .status(200)
      .json({ error: false, data: { token: newAccessToken } });
  } catch (error) {
    return res
      .status(401)
      .json({ error: true, message: "Invalid or expired refresh token" });
  }
};
