import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const noteSchema = new mongoose.Schema({
    _id: {
        type: String, 
        required: true,
        default: uuidv4,
    },
    title: {
        type: String,
        required: [true, "Note title is required"],
    },
    content: {
        type: String,
        default: "",
    },
    pinned: {
        type: Boolean,
        default: false,
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

export default mongoose.model("Note", noteSchema);