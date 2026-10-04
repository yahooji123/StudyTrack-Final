import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateGoal,
  changePassword
} from "../controllers/userController.js";

const router = express.Router();

router.use(auth);

router.get("/profile", getProfile);
router.put("/goal", updateGoal);
router.put("/password", changePassword);

export default router;
