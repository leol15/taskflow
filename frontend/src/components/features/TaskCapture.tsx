"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTasks } from "../../context/TaskContext";
import { useGlobalShortcut } from "../../hooks/useGlobalShortcut";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Plus } from "lucide-react";
import styles from "./TaskCapture.module.scss";

export function TaskCapture() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const { addTask } = useTasks();
  const inputRef = useRef<HTMLInputElement>(null);

  useGlobalShortcut("k", () => setIsOpen(true));
  useGlobalShortcut("escape", () => setIsOpen(false), false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setTitle("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), "P4"); // Default priority
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
