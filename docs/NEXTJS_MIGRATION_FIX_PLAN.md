# Next.js Migration Fix Plan

**Date:** 2026-05-31  
**Status:** PENDING IMPLEMENTATION  
**Goal:** Complete migration to Next.js-only backend, fix all API routing issues

---

## Executive Summary

### Current Problem
- **Dual backends**: Express (port 5001) + Next.js API routes both connected to same MongoDB
- **Inconsistent API calls**: Frontend files use different base URLs (localhost:3000, localhost:5000, /api)
- **Double /api paths**: Some routes become `/api/api/tasks`
- **Result**: CRUD operations broken, task creation fails with CORS errors

### Solution
- Fix all frontend API calls to use consistent relative paths (`/api`)
- Consolidate to **Next.js-only backend** (remove Express)
- Update Socket.io to use Next.js instead of Express
- Verify all endpoints work with single backend

---

## Files to Fix (In Order)

### Phase 1: Critical Path Fixes (BLOCKERS)
These fixes unblock CRUD operations immediately.

#### 1. `app/hooks/useTasks.ts` — Line 38 (CRITICAL)

**Problem:** Double `/api` path
```typescript
// WRONG (current)
const response = await fetch(`${API_URL}/api/tasks/${_id}`, {
```

**Fix:**
```typescript
// CORRECT
const response = await fetch(`${API_URL}/tasks/${_id}`, {
```

**File locations to fix:**
- Line 16: Already correct (`${API_URL}/tasks`)
- Line 27: Already correct (`${API_URL}/tasks/${_id}`)
- **Line 38: BROKEN** — `${API_URL}/api/tasks/${_id}` → fix to `${API_URL}/tasks/${_id}`

**Why:** API_URL is already set to `/api` in `.env.local`, so adding `/api` again creates `/api/api/tasks/`

**Impact:** Task editing will work once fixed

---

#### 2. `app/hooks/useNotes.ts` — Lines 12, 19, 25, etc. (CRITICAL)

**Problem:** Hardcoded localhost URLs pointing to old Express server

**Current code (sample):**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getNotes = async (): Promise<Note[]> => {
  const response = await fetch(`${API_URL}/api/notes`, {
    // ...
  });
};
```

**Fix:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const getNotes = async (): Promise<Note[]> => {
  const response = await fetch(`${API_URL}/notes`, {  // remove /api prefix
    // ...
  });
};
```

**All functions to update:**
- Line 12: Default fallback from `http://localhost:5000` → `/api`
- Line 17: `${API_URL}/api/notes` → `${API_URL}/notes`
- Line 25: `${API_URL}/api/notes` → `${API_URL}/notes`
- Line 33: `${API_URL}/api/notes/${id}` → `${API_URL}/notes/${id}`
- Line 41: `${API_URL}/api/notes/${id}` → `${API_URL}/notes/${id}`
- Line 50: `${API_URL}/api/notes/${id}` → `${API_URL}/notes/${id}`

**Why:** Notes are not loading/saving because requests go to localhost:5000 instead of `/api`

**Impact:** Notes CRUD will work once fixed

---

#### 3. `app/hooks/useAgenda.ts` — Lines 19, 24, 29, etc. (CRITICAL)

**Problem:** Wrong default fallback + incorrect API prefix

**Current code (sample):**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getAgenda = async (date: string): Promise<AgendaData> => {
  const response = await fetch(`${API_URL}/api/agenda/day?date=${date}`, {
    // ...
  });
};
```

**Fix:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const getAgenda = async (date: string): Promise<AgendaData> => {
  const response = await fetch(`${API_URL}/agenda/day?date=${date}`, {  // remove /api
    // ...
  });
};
```

**All locations to update:**
- Line 19: Default fallback from `http://localhost:3000` → `/api`
- Line 24: `${API_URL}/api/agenda/day` → `${API_URL}/agenda/day`
- Line 29: `${API_URL}/api/agenda/week` → `${API_URL}/agenda/week`
- Line 34: `${API_URL}/api/agenda/month` → `${API_URL}/agenda/month`
- (And any other agenda route calls)

**Why:** Agenda data won't load because requests go to wrong port

**Impact:** Calendar/Dashboard agenda won't display

---

#### 4. `app/components/auth/GoogleLogin.tsx` — Line ~132 (HIGH)

**Problem:** Hardcoded old Express server URL

**Current code (sample):**
```typescript
const redirectUri = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

**Fix:** Use the `lib/api.ts` authApi instead, OR update fallback:
```typescript
const redirectUri = process.env.NEXT_PUBLIC_API_URL || '/api';
```

Then update the actual OAuth endpoint call to use relative path.

**Why:** Google OAuth flow breaks if it tries to hit localhost:5000

**Impact:** Login via Google will fail

---

### Phase 2: Socket.io Migration (MEDIUM)

#### 5. `app/hooks/useSocket.ts` — Socket URL configuration

**Problem:** Socket.io points to Express server (localhost:5001)

**Current:**
```typescript
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
```

**Decision point:** Do we keep socket.io or replace it?

**Option A (Keep Express for now):**
- Keep `NEXT_PUBLIC_SOCKET_URL=http://localhost:5001` in `.env.local`
- This defers socket.io migration to Phase 3

