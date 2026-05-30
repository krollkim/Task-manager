# Architecture Plan: TaskManager V2

**Current Branch:** `feature/architecture-v2`  
**Status:** Phase 2 in progress (B8 recurring meetings)  
**Timeline:** Started 2026-04-14, estimated completion Phase 2: 2026-05-31  

---

## Overview

Upgrade from basic CRUD app to professional collaboration platform with:
- Real-time chat + presence
- Global search + command palette
- Recurring meetings with scope-aware edits
- GSAP animations for polish
- Zustand state management
- Performance-first architecture (Phase 3)

**Total Phases:** 3  
**Current Status:** Phase 2/3 (87% complete)

---

## Phase 0: Foundation ✅ COMMITTED

**Goal:** Restructure data layer and introduce modern state management  
**Committed:** 2026-04-14 (commit `fe2162a`)

### Deliverables

#### Backend Schema Extensions
- [x] Task model: `parentTaskId`, `linkedMeetingId`, `linkedNoteId` cross-links
- [x] Note model: `linkedTaskId`, `linkedMeetingId` cross-links
- [x] Meeting model: same cross-links + text index for search
- [x] Text indexes on all three models for `/search` endpoint
- [x] MongoDB cluster migrated to v2 with proper credentials

#### API Endpoints
- [x] `GET /agenda/month?year=YYYY&month=MM` — Returns all tasks + notes + meetings for entire month (single query)
- [x] `GET /search?q=QUERY&types=task,note,meeting&limit=10` — Unified text search across all collections

#### Frontend State Management
- [x] Zustand 5.0.12 store (`client/src/store/useAppStore.ts`)
  - Slice 1: `taskSlice` (tasks, addTask, updateTask, etc.)
  - Slice 2: `noteSlice` (notes, addNote, updateNote, etc.)
  - Slice 3: `agendaSlice` (meetings, addMeeting, etc.)
  - Slice 4: `uiSlice` (modals, notifications, UI state)
- [x] Services migrated from fetch → axios (VITE_API_URL, withCredentials)

#### Database Migration
- [x] MongoDB cluster URL changed: `taskmanagerclusterv2.l9xc3t6.mongodb.net`
- [x] Credentials stored in `server/config/default.json` (via environment)
- [x] Connection verified, `/search` endpoint tested live ✅

---

## Phase 1: Parallel Streams ✅ COMMITTED

**Goal:** Add real-time features and animations in parallel work streams  
**Committed:** 2026-04-15 (commits `05dcdf6`, `41085ae`)

### Stream A: GSAP Animations ✅

**Purpose:** Add polish and visual feedback to interactions

#### Deliverables
- [x] `client/src/utils/animations.ts` — GSAP animation presets
  - `staggerEnter` (offset reveal on list items)
  - `fadeInUp` (subtle entrance effect)
  - `pulse` (attention-grabbing for notifications)
  - `slideInRight` (modal entrance)
  - Others as needed

- [x] Component integration:
  - TaskCard: stagger on list, hover lift with scale
  - TaskListItem: same effect
  - CalendarWidget: event list stagger on date change
  - ModalComponent: slide-in entrance
  - CommandPalette: results stagger on search change

**Status:** All components wired, animations working ✅

### Stream B: Socket.io Infrastructure (Chat + Presence) ✅

**Purpose:** Enable real-time collaboration

#### Deliverables
- [x] `server/services/chatHandler.js` — WebSocket event handlers
  - `message:send` → broadcasts to room
  - `message:edit` → broadcasts edit
  - `presence:online` → user online/offline status
  
- [x] `server/models/mongoDB/Message.js` — Message model
  - Fields: `userId`, `senderName`, `text`, `timestamp`, `linkedItemId` (links to task/note)
  - Text index for search
  
- [x] `server/routes/MessageRouter.js` — REST API for messages (fetch history)

- [x] `client/src/contexts/SocketContext.tsx` — Socket singleton
  - One socket per app, owned by SocketProvider
  - `useSocket()` is a re-export shim (zero consumer changes)
  - Eliminates double-socket bug from earlier versions
  
- [x] `client/src/components/TeamPanel.tsx` — Team management
  - Display team members
  - Invite UI + form
  
