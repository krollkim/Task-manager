import React, { useState, useEffect } from 'react';
import { ModalProps, Task } from '../types/types';
import Modal from "react-modal";

const ModalComponent = ({ 
  taskToEdit, 
  isOpen, 
  closeModal, 
  onSave, 
  modalMode }: ModalProps) => {
  const [task, setTask] = useState<Task | null>(null);


  useEffect(() => {
    if (taskToEdit) {
      setTask(taskToEdit);
    }
  }, [taskToEdit]);

  const handleSave = () => {
    if (task) {
      onSave(task);
      closeModal();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTask(prev => prev ? { ...prev, [name]: value } : null);
  };

  return (
    <>
  {modalMode === "preview" && (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="View Task"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="p-6 bg-white rounded-lg shadow-lg w-[500px]">
        <h2 className="text-2xl font-bold mb-4">View Task</h2>

        {/* Task Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Name:
          </label>
          <div className="w-full border border-gray-300 rounded-md p-2 bg-gray-50">
            {task?.task || "N/A"}
          </div>
        </div>

        {/* Task Status */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status:
          </label>
          <div className="w-full border border-gray-300 rounded-md p-2 bg-gray-50">
            {task?.status || "N/A"}
          </div>
        </div>

        {/* Task Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description:
          </label>
          <div className="w-full border border-gray-300 rounded-md p-2 bg-gray-50">
            {task?.description || "N/A"}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )}

    {modalMode === "edit" && (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Edit Task"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="p-6 bg-white rounded-lg shadow-lg w-[500px]">
        <h2 className="text-2xl font-bold mb-4">Edit Task</h2>

        {/* Task Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Name:
          </label>
          <input
            type="text"
            name="task"
            value={task?.task || ""}
            onChange={handleChange}
            placeholder="Enter task name"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Task Status */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status:
          </label>
          <select
            name="status"
            value={task?.status || "todo"}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todo">To-do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Task Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description:
          </label>
          <textarea
            name="description"
            value={task?.description || ""}
            onChange={handleChange}
            placeholder="Enter task description"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
      )}
    </>
  );
};

export default ModalComponent;
