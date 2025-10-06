import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { 
  CloseOutlined, 
  SaveOutlined,
  EditOutlined,
  DescriptionOutlined,
} from '@mui/icons-material';
import { 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  Chip
} from '@mui/material';
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

  useEffect(() => {
    if (taskToEdit) {
      setTask(taskToEdit.task || '');
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status || 'todo');
    } else {
      // Reset for new task
      setTask('');
      setDescription('');
      setStatus('todo');
    }
  }, [taskToEdit, isOpen]);

  const handleSave = () => {
    if (!task.trim()) return;

    const updatedTask: Partial<Task> = {
      task: task.trim(),
      description: description.trim(),
      status
    };

    onSave(updatedTask);
    handleClose();
  };

  const handleClose = () => {
    setTask('');
    setDescription('');
    setStatus('todo');
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
    >
      <div className="pro-card-gradient pro-rounded-lg p-6 w-full max-w-md mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <EditOutlined className="text-white/80" />
            <h2 className="text-xl font-semibold text-white">
              {modalMode === 'edit' ? (taskToEdit ? 'Edit Task' : 'New Task') : 'Task Details'}
            </h2>
          </div>
          <IconButton onClick={handleClose} className="text-white/60 hover:text-white">
            <CloseOutlined />
          </IconButton>
        </div>

        {modalMode === 'preview' ? (
          // Preview Mode
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">{taskToEdit?.task}</h3>
              <Chip 
                label={getStatusLabel(taskToEdit?.status || 'todo')}
                color={getStatusColor(taskToEdit?.status || 'todo')}
                size="small"
                className="mb-3"
              />
            </div>
            
            {taskToEdit?.description && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <DescriptionOutlined className="text-white/60" fontSize="small" />
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
            <TextField
              label="Task Name"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              fullWidth
              variant="outlined"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'transparent',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.7)' }
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />

            {/* Description */}
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'transparent',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.7)' }
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />

            {/* Status */}
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as Task['status'])}
                label="Status"
                sx={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.7)' },
                  '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' }
                }}
              >
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-white/10">
          <Button 
            onClick={handleClose}
            variant="outlined"
            className="text-white/70 border-white/30 hover:border-white/50"
          >
            Cancel
          </Button>
          {modalMode === 'edit' && (
            <Button 
              onClick={handleSave}
              variant="contained"
              disabled={!task.trim()}
              startIcon={<SaveOutlined />}
              className="pro-button-gradient text-white font-medium"
              sx={{
                background: 'linear-gradient(135deg, #0F2027 0%, #2C5364 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0F2027 0%, #2C5364 100%)',
                  transform: 'scale(1.02)'
                }
              }}
            >
              Save Task
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalComponent;
