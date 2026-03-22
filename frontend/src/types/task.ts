export type Priority = "P1" | "P2" | "P3" | "P4";
export type Effort = "<10 min" | "30 min" | "2 hours" | "unknown";
export type Urgency = "Immediate" | "Today" | "This Week" | "Eventually";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  effort?: Effort;
  urgency?: Urgency;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
  completedAt?: string; // ISO string
  dueDate?: string; // ISO string, optional for v1
}
