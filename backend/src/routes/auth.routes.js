import express from "express";
import {
  register,
  login,
  me,
  refresh,
} from "../controllers/auth.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  registerValidator,
  loginValidator,
} from "../validator/auth.validator.js";

const router = express.Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.post("/refresh", refresh);
router.get("/me", authenticate, me);

export default router;
