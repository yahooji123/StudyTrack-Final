import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject
} from "../controllers/subjectController.js";

const router = express.Router();

router.use(auth);

router.get("/", getSubjects);
router.post("/", createSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

export default router;
