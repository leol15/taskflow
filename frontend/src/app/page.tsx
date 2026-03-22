"use client";

import { TaskList } from "../components/features/TaskList";
import { TaskCapture } from "../components/features/TaskCapture";
import styles from "./page.module.scss";
import { CheckCircle2 } from "lucide-react";
import { useTasks } from "../context/TaskContext";

export default function Home() {
  const { tasks } = useTasks();
  const hasTasks = tasks.length > 0;

  return (
    <main className={`${styles.main} ${hasTasks ? styles.hasTasks : ""}`}>
      <div className={styles.backgroundGlow} />

      <header className={`${styles.header} ${hasTasks ? styles.docked : ""}`}>
        <div className={styles.logo}>
          <CheckCircle2 size={hasTasks ? 18 : 24} className={styles.logoIcon} />
          <h1 className={styles.title}>TaskFlow</h1>
        </div>
        {!hasTasks && <p className={styles.subtitle}>Capture. Organize. Prioritize.</p>}
      </header>

      <div className={`${styles.container} ${hasTasks ? styles.hasTasks : ""}`}>
        <section className={styles.content}>
          <TaskList />
        </section>
      </div>

      <TaskCapture />
    </main>
  );
}
