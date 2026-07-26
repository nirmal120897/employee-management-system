import { body, param } from "express-validator";

export const createProfileValidator = [
  body("userId").isUUID().withMessage("Valid userId is required"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("department").trim().notEmpty().withMessage("Department is required"),
  body("experience").trim().notEmpty().withMessage("Experience is required"),
  body("skills").optional().isArray().withMessage("skills must be an array"),
];

export const searchProfilesValidator = [
  body("query").trim().notEmpty().withMessage("query is required"),
];

export const profileIdValidator = [
  param("id").isUUID().withMessage("Invalid profile id"),
];
