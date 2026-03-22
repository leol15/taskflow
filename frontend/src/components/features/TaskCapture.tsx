"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTasks } from "../../context/TaskContext";
import { useGlobalShortcut } from "../../hooks/useGlobalShortcut";
import { Effort, Priority, Urgency } from "../../types/task";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import styles from "./TaskCapture.module.scss";

export function TaskCapture() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("P4");
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
      setPriority("P4");
      setEffort("unknown");
      setUrgency("Eventually");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), priority, effort, urgency);
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
                    <label>Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                      <option value="P1">P1 - Critical</option>
                      <option value="P2">P2 - High</option>
                      <option value="P3">P3 - Normal</option>
                      <option value="P4">P4 - Low</option>
                    </select>
                  </div>
                  <div className={styles.attributeGroup}>
                    <label>Effort</label>
                    <select value={effort} onChange={e => setEffort(e.target.value as Effort)}>
                      <option value="<10 min">&lt;10 min</option>
                      <option value="30 min">30 min</option>
                      <option value="2 hours">2 hours</option>
                      <option value="unknown">unknown</option>
                    </select>
                  </div>
                  <div className={styles.attributeGroup}>
                    <label>Urgency</label>
                    <select value={urgency} onChange={e => setUrgency(e.target.value as Urgency)}>
                      <option value="Immediate">Immediate</option>
                      <option value="Today">Today</option>
                      <option value="This Week">This Week</option>
                      <option value="Eventually">Eventually</option>
                    </select>
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
