import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const meetingSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: uuidv4,
    },
    title: {
        type: String,
        required: [true, "Meeting title is required"],
    },
    description: {
        type: String,
        default: "",
    },
    date: {
        type: Date,
        required: [true, "Meeting date is required"],
    },
    startTime: {
        type: String,
        required: false,
    },
    endTime: {
        type: String,
        required: false,
    },
    userId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Meeting", meetingSchema);
