import { TaskList } from "../components/features/TaskList";
import { TaskCapture } from "../components/features/TaskCapture";
import styles from "./page.module.scss";
import { CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.backgroundGlow} />
      
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <CheckCircle2 size={24} className={styles.logoIcon} />
            <h1 className={styles.title}>TaskFlow</h1>
          </div>
          <p className={styles.subtitle}>Capture. Organize. Prioritize.</p>
        </header>

        <section className={styles.content}>
          <TaskList />
        </section>
      </div>

      <TaskCapture />
    </main>
  );
}
