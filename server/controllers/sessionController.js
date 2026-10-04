import StudySession from "../models/StudySession.js";
import Subject from "../models/Subject.js";

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const addDays = (date, amount) => {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
};

export const createSession = async (req, res) => {
  try {
    const { subject, topic, notes, durationMinutes, date } = req.body;

    if (!subject || !durationMinutes || !date) {
      return res.status(400).json({
        message: "Subject, duration and date are required"
      });
    }

    const subjectDoc = await Subject.findOne({
      _id: subject,
      user: req.userId
    });

    if (!subjectDoc) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const session = await StudySession.create({
      user: req.userId,
      subject,
      topic: topic || "",
      notes: notes || "",
      durationMinutes: Math.max(1, Math.round(Number(durationMinutes))),
      date: new Date(date)
    });

    const populated = await session.populate("subject", "name");
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not save study session" });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({ user: req.userId })
      .populate("subject", "name")
      .sort({ date: -1 });

    res.json(sessions);
  } catch {
    res.status(500).json({ message: "Could not load history" });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrow = addDays(todayStart, 1);
    const weekStart = addDays(todayStart, -6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const sessions = await StudySession.find({
      user: req.userId,
      date: { $gte: monthStart, $lt: monthEnd }
    }).populate("subject", "name");

    const todaySessions = sessions.filter(
      (s) => new Date(s.date) >= todayStart && new Date(s.date) < tomorrow
    );

    const weekSessions = await StudySession.find({
      user: req.userId,
      date: { $gte: weekStart, $lt: tomorrow }
    });

    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const weekMinutes = weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const monthMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    const subjectMap = {};

    todaySessions.forEach((s) => {
      const key = s.subject?.name || "Unknown";
      subjectMap[key] = (subjectMap[key] || 0) + s.durationMinutes;
    });

    const dailyMap = {};
    sessions.forEach((s) => {
      const key = startOfDay(s.date).toISOString().slice(0, 10);
      dailyMap[key] = (dailyMap[key] || 0) + s.durationMinutes;
    });

    const subjectMapMonth = {};
    sessions.forEach((s) => {
      const key = s.subject?.name || "Unknown";
      subjectMapMonth[key] = (subjectMapMonth[key] || 0) + s.durationMinutes;
    });

    const allSessions = await StudySession.find({ user: req.userId }).sort({ date: 1 });

    const studiedDates = new Set(
      allSessions.map((s) => startOfDay(s.date).toISOString().slice(0, 10))
    );

    let currentStreak = 0;
    let cursor = todayStart;

    while (studiedDates.has(cursor.toISOString().slice(0, 10))) {
      currentStreak += 1;
      cursor = addDays(cursor, -1);
    }

    let bestStreak = 0;
    let running = 0;
    let previous = null;

    for (const s of allSessions) {
      const current = startOfDay(s.date);
      if (!previous) {
        running = 1;
      } else {
        const difference = Math.round(
          (current - previous) / (24 * 60 * 60 * 1000)
        );
        running = difference === 1 ? running + 1 : 1;
      }
      bestStreak = Math.max(bestStreak, running);
      previous = current;
    }

    res.json({
      todayMinutes,
      weekMinutes,
      monthMinutes,
      subjectToday: subjectMap,
      subjectMonth: subjectMapMonth,
      dailyMap,
      currentStreak,
      bestStreak
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load dashboard" });
  }
};
