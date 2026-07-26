import { ROLES, ASSIGNABLE_ROLES } from "../constants/roles.js";
import {
  createUserService,
  getAllUsersService,
  getUsersByRoleService,
  getStaffUnderManagerService,
  getUserByIdService,
  updateUserService,
  adminUpdateUserService,
  deleteUserService,
  assignManagerToStaffService,
  isStaffOfManager,
  getManagerlist,
} from "../services/user.service.js";

const handleError = (res, error) => {
  console.error(error.message);
  const status = error.statusCode || 500;
  return res
    .status(status)
    .json({ error: true, message: error.message || "Something went wrong" });
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: true,
        message: "name, email, password and role are required",
      });
    }

    if (!ASSIGNABLE_ROLES.includes(role)) {
      return res.status(400).json({
        error: true,
        message: `role must be one of: ${ASSIGNABLE_ROLES.join(", ")}`,
      });
    }

    if (role === ROLES.STAFF && !managerId) {
      return res.status(400).json({
        error: true,
        message: "managerId is required when creating a STAFF user",
      });
    }

    const user = await createUserService({
      name,
      email,
      password,
      role,
      managerId,
    });
    return res
      .status(201)
      .json({ error: false, message: "User created", data: user });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /api/users?page=1&limit=10  (ADMIN only)
export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      100,
    );

    const { data, pagination } = await getAllUsersService({ page, limit });
    return res.status(200).json({ error: false, data, pagination });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const upperRole = role?.toUpperCase();

    if (!Object.values(ROLES).includes(upperRole)) {
      return res.status(400).json({
        error: true,
        message: "Invalid role. Use ADMIN, MANAGER or STAFF",
      });
    }

    const users = await getUsersByRoleService(upperRole);
    return res.status(200).json({ error: false, data: users });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /api/users/my-staff  (MANAGER only) - staff assigned to logged-in manager
export const getMyStaff = async (req, res) => {
  try {
    const staff = await getStaffUnderManagerService(req.user.user_id);
    return res.status(200).json({ error: false, data: staff });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (requester.role === ROLES.STAFF && requester.user_id !== id) {
      return res.status(403).json({
        error: true,
        message: "Staff can only view their own profile",
      });
    }

    if (requester.role === ROLES.MANAGER) {
      const belongsToManager = await isStaffOfManager(id, requester.user_id);
      if (!belongsToManager && requester.user_id !== id) {
        return res.status(403).json({
          error: true,
          message: "Manager can only view their assigned staff",
        });
      }
    }

    const user = await getUserByIdService(id);
    return res.status(200).json({ error: false, data: user });
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (requester.role === ROLES.ADMIN) {
      const user = await adminUpdateUserService(id, req.body);
      return res
        .status(200)
        .json({ error: false, message: "User updated", data: user });
    }

    if (requester.role === ROLES.MANAGER) {
      const belongsToManager = await isStaffOfManager(id, requester.user_id);
      if (!belongsToManager) {
        return res.status(403).json({
          error: true,
          message: "Manager can only update their assigned staff",
        });
      }
      const { name, email } = req.body;
      const user = await updateUserService(id, { name, email });
      return res
        .status(200)
        .json({ error: false, message: "Staff updated", data: user });
    }

    return res.status(403).json({ error: true, message: "Access denied" });
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteUserService(id);
    return res.status(200).json({ error: false, message: "User deleted" });
  } catch (error) {
    return handleError(res, error);
  }
};

export const assignManagerToStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;

    if (!managerId) {
      return res
        .status(400)
        .json({ error: true, message: "managerId is required" });
    }

    const user = await assignManagerToStaffService(id, managerId);
    return res
      .status(200)
      .json({ error: false, message: "Manager assigned", data: user });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getManagers = async (req, res) => {
  try {
    const staff = await getManagerlist(req.user.user_id);
    return res.status(200).json({ error: false, data: staff });
  } catch (error) {
    return handleError(res, error);
  }
};
