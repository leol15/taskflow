import { Task } from "../types/task";

export type SortOption = "createdAt" | "updatedAt" | "prioritized";

export function sortTasks(tasks: Task[], option: SortOption): Task[] {
  return [...tasks].sort((a, b) => {
    switch (option) {
      case "createdAt": {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Newest first
      }
      case "updatedAt": {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime();
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA; // Newest first
      }
      case "prioritized": {
        const scoreA = calculatePriorityScore(a);
        const scoreB = calculatePriorityScore(b);
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // Higher score first
        }
        // Fallback to createdAt if scores are equal
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      default:
        return 0;
    }
  });
}

function calculatePriorityScore(task: Task): number {
  let score = 0;

  switch (task.importance) {
    case "must do": score += 30; break;
    case "should do": score += 20; break;
    case "can do": score += 10; break;
  }

  switch (task.urgency) {
    case "Immediate": score += 40; break;
    case "Today": score += 30; break;
    case "This Week": score += 20; break;
    case "Eventually": score += 10; break;
  }

  switch (task.effort) {
    case "<10 min": score += 5; break;
    case "30 min": score += 3; break;
    case "2 hours": score += 1; break;
    case "unknown": score += 0; break;
  }

  return score;
}
