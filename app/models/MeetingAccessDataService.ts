import Meeting from './mongoDB/Meeting';

const getMeetings = async (userId: string) => {
  try {
    const meetings = await Meeting.find({ userId });
    return meetings;
  } catch (error: any) {
    error.status = 404;
    throw error;
  }
};

const getMeeting = async (meetingId: string, userId: string) => {
  try {
    const meeting = await Meeting.findOne({ _id: meetingId, userId });
    if (!meeting) throw new Error('Could not find this meeting in the database');
    return meeting;
  } catch (error: any) {
    error.status = 404;
    throw error;
  }
};

const createMeeting = async (meetingData: any) => {
  try {
    const meeting = new Meeting(meetingData);
    await meeting.save();
    return meeting;
  } catch (error: any) {
    error.status = 400;
    throw error;
  }
};

const deleteMeeting = async (id: string, userId: string) => {
  try {
    const deletedMeeting = await Meeting.findOneAndDelete({ _id: id, userId });
    if (!deletedMeeting) {
      const error: any = new Error('Meeting not found');
      error.status = 404;
      throw error;
    }
    return deletedMeeting;
  } catch (error) {
    throw error;
  }
};

const editMeeting = async (meetingId: string, updatedData: any, userId: string) => {
  try {
    const editedMeeting = await Meeting.findOne({ _id: meetingId, userId });
    if (!editedMeeting) {
      throw new Error('Meeting not found');
    }

    editedMeeting.title = updatedData.title || editedMeeting.title;
    if (updatedData.description !== undefined) editedMeeting.description = updatedData.description;
    if (updatedData.date !== undefined) editedMeeting.date = updatedData.date;
    if (updatedData.startTime !== undefined) editedMeeting.startTime = updatedData.startTime;
    if (updatedData.endTime !== undefined) editedMeeting.endTime = updatedData.endTime;
    if (updatedData.rrule !== undefined) {
      editedMeeting.rrule = updatedData.rrule;
      editedMeeting.isRecurringBase = !!updatedData.rrule;
    }
    if (updatedData.exceptedDates !== undefined) editedMeeting.exceptedDates = updatedData.exceptedDates;

    await editedMeeting.save();
    return editedMeeting.toObject();
  } catch (error) {
    throw error;
  }
};

export { getMeetings, getMeeting, createMeeting, deleteMeeting, editMeeting };
