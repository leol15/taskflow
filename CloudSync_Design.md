# TaskFlow — Cloud Sync Design

**Status:** Approved for implementation  
**Last updated:** 2026-03-22

---

## Overview

TaskFlow is a **local-first** app. All tasks live in `localStorage` and the app is fully functional with no account required. Cloud sync is an **optional, additive layer** that users can activate by linking an account. Users can always disconnect and return to local-only mode.

---

## Core Principles

1. **Local is always the source of truth.** `localStorage` is read on every render. Cloud is a backup/sync layer, not a replacement.
2. **No account required.** The app works 100% offline and anonymously forever. Sign-in is never a blocker.
3. **Sync is on-demand, not real-time.** No WebSocket listeners. Sync runs at well-defined trigger points.
4. **Disconnect is always available.** "Local only" is both the default state and a mode the user can return to at any time after signing in.
5. **Data is never silently lost.** When the cloud version overwrites a local task, the user always gets an undo option.

---

## Sync States

The app is always in one of two modes, togglable at any time:

```
┌─────────────────┐       Link account      ┌──────────────────┐
│   LOCAL ONLY    │ ───────────────────────► │  SYNCED (Cloud)  │
│  (default)      │                          │                  │
│                 │ ◄─────────────────────── │                  │
└─────────────────┘    Disconnect / Sign out └──────────────────┘
```

| State | Data lives in | Sync badge |
|---|---|---|
| **Local only** | `localStorage` only | `○ Local only` |
| **Synced** | `localStorage` + Firestore | `✓ Synced` / `⟳ Syncing…` / `⚠ Error` |

---

## Authentication

### Provider: Firebase Auth

| Sign-in method | Friction | Notes |
|---|---|---|
| Google OAuth | ⭐ Lowest | One-click, recommended default button |
| Email magic link | Low | Enter email, click link in inbox, done |
| Email + password | Medium | Classic fallback |

### Sign-in Flow

```
User taps "Sync to cloud"
  │
  ▼
Sign-in sheet (Google button + email option)
  │
  ├─ First time signing in on this device
  │     ▼
  │   Merge local tasks with cloud (see: Multi-device Merge)
  │     ▼
  │   Sync status → "✓ Synced"
  │
  └─ Already signed in before (returning device)
        ▼
      Pull cloud tasks → reconcile with local (LWW)
        ▼
      Sync status → "✓ Synced"
```

### Sign-out Behaviour

- **`localStorage` is always preserved.** Signing out does not clear local tasks.
- The app immediately enters "Local only" mode.
- On next sign-in, the local state is treated as a fresh device (multi-device merge runs again).

### Disconnect (Go Local)

Available in Settings at all times — before and after signing in.

- Disconnecting stops all sync activity.
- `localStorage` is untouched.
- Firestore data is preserved in the cloud (not deleted).
- The app enters "Local only" mode.
- Re-connecting (sign back in) triggers a standard merge.

---

## Conflict Resolution: Last-Write-Wins (LWW)

Every `Task` has an `updatedAt` ISO timestamp. The task with the **most recent `updatedAt` wins**.

### LWW Algorithm

```
For each task (matched by id) that exists in both local and cloud:

  if local.updatedAt >= cloud.updatedAt:
    → Keep local. Push local to cloud.       ← local is newer or equal

  else:
    → Accept cloud. Write cloud to local.    ← cloud is newer
    → Queue a conflict toast notification.
```

For tasks that exist in only one location:

```
  Task only in local:   → Push to cloud.
  Task only in cloud:   → Pull to local.   (new task from another device)
```

### Conflict Toast (Override UI)

When the cloud version overwrites a local task, a non-blocking toast appears at the bottom of the screen:

```
┌──────────────────────────────────────────────────────────────┐
│  ↑ Cloud updated 1 task.          [Keep my version]      ✕  │
└──────────────────────────────────────────────────────────────┘
```