**Option B (Migrate to Next.js):**
- Create Next.js WebSocket API route or polling mechanism
- Update useSocket.ts to use Next.js socket endpoint
- Remove Express dependency

**Recommendation:** **Option A for now** — fix CRUD first, then migrate sockets later

**Action:** No changes needed to useSocket.ts at this stage

---

### Phase 3: Backend Consolidation (CLEANUP)

#### 6. Deprecate Express Server

**Action Items:**
1. Stop running Express server (port 5001)
2. Remove `server/` folder from active development (archive it)
3. Delete old `client/` folder (Vite) — it's obsolete with Next.js

**Timing:** Only after all API calls are working and sockets are migrated

**Files to consider removing:**
- `server/` (entire directory)
- `client/` (entire directory)
- `server/.env`

---

## Implementation Order

### Step 1: Fix useTasks.ts (1 minute)
- **File:** `app/hooks/useTasks.ts`
- **Change:** Line 38 only
- **Verification:** Try to edit a task

### Step 2: Fix useNotes.ts (2 minutes)
- **File:** `app/hooks/useNotes.ts`
- **Changes:** Lines 12, 17, 25, 33, 41, 50
- **Verification:** Notes should display in dashboard

### Step 3: Fix useAgenda.ts (2 minutes)
- **File:** `app/hooks/useAgenda.ts`
- **Changes:** Lines 19, 24, 29, 34 (and any others)
- **Verification:** Calendar should show agenda items

### Step 4: Fix GoogleLogin.tsx (2 minutes)
- **File:** `app/components/auth/GoogleLogin.tsx`
- **Change:** Update default fallback URL
- **Verification:** Google login button should work

### Step 5: Test all CRUD (5 minutes)
- Open dashboard
- Create task → should save
- Edit task → should update
- Delete task → should remove
- Create note → should save
- See agenda items in calendar

---

## Verification Checklist

After each fix, verify in browser:

- [ ] Dashboard loads without 404 errors
- [ ] GET /api/tasks returns 200 (check Network tab)
- [ ] GET /api/notes returns 200
- [ ] GET /api/agenda/day returns 200
- [ ] Create new task: POST /api/tasks returns 201
- [ ] Edit task: PATCH /api/tasks/:id returns 200
- [ ] Delete task: DELETE /api/tasks/:id returns 200
- [ ] Same for notes
- [ ] Calendar displays with agenda items
- [ ] Console shows NO CORS errors
- [ ] Console shows NO 404 errors for API calls

---

## Environment Configuration Summary

After fixes, your `.env.local` should look like:

```bash
# Next.js API routes (all on same origin)
NEXT_PUBLIC_API_URL=/api

# Socket.io (still points to Express for now)
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001

# Database
MONGODB_URI=mongodb+srv://...

# Auth
JWT_SECRET=super-secret-jwt-key-change-in-production-12345
GOOGLE_CLIENT_ID=823830154060-...
GOOGLE_CLIENT_SECRET=...
```

**Key principle:** All API calls use relative `/api` path (single origin), avoiding port conflicts.

---

## Future Work (Phase 4)

Once CRUD is working:
1. Migrate Socket.io to Next.js API routes
2. Remove Express server entirely
3. Delete `server/` and `client/` folders
4. Run performance audit (bundle size, load time)

---

## Decision: Keep or Remove Express?

**Current recommendation: KEEP EXPRESS (for now)**

**Reasoning:**
- Socket.io integration is complex; chat feature still depends on Express
- Migrate sockets in Phase 4 after verifying CRUD works
- One change at a time reduces risk

**When ready to remove:**
- Move socket.io to Next.js WebSocket API
- Update NEXT_PUBLIC_SOCKET_URL to point to Next.js
- Archive server/ folder

---

## Summary Table

| File | Issue | Fix | Effort | Impact |
|------|-------|-----|--------|--------|
| useTasks.ts:38 | Double `/api` | Remove `/api` prefix | 1 min | Tasks won't edit |
| useNotes.ts | Wrong base URL | Change localhost:5000 → /api | 2 min | Notes won't load |
| useAgenda.ts | Wrong base URL | Change localhost:3000 → /api | 2 min | Agenda won't display |
| GoogleLogin.tsx | Hardcoded URL | Fix fallback | 2 min | OAuth broken |
| useSocket.ts | Still points to Express | Keep for Phase 4 | 0 min | Deferred |
| Express server | Dual backend | Keep for now | 0 min | Revisit later |

**Total time to fix CRUD:** ~10 minutes  
**Expected result:** All CRUD operations working with single Next.js backend

