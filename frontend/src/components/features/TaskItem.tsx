"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Square } from "lucide-react";
import { Task } from "../../types/task";
import { useTasks } from "../../context/TaskContext";
import { CATEGORY_COLORS, IMPORTANCE_COLORS } from "../../utils/constants";
import styles from "./TaskItem.module.scss";
import clsx from "clsx";

interface TaskItemProps {
  task: Task;
  onEdit?: () => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const { toggleTask } = useTasks();

  const categoryColorVar = task.category ? CATEGORY_COLORS[task.category] : CATEGORY_COLORS['todo'];
  const importanceColorVar = IMPORTANCE_COLORS[task.importance] || IMPORTANCE_COLORS['should do'];

  const itemStyle = {
    '--category-color': task.completed 
      ? 'var(--text-tertiary)' 
      : `var(${categoryColorVar})`,
    '--importance-color': task.completed
      ? 'var(--text-tertiary)'
      : `var(${importanceColorVar})`
  } as React.CSSProperties;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className={clsx(styles.item, { [styles.completed]: task.completed })}
      onClick={() => onEdit?.()}
      style={itemStyle}
    >
      <button 
        className={styles.checkboxArea}
        onClick={(e) => {
          e.stopPropagation();
          toggleTask(task.id);
        }}
      >
        <div className={styles.checkbox}>
          {task.completed ? <Check size={14} className={styles.checkIcon} /> : <Square size={14} className={styles.squareIcon} />}
        </div>
      </button>
      
      <div className={styles.content}>
        <span className={styles.title}>{task.title}</span>
        <div className={styles.metadata}>
          {task.category && (
            <span className={clsx(styles.badge, styles.category, styles[task.category])}>
              {task.category}
            </span>
          )}

          {!task.completed ? (
            <>
              <span className={clsx(styles.badge, styles[task.importance.replace(' ', '-')])}>
                {task.importance}
              </span>

              {task.urgency && task.urgency !== "Eventually" && (
                <span className={clsx(styles.badge, styles.urgency, {
                  [styles.immediate]: task.urgency === "Immediate",
                })}>
                  {task.urgency}
                </span>
              )}

              {task.effort && task.effort !== "unknown" && (
                <span className={clsx(styles.badge, styles.effort)}>
                  {task.effort}
                </span>
              )}
            </>
          ) : (
            <span className={styles.datePeriod}>
              {formatDate(task.createdAt)} - {task.completedAt ? formatDate(task.completedAt) : "Completed"}
            </span>
          )}
        </div>
      </div>

    </motion.div>
  );
}
