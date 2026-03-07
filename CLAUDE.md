# Task Manager - Active Work Log

## Workflow Rule
When starting any new feature, document the plan here.
Mark each step `[x]` when complete. Never close the file — this is our shared source of truth.

---

## Current Branch: `feature/calandar-b4`

### Goal
Add a full Calendar Hub: agenda display, quick-add, meeting/note modals, click-to-edit, sorting, and week view.

---

## Plan & Progress

### B1 — Server Foundation ✅ (committed)
- [x] Meeting model (title, date, startTime, endTime, description)
- [x] `/api/agenda?date=` endpoint (returns tasks + notes + meetings for a day)
- [x] Note model: add optional `date` field

### B2 — Calendar Daily Hub ✅ (committed)
- [x] AgendaData / Meeting types in `types.ts`
- [x] `useAgenda` hook — fetches day agenda, exposes `agenda`, `loading`, `isEmpty`, `refetch`
- [x] CalendarWidget: agenda list (meetings → tasks → notes)
- [x] CalendarWidget: Quick-Add buttons (Task / Note / Meeting)
- [x] MeetingModal (create mode)
- [x] NoteModal extended with date field

### B3 — Agenda Item Click Actions ✅ (committed)
- [x] Meeting items clickable → MeetingModal in edit mode (prefill + delete)
- [x] Note items clickable → NoteModal in edit mode (prefill + delete)
- [x] Task items clickable → existing ModalComponent (edit mode)
- [x] Quick-add clears edit state (no stale data)
- [x] All edits/deletes trigger `refetch` + NotesWidget refresh

### B4 — Week View
- [x] **B4a** — Agenda sorting (committed)
  - Meetings: by startTime, no-time → end
  - Tasks: by priority (urgent → high → medium → low → none)
  - Notes: by createdAt descending
- [x] **B4b** — `useAgenda` week logic ✅ (committed & pushed)
  - `AgendaView = 'day' | 'week'` type
  - `WeekAgendaDay { date, label, agenda }` type
  - `getWeekDays()` → Mon–Sun array
  - `fetchWeekAgenda()` → Promise.all over 7 days, each day sorted
  - `weekAgenda` state, `isEmpty` and `refetch` handle both modes
- [x] **B4c** — CalendarWidget week view UI ✅ (committed & pushed)
  - Added Day/Week toggle buttons above agenda list
  - Destructured `agendaView`, `onAgendaViewChange`, `weekAgenda` in component
  - Extracted `renderAgendaItems(AgendaData)` helper (reuses all click handlers)
  - Week view: grouped Mon–Sun sections, empty days are skipped (only days with items shown)
  - Day view: unchanged flat list using `renderAgendaItems`
  - Dashboard: added `agendaView` state, updated `useAgenda` call, wired both CalendarWidget instances

---

## Constraints (all steps)
- No backend changes after B1
- No layout/responsive changes (breakpoints/grid/overflow) as part of B4
- Keep API contract as-is
- Do NOT modify `sortAgenda` in `useAgenda.tsx`
- `Dashboard.tsx` changes allowed ONLY for wiring state/props (no layout tweaks)

---

## Files Touched
| File | Status |
|---|---|
| `server/models/Meeting.js` | B1 done |
| `server/routes/agenda.js` | B1 done |
| `client/src/types/types.ts` | B6 done |
| `client/src/hooks/useAgenda.tsx` | B6 done |
| `client/src/components/dashboard/CalendarWidget.tsx` | B6 done |
| `client/src/components/dashboard/Dashboard.tsx` | B6 wiring done |
| `client/src/components/modals/MeetingModal.tsx` | B3 done |
| `client/src/components/modals/NoteModal.tsx` | B3 done |

---

---

## Upcoming Roadmap — Phase B: Calendar Hub Expansion

### B5 — Calendar Navigation ✅ (committed)
- [x] `handlePrev` / `handleNext` — moves ±1 day (Day mode) or ±7 days (Week mode)
- [x] `handleToday` — resets `selectedDate` to today
- [x] Nav row rendered above Day/Week toggle; labels change contextually ("Prev Day" / "Prev Week")
- [x] `useEffect` syncs `currentMonth`/`currentYear` grid state when `selectedDate` crosses a month boundary
- [x] All wired through existing `onDateSelect` prop — zero changes to `Dashboard.tsx`

### B6 — Month Calendar ✅ (done)
- [x] `AgendaView` extended to `'day' | 'week' | 'month'`
- [x] `getMonthDays()` + `fetchMonthAgenda()` in `useAgenda` (Promise.all over ~28–31 days)
- [x] `monthAgenda` state, `isEmpty` and `refetch` handle all three modes
- [x] `buildMonthMap()` in CalendarWidget — maps day numbers → AgendaData for current month
- [x] Neon event dots (purple=meeting, blue=task, yellow=note) visible in all views (Day/Week/Month)
- [x] Single click → update `selectedDate`, stay in current view; double-click / dot-click → switch to Day view
- [x] Prev/Next in Month view navigates ±1 month; labels update contextually
- [x] Day toggle added alongside Day | Week
- [x] Day view & Month single-click preview use `renderGroupedAgendaItems` with futuristic category separators (glowing `h-px` lines + spaced-out caps labels)

### B7 — Quick Reschedule
- [ ] Add `Move to Tomorrow` / `Move to Next Week` actions on tasks/meetings

### B8 — Recurring Meetings
- [ ] Add logic for daily/weekly/monthly repeating events in the DB and UI

### B9 — Global Search
- [ ] Extend existing search to cover the Calendar Hub (meetings/notes/tasks)

> Note: B10 (Task Search) is already implemented and working in the dashboard.

---

## Current Branch: `feature/calendar-b6`
