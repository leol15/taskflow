"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useTasks } from "../../context/TaskContext";
import { TaskItem } from "./TaskItem";
import { TaskEditModal } from "./TaskEditModal";
import styles from "./TaskList.module.scss";

export function TaskList() {
  const { tasks } = useTasks();
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks
    .filter((t) => t.completed)
    .sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA; // Newest completed first
    });
  const editingTask = tasks.find((t) => t.id === editingTaskId) || null;

  return (
    <div className={styles.container}>
      {tasks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tasks yet. Press Cmd+K to capture one.</p>
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
