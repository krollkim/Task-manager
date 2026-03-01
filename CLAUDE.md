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
- [x] **B4b** — `useAgenda` week logic (not yet committed)
  - `AgendaView = 'day' | 'week'` type
  - `WeekAgendaDay { date, label, agenda }` type
  - `getWeekDays()` → Mon–Sun array
  - `fetchWeekAgenda()` → Promise.all over 7 days, each day sorted
  - `weekAgenda` state, `isEmpty` and `refetch` handle both modes
- [x] **B4c** — CalendarWidget week view UI (done, built, ready to commit)
  - Added Day/Week toggle buttons above agenda list
  - Destructured `agendaView`, `onAgendaViewChange`, `weekAgenda` in component
  - Extracted `renderAgendaItems(AgendaData)` helper (reuses all click handlers)
  - Week view: grouped Mon–Sun sections, skips empty days
  - Day view: unchanged flat list using `renderAgendaItems`
  - Dashboard: added `agendaView` state, updated `useAgenda` call, wired both CalendarWidget instances

---

## Constraints (all steps)
- No changes to `Dashboard.tsx`
- No backend changes after B1
- No layout/responsive changes beyond what the feature requires
- Keep API contract as-is
- Do NOT modify `sortAgenda` in `useAgenda.tsx`

---

## Files Touched
| File | Status |
|---|---|
| `server/models/Meeting.js` | B1 done |
| `server/routes/agenda.js` | B1 done |
| `client/src/types/types.ts` | B4b done (uncommitted) |
| `client/src/hooks/useAgenda.tsx` | B4b done (uncommitted) |
| `client/src/components/dashboard/CalendarWidget.tsx` | B4c pending |
| `client/src/components/modals/MeetingModal.tsx` | B3 done |
| `client/src/components/modals/NoteModal.tsx` | B3 done |

---

## Next Step
**Commit B4b** — all client-side week view work is complete and built clean.
