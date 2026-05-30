import React from 'react';
import Modal from 'react-modal';
import { AgendaData, AgendaView, WeekAgendaDay, Meeting, Task, Note } from '../../types/types';
import CalendarWidget from '../dashboard/CalendarWidget';
import '../../App.css';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  agenda?: AgendaData;
  agendaLoading?: boolean;
  agendaEmpty?: boolean;
  agendaView?: AgendaView;
  onAgendaViewChange?: (view: AgendaView) => void;
  weekAgenda?: WeekAgendaDay[];
  monthAgenda?: WeekAgendaDay[];
  onAddTask?: () => void;
  onAddNote?: () => void;
  onAddMeeting?: () => void;
  onMeetingClick?: (meeting: Meeting) => void;
  onTaskClick?: (task: Task) => void;
  onNoteClick?: (note: Note) => void;
  onMeetingReschedule?: (meetingId: string, newDate: string) => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onDateSelect,
  agenda,
  agendaLoading,
  agendaEmpty,
  agendaView = 'day',
  onAgendaViewChange,
  weekAgenda = [],
  monthAgenda = [],
  onAddTask,
  onAddNote,
  onAddMeeting,
  onMeetingClick,
  onTaskClick,
  onNoteClick,
  onMeetingReschedule,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4"
      overlayClassName="fixed inset-0 bg-black/60 z-50"
      ariaHideApp={false}
      style={{
        content: {
          position: 'relative',
          width: '80vw',
          height: '92vh',
          maxWidth: 'none',
          margin: 'auto',
          padding: 0,
          border: 'none',
          borderRadius: '1rem',
          background: 'transparent',
          overflow: 'visible',
        }
      }}
    >
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl w-full h-full overflow-hidden border border-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-slate-900/95 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-white">📅 Calendar</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Calendar Widget Content - Full Functionality */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <CalendarWidget
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
              className="w-full"
              agenda={agenda}
              agendaLoading={agendaLoading}
              agendaEmpty={agendaEmpty}
              agendaView={agendaView}
              onAgendaViewChange={onAgendaViewChange}
              weekAgenda={weekAgenda}
              monthAgenda={monthAgenda}
              onAddTask={onAddTask}
              onAddNote={onAddNote}
              onAddMeeting={onAddMeeting}
              onMeetingClick={onMeetingClick}
              onTaskClick={onTaskClick}
              onNoteClick={onNoteClick}
              onMeetingReschedule={onMeetingReschedule}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CalendarModal;
