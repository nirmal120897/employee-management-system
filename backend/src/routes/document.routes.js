import express from "express";
import multer from "multer";
import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/rbac.middleware.js";
import { ROLES } from "../constants/roles.js";
import { uploadPDF } from "../config/multer.config.js";
import {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  parseDocument,
  chunkDocument,
  getDocumentChunks,
  embedDocument,
  askQuestion,
} from "../controllers/document.controller.js";

const router = express.Router();

router.use(authenticate);

const handleUpload = (req, res, next) => {
  uploadPDF.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: true, message: err.message });
    }
    if (err) {
      return res.status(400).json({ error: true, message: err.message });
    }
    next();
  });
};

router.post(
  "/upload",
  authorizeRoles(ROLES.ADMIN),
  handleUpload,
  uploadDocument,
);
// router.post("/:id/parse", authorizeRoles(ROLES.ADMIN), parseDocument);
router.get("/", getAllDocuments);
router.get("/:id", getDocumentById);
router.delete("/:id", authorizeRoles(ROLES.ADMIN), deleteDocument);
router.post("/:id/parse", authorizeRoles(ROLES.ADMIN), parseDocument);

router.post("/:id/chunk", authorizeRoles(ROLES.ADMIN), chunkDocument);
router.get("/:id/chunks", getDocumentChunks);

router.post("/:id/embed", authorizeRoles(ROLES.ADMIN), embedDocument);

router.post("/ask", askQuestion);
export default router;
