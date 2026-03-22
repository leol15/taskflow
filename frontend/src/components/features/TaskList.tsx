"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useTasks } from "../../context/TaskContext";
import { TaskItem } from "./TaskItem";
import { TaskEditModal } from "./TaskEditModal";
import styles from "./TaskList.module.scss";

export function TaskList() {
  const { tasks, clearAllTasks } = useTasks();
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);

  const [filterCategory, setFilterCategory] = React.useState<string>("All");
  const [filterImportance, setFilterImportance] = React.useState<string>("All");
  const [filterEffort, setFilterEffort] = React.useState<string>("All");
  const [filterUrgency, setFilterUrgency] = React.useState<string>("All");

  const applyFilters = (t: any) => {
    if (filterCategory !== "All" && t.category !== filterCategory) return false;
    if (filterImportance !== "All" && t.importance !== filterImportance) return false;
    if (filterEffort !== "All" && t.effort !== filterEffort) return false;
    if (filterUrgency !== "All" && t.urgency !== filterUrgency) return false;
    return true;
  };

  const activeTasks = tasks.filter((t) => !t.completed && applyFilters(t));
  const completedTasks = tasks
    .filter((t) => t.completed && applyFilters(t))
    .sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA; // Newest completed first
    });
  const editingTask = tasks.find((t) => t.id === editingTaskId) || null;

  return (
    <div className={styles.container}>
      {tasks.length > 0 && (
        <div className={styles.filters}>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="task">task</option>
            <option value="idea">idea</option>
            <option value="reminder">reminder</option>
            <option value="note">note</option>
          </select>
          <select value={filterImportance} onChange={(e) => setFilterImportance(e.target.value)}>
            <option value="All">All Importances</option>
            <option value="must do">must do</option>
            <option value="should do">should do</option>
            <option value="can do">can do</option>
          </select>
          <select value={filterEffort} onChange={(e) => setFilterEffort(e.target.value)}>
            <option value="All">All Efforts</option>
            <option value="<10 min">&lt;10 min</option>
            <option value="30 min">30 min</option>
            <option value="2 hours">2 hours</option>
            <option value="unknown">unknown</option>
          </select>
          <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)}>
            <option value="All">All Urgencies</option>
            <option value="Immediate">Immediate</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="Eventually">Eventually</option>
          </select>
          <button 
            className={styles.clearAllBtn}
            onClick={() => {
              if (window.confirm("Are you sure you want to delete all tasks? This action cannot be undone.")) {
                clearAllTasks();
              }
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tasks yet. Press Cmd+K to capture one.</p>
        </div>
      ) : activeTasks.length === 0 && completedTasks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tasks match your filters.</p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            <AnimatePresence>
              {activeTasks.map((task) => (
                <TaskItem key={task.id} task={task} onEdit={() => setEditingTaskId(task.id)} />
              ))}
            </AnimatePresence>
          </div>

          {completedTasks.length > 0 && (
            <div className={styles.completedSection}>
              <h3 className={styles.completedHeading}>Completed</h3>
              <div className={styles.list}>
                <AnimatePresence>
                  {completedTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onEdit={() => setEditingTaskId(task.id)} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </>
      )}

      <TaskEditModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTaskId(null)}
      />
    </div>
  );
}
