import {
  collection,
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "../lib/firebase";
import { Task } from "../types/task";

/**
 * Fetch all tasks for a user from Firestore.
 */
export async function fetchCloudTasks(userId: string): Promise<Task[]> {
  const db = getFirebaseDb();
  const colRef = collection(db, "users", userId, "tasks");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((d) => d.data() as Task);
}

/**
 * Write all tasks to Firestore for a user (full replace via batch).
 * Stamps each task with the current syncedAt time.
 * Firestore batch limit is 500 ops — ample for a personal task manager.
 */
export async function pushCloudTasks(
  userId: string,
  tasks: Task[]
): Promise<void> {
  const db = getFirebaseDb();
  const batch = writeBatch(db);
  const syncedAt = new Date().toISOString();

  tasks.forEach((task) => {
    const ref = doc(db, "users", userId, "tasks", task.id);
    batch.set(ref, { ...task, syncedAt });
  });

  await batch.commit();
}

/**
 * Delete a single task document from Firestore.
 * Used in Phase 3 for tombstone-based delete propagation.
 */
export async function deleteCloudTask(
  userId: string,
  taskId: string
): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, "users", userId, "tasks", taskId);
  await deleteDoc(ref);
}
