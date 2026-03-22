"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { Task } from "../../types/task";
import { useTasks } from "../../context/TaskContext";
import styles from "./TaskItem.module.scss";
import clsx from "clsx";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTask } = useTasks();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className={clsx(styles.item, { [styles.completed]: task.completed })}
      onClick={() => toggleTask(task.id)}
    >
      <button className={styles.checkbox}>
        {task.completed ? <Check size={16} className={styles.checkIcon} /> : <Circle size={16} className={styles.circleIcon} />}
      </button>
      
      <div className={styles.content}>
        <span className={styles.title}>{task.title}</span>
        <div className={styles.metadata}>
          <span className={clsx(styles.priority, styles[task.priority.toLowerCase()])}>
            {task.priority}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