- [x] `client/src/components/ChatPanel.tsx` — Chat interface
  - Message list with sender info
  - Input field
  - Real-time message send/receive

**Status:** Socket infrastructure complete, messages persisting ✅

### Stream C: Message → Task/Note Conversion ✅

**Purpose:** Quick capture from chat

#### Deliverables
- [x] `server/routes/chatHandler.js` — `chat:convert` event
  - Payload: `{ text, type: 'task'|'note' }`
  - Creates Task or Note, broadcasts `task:converted` event
  - Sets `teamId: 'default'` on created task
  - Guard against double-conversion via `linkedItemId` check
  
- [x] `client/src/components/MessageBubble.tsx` — Message bubble with hover actions
  - "Convert to Task" button
  - "Convert to Note" button
  - Calls `socket.emit('chat:convert', ...)`
  
- [x] Real-time feedback: Message shows linked item indicator after conversion

**Status:** Complete, tested with socket.io ✅

### Vite Environment Types
- [x] `client/vite-env.d.ts` — Fixes `import.meta.env` TypeScript errors globally

---

## Phase 2: Advanced Features & Polish 🟡 IN PROGRESS (87% done)

**Goal:** Command Palette, global search, recurring meetings, invite system  
**Status:** B9 complete, B8 ready to test

### B9: Command Palette + Global Search ✅ COMMITTED

**Committed:** 2026-04-21 (commit `f6ae43c`)

#### Deliverables
- [x] `client/src/components/CommandPalette.tsx`
  - Cmd+K / Ctrl+Q keyboard shortcut
  - Glass-panel UI with search input
  - Results grouped by type: Tasks | Notes | Meetings | Messages
  - Click to open correct modal (task → ModalComponent, meeting → MeetingModal, etc.)
  - ESC + backdrop close
  - GSAP stagger animation on results change
  - Null-guard on all buckets (tasks/notes/meetings/messages) to prevent crashes

- [x] `client/src/hooks/useSearch.ts`
  - Debounced 300ms axios call to `GET /search`
  - Minimum 2 characters to trigger search
  - Writes to Zustand: `searchResults`, `searchLoading`

- [x] `client/src/types/types.ts`
  - `SearchResults` type: buckets for tasks, notes, meetings, messages
  - Each result includes: `_id`, `title`, `snippet`, `score`, `type`

- [x] `server/routes/SearchRouter.js`
  - `GET /search?q=QUERY&types=task,note,meeting,message&limit=10`
  - MongoDB $text search across all 4 collections
  - Returns ranked results by score

- [x] Message text index added to enable message search

- [x] Dashboard integration
  - Global keydown listener (capture phase)
  - Case-insensitive key check for locale compatibility
  - `<CommandPalette>` mounted with all modal callbacks
  - Clear searchQuery on mount to prevent stale store crash

**Status:** Working, bug-fixed for reliability ✅

### B8: Invite System + Join Flow ✅ COMMITTED

**Committed:** 2026-04-21 (commits in `f6ae43c`)

#### Deliverables
- [x] `server/models/mongoDB/Invite.js`
  - Fields: `token` (UUID), `email`, `createdAt`, `expiresAt` (7 days)
  - Unique constraint: `(email, workspaceId)` to prevent duplicate invites
  
- [x] `server/routes/TeamsRouter.js`
  - `POST /teams/invite` — Generate invite token + send email placeholder
  - `GET /teams/invite/:token` — Validate token (not expired, not accepted)
  - `POST /teams/invite/:token/accept` — Mark accepted + create TeamMember record
  - Mounted at `/teams` in `server/index.js`

- [x] `server/models/mongoDB/TeamMember.js`
  - Upserted on invite accept
  - Fields: `userId`, `workspaceId`, `role`
  - Compound unique index: `(userId, workspaceId)`

- [x] `client/src/pages/JoinPage.tsx` (NEW)
  - Public route `/join/:token`
  - Validates invite token
  - Auto-accepts if user logged in
  - Shows register/login flow if not authenticated

- [x] `client/src/AppRouter.tsx`
  - Route mounted: `<Route path="/join/:token" element={<JoinPage />} />`

- [x] TeamPanel invite UI
  - Toggle form for email input
  - `POST /teams/invite` on submit
  - Display invite URL on success

