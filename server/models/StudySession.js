import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    topic: {
      type: String,
      default: "",
      trim: true
    },
    notes: {
      type: String,
      default: "",
      trim: true
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1
    },
    date: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("StudySession", studySessionSchema);
