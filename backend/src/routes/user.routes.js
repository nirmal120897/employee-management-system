import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/rbac.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  createUser,
  getAllUsers,
  getUsersByRole,
  getMyStaff,
  getUserById,
  updateUser,
  deleteUser,
  assignManagerToStaff,
  getManagers,
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(authenticate);

router.post("/", authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), createUser);
router.get("/", authorizeRoles(ROLES.ADMIN), getAllUsers);
router.get("/role/:role", authorizeRoles(ROLES.ADMIN), getUsersByRole);
router.delete("/:id", authorizeRoles(ROLES.ADMIN), deleteUser);
router.patch(
  "/:id/assign-manager",
  authorizeRoles(ROLES.ADMIN),
  assignManagerToStaff,
);

router.get("/my-staff", authorizeRoles(ROLES.MANAGER), getMyStaff);

router.get(
  "/managers",
  authorizeRoles(ROLES.MANAGER, ROLES.ADMIN),
  getManagers,
);

router.get(
  "/:id",
  authorizeRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF),
  getUserById,
);
router.patch("/:id", authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), updateUser);


export default router;
