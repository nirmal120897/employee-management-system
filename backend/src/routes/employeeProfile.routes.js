import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/rbac.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  createProfile,
  updateProfile,
  getAllProfiles,
  getProfileById,
  deleteProfile,
  searchProfiles,
} from "../controllers/employeeProfile.controller.js";

const router = express.Router();

router.use(authenticate);

router.post("/", authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), createProfile);
router.post("/search", authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), searchProfiles);
router.get("/", authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), getAllProfiles);
router.get("/:id", authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), getProfileById);
router.patch("/:id", authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), updateProfile);
router.delete("/:id", authorizeRoles(ROLES.ADMIN), deleteProfile);

export default router;