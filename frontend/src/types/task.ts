export type Category = "todo" | "idea" | "reminder" | "note" | "reflection";
export type Importance = "must do" | "should do" | "can do";
export type Effort = "<10 min" | "30 min" | "2 hours" | "unknown";
export type Urgency = "Immediate" | "Today" | "This Week" | "Eventually";

export interface Task {
  id: string;
  title: string;
  category: Category;
  completed: boolean;
  importance: Importance;
  effort?: Effort;
  urgency?: Urgency;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
  completedAt?: string; // ISO string
  dueDate?: string; // ISO string, optional for v1

  // Sync fields (optional, backwards-compatible)
  syncedAt?: string;  // ISO string — last confirmed cloud sync
  deviceId?: string;  // last device to write this task
}
