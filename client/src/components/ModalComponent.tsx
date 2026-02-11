import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Task, ModalProps } from '../types/types';
import '../App.css';

const ModalComponent: React.FC<ModalProps> = ({ 
  isOpen, 
  taskToEdit, 
  closeModal, 
  modalMode,
  onSave 
}) => {
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimateMinutes, setEstimateMinutes] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTask(taskToEdit.task || '');
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status || 'todo');
      setPriority(taskToEdit.priority || 'medium');
      setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '');
      setEstimateMinutes(taskToEdit.estimateMinutes?.toString() || '');
    } else {
      // Reset for new task
      setTask('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setDueDate('');
      setEstimateMinutes('');
    }
  }, [taskToEdit, isOpen]);

  const handleSave = () => {
    if (!task.trim()) return;

    const updatedTask: Partial<Task> = {
      task: task.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate || undefined,
      estimateMinutes: estimateMinutes ? parseInt(estimateMinutes) : undefined
    };

    onSave(updatedTask);
    handleClose();
  };

  const handleClose = () => {
    setTask('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setDueDate('');
    setEstimateMinutes('');
    closeModal();
  };

  const getStatusColor = (taskStatus: Task['status']) => {
    switch (taskStatus) {
      case 'done':
        return 'success';
      case 'in-progress':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getStatusLabel = (taskStatus: Task['status']) => {
    switch (taskStatus) {
      case 'done':
        return 'Done';
      case 'in-progress':
        return 'In Progress';
      default:
        return 'To Do';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel={modalMode === 'edit' ? 'Edit Task' : 'Task Details'}
      className="ReactModal__Content"
      overlayClassName="ReactModal__Overlay"
      ariaHideApp={false}
      closeTimeoutMS={300}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <div className="pro-card-gradient pro-rounded-lg p-4 md:p-6 w-full max-w-md mx-auto relative pro-shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-white/80 text-xl">✏️</span>
            <h2 className="text-xl font-semibold text-white">
              {modalMode === 'edit' ? (taskToEdit ? 'Edit Task' : 'New Task') : 'Task Details'}
            </h2>
          </div>
          <button onClick={handleClose} className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
            <span className="text-xl">✕</span>
          </button>
        </div>

        {modalMode === 'preview' ? (
          // Preview Mode
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">{taskToEdit?.task}</h3>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-3 ${
                taskToEdit?.status === 'done' ? 'bg-green-600/20 text-green-400' : 
                taskToEdit?.status === 'in-progress' ? 'bg-yellow-600/20 text-yellow-400' : 
                'bg-blue-600/20 text-blue-400'
              }`}>
                {getStatusLabel(taskToEdit?.status || 'todo')}
              </span>
            </div>
            
            {taskToEdit?.description && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-white/60 text-sm">📝</span>
                  <span className="text-white/80 text-sm font-medium">Description</span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed pl-6">
                  {taskToEdit.description}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <span className="text-white/60 text-xs">
                Created: {new Date(taskToEdit?.createdAt || '').toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            {/* Task Name */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Task Name *</label>
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/70 hover:border-white/50 transition-colors"
                placeholder="Enter task name..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/70 hover:border-white/50 transition-colors resize-none"
                placeholder="Enter description..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Task['status'])}
                className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/70 hover:border-white/50 transition-colors"
              >
                <option value="todo" className="bg-gray-800 text-white">
                  📋 To Do
                </option>
                <option value="in-progress" className="bg-gray-800 text-white">
                  ⏳ In Progress
                </option>
                <option value="done" className="bg-gray-800 text-white">
                  ✅ Done
                </option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/70 hover:border-white/50 transition-colors"
              >
                <option value="low" className="bg-gray-800 text-white">
                  🟢 Low
                </option>
                <option value="medium" className="bg-gray-800 text-white">
                  🟡 Medium
                </option>
                <option value="high" className="bg-gray-800 text-white">
                  🟠 High
                </option>
                <option value="urgent" className="bg-gray-800 text-white">
                  🔴 Urgent
                </option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/70 hover:border-white/50 transition-colors"
              />
            </div>

            {/* Estimate Minutes */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Estimate (minutes)
                <span className="text-white/40 text-xs ml-2">Optional</span>
              </label>
              <input
                type="number"
                min="0"
                step="15"
                value={estimateMinutes}
                onChange={(e) => setEstimateMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/70 hover:border-white/50 transition-colors"
                placeholder="e.g., 30, 60, 120..."
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-white/10">
          <button 
            onClick={handleClose}
            className="px-4 py-2 text-white/70 border border-white/30 rounded-lg hover:border-white/50 hover:text-white transition-colors"
          >
            Cancel
          </button>
          {modalMode === 'edit' && (
            <button 
              onClick={handleSave}
              disabled={!task.trim()}
              className="px-4 py-2 pro-button-gradient text-white font-medium rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
            >
              <span>💾</span>
              <span>Save Task</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalComponent;
