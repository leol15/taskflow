"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Category, Effort, Importance, Task, Urgency } from "../types/task";

interface TaskContextType {
  tasks: Task[];
  archivedTasks: Task[];
  addTask: (title: string, category: Category, importance: Importance, effort?: Effort, urgency?: Urgency) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearAllTasks: () => void;
  clearArchive: () => void;
  /** Overwrite the full task list from a sync operation. Does not re-trigger sync. */
  setTasksFromSync: (tasks: Task[]) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedTasks = localStorage.getItem("taskflow_tasks");
    if (savedTasks) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTasks(JSON.parse(savedTasks));
      } catch {
        console.error("Failed to parse tasks");
      }
    }

    const savedArchive = localStorage.getItem("taskflow_archive");
    if (savedArchive) {
      try {
        setArchivedTasks(JSON.parse(savedArchive));
      } catch {
        console.error("Failed to parse archived tasks");
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

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("taskflow_archive", JSON.stringify(archivedTasks));
    }
  }, [archivedTasks, isLoaded]);

  // Auto-archive logic: Move completed tasks > 24h old to archive
  useEffect(() => {
    if (!isLoaded || tasks.length === 0) return;

    const now = new Date().getTime();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    const toArchive: Task[] = [];
    const remaining: Task[] = [];

    tasks.forEach((task) => {
      if (task.completed && task.completedAt) {
        const completedTime = new Date(task.completedAt).getTime();
        if (now - completedTime > TWENTY_FOUR_HOURS_MS) {
          toArchive.push(task);
        } else {
          remaining.push(task);
        }
      } else {
        remaining.push(task);
      }
    });

    if (toArchive.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTasks(remaining);
      setArchivedTasks((prev) => [...toArchive, ...prev]);
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

  const clearArchive = () => {
    setArchivedTasks([]);
  };

  const setTasksFromSync = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  return (
    <TaskContext.Provider value={{ tasks, archivedTasks, addTask, updateTask, toggleTask, deleteTask, clearAllTasks, clearArchive, setTasksFromSync }}>
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
