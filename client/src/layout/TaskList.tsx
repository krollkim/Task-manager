import React from 'react';
import TaskItem from './TaskItem';
import ModalComponent from '../components/ModalComponent';
import { Task, TaskListProps } from '../types/types';

// export interface Task {
//     _id: string;
//     task: string;
//     createdAt: string;
//     status: 'todo' | 'in-progress' | 'done';
//     description: string;
// }

// export interface TaskListProps {
//     tasks: Task[];
//     onDelete: (id: string) => void;
//     onEdit: (id: string, updatedTask: Partial<Task>) => void;
//     onComplete: (id: string) => void;
//     modalProps?: ModalProps
// }

const TaskList = ({
    tasks,
    onDelete,
    onEdit,
    onComplete,
    modalProps,
}: TaskListProps) => {
    return (
        <>
            <div className="grid grid-cols-3 gap-6 px-8 py-4 bg-gray-100 rounded-lg shadow-lg">
                {['todo', 'in-progress', 'done'].map((status) => (
                    <div
                        key={status}
                        className="p-4 bg-white rounded-lg shadow-md border border-gray-300"
                    >
                        <h2 className="mb-4 text-lg font-bold capitalize text-gray-800">
                            {status.replace('-', ' ')}
                        </h2>
                        <div className="space-y-2">
                            {tasks
                                .filter((task) => task.status === status)
                                .map((task) => (
                                    <TaskItem
                                        key={task._id}
                                        task={task}
                                        onDelete={() => onDelete(task._id)}
                                        onEdit={() => modalProps.openModal(task, "edit")}
                                        onComplete={() => onComplete(task._id)}
                                        onClick={() => {
                                             modalProps?.openModal(task, 'preview');
                                        }}
                                    />
                                ))}
                        </div>
                    </div>
                ))}
            </div>
            {modalProps?.isOpen && modalProps.taskToEdit && (
                <ModalComponent
                isOpen={modalProps.isOpen}
                    taskToEdit={modalProps.taskToEdit}
                    closeModal={modalProps.closeModal}
                    onSave={(updatedTask: Partial<Task>) => {
                      if (modalProps.taskToEdit) {
                        onEdit(modalProps.taskToEdit._id, updatedTask);
                        modalProps.closeModal();
                      }
                  }}
                  modalMode={modalProps.modalMode}
                />
            )}
        </>
    );
};

export default TaskList;
