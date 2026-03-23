import { Task } from "../types/task";

export interface ReconcileResult {
  /** The definitively merged set of tasks to write to both local and cloud. */
  merged: Task[];
  /** IDs of tasks where the cloud version was newer and overwrote the local version. */
  conflictedIds: string[];
  /** Snapshot of local tasks before the merge ran. Used for "Keep my version". */
  preSyncSnapshot: Task[];
}

/**
 * Reconcile local and cloud task lists using Last-Write-Wins (LWW).
 *
 * For each task id present in either list:
 *   - Only in local  → include it (needs to be pushed to cloud)
 *   - Only in cloud  → include it (pulled from another device)
 *   - In both        → pick the one with the newer updatedAt (or createdAt as fallback)
 *
 * When the cloud version wins, the task id is added to `conflictedIds`.
 */
export function reconcile(local: Task[], cloud: Task[]): ReconcileResult {
  const preSyncSnapshot = [...local];
  const localMap = new Map(local.map((t) => [t.id, t]));
  const cloudMap = new Map(cloud.map((t) => [t.id, t]));
  const allIds = new Set([...localMap.keys(), ...cloudMap.keys()]);

  const conflictedIds: string[] = [];
  const merged: Task[] = [];

  for (const id of allIds) {
    const localTask = localMap.get(id);
    const cloudTask = cloudMap.get(id);

    if (localTask && !cloudTask) {
      // Only exists locally — include as-is (will be pushed to cloud)
      merged.push(localTask);
    } else if (!localTask && cloudTask) {
      // New task from another device — pull it in
      merged.push(cloudTask);
    } else if (localTask && cloudTask) {
      // Both sides have this task — LWW by updatedAt, fall back to createdAt
      const localTime = localTask.updatedAt ?? localTask.createdAt;
      const cloudTime = cloudTask.updatedAt ?? cloudTask.createdAt;

      if (localTime >= cloudTime) {
        merged.push(localTask); // local wins
      } else {
        merged.push(cloudTask); // cloud wins → conflict
        conflictedIds.push(id);
      }
    }
  }

  return { merged, conflictedIds, preSyncSnapshot };
}

/**
 * Restore the pre-sync local versions of conflicted tasks,
 * bumping their updatedAt so they become the newest version on next sync.
 */
export function restoreLocalVersions(
  currentTasks: Task[],
  preSyncSnapshot: Task[],
  conflictedIds: string[]
): Task[] {
  const snapshotMap = new Map(preSyncSnapshot.map((t) => [t.id, t]));
  const conflictSet = new Set(conflictedIds);
  const now = new Date().toISOString();

  return currentTasks.map((task) => {
    if (conflictSet.has(task.id)) {
      const preSync = snapshotMap.get(task.id);
      if (preSync) {
        // Bump updatedAt so this version wins on the next LWW sync
        return { ...preSync, updatedAt: now };
      }
    }
    return task;
  });
}
