import React, { ReactNode, useState } from 'react'
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from "@mui/material";
import { Task } from '../types/types';

type TaskInputProps = {
  children?: ReactNode;
  onAddTask: (task: Omit<Task, '_id' | 'createdAt'>) => void;
}

const TaskInput = ({ children, onAddTask }: TaskInputProps) => {
  const [task, setTask] = useState('');
  const [description, setDescription] = useState<string>(''); 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTask(e.target.value);
  };

  const handleAddTask = () => {
    if (task.trim()) {
      const newTask: Omit<Task, '_id' | 'createdAt'>= {
        task,
        description,
        status: 'todo',
      };
      onAddTask(newTask);
      setTask('');
      setDescription(''); 
    }
  };

  return (
    <div className='p-2 mt-12'>
      <h1>Put your task below</h1>
      <div className='flex justify-center items-center mt-4'>
        <input
          className='border-2 border-black rounded p-2 w-64'
          type="text"
          value={task}
          onChange={handleInputChange}
        />
        <IconButton className='ml-2 w-16 h-16' onClick={handleAddTask}>
          <AddIcon className='bg-green-400 rounded-xl w-full h-full' />
        </IconButton>
      </div>
      {children}
    </div>
  );
}

export default TaskInput