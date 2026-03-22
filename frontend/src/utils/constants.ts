import { Category, Importance, Effort, Urgency } from "../types/task";

export const CATEGORIES: readonly Category[] = ["todo", "idea", "reminder", "note", "reflection"];
export const IMPORTANCES: readonly Importance[] = ["must do", "should do", "can do"];
export const EFFORTS: readonly Effort[] = ["<10 min", "30 min", "2 hours", "unknown"];
export const URGENCIES: readonly Urgency[] = ["Immediate", "Today", "This Week", "Eventually"];

export const CATEGORY_COLORS: Record<string, string> = {
  todo: "--color-category-todo",
  idea: "--color-category-idea",
  reminder: "--color-category-reminder",
  note: "--color-category-note",
  reflection: "--color-category-reflection",
};

export const IMPORTANCE_COLORS: Record<string, string> = {
  "must do": "--color-importance-must",
  "should do": "--color-importance-should",
  "can do": "--color-importance-can",
};

export const EFFORT_COLORS: Record<string, string> = {
  "<10 min": "--color-effort-quick",
  "30 min": "--color-effort-medium",
  "2 hours": "--color-effort-long",
  unknown: "--color-effort-unknown",
};

export const URGENCY_COLORS: Record<string, string> = {
  Immediate: "--color-importance-must",
  Today: "--color-importance-should",
  "This Week": "--color-category-todo",
  Eventually: "--color-effort-unknown",
};
