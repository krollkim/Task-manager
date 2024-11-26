// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    task: { 
        type: String, 
        required: true 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'done'],
        default: 'todo' 
    }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;