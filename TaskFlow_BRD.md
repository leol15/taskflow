# TaskFlow — Business Requirements (Brainstorm Draft)

**Scope:** Capture, Organization, Prioritization
**Status:** Draft / Brainstorm

---

## The Core Problem

Most todo apps fail not because users forget their tasks, but because the tools create friction at every step — adding tasks takes too long, organizing them requires too many decisions, and nothing tells you what to actually work on next. Users abandon their lists within weeks.

---

## 1. Capture

**Problem:** The moment between "I need to do this" and "it's saved" is too long. Navigating to an app, picking a project, and filling in fields means tasks get forgotten before they're recorded.

**Solutions:**
- Global keyboard shortcut (Cmd/Ctrl+K) opens a task field instantly from anywhere in the app

---

## 2. Organization

**Problem:** Flat lists become unmanageable. Rigid folder hierarchies require too much upfront thinking. Users have different mental models for their work (by project, by context, by area of life) and no single structure fits everyone. Over time, the list becomes more overwhelming than the work itself.

**Solutions:**
- **Projects** to group related tasks under a goal — one project per task, simple and strict
- **Tags** as a cross-cutting layer — apply multiple tags to any task, filter across all projects by tag
- **Subtasks** — a checklist inside a task for breaking down complex work, up to 2 levels deep
- **Global search** — fuzzy full-text search across titles, notes, and tags so users never need to remember where something lives
- **Saved filters** — save any combination of project + tag + status as a named view for one-click access

---

## 3. Prioritization

**Problem:** When everything looks equal, nothing gets done. Users either default to easy tasks (not important ones) or feel paralyzed. Existing tools either offer no priority support, or offer so many signals (flags, scores, tags, effort levels) that maintaining the system becomes a second job.

**Solutions:**
- **4 priority levels** (P1–P4) with clear visual indicators — simple enough to maintain, enough signal to differentiate
- **Today view** — a single daily view showing only overdue tasks, tasks due today, and P1s. Max 20 items, nothing else
- **Overdue escalation** — tasks past their due date automatically surface to the top of any view
- **Daily task cap** — users set a personal daily limit (default 5); tasks beyond it are visually de-emphasized so they stop overcommitting
- **Snooze** — defer a task to a future date so it disappears from view until it's actually actionable

---

## Open Questions

- Should a task be allowed to belong to more than one project?
- How deep should subtask nesting go — is 2 levels enough?
- Does the Today view cap (20 items) need to be user-configurable?
- Should the daily task limit be per-day-of-week or a single global setting?

---

## Out of Scope (v1)

Recurring tasks, reminders, calendar sync, team collaboration, analytics, integrations.

---

## Appendix — Deferred Capture Ideas

These were removed from the main requirements for now but are worth revisiting in a later sprint.

- **Natural language parsing** — typing "dentist Friday 3pm" sets the title and due date automatically. High value but adds NLP complexity and edge cases to v1.
- **Inbox zone** — tasks saved with zero metadata land in a dedicated inbox with no project, date, or priority required. Deferred pending a decision on whether zero-metadata tasks create more clutter than they solve.
- **Browser extension** — capture tasks from any webpage with the URL auto-attached. Useful but out of scope until the core app is stable.
- **Email forwarding** — forward an email to a personal capture address and it becomes a task. Depends on email infrastructure not planned for v1.