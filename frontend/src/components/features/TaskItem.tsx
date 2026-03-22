"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Square, MoreHorizontal } from "lucide-react";
import { Task } from "../../types/task";
import { useTasks } from "../../context/TaskContext";
import styles from "./TaskItem.module.scss";
import clsx from "clsx";

interface TaskItemProps {
  task: Task;
  onEdit?: () => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const { toggleTask } = useTasks();

  const importanceKey = task.importance.replace(' do', '');
  const itemStyle = {
    '--item-color': task.completed 
      ? 'var(--text-tertiary)' 
      : `var(--color-importance-${importanceKey})`
  } as React.CSSProperties;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className={clsx(styles.item, { [styles.completed]: task.completed })}
      onClick={() => toggleTask(task.id)}
      style={itemStyle}
    >
      <button className={styles.checkbox}>
        {task.completed ? <Check size={14} className={styles.checkIcon} /> : <Square size={14} className={styles.squareIcon} />}
      </button>
      
      <div className={styles.content}>
        <span className={styles.title}>{task.title}</span>
        <div className={styles.metadata}>
          <span className={clsx(styles.badge, styles[task.importance.replace(' ', '-')])}>
            {task.importance}
          </span>

          {task.category && (
            <span className={clsx(styles.badge, styles.category, styles[task.category])}>
              {task.category}
            </span>
          )}

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
        </div>
      </div>

      {onEdit && (
        <button 
          className={styles.editBtn} 
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <MoreHorizontal size={18} />
        </button>
      )}
    </motion.div>
  );
}
