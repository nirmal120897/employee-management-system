import { body, param } from "express-validator";

export const createUserValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Enter a valid email address").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const updateUserValidator = [
  param("id").isUUID().withMessage("Invalid user id"),
  body("email").optional().trim().isEmail().withMessage("Enter a valid email address").normalizeEmail(),
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
];

export const assignManagerValidator = [
  param("id").isUUID().withMessage("Invalid user id"),
  body("managerId").isUUID().withMessage("managerId must be a valid id"),
];