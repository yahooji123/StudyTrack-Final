import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch {
    res.status(500).json({ message: "Could not load profile" });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const hours = Number(req.body.hours);

    if (!hours || hours < 0.5 || hours > 24) {
      return res.status(400).json({ message: "Goal must be between 0.5 and 24 hours" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { dailyGoalMinutes: Math.round(hours * 60) },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch {
    res.status(500).json({ message: "Could not update goal" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Use a new password of at least 6 characters" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);

    if (!match) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch {
    res.status(500).json({ message: "Could not change password" });
  }
};