- Tapping **"Keep my version"** restores the pre-sync local version and immediately pushes it to the cloud with a fresh `updatedAt` (making it the new winner).
- Multiple conflicts are batched: *"Cloud updated 3 tasks."*
- Toast auto-dismisses after 8 seconds if ignored.
- Toast only appears when the cloud version actually changed data (not when local wins).

### Deleted Tasks *(Phase 3 — later sprint)*

Deleted tasks use a **tombstone** pattern to propagate deletes to the cloud:

```typescript
// Stored in localStorage under "taskflow_tombstones"
interface Tombstone {
  id: string;       // task id that was deleted
  deletedAt: string; // ISO string
}
```

On sync, tombstones are compared to cloud tasks:
- If `tombstone.deletedAt > cloud_task.updatedAt` → delete from cloud. Local delete wins.
- If `cloud_task.updatedAt > tombstone.deletedAt` → task was re-created/edited on another device after local delete. Restore to local.

---

## Multi-Device Merge

When a user signs in on a **new device that already has local tasks**, both sets of tasks are merged:

```
Strategy:
  1. Fetch all cloud tasks.
  2. Fetch all local tasks.
  3. Build a unified task map keyed by id:
       For each id in {local ∪ cloud}:
         - If id exists in both: apply LWW (newer updatedAt wins).
         - If id only in local:  keep it (push to cloud).
         - If id only in cloud:  keep it (pull to local).
  4. Write merged set back to localStorage.
  5. Write merged set back to Firestore.
```

**Result:** No tasks are ever dropped. New tasks from both devices are preserved. Duplicated task content resolves by LWW.

---

## Sync Protocol

### Trigger Points

| Trigger | Condition |
|---|---|
| App opens / gains window focus | Signed in |
| After any local mutation | Signed in, debounced 3 seconds |
| Manual "Sync now" in Settings | Signed in |

No real-time listeners or subscriptions. No polling interval.

### Sync Function (pseudo-code)

```typescript
async function syncTasks(userId: string): Promise<void> {
  setSyncStatus('syncing');
  try {
    const [localTasks, cloudTasks] = await Promise.all([
      getLocalTasks(),
      fetchCloudTasks(userId),
    ]);
    const { merged, conflicts } = reconcile(localTasks, cloudTasks);

    // Write merged state everywhere
    setLocalTasks(merged);
    await pushCloudTasks(userId, merged);

    if (conflicts.length > 0) {
      showConflictToast(conflicts); // "Cloud updated N tasks. [Keep my version]"
    }
    setSyncStatus('synced');
  } catch (err) {
    setSyncStatus('error');
  }
}
```

---

## Data Model

### Task (updated for sync)

```typescript
// src/types/task.ts — additions only, all new fields are optional
export interface Task {
  // --- existing fields ---
  id: string;
  title: string;
  category: Category;
  completed: boolean;
  importance: Importance;
  effort?: Effort;
  urgency?: Urgency;
  createdAt: string;        // ISO string
  updatedAt?: string;       // ISO string  ← LWW key
  completedAt?: string;
  dueDate?: string;

  // --- sync additions ---
  syncedAt?: string;        // ISO string — last confirmed cloud sync timestamp
  deviceId?: string;        // optional — last device to write this task (debugging)
}
```

All new fields are optional. Fully backwards-compatible with existing `localStorage` data.

### Tombstone (Phase 3)

```typescript
// Stored in localStorage["taskflow_tombstones"]
export interface Tombstone {
  id: string;
  deletedAt: string; // ISO string
}
```

### Firestore Path

```
/users/{userId}/tasks/{taskId}   ← one document per task
```

---

## Permissions

**Solo only.** Firestore Security Rules enforce that each user can only read and write their own tasks.

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

No sharing, no roles, no public access. Keep it simple.

---

## New Files & Code Architecture

