"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTasks } from "../../context/TaskContext";
import { Task, Category, Importance, Effort, Urgency } from "../../types/task";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TaskAttributesForm } from "./TaskAttributesForm";
import styles from "./TaskEditModal.module.scss";

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskEditModal({ task, isOpen, onClose }: TaskEditModalProps) {
  const { updateTask, deleteTask } = useTasks();
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("todo");
  const [importance, setImportance] = useState<Importance>("can do");
  const [effort, setEffort] = useState<Effort>("unknown");
  const [urgency, setUrgency] = useState<Urgency>("Eventually");

  useEffect(() => {
    if (isOpen && task) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(task.title);
      setCategory(task.category || "todo");
      setImportance(task.importance);
      setEffort(task.effort || "unknown");
      setUrgency(task.urgency || "Eventually");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, task]);

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    updateTask(task.id, {
      title: title.trim(),
      category,
      importance,
      effort,
      urgency
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id);
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose}>
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className={styles.formContainer}>
              <div className={styles.header}>
                <h3>Edit Task</h3>
                <button type="button" onClick={onClose} className={styles.closeBtn}>×</button>
              </div>
              
              <div className={styles.body}>
                <Input
                  ref={inputRef}
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.inputOverrides}
                />
                
                <TaskAttributesForm
                  category={category} setCategory={setCategory}
                  importance={importance} setImportance={setImportance}
                  effort={effort} setEffort={setEffort}
                  urgency={urgency} setUrgency={setUrgency}
                  defaultExpanded
                />

                <div className={styles.timestamps}>
                  <div className={styles.timestamp}>
                    <label>Created</label>
                    <span>{formatDate(task.createdAt)}</span>
                  </div>
                  {task.updatedAt && (
                    <div className={styles.timestamp}>
                      <label>Last Updated</label>
                      <span>{formatDate(task.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.footer}>
                <button type="button" className={styles.deleteBtn} onClick={handleDelete}>
                  Delete Task
                </button>
                <div className={styles.footerActions}>
                  <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                  <Button type="submit" variant="primary">Save Changes</Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
