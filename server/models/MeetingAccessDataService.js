import Meeting from "./mongoDB/Meeting.js";
import { v4 as uuidv4 } from 'uuid';

const DB = process.env.DB || "MONGODB";

const getMeetings = async (userId) => {
    if (DB === "MONGODB") {
        try {
            const meetings = await Meeting.find({ userId });
            return Promise.resolve(meetings);
        } catch (error) {
            error.status = 404;
            throw error;
        }
    }
    return Promise.resolve("get meetings not in mongodb");
};

const getMeeting = async (meetingId, userId) => {
    if (DB === "MONGODB") {
        try {
            const meeting = await Meeting.findOne({ _id: meetingId, userId });
            if (!meeting) throw new Error("Could not find this meeting in the database");
            return Promise.resolve(meeting);
        } catch (error) {
            error.status = 404;
            throw error;
        }
    }
    return Promise.resolve("get meeting not in mongodb");
};

const createMeeting = async (meetingData) => {
    if (DB === "MONGODB") {
        try {
            meetingData.id = uuidv4();
            let meeting = new Meeting(meetingData);
            meeting = await meeting.save();
            return Promise.resolve(meeting);
        } catch (error) {
            error.status = 400;
            throw error;
        }
    }
    return Promise.resolve("create meeting not in mongodb");
};

const deleteMeeting = async (id, userId) => {
    if (DB === "MONGODB") {
        try {
            const deletedMeeting = await Meeting.findOneAndDelete({ _id: id, userId });
            if (!deletedMeeting) {
                const error = new Error("Meeting not found");
                error.status = 404;
                throw error;
            }
            return deletedMeeting;
        } catch (error) {
            throw error;
        }
    }
    throw new Error("delete meeting not in mongodb");
};

const editMeeting = async (meetingId, updatedData, userId) => {
    if (DB === "MONGODB") {
        try {
            const editedMeeting = await Meeting.findOne({ _id: meetingId, userId });
            if (!editedMeeting) {
                throw new Error("Meeting not found");
            }

            editedMeeting.title = updatedData.title || editedMeeting.title;
            if (updatedData.description !== undefined) editedMeeting.description = updatedData.description;
            if (updatedData.date !== undefined) editedMeeting.date = updatedData.date;
            if (updatedData.startTime !== undefined) editedMeeting.startTime = updatedData.startTime;
            if (updatedData.endTime !== undefined) editedMeeting.endTime = updatedData.endTime;

            await editedMeeting.save();
            return editedMeeting.toObject();
        } catch (error) {
            error.status = 400;
            throw error;
        }
    }
    return "edit meeting not available in mongodb";
};

export { getMeetings, getMeeting, createMeeting, deleteMeeting, editMeeting };
