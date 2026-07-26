import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { ROLES } from "../constants/roles.js";

// ---------- CREATE ----------
export const createUserService = async ({
  name,
  email,
  password,
  role,
  managerId,
}) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("Email already exists");
    err.statusCode = 409;
    throw err;
  }

  if (managerId) {
    const manager = await prisma.user.findUnique({ where: { id: managerId } });
    if (!manager || manager.role !== ROLES.MANAGER) {
      const err = new Error(
        "Invalid managerId - must reference an existing MANAGER",
      );
      err.statusCode = 400;
      throw err;
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      managerId: role === ROLES.STAFF ? managerId || null : null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      managerId: true,
      createdAt: true,
    },
  });

  return user;
};

// ---------- READ ----------
export const getAllUsersService = async ({ page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit),
    }),
    prisma.user.count(),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getUsersByRoleService = async (role) => {
  return prisma.user.findMany({
    where: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      managerId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getStaffUnderManagerService = async (
  managerId,
  { page = 1, limit = 10 } = {},
) => {
  const skip = (page - 1) * limit;
  const where = { managerId, role: ROLES.STAFF };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit),
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getUserByIdService = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
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
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

// ---------- UPDATE ----------
export const updateUserService = async (id, data) => {
  const { name, email } = data;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
    },
    select: { id: true, name: true, email: true, role: true, managerId: true },
  });

  return user;
};

export const adminUpdateUserService = async (id, data) => {
  const { name, email, role, managerId } = data;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(managerId !== undefined && { managerId }),
    },
    select: { id: true, name: true, email: true, role: true, managerId: true },
  });

  return user;
};

// ---------- DELETE ----------
export const deleteUserService = async (id) => {
  await prisma.user.delete({ where: { id } });
};

// ---------- ASSIGN MANAGER ----------
export const assignManagerToStaffService = async (staffId, managerId) => {
  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff || staff.role !== ROLES.STAFF) {
    const err = new Error("Target user must exist and have role STAFF");
    err.statusCode = 400;
    throw err;
  }

  const manager = await prisma.user.findUnique({ where: { id: managerId } });
  if (!manager || manager.role !== ROLES.MANAGER) {
    const err = new Error("managerId must reference an existing MANAGER");
    err.statusCode = 400;
    throw err;
  }

  return prisma.user.update({
    where: { id: staffId },
    data: { managerId },
    select: { id: true, name: true, email: true, role: true, managerId: true },
  });
};

// ---------- OWNERSHIP HELPER ----------
export const isStaffOfManager = async (staffId, managerId) => {
  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  return !!staff && staff.managerId === managerId;
};

export const getManagerlist = async () => {
  const managerlist = await prisma.user.findMany({
    where: { role: "MANAGER" },
  });
  console.log(">>>", managerlist);

  return managerlist;
};
