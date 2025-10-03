import React, { useState } from 'react';
import { AddOutlined } from '@mui/icons-material';
import { Fab } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import TaskCard from './TaskCard';
import CalendarWidget from './CalendarWidget';
import NotesWidget from './NotesWidget';
import ModalComponent from '../ModalComponent';
import { useTasks } from '../../hooks/useTasks';
import { Task } from '../../types/types';
import '../../dashboard.css';

interface DashboardProps {
  isMobile?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isMobile = false }) => {
  const {
    tasks,
    handleAddTask,
    handleDelete,
    handleEdit,
    isOpen,
    taskToEdit,
    closeModal,
    openModal,
    modalMode,
  } = useTasks();

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [activeSection, setActiveSection] = useState('tasks');
  const [searchValue, setSearchValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter tasks based on search
  const filteredTasks = tasks.filter(task =>
    task.task.toLowerCase().includes(searchValue.toLowerCase()) ||
    task.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Group tasks by status
  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    done: filteredTasks.filter(task => task.status === 'done')
  };

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTaskEdit = (task: Task) => {
    openModal(task, 'edit');
  };

  const handleTaskStatusChange = (id: string, status: Task['status']) => {
    handleEdit(id, { status });
  };

  const handleAddNewTask = () => {
    // Open modal for adding a new task
    openModal(null as any, 'edit');
  };

  const handleModalSave = async (updatedTask: Partial<Task>) => {
    if (taskToEdit) {
      // Edit existing task
      await handleEdit(taskToEdit._id, updatedTask);
    } else {
      // Add new task
      await handleAddTask(updatedTask as Omit<Task, '_id' | 'createdAt'>);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex gap-6 h-screen">
          {/* Sidebar */}
          {(!isMobile || sidebarOpen) && (
            <div className={`
              ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'w-64'}
              ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
              transition-transform duration-300 ease-in-out
            `}>
              <Sidebar
                activeItem={activeSection}
                onItemClick={setActiveSection}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <Header
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onMenuClick={handleMenuClick}
              isMobile={isMobile}
            />

            {/* Dashboard Content */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
              {/* Tasks Section */}
              <div className="lg:col-span-8 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-2xl font-bold">
                    My Tasks Overview
                  </h2>
                  <span className="text-white/60 text-sm">
                    {filteredTasks.length} tasks
                  </span>
                </div>

                {/* Task Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="pro-glass pro-rounded p-4 text-center">
                    <div className="text-blue-400 text-2xl font-bold">
                      {tasksByStatus.todo.length}
                    </div>
                    <div className="text-white/60 text-sm">To Do</div>
                  </div>
                  <div className="pro-glass pro-rounded p-4 text-center">
                    <div className="text-yellow-400 text-2xl font-bold">
                      {tasksByStatus['in-progress'].length}
                    </div>
                    <div className="text-white/60 text-sm">In Progress</div>
                  </div>
                  <div className="pro-glass pro-rounded p-4 text-center">
                    <div className="text-green-400 text-2xl font-bold">
                      {tasksByStatus.done.length}
                    </div>
                    <div className="text-white/60 text-sm">Completed</div>
                  </div>
                </div>

                {/* Tasks Grid */}
                <div className="flex-1 overflow-y-auto pro-scrollbar">
                  {filteredTasks.length === 0 ? (
                    <div className="pro-glass pro-rounded-lg p-8 text-center">
                      <p className="text-white/60 text-lg mb-2">No tasks found</p>
                      <p className="text-white/40 text-sm">
                        {searchValue ? 'Try adjusting your search' : 'Create your first task to get started'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredTasks.map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          onEdit={handleTaskEdit}
                          onDelete={handleDelete}
                          onStatusChange={handleTaskStatusChange}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar - Calendar & Notes */}
              <div className="lg:col-span-4 flex flex-col space-y-6">
                {/* Calendar Widget */}
                <CalendarWidget
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  className="flex-shrink-0"
                />

                {/* Notes Widget */}
                <NotesWidget className="flex-1 min-h-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <Fab
          onClick={handleAddNewTask}
          className="pro-card-gradient hover:scale-110 transition-transform duration-200"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            '&:hover': {
              transform: 'scale(1.1)',
            }
          }}
        >
          <AddOutlined className="text-white" />
        </Fab>

        {/* Modal for editing/adding tasks */}
        <ModalComponent
          isOpen={isOpen}
          taskToEdit={taskToEdit}
          closeModal={closeModal}
          modalMode={modalMode}
          onSave={handleModalSave}
        />

        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard; 