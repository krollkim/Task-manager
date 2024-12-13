import React from "react";
import TaskInput from "./TaskInput";
import TaskList from "./TaskList";
import {useTasks} from "../hooks/useTasks";
import { Task } from "../types/types";

const Layout = () => {
  const { 
    tasks, 
    handleAddTask, 
    handleDelete, 
    handleEdit, 
    handleComplete, 
    isOpen,
    taskToEdit,
    closeModal,
    openModal,
    modalMode,
  } = useTasks();

  const modalProps = {
    isOpen,
    taskToEdit,
    closeModal,
    openModal,
    modalMode,
    onSave: (updatedTask: Partial<Task>) => {
      if (taskToEdit) {
        handleEdit(taskToEdit._id, updatedTask);
        closeModal();
      }
    },
};

  return (
    <>
      <TaskInput onAddTask={handleAddTask} />
      <TaskList 
        tasks={tasks} 
        onDelete={handleDelete} 
        onEdit={handleEdit} 
        onComplete={handleComplete}
        modalProps={modalProps}
      />
    </>
  );
};

export default Layout;