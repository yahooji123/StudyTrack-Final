import Subject from "../models/Subject.js";
import StudySession from "../models/StudySession.js";

export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.userId }).sort({ name: 1 });
    res.json(subjects);
  } catch {
    res.status(500).json({ message: "Could not load subjects" });
  }
};

export const createSubject = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    const existing = await Subject.findOne({ user: req.userId, name });

    if (existing) {
      return res.status(400).json({ message: "Subject already exists" });
    }

    const subject = await Subject.create({
      user: req.userId,
      name
    });

    res.status(201).json(subject);
  } catch {
    res.status(500).json({ message: "Could not create subject" });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(subject);
  } catch {
    res.status(500).json({ message: "Could not update subject" });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const used = await StudySession.countDocuments({
      user: req.userId,
      subject: subject._id
    });

    if (used > 0) {
      return res.status(400).json({
        message: "This subject has study sessions. Keep it to preserve history."
      });
    }

    await subject.deleteOne();
    res.json({ message: "Subject deleted" });
  } catch {
    res.status(500).json({ message: "Could not delete subject" });
  }
};
