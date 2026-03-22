"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useTasks } from "../../context/TaskContext";
import { TaskItem } from "./TaskItem";
import styles from "./TaskList.module.scss";

export function TaskList() {
  const { tasks } = useTasks();

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

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
                <TaskItem key={task.id} task={task} />
              ))}
            </AnimatePresence>
          </div>

          {completedTasks.length > 0 && (
            <div className={styles.completedSection}>
              <h3 className={styles.completedHeading}>Completed</h3>
              <div className={styles.list}>
                <AnimatePresence>
                  {completedTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
