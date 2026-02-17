import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import TaskCard from './TaskCard';
import TaskList from './TaskList';
import TaskViewToggle from './TaskViewToggle';
import CalendarWidget from './CalendarWidget';
import NotesWidget from './NotesWidget';
import MobileBottomNav from './MobileBottomNav';
import ModalComponent from '../ModalComponent';
import MeetingModal from '../MeetingModal';
import NoteModal from '../NoteModal';
import { useTasks } from '../../hooks/useTasks';
import { useViewPreference } from '../../hooks/useViewPreference';
import { useAgenda } from '../../hooks/useAgenda';
import { Task } from '../../types/types';
import { addMeeting } from '../../services/MeetingServices';
import { NoteServices } from '../../services/NoteServices';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  isMobile?: boolean;
}

const Dashboard: React.FC<DashboardProps> = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  
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

  // // Debug logging
  // useEffect(() => {
  //   console.log('🎯 Dashboard tasks state:', tasks);
  //   console.log('🎯 Tasks length:', tasks?.length);
  // }, [tasks]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('tasks');
  const [searchValue, setSearchValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);

  const { agenda, loading: agendaLoading, isEmpty: agendaEmpty, refetch: refetchAgenda } = useAgenda(selectedDate);

  // View preferences (widget-ready)
  const { viewMode, listDensity, setViewMode, setListDensity } = useViewPreference();

  // Close sidebar when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

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

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    if (isMobile) {
      setSidebarOpen(false); // Auto-close sidebar on mobile after selection
    }
  };

  const handleTaskEdit = (task: Task) => {
    openModal(task, 'edit');
  };

  const handleTaskStatusChange = (id: string, status: Task['status']) => {
    handleEdit(id, { status });
  };

  const handleTaskQuickUpdate = (id: string, updates: Partial<Task>) => {
    handleEdit(id, updates);
  };

  const handleAddNewTask = () => {
    // Open modal for adding a new task
    openModal(null as any, 'edit');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleModalSave = async (updatedTask: Partial<Task>) => {
    if (taskToEdit) {
      await handleEdit(taskToEdit._id, updatedTask);
    } else {
      await handleAddTask(updatedTask as Omit<Task, '_id' | 'createdAt'>);
    }
    refetchAgenda();
  };

  const handleQuickAddTask = () => {
    openModal(null as any, 'edit');
  };

  const handleQuickAddNote = () => {
    setNoteModalOpen(true);
  };

  const handleQuickAddMeeting = () => {
    setMeetingModalOpen(true);
  };

  const formatLocalDate = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const handleMeetingSave = async (meetingData: {
    title: string;
    date: string;
    description?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    try {
      await addMeeting(meetingData);
      refetchAgenda();
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const handleNoteSave = async (noteData: {
    title: string;
    content?: string;
    pinned?: boolean;
    date?: string;
  }) => {
    try {
      await NoteServices.createNote(noteData);
      refetchAgenda();
      setNotesRefreshKey((k) => k + 1);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  return (
    <div className={`${isMobile ? 'min-h-screen' : 'h-screen'} bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${isMobile ? '' : 'overflow-hidden'}`}>
      <div className={`max-w-[1800px] mx-auto ${isMobile ? '' : 'h-full'} p-4 pb-20 md:pb-4 box-border`}>
        <div className={`flex gap-6 ${isMobile ? 'min-h-screen' : 'h-full'}`}>
          {/* Desktop/Tablet Sidebar */}
          {(!isMobile || sidebarOpen) && (
            <div className={`
              ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'w-64'}
              ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
              transition-transform duration-300 ease-in-out
            `}>
              <Sidebar
                activeItem={activeSection}
                onItemClick={handleSectionChange}
                onClose={handleSidebarClose}
                isMobile={isMobile}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </div>
          )}

          {/* Main Content */}
          <div className={`flex-1 flex flex-col min-w-0 ${isMobile ? '' : 'h-full overflow-hidden'}`}>
            {/* Header */}
            <Header
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onMenuClick={handleMenuClick}
              isMobile={isMobile}
            />

            {/* Dashboard Content */}
            <div className={`flex-1 ${isMobile ? 'flex flex-col' : 'flex flex-col lg:grid lg:grid-cols-12'} gap-6 ${isMobile ? '' : 'min-h-0'}`}>
              {/* Tasks Section */}
              <div className={`${isMobile ? 'w-full' : 'lg:col-span-8'} flex flex-col ${isMobile ? '' : 'min-h-0'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-2xl font-bold">
                    {activeSection === 'dashboard' ? 'Dashboard Overview' :
                     activeSection === 'tasks' ? 'My Tasks' :
                     activeSection === 'mail' ? 'Mail & Messages' :
                     activeSection === 'chat' ? 'Team Chat' :
                     activeSection === 'spaces' ? 'Shared Spaces' :
                     activeSection === 'meet' ? 'Meetings' : 'My Tasks'}
                  </h2>
                  <div className="flex items-center gap-4">
                    {(activeSection === 'tasks' || activeSection === 'dashboard') && (
                      <TaskViewToggle
                        viewMode={viewMode}
                        onViewChange={setViewMode}
                        listDensity={listDensity}
                        onDensityChange={setListDensity}
                        isMobile={isMobile}
                      />
                    )}
                    <span className="text-white/60 text-sm">
                      {activeSection === 'tasks' || activeSection === 'dashboard' ?
                        `${filteredTasks.length} tasks` :
                        'Coming Soon'}
                    </span>
                  </div>
                </div>

                {/* Task Stats */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                  <div className="pro-glass pro-rounded p-3 md:p-4 text-center">
                    <div className="text-blue-400 text-xl md:text-2xl font-bold">
                      {tasksByStatus.todo.length}
                    </div>
                    <div className="text-white/60 text-xs md:text-sm">To Do</div>
                  </div>
                  <div className="pro-glass pro-rounded p-3 md:p-4 text-center">
                    <div className="text-yellow-400 text-xl md:text-2xl font-bold">
                      {tasksByStatus['in-progress'].length}
                    </div>
                    <div className="text-white/60 text-xs md:text-sm">In Progress</div>
                  </div>
                  <div className="pro-glass pro-rounded p-3 md:p-4 text-center">
                    <div className="text-green-400 text-xl md:text-2xl font-bold">
                      {tasksByStatus.done.length}
                    </div>
                    <div className="text-white/60 text-xs md:text-sm">Completed</div>
                  </div>
                </div>

                {/* Content based on active section */}
                <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
                  {(activeSection === 'tasks' || activeSection === 'dashboard') ? (
                    <>
                      {/* Tasks content */}
                      {filteredTasks.length === 0 ? (
                        <div className="pro-glass pro-rounded-lg p-8 text-center">
                          <p className="text-white/60 text-lg mb-2">No tasks found</p>
                          <p className="text-white/40 text-sm">
                            {searchValue ? 'Try adjusting your search' : 'Create your first task to get started'}
                          </p>
                        </div>
                      ) : (
                        <div
                          key={viewMode}
                          className="animate-fadeIn motion-reduce:animate-none"
                        >
                          {viewMode === 'cards' ? (
                            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                              {filteredTasks.map((task) => (
                                <TaskCard
                                  key={task._id}
                                  task={task}
                                  onEdit={handleTaskEdit}
                                  onDelete={handleDelete}
                                  onStatusChange={handleTaskStatusChange}
                                  onQuickUpdate={handleTaskQuickUpdate}
                                />
                              ))}
                            </div>
                          ) : (
                            <TaskList
                              tasks={filteredTasks}
                              onEdit={handleTaskEdit}
                              onDelete={handleDelete}
                              onStatusChange={handleTaskStatusChange}
                              onQuickUpdate={handleTaskQuickUpdate}
                              density={isMobile ? 'compact' : listDensity}
                              isMobile={isMobile}
                            />
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    // Placeholder content for other sections
                    <div className="pro-glass pro-rounded-lg p-8 text-center">
                      <p className="text-white/60 text-lg mb-2">
                        {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Feature
                      </p>
                      <p className="text-white/40 text-sm">
                        This feature is coming soon! We're working hard to bring you the best experience.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop: Right Sidebar - Calendar & Notes */}
              {!isMobile && (
                <div className="lg:col-span-4 flex flex-col space-y-6 min-h-0">
                  <CalendarWidget
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    className="flex-shrink-0"
                    agenda={agenda}
                    agendaLoading={agendaLoading}
                    agendaEmpty={agendaEmpty}
                    onAddTask={handleQuickAddTask}
                    onAddNote={handleQuickAddNote}
                    onAddMeeting={handleQuickAddMeeting}
                  />
                  <NotesWidget className="flex-1" refreshKey={notesRefreshKey} />
                </div>
              )}
            </div>

            {/* Mobile Widgets - ALWAYS RENDERED outside main grid */}
            {isMobile && (
              <div className="flex flex-col space-y-6 mt-6">
                <CalendarWidget
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  className="w-full"
                  agenda={agenda}
                  agendaLoading={agendaLoading}
                  agendaEmpty={agendaEmpty}
                  onAddTask={handleQuickAddTask}
                  onAddNote={handleQuickAddNote}
                  onAddMeeting={handleQuickAddMeeting}
                />
                <NotesWidget className="w-full min-h-[300px]" refreshKey={notesRefreshKey} />
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={handleAddNewTask}
          className={`fixed ${isMobile ? 'bottom-20 right-6' : 'bottom-6 left-6'} w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-200 z-50`}
        >
          <span className="text-2xl font-bold">+</span>
        </button>

        {/* Modal for editing/adding tasks */}
        <ModalComponent
          isOpen={isOpen}
          taskToEdit={taskToEdit}
          closeModal={closeModal}
          modalMode={modalMode}
          onSave={handleModalSave}
          defaultDueDate={formatLocalDate(selectedDate)}
        />

        {/* Meeting Modal */}
        <MeetingModal
          isOpen={meetingModalOpen}
          closeModal={() => setMeetingModalOpen(false)}
          onSave={handleMeetingSave}
          prefillDate={selectedDate}
        />

        {/* Note Modal */}
        <NoteModal
          isOpen={noteModalOpen}
          closeModal={() => setNoteModalOpen(false)}
          onSave={handleNoteSave}
          prefillDate={selectedDate}
        />

        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <MobileBottomNav
            activeItem={activeSection}
            onItemClick={handleSectionChange}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;