"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { fetchCloudTasks, pushCloudTasks } from "../utils/firestore";
import { reconcile, restoreLocalVersions } from "../utils/reconcile";
import { Task } from "../types/task";

export interface ConflictInfo {
  count: number;
  conflictedIds: string[];
  preSyncSnapshot: Task[];
}

const DEBOUNCE_MS = 3000;

export function useSync() {
  const { user, isDisconnected, setSyncStatus } = useAuth();
  const { tasks, setTasksFromSync } = useTasks();

  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);

  // Always-current refs so async closures never go stale
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const isActiveRef = useRef(false);
  const isActive = !!user && !isDisconnected;
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Guard: when useSync itself writes tasks back we skip re-triggering sync
  const isSyncWrite = useRef(false);

  // ── Core sync ──────────────────────────────────────────────────────────────

  const runSync = useCallback(async () => {
    if (!isActiveRef.current || !userRef.current) return;

    setSyncStatus("syncing");
    try {
      const cloudTasks = await fetchCloudTasks(userRef.current.uid);
      const { merged, conflictedIds, preSyncSnapshot } = reconcile(
        tasksRef.current,
        cloudTasks
      );

      // Write merged tasks to localStorage (without triggering another sync)
      isSyncWrite.current = true;
      setTasksFromSync(merged);

      // Persist to Firestore
      await pushCloudTasks(userRef.current.uid, merged);

      if (conflictedIds.length > 0) {
        setConflictInfo({ count: conflictedIds.length, conflictedIds, preSyncSnapshot });
      }

      setSyncStatus("synced");
    } catch (err) {
      console.error("[TaskFlow] Sync failed:", err);
      setSyncStatus("error");
    }
  }, [setSyncStatus, setTasksFromSync]);

  // ── Debounced sync after local mutations ────────────────────────────────────

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedSync = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(runSync, DEBOUNCE_MS);
  }, [runSync]);

  // Watch task changes — skip the initial render and skip sync-write updates
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isSyncWrite.current) {
      isSyncWrite.current = false;
      return;
    }
    if (isActiveRef.current) {
      debouncedSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  // ── Sync on sign-in / reconnect ────────────────────────────────────────────

  useEffect(() => {
    if (user && !isDisconnected) {
      runSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, isDisconnected]);

  // ── Sync on window focus ────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleFocus = () => {
      if (isActiveRef.current) runSync();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [runSync]);

  // ── "Keep my version" ──────────────────────────────────────────────────────

  const keepMyVersions = useCallback(async () => {
    if (!conflictInfo || !userRef.current) return;

    const restored = restoreLocalVersions(
      tasksRef.current,
      conflictInfo.preSyncSnapshot,
      conflictInfo.conflictedIds
    );

    isSyncWrite.current = true;
    setTasksFromSync(restored);
    setConflictInfo(null);

    try {
      await pushCloudTasks(userRef.current.uid, restored);
      setSyncStatus("synced");
    } catch {
      setSyncStatus("error");
    }
  }, [conflictInfo, setTasksFromSync, setSyncStatus]);

  const clearConflict = useCallback(() => setConflictInfo(null), []);

  return {
    syncNow: runSync,
    conflictInfo,
    keepMyVersions,
    clearConflict,
  };
}
