"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTasks } from "../../context/TaskContext";
import { useGlobalShortcut } from "../../hooks/useGlobalShortcut";
import { Category, Effort, Importance, Urgency } from "../../types/task";
import { Button } from "../ui/Button";
import { ButtonGroup } from "../ui/ButtonGroup";
import { Input } from "../ui/Input";
import styles from "./TaskCapture.module.scss";

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

export function TaskCapture() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("task");
  const [importance, setImportance] = useState<Importance>("can do");
  const [effort, setEffort] = useState<Effort>("unknown");
  const [urgency, setUrgency] = useState<Urgency>("Eventually");
  const { addTask } = useTasks();
  const inputRef = useRef<HTMLInputElement>(null);

  useGlobalShortcut("k", () => setIsOpen(true));
  useGlobalShortcut("escape", () => setIsOpen(false), false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle("");
      setCategory("task");
      setImportance("can do");
      setEffort("unknown");
      setUrgency("Eventually");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), category, importance, effort, urgency);
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
