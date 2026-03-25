"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTasks } from "../../context/TaskContext";
import { useGlobalShortcut } from "../../hooks/useGlobalShortcut";
import { Category, Effort, Importance, Urgency } from "../../types/task";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TaskAttributesForm } from "./TaskAttributesForm";
import styles from "./TaskCapture.module.scss";

export function TaskCapture() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  // Track last successfully created task attributes
  const [lastAttributes, setLastAttributes] = useState<{
    category: Category;
    importance: Importance;
    effort: Effort;
    urgency: Urgency;
  }>(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("taskflow_last_attributes");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
        }
      }
    }
    return {
      category: "todo",
      importance: "can do",
      effort: "unknown",
      urgency: "Eventually",
    };
  });

  const [category, setCategory] = useState<Category>(lastAttributes.category);
  const [importance, setImportance] = useState<Importance>(lastAttributes.importance);
  const [effort, setEffort] = useState<Effort>(lastAttributes.effort);
  const [urgency, setUrgency] = useState<Urgency>(lastAttributes.urgency);
  
  const { addTask } = useTasks();
  const inputRef = useRef<HTMLInputElement>(null);

  useGlobalShortcut("k", () => setIsOpen(true));
  useGlobalShortcut("escape", () => setIsOpen(false), false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      /* eslint-disable react-hooks/set-state-in-effect */
      setTitle("");
      // Revert attributes to last successfully created task values if they were changed but not saved
      setCategory(lastAttributes.category);
      setImportance(lastAttributes.importance);
      setEffort(lastAttributes.effort);
      setUrgency(lastAttributes.urgency);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [isOpen, lastAttributes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Save task
    addTask(title.trim(), category, importance, effort, urgency);
    
    // Record these as the new "last used" attributes
    const attributes = { category, importance, effort, urgency };
    setLastAttributes(attributes);
    localStorage.setItem("taskflow_last_attributes", JSON.stringify(attributes));
    
    setIsOpen(false);
  };

  return (
    <>
      <div className={styles.hint} onClick={() => setIsOpen(true)}>
        <span>Press</span>
        <kbd className={styles.kbd}>
          {typeof navigator !== "undefined" && navigator.platform.includes("Mac") ? "⌘" : "Ctrl"} K
        </kbd>
        <span>to auto-capture workspace task</span>
      </div>

      {/* Mobile FAB — hidden on desktop via CSS */}
      <button
        className={styles.fab}
        onClick={() => setIsOpen(true)}
        aria-label="Add new task"
      >
        <Plus size={26} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className={styles.overlay} onClick={() => setIsOpen(false)}>
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit} className={styles.formContainer}>
                <Input
                  ref={inputRef}
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  icon={<Plus size={20} />}
                  className={styles.inputOverrides}
                />
                <TaskAttributesForm
                  category={category} setCategory={setCategory}
                  importance={importance} setImportance={setImportance}
                  effort={effort} setEffort={setEffort}
                  urgency={urgency} setUrgency={setUrgency}
                  className={styles.attributesLayout}
                />
                <div className={styles.footer}>
                  <span className={styles.footerHint}>Press <kbd>Enter</kbd> to save, <kbd>Esc</kbd> to dismiss</span>
                  <Button type="submit" size="sm" variant="primary">Save Task</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