**Status:** Complete, tested with socket flow ✅

### B8: Recurring Meetings 🟡 STAGED (ready to test)

**Status:** Code complete, uncommitted, ready for E2E testing

#### Deliverables

**Backend:**
- [x] `server/models/mongoDB/Meeting.js`
  - Added fields: `rrule` (string, DTSTART + RRULE), `recurringId` (base ID), `isRecurringBase` (bool), `exceptedDates` (array)

- [x] `server/utils/rruleExpander.js` (NEW)
  - `expandInRange(meeting, startDate, endDate)` — Expands base meeting to virtual instances
  - `toDateStr(date)` — Formats date as YYYY-MM-DD
  - `extractRrulePart(rruleStr)` — Strips DTSTART, keeps FREQ options
  - `buildRrule(freqOptions, dtstart)` — Builds full DTSTART+RRULE string
  - Virtual instances: synthetic `_id = baseId_YYYY-MM-DD`, never stored in DB

- [x] `server/routes/MeetingRouter.js`
  - `POST /meetings` — Accept `rrule` field, set `isRecurringBase: true`
  - `PATCH /meetings/:id/recurring` (NEW)
    - Scoped edit/delete: scope = 'this' | 'following', action = 'edit' | 'delete'
    - 'this': Add date to `exceptedDates` on base, optionally create exception meeting
    - 'following': Truncate base (add UNTIL), optionally create new base for future
    - 'all': Update base directly (normal PATCH)

- [x] `server/routes/AgendaRouter.js`
  - Updated day + month queries to:
    - Exclude `isRecurringBase` meetings from regular query
    - Expand recurring bases via `expandInRange`
    - Merge virtual instances into results

- [x] `server/models/MeetingAccessDataService.js`
  - `editMeeting()` handles new fields: `rrule`, `isRecurringBase`, `exceptedDates`

**Frontend:**
- [x] `client/src/types/types.ts`
  - Meeting interface extended: `rrule?`, `recurringId?`, `isRecurringBase?`, `isRecurringInstance?`, `exceptedDates?[]`
  - New types: `RecurrenceFreq = 'none' | 'daily' | 'weekly' | 'monthly'`
  - New types: `RecurringEditScope = 'this' | 'following' | 'all'`

- [x] `client/src/components/modals/RecurrenceSelector.tsx` (NEW)
  - Frequency picker: None | Daily | Weekly | Monthly
  - Weekly: Day-of-week pills (Mon–Sun)
  - Monthly: Read-only label (for now, always on day N of month)
  - Builds/parses DTSTART+RRULE strings
  - Only shows when creating new or editing scope='all'

- [x] `client/src/components/MeetingModal.tsx`
  - Integrated RecurrenceSelector
  - Scope picker: "This occurrence" | "This & following" | "All occurrences"
  - ↻ Recurring badge in header
  - RecurrenceSelector locked when scope !== 'all'
  - `onSave(meeting, editScope?)` — passes scope to handler

- [x] `client/src/services/MeetingServices.js`
  - `editRecurringMeeting(baseId, { scope, action, date, data })` — New method
  - Routes to `PATCH /meetings/:id/recurring` with scope

- [x] `client/src/components/dashboard/Dashboard.tsx`
  - `handleMeetingSave()` routes to `/recurring` endpoint when recurring
  - `handleMeetingDelete()` extracts base ID from virtual instances via `recurringId`
  - Calls `refetchAgenda()` after operations

- [x] `client/src/components/dashboard/CalendarWidget.tsx`
  - ↻ Recurring badge on all recurring instances (base + virtual)
  - Badge in both `renderAgendaItems` and `renderGroupedAgendaItems`

**Status:** Ready for E2E testing ✅

#### Test Plan
See: [docs/testing/e2e-recurring-meetings.md](../testing/e2e-recurring-meetings.md)

---

## Phase 3: Performance & Polish ❌ NOT STARTED

**Goal:** Optimize bundle size, add lazy loading, performance monitoring, final security review  
**Estimated Start:** After Phase 2 testing + commit  
**Estimated Duration:** 2 weeks

### Deliverables (Planned)

