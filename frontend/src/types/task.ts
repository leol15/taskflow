export type Priority = "P1" | "P2" | "P3" | "P4";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: string; // ISO string
  dueDate?: string; // ISO string, optional for v1
}
