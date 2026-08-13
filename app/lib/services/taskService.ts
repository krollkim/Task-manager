import Task from '@/models/mongoDB/Task';

export async function quickRescheduleTask(
  userId: string,
  taskId: string,
  daysFromNow: number
) {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw new Error('Task not found');
  }

  const newDate = new Date();
  newDate.setDate(newDate.getDate() + daysFromNow);
  const dateStr = newDate.toISOString().split('T')[0];

  const updated = await Task.findByIdAndUpdate(
    taskId,
    { dueDate: dateStr },
    { new: true }
  );

  return updated;
}
