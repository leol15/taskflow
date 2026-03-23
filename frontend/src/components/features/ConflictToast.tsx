"use client";

import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cloud, X } from "lucide-react";
import styles from "./ConflictToast.module.scss";

const AUTO_DISMISS_MS = 8000;

interface ConflictToastProps {
  count: number;
  onKeepMine: () => void;
  onDismiss: () => void;
}

function ConflictToast({ count, onKeepMine, onDismiss }: ConflictToastProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  // Animate the countdown bar via a CSS animation rather than JS setInterval
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    el.style.transition = `width ${AUTO_DISMISS_MS}ms linear`;
    // Trigger reflow so the transition fires
    void el.offsetWidth;
    el.style.width = "0%";

    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <Cloud size={14} className={styles.icon} />

      <span className={styles.message}>
        Cloud updated{" "}
        <strong>
          {count} {count === 1 ? "task" : "tasks"}
        </strong>
        .
      </span>

      <button
        className={styles.keepBtn}
        onClick={onKeepMine}
        id="conflict-keep-mine"
      >
        Keep my version
      </button>

      <button
        className={styles.dismissBtn}
        onClick={onDismiss}
        aria-label="Dismiss"
        id="conflict-dismiss"
      >
        <X size={12} />
      </button>

      {/* Auto-dismiss progress bar */}
      <div className={styles.progressTrack}>
        <div
          ref={progressRef}
          className={styles.progressBar}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

// ── Public wrapper that handles AnimatePresence ─────────────────────────────

interface ConflictToastWrapperProps {
  count: number | null;
  onKeepMine: () => void;
  onDismiss: () => void;
}

export function ConflictToastWrapper({
  count,
  onKeepMine,
  onDismiss,
}: ConflictToastWrapperProps) {
  const isVisible = count !== null && count > 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.wrapper}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <ConflictToast
            count={count!}
            onKeepMine={onKeepMine}
            onDismiss={onDismiss}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