#### Performance
- [ ] React.lazy() for modals + heavy components
- [ ] Skeleton loaders for async content
- [ ] Zustand selector audit (ensure granular selects, not full state)
- [ ] Bundle analysis: target < 400kb gzipped
- [ ] Code splitting by route

#### Security (Final Pass)
- [ ] Remove console.log, integrate proper logging library (Winston/Pino)
- [ ] Rate limiting on public endpoints
- [ ] HTTPS + HSTS headers
- [ ] Content-Security-Policy header
- [ ] Encrypt sensitive fields at rest (email, etc.)
- [ ] Password requirement enforcement
- [ ] Audit logging for sensitive operations

#### Monitoring
- [ ] Error tracking (Sentry integration)
- [ ] Performance metrics (Web Vitals)
- [ ] User activity logging

#### Polish
- [ ] UI/UX refinements from design inspiration
- [ ] Animation tweaks (GSAP timing)
- [ ] Responsive design review

---

## Current Status Summary

| Phase | Feature | Status | Commit |
|-------|---------|--------|--------|
| **0** | Foundation (Zustand, schema, /search, /agenda/month) | ✅ DONE | `fe2162a` |
| **1a** | GSAP animations | ✅ DONE | `05dcdf6` |
| **1b** | Socket.io chat + presence | ✅ DONE | `41085ae` |
| **1c** | Message → Task/Note conversion | ✅ DONE | `41085ae` |
| **2a** | Command Palette + global search | ✅ DONE | `f6ae43c` |
| **2b** | Invite system + join flow | ✅ DONE | `f6ae43c` |
| **2c** | Recurring meetings (B8) | 🟡 STAGED | Not yet committed |
| **3** | Performance + security hardening | ❌ NOT STARTED | — |

---

## Deployment Timeline

1. **Today (2026-05-29):** E2E test B8, commit Phase 2
2. **2026-05-31:** Create PR to main, code review
3. **2026-06-02:** Merge to main, deploy to staging
4. **2026-06-09 to 2026-06-23:** Next.js refactor (2–3 weeks)
5. **2026-06-23:** Deploy Next.js to production
6. **2026-06-30 to 2026-07-14:** Phase 3 (performance, security, monitoring)
7. **2026-07-14 onwards:** Phase 4 (video, collaboration features)
8. **2026-07-15 (Phase 4 start):** Evaluate Supabase migration (database decision point)

---

## Branch Strategy

```
main (production)
  ↓
develop (staging)
  ↓
feature/architecture-v2 (current work)
  ├── Phases 0–2 committed
  └── Phase 2-B8 staged (waiting for testing)
```

**Next Steps:**
1. E2E test recurring meetings (all 10 phases + edge cases)
2. Commit B8 with `feat(b8): recurring meetings...`
3. Create PR to main
4. Code review + merge
5. Begin Phase 3

---

## Decision Log

| Decision | Date | Reason | Status |
|----------|------|--------|--------|
| Zustand over Redux | 2026-04-14 | Lighter, faster, less boilerplate | ✅ Implemented |
| Socket.io for real-time | 2026-04-15 | Battle-tested, WebSocket fallback | ✅ Implemented |
| RRULE standard for recurrence | 2026-04-21 | RFC 5545 standard, widely supported | ✅ Implemented |
| Virtual instances (client-side expansion) | 2026-04-21 | Avoids DB bloat, faster queries | ✅ Implemented |
| Scoped edit/delete for recurring | 2026-04-21 | User mental model matches calendar apps | ✅ Implemented |

---

## Known Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Timezone handling** | Wrong meeting times in other zones | UTC-only for MVP, upgrade in Phase 3 with user timezone prefs |
| **Recurring series with 1000+ instances** | Slow expansion | Limit expansion to ±5 years, implement pagination |
| **Bundle size growth** | Slow page load | Phase 3: lazy loading, code splitting, target < 400kb |
| **Real-time sync conflicts** | Data inconsistency | Document conflict resolution strategy (client always wins for edits) |
| **Security gaps before production** | Data breaches | Phase 3: security review, penetration test, OWASP checks |

---

## References

- CLAUDE.md — In-progress feature log
- Phase 1 commits: GSAP animations, socket infrastructure
- Phase 2 commits: Command Palette, invite system, recurring meetings (B8 staged)
