import styles from "./page.module.scss";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>TaskFlow Frontend</h1>
        <p>This is the scaffolded Next.js page.</p>
      </main>
    </div>
  );
}
