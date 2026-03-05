import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const taskSchema = new mongoose.Schema({
    _id: {
        type: String, 
        required: true,
        default: uuidv4,
    },
    task: {
        type: String,
        required: [true, "Task is required and must be a non-empty string"],
    },
    description: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        enum: ["todo", "in-progress", "done"],
        default: "todo",
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium",
    },
    dueDate: {
        type: Date,
        required: false,
    },
    estimateMinutes: {
        type: Number,
        required: false,
        min: 0,
    },
    spentMinutes: {
        type: Number,
        required: false,
        min: 0,
        default: 0,
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

export default mongoose.model("Task", taskSchema);

// // models/Task.js
// const mongoose = require('mongoose');

// const taskSchema = new mongoose.Schema({
//     id: {
//         type: String,
//         required: true
//     },
//     task: { 
//         type: String, 
//         required: true 
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
//     status: {
//         type: String,
//         enum: ['todo', 'in-progress', 'done'],
//         default: 'todo' 
//     },
//     description: {
//         type: String,
//         default: ""
//     }
// });

// const Task = mongoose.model('Task', taskSchema);

// module.exports = Task;

