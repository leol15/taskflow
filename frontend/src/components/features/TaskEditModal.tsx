"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTasks } from "../../context/TaskContext";
import { Task, Category, Importance, Effort, Urgency } from "../../types/task";
import { ButtonGroup } from "../ui/ButtonGroup";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import styles from "./TaskEditModal.module.scss";

const CATEGORIES: readonly Category[] = ["task", "idea", "reminder", "note"];
const IMPORTANCES: readonly Importance[] = ["must do", "should do", "can do"];
const EFFORTS: readonly Effort[] = ["<10 min", "30 min", "2 hours", "unknown"];
const URGENCIES: readonly Urgency[] = ["Immediate", "Today", "This Week", "Eventually"];

const CATEGORY_COLORS = {
  "task": "--color-category-task",
  "idea": "--color-category-idea",
  "reminder": "--color-category-reminder",
  "note": "--color-category-note",
};

const IMPORTANCE_COLORS = {
  "must do": "--color-importance-must",
  "should do": "--color-importance-should",
  "can do": "--color-importance-can",
};

const EFFORT_COLORS = {
  "<10 min": "--color-effort-quick",
  "30 min": "--color-effort-medium",
  "2 hours": "--color-effort-long",
  "unknown": "--color-effort-unknown",
};

const URGENCY_COLORS = {
  "Immediate": "--color-importance-must",
  "Today": "--color-importance-should",
  "This Week": "--color-category-task",
  "Eventually": "--color-effort-unknown",
};

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskEditModal({ task, isOpen, onClose }: TaskEditModalProps) {
  const { updateTask } = useTasks();
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("task");
  const [importance, setImportance] = useState<Importance>("can do");
  const [effort, setEffort] = useState<Effort>("unknown");
  const [urgency, setUrgency] = useState<Urgency>("Eventually");

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setCategory(task.category || "task");
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
                
                <div className={styles.attributes}>
                  <div className={styles.attributeGroup}>
                    <label>Category</label>
                    <ButtonGroup options={CATEGORIES} value={category} onChange={setCategory} colorMap={CATEGORY_COLORS} />
                  </div>
                  <div className={styles.attributeGroup}>
                    <label>Importance</label>
                    <ButtonGroup options={IMPORTANCES} value={importance} onChange={setImportance} colorMap={IMPORTANCE_COLORS} />
                  </div>
                  <div className={styles.attributeGroup}>
                    <label>Effort</label>
                    <ButtonGroup options={EFFORTS} value={effort} onChange={setEffort} colorMap={EFFORT_COLORS} />
                  </div>
                  <div className={styles.attributeGroup}>
                    <label>Urgency</label>
                    <ButtonGroup options={URGENCIES} value={urgency} onChange={setUrgency} colorMap={URGENCY_COLORS} />
                  </div>
                </div>

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
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
