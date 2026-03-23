export type SyncStatus = "local-only" | "syncing" | "synced" | "error";

export type AuthProvider = "google" | "email";

export interface SyncUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Phase 3: tombstone for propagating deletes to cloud
export interface Tombstone {
  id: string;       // task id that was deleted
  deletedAt: string; // ISO string
}
