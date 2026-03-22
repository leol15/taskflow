"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Category, Effort, Importance, Task, Urgency } from "../types/task";

interface TaskContextType {
  tasks: Task[];
  addTask: (title: string, category: Category, importance: Importance, effort?: Effort, urgency?: Urgency) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearAllTasks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("taskflow_tasks");
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTasks(JSON.parse(saved));
      } catch {
        console.error("Failed to parse tasks");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = (title: string, category: Category, importance: Importance, effort?: Effort, urgency?: Urgency) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      category,
      importance,
      effort,
      urgency,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    // Prepend new task so it appears at top
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks((prev) => 
      prev.map((t) => 
        t.id === id 
          ? { ...t, ...updates, updatedAt: new Date().toISOString() } 
          : t
      )
    );
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isCompleting = !t.completed;
          return {
            ...t,
            completed: isCompleting,
            completedAt: isCompleting ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, toggleTask, deleteTask, clearAllTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within TaskProvider");
  }
  return context;
};
