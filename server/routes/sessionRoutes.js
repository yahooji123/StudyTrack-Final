import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
  createSession,
  getSessions,
  getDashboard
} from "../controllers/sessionController.js";

const router = express.Router();

router.use(auth);

router.post("/", createSession);
router.get("/", getSessions);
router.get("/dashboard", getDashboard);

export default router;
