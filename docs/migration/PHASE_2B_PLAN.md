# Phase 2b: Component Migration Plan

**Target:** Migrate React components from Vite to Next.js  
**Approach:** Move as-is, update imports, remove old API calls  
**Parallel Execution:** Use agents to migrate component groups in parallel

---

## Components to Migrate

### Group 1: Authentication (2 components)
**Source:** `client/src/components/auth/`

- [ ] `Login.tsx` → `app/components/auth/Login.tsx`
- [ ] `Register.tsx` → `app/components/auth/Register.tsx`

**Changes:**
- Update imports: `@/services` → API calls removed (use API routes instead)
- Update import paths for types, utils, etc.
- Remove localStorage handling (session management moves to next-auth)

---

### Group 2: Modals (4 components)
**Source:** `client/src/components/modals/`

- [ ] `ModalComponent.tsx` → `app/components/modals/ModalComponent.tsx`
- [ ] `MeetingModal.tsx` → `app/components/modals/MeetingModal.tsx`
- [ ] `NoteModal.tsx` → `app/components/modals/NoteModal.tsx`
- [ ] `RecurrenceSelector.tsx` → `app/components/modals/RecurrenceSelector.tsx`
- [ ] `CalendarModal.tsx` → `app/components/modals/CalendarModal.tsx` (already in Next.js)
- [ ] `CalendarSidebar.tsx` → `app/components/modals/CalendarSidebar.tsx` (already in Next.js)
- [ ] `CommandPalette.tsx` → `app/components/modals/CommandPalette.tsx`
- [ ] `SimpleCalendarGrid.tsx` → `app/components/modals/SimpleCalendarGrid.tsx`

**Changes:**
- Add `'use client'` directive
- Update all imports to use `@/` aliases
- Remove direct API calls, use hooks (useSearch, useAgenda, etc.)
- Wire to Zustand store

---

### Group 3: Dashboard Components (6 components)
**Source:** `client/src/components/dashboard/`

- [ ] `Dashboard.tsx` → `app/components/dashboard/Dashboard.tsx`
- [ ] `TaskCard.tsx` → `app/components/dashboard/TaskCard.tsx`
- [ ] `TaskListItem.tsx` → `app/components/dashboard/TaskListItem.tsx`
- [ ] `CalendarWidget.tsx` → `app/components/dashboard/CalendarWidget.tsx`
- [ ] `NotesWidget.tsx` → `app/components/dashboard/NotesWidget.tsx`
- [ ] `Header.tsx` → `app/components/common/Header.tsx` (or enhance Navbar)

**Changes:**
- Add `'use client'` directive
- Update imports to `@/` aliases
- Wire to Zustand store (getTasks, getNotes, getMeetings)
- Replace old API calls with hooks
- Keep all styling intact

---

### Group 4: Chat Components (3 components)
**Source:** `client/src/components/chat/`

- [ ] `ChatPanel.tsx` → `app/components/chat/ChatPanel.tsx`
- [ ] `MessageBubble.tsx` → `app/components/chat/MessageBubble.tsx`
- [ ] `TeamsPanel.tsx` → `app/components/chat/TeamsPanel.tsx`

**Changes:**
- Add `'use client'` directive
- Update imports to `@/` aliases
- Wire to Socket.io hook (useSocket)
- Keep all styling

---

### Group 5: Common Components (2 components)
**Source:** `client/src/components/` (existing in Next.js)

- [ ] `Navbar.tsx` — Already in `app/components/common/` (enhance if needed)
- [ ] `Sidebar.tsx` — Already in `app/components/common/` (enhance if needed)

**Changes:**
- Verify styling and functionality
- Enhance with additional features if needed

---

## Migration Pattern

**For Each Component:**

1. **Copy the file:**
   ```bash
   cp client/src/components/[GROUP]/[COMPONENT].tsx app/components/[GROUP]/[COMPONENT].tsx
   ```

2. **Update the file:**
   - Add `'use client'` at the top (for client components)
   - Replace import paths:
     ```
     OLD: import { getTasks } from '../../services/TaskServices'
     NEW: import { tasksApi } from '@/lib/api' // created in Phase 2c
     ```
   - Replace old API calls:
     ```
     OLD: const tasks = await TaskServices.getTasks()
     NEW: const tasks = useAppStore((state) => state.tasks)
     ```
   - Update type imports: `@/types` instead of relative paths

3. **Verify:**
   - No `client/src/` imports remaining
   - All `@/` aliases used
   - `'use client'` present in client components
   - No old API service calls

---

## Phase 2c: Create API Layer

**After** all components are migrated, create `lib/api.ts`:

```typescript
// lib/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

export const tasksApi = {
  getAll: () => apiClient.get('/tasks'),
  getOne: (id: string) => apiClient.get(`/tasks/${id}`),
  create: (data: any) => apiClient.post('/tasks', data),
  update: (id: string, data: any) => apiClient.patch(`/tasks/${id}`, data),
  delete: (id: string) => apiClient.delete(`/tasks/${id}`),
};

// Similar for notesApi, meetingsApi, agendaApi, searchApi, teamsApi
```

Then update components to use this instead of direct fetch/axios calls.

---

## Parallel Execution Strategy

**Agent Groups (6 parallel streams):**

1. **Agent 1:** Auth components (Login, Register)
2. **Agent 2:** Modal components (Modals 1-4)
3. **Agent 3:** Modal components (Modals 5-8, including CommandPalette)
4. **Agent 4:** Dashboard components (TaskCard, TaskListItem, CalendarWidget)
5. **Agent 5:** Dashboard components (Dashboard, NotesWidget)
6. **Agent 6:** Chat components (ChatPanel, MessageBubble, TeamsPanel)

---

## Quality Checks

After all migrations:

- [ ] No `client/src/` imports in any component
- [ ] All imports use `@/` aliases
- [ ] All client components have `'use client'` directive
- [ ] No old API service calls (TaskServices.*, NoteServices.*, etc.)
- [ ] Types imported from `@/types`
- [ ] Zustand store used for state
- [ ] Build passes: `npm run build`
- [ ] Dev server runs without errors: `npm run dev`
- [ ] All components render without console errors

---

## Testing After Migration

1. **Visual Testing:**
   - [ ] All components render visually as before
   - [ ] Styling matches old app
   - [ ] Responsive design works

2. **Functional Testing:**
   - [ ] Forms work (login, register, create task/note/meeting)
   - [ ] Navigation works (sidebar, navbar)
   - [ ] Modals open/close properly
   - [ ] Chat real-time updates work

3. **API Integration:**
   - [ ] API calls go to Next.js routes
   - [ ] Network requests show correct endpoints
   - [ ] Auth flow works

---

## Files to Remove After Migration

Once all components are migrated and tested:

- [ ] Delete `client/src/components/` (move to backup if unsure)
- [ ] Delete `client/` folder if not needed
- [ ] Update CLAUDE.md with completion status

---

## Success Criteria

✅ All components migrated to `app/components/`  
✅ No old imports from `client/src/`  
✅ Build passes with no errors  
✅ Dev server runs without errors  
✅ Visual styling matches old app  
✅ API calls go to Next.js routes  
✅ Ready for Phase 3 — Backend Integration

---

**Estimated Duration:** 1-2 days with parallel agents  
**Next Step:** Launch Phase 2b component migration
