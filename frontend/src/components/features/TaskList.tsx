"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useTasks } from "../../context/TaskContext";
import { TaskItem } from "./TaskItem";
import { Task } from "../../types/task";
import { TaskEditModal } from "./TaskEditModal";
import { sortTasks, SortOption } from "../../utils/sort";
import { ChevronDown, ChevronRight, Archive } from "lucide-react";
import styles from "./TaskList.module.scss";

export function TaskList() {
  const { tasks, archivedTasks, clearAllTasks, clearArchive } = useTasks();
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [showArchive, setShowArchive] = React.useState(false);

  const [filterCategory, setFilterCategory] = React.useState<string>("All");
  const [filterImportance, setFilterImportance] = React.useState<string>("All");
  const [filterEffort, setFilterEffort] = React.useState<string>("All");
  const [filterUrgency, setFilterUrgency] = React.useState<string>("All");
  const [sortOption, setSortOption] = React.useState<SortOption>("createdAt");
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState<boolean>(false);

  const applyFilters = (t: Task) => {
    if (filterCategory !== "All" && t.category !== filterCategory) return false;
    if (filterImportance !== "All" && t.importance !== filterImportance) return false;
    if (filterEffort !== "All" && t.effort !== filterEffort) return false;
    if (filterUrgency !== "All" && t.urgency !== filterUrgency) return false;
    return true;
  };

  const activeTasks = sortTasks(tasks.filter((t) => !t.completed && applyFilters(t)), sortOption);
  const completedTasks = tasks
    .filter((t) => t.completed && applyFilters(t))
    .sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA; // Newest completed first
    });
  const editingTask = tasks.find((t) => t.id === editingTaskId) || null;

  return (
    <div className={styles.container}>
      {tasks.length > 0 && (
        <div className={styles.filtersContainer}>
          <div className={styles.categoryFilters}>
            {["All", "todo", "idea", "reminder", "note", "reflection"].map(c => (
              <button 
                key={c} 
                className={`${styles.categoryBtn} ${c !== "All" ? styles[c] : ''} ${filterCategory === c ? styles.active : ''}`} 
                onClick={() => setFilterCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className={styles.mainFiltersGroups}>
            <div className={styles.filtersPrimary}>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Sort:</span>
                <div className={styles.buttonGroup}>
                  {[
                    { value: "prioritized", label: "Priority" },
                    { value: "createdAt", label: "Created" },
                    { value: "updatedAt", label: "Updated" },
                  ].map(s => (
                    <button key={s.value} className={`${styles.filterBtn} ${sortOption === s.value ? styles.active : ''}`} onClick={() => setSortOption(s.value as SortOption)}>{s.label}</button>
                  ))}
                </div>
              </div>

              <button 
                className={`${styles.filterBtn} ${styles.advancedToggle} ${showAdvancedFilters ? styles.active : ''}`}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? "Hide Advanced" : "Advanced Filters"}
              </button>

              <button 
                className={styles.clearAllBtn}
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete all tasks? This action cannot be undone.")) {
                    clearAllTasks();
                  }
                }}
              >
                Clear All
              </button>
            </div>

            {showAdvancedFilters && (
              <div className={styles.filtersAdvanced}>
                <div className={styles.filterGroup}>
                  <span className={styles.filterLabel}>Importance:</span>
                  <div className={styles.buttonGroup}>
                    {["All", "must do", "should do", "can do"].map(i => (
                      <button key={i} className={`${styles.filterBtn} ${filterImportance === i ? styles.active : ''}`} onClick={() => setFilterImportance(i)}>{i}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.filterLabel}>Effort:</span>
                  <div className={styles.buttonGroup}>
                    {["All", "<10 min", "30 min", "2 hours", "unknown"].map(e => (
                      <button key={e} className={`${styles.filterBtn} ${filterEffort === e ? styles.active : ''}`} onClick={() => setFilterEffort(e)}>{e}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.filterLabel}>Urgency:</span>
                  <div className={styles.buttonGroup}>
                    {["All", "Immediate", "Today", "This Week", "Eventually"].map(u => (
                      <button key={u} className={`${styles.filterBtn} ${filterUrgency === u ? styles.active : ''}`} onClick={() => setFilterUrgency(u)}>{u}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tasks yet. Press <strong>Cmd+K</strong> or tap <strong>+</strong> to capture one.</p>
        </div>
      ) : activeTasks.length === 0 && completedTasks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tasks match your filters.</p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            <AnimatePresence>
              {activeTasks.map((task) => (
                <TaskItem key={task.id} task={task} onEdit={() => setEditingTaskId(task.id)} />
              ))}
            </AnimatePresence>
          </div>

          {completedTasks.length > 0 && (
            <div className={styles.completedSection}>
              <h3 className={styles.completedHeading}>Completed</h3>
              <div className={styles.list}>
                <AnimatePresence>
                  {completedTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onEdit={() => setEditingTaskId(task.id)} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {archivedTasks.length > 0 && (
            <div className={styles.archiveSection}>
              <div 
                className={styles.archiveHeader}
                onClick={() => setShowArchive(!showArchive)}
              >
                <div className={styles.archiveTitle}>
                  {showArchive ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <Archive size={14} />
                  <span>Archive</span>
                  <span className={styles.archiveCount}>{archivedTasks.length}</span>
                </div>
                
                {showArchive && (
                  <button 
                    className={styles.clearArchiveBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Clear all archived tasks? This is local-only and cannot be undone.")) {
                        clearArchive();
                      }
                    }}
                  >
                    Clear Archive
                  </button>
                )}
              </div>

              {showArchive && (
                <div className={styles.archiveList}>
                  <AnimatePresence>
                    {archivedTasks.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <TaskEditModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTaskId(null)}
      />
    </div>
  );
}
