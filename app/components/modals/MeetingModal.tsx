'use client';

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Meeting, RecurringEditScope } from '@/types/types';
import RecurrenceSelector from './RecurrenceSelector';

interface MeetingModalProps {
    isOpen: boolean;
    closeModal: () => void;
    onSave: (
        meeting: {
            title: string;
            date: string;
            description?: string;
            startTime?: string;
            endTime?: string;
            rrule?: string | null;
        },
        editScope?: RecurringEditScope
    ) => void;
    prefillDate?: Date;
    meetingToEdit?: Meeting | null;
    onDelete?: (meetingId: string, editScope?: RecurringEditScope) => void;
}

const formatLocalDate = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const SCOPE_OPTIONS: { value: RecurringEditScope; label: string }[] = [
    { value: 'this',      label: 'This occurrence' },
    { value: 'following', label: 'This & following' },
    { value: 'all',       label: 'All occurrences' },
];

const MeetingModal: React.FC<MeetingModalProps> = ({
    isOpen,
    closeModal,
    onSave,
    prefillDate,
    meetingToEdit,
    onDelete
}) => {
    const [title, setTitle]           = useState('');
    const [date, setDate]             = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime]   = useState('');
    const [endTime, setEndTime]       = useState('');
    const [rrule, setRrule]           = useState<string | null>(null);
    const [editScope, setEditScope]   = useState<RecurringEditScope>('this');

    const isRecurring = !!(meetingToEdit?.isRecurringBase || meetingToEdit?.isRecurringInstance);

    useEffect(() => {
        if (isOpen && meetingToEdit) {
            setTitle(meetingToEdit.title);
            setDate(meetingToEdit.date.split('T')[0]);
            setDescription(meetingToEdit.description || '');
            setStartTime(meetingToEdit.startTime || '');
            setEndTime(meetingToEdit.endTime || '');
            setRrule(meetingToEdit.rrule ?? null);
            // Default scope: 'this' for instances, 'all' for base
            setEditScope(meetingToEdit.isRecurringInstance ? 'this' : 'all');
        } else if (isOpen && prefillDate) {
            setDate(formatLocalDate(prefillDate));
            setRrule(null);
            setEditScope('this');
        }
        if (!isOpen) {
            setTitle('');
            setDate('');
            setDescription('');
            setStartTime('');
            setEndTime('');
            setRrule(null);
            setEditScope('this');
        }
    }, [isOpen, prefillDate, meetingToEdit]);

    const handleSave = () => {
        if (!title.trim() || !date) return;
        onSave(
            {
                title: title.trim(),
                date,
                description: description.trim() || undefined,
                startTime: startTime || undefined,
                endTime: endTime || undefined,
                rrule: isRecurring ? (editScope === 'all' ? rrule : undefined) : rrule,
            },
            isRecurring ? editScope : undefined
        );
        closeModal();
    };

    const handleDelete = () => {
        if (!meetingToEdit || !onDelete) return;
        onDelete(meetingToEdit._id, isRecurring ? editScope : undefined);
        closeModal();
    };

    // Show RecurrenceSelector only for new meetings or when editing all occurrences
    const showRecurrenceSelector = !meetingToEdit || (isRecurring && editScope === 'all') || !isRecurring;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel={meetingToEdit ? 'Edit Meeting' : 'New Meeting'}
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
                        <span className="text-white/80 text-xl">📅</span>
                        <h2 className="text-xl font-semibold text-white">
                            {meetingToEdit ? 'Edit Meeting' : 'New Meeting'}
                        </h2>
                        {isRecurring && (
                            <span className="text-purple-400/80 text-xs font-medium px-2 py-0.5 rounded-full border border-purple-400/30 bg-purple-500/10">
                                ↻ Recurring
                            </span>
                        )}
                    </div>
                    <button
                        onClick={closeModal}
                        className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <span className="text-xl">✕</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Edit scope picker — only shown when editing recurring meetings */}
                    {isRecurring && meetingToEdit && (
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">Edit scope</label>
                            <div className="flex gap-1.5">
                                {SCOPE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setEditScope(opt.value)}
                                        className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors ${
                                            editScope === opt.value
                                                ? 'bg-indigo-500/30 border-indigo-400/60 text-indigo-200'
                                                : 'bg-white/5 border-white/15 text-white/50 hover:border-white/30 hover:text-white/70'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/70 hover:border-white/50 transition-colors"
                            placeholder="Meeting title..."
                        />
                    </div>

                    {/* Date — locked to occurrence date when editing 'this' or 'following' */}
                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">Date *</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            disabled={isRecurring && (editScope === 'this' || editScope === 'following')}
                            className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/70 hover:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Time Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">Start Time</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/70 hover:border-white/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">End Time</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/70 hover:border-white/50 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/70 hover:border-white/50 transition-colors resize-none"
                            placeholder="Meeting description..."
                        />
                    </div>

                    {/* Recurrence Selector */}
                    {showRecurrenceSelector && (
                        <RecurrenceSelector
                            value={rrule}
                            onChange={setRrule}
                            baseDate={date}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className={`flex ${meetingToEdit ? 'justify-between' : 'justify-end'} mt-6 pt-4 border-t border-white/10`}>
                    {meetingToEdit && onDelete && (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 text-red-400 border border-red-400/30 rounded-lg hover:bg-red-500/10 hover:border-red-400/50 transition-colors flex items-center space-x-2"
                        >
                            <span>🗑️</span>
                            <span>Delete</span>
                        </button>
                    )}
                    <div className="flex space-x-3">
                        <button
                            onClick={closeModal}
                            className="px-4 py-2 text-white/70 border border-white/30 rounded-lg hover:border-white/50 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!title.trim() || !date}
                            className="px-4 py-2 pro-button-gradient text-white font-medium rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
                        >
                            <span>📅</span>
                            <span>{meetingToEdit ? 'Update Meeting' : 'Save Meeting'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default MeetingModal;