```
frontend/src/
├── lib/
│   └── firebase.ts              ← Firebase app init (env vars)
├── types/
│   └── task.ts                  ← Add syncedAt, deviceId fields
│   └── sync.ts                  ← Tombstone, SyncStatus types
├── context/
│   └── TaskContext.tsx           ← Add syncStatus, signIn, signOut, disconnect
│   └── AuthContext.tsx           ← NEW: Firebase auth state wrapper
├── hooks/
│   └── useSync.ts               ← NEW: sync trigger logic
│   └── useAuth.ts               ← NEW: sign-in/out/disconnect
├── utils/
│   └── reconcile.ts             ← NEW: LWW merge algorithm
│   └── firestore.ts             ← NEW: fetchCloudTasks, pushCloudTasks
└── components/
    └── ui/
        └── SyncBadge.tsx        ← NEW: sync status indicator in header
    └── features/
        └── AuthSheet.tsx        ← NEW: sign-in modal/sheet
        └── ConflictToast.tsx    ← NEW: "Cloud updated N tasks" notification
```

---

## Firebase Setup Checklist

This is a **one-time manual setup** (~20 min). No CI/CD required beyond one GitHub secret.

### 1. Firebase Console

- [ ] Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Enable **Firebase Auth** → add Google provider + Email (magic link)
- [ ] Create **Firestore database** → start in production mode, choose a region
- [ ] Register a **web app** → copy the config object

### 2. Local Environment

```bash
# Install Firebase SDK
npm install firebase

# .env.local (never commit this file)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Security Rules

```bash
# Install Firebase CLI once
npm install -g firebase-tools
firebase login
firebase init firestore   # in project root

# Deploy rules (re-run this if rules change)
firebase deploy --only firestore:rules
```

### 4. GitHub Actions Secret (production build)

In **GitHub repo → Settings → Secrets and variables → Actions**, add each `NEXT_PUBLIC_FIREBASE_*` key as a repository secret. Reference them in the existing `.github/workflows` deploy step.

---

## Implementation Phases

### Phase 1 — Auth Shell
**Goal:** Sign-in works, sync status visible, no data moves yet.

- [ ] `lib/firebase.ts` — init Firebase app from env vars
- [ ] `AuthContext.tsx` — Firebase auth state, `signIn()`, `signOut()`, `disconnect()` (local-only mode toggle)
- [ ] `useAuth.ts` — convenience hook
- [ ] `SyncBadge.tsx` — header component showing `○ Local only` | `✓ Synced` | `⟳ Syncing…` | `⚠ Error`
- [ ] `AuthSheet.tsx` — sign-in modal with Google + email options
- [ ] Settings page entry: "Sync to cloud" / "Disconnect"

### Phase 2 — Sync Layer
**Goal:** Tasks actually sync to/from Firestore.

- [ ] `utils/firestore.ts` — `fetchCloudTasks()`, `pushCloudTasks()`
- [ ] `utils/reconcile.ts` — LWW merge algorithm (`reconcile(local, cloud) → { merged, conflicts }`)
- [ ] `hooks/useSync.ts` — trigger sync on focus/mutation (debounced), expose `syncNow()`
- [ ] `ConflictToast.tsx` — show when cloud version overwrites local, "Keep my version" action
- [ ] Wire `TaskContext` → call sync after each mutation (add/update/toggle/delete) when signed in
- [ ] Migrate existing `localStorage` tasks to Firestore on first sign-in (multi-device merge path)

### Phase 3 — Tombstones & Edge Cases *(later sprint)*
**Goal:** Deletes propagate, edge cases handled.

- [ ] `types/sync.ts` — `Tombstone` type
- [ ] Store tombstone on `deleteTask()` in `localStorage`
- [ ] Include tombstones in sync protocol
- [ ] Handle clock skew: if `updatedAt` delta < 1000ms, prefer cloud (conservative)
- [ ] Handle sign-in on device with no internet: queue sync, run when connectivity returns

---

## Open Questions (Resolved)

| Question | Decision |
|---|---|
| Does sign-out clear localStorage? | **No. Always preserve localStorage.** Local-only is a core use case. |
| Two devices both have local tasks: what happens on first sign-in? | **Keep all tasks from both devices.** Deduplicate by id with LWW. No tasks are dropped. |
| Can the user go back to local-only after signing in? | **Yes. "Disconnect" is always available** in Settings, both before and after signing in. |
