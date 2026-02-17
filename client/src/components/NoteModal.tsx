import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import '../App.css';

interface NoteModalProps {
    isOpen: boolean;
    closeModal: () => void;
    onSave: (note: {
        title: string;
        content?: string;
        pinned?: boolean;
        date?: string;
    }) => void;
    prefillDate?: Date;
}

const formatLocalDate = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const NoteModal: React.FC<NoteModalProps> = ({
    isOpen,
    closeModal,
    onSave,
    prefillDate
}) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setContent('');
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({
            title: title.trim(),
            content: content.trim() || undefined,
            pinned: false,
            date: prefillDate ? formatLocalDate(prefillDate) : undefined,
        });
        closeModal();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="New Note"
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
                        <span className="text-white/80 text-xl">📝</span>
                        <h2 className="text-xl font-semibold text-white">New Note</h2>
                    </div>
                    <button onClick={closeModal} className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <span className="text-xl">✕</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/70 hover:border-white/50 transition-colors"
                            placeholder="Note title..."
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/70 focus:ring-1 focus:ring-white/70 hover:border-white/50 transition-colors resize-none"
                            placeholder="Note content..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-white/10">
                    <button
                        onClick={closeModal}
                        className="px-4 py-2 text-white/70 border border-white/30 rounded-lg hover:border-white/50 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!title.trim()}
                        className="px-4 py-2 pro-button-gradient text-white font-medium rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
                    >
                        <span>📝</span>
                        <span>Save Note</span>
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default NoteModal;
