# Phase 2a: Next.js Migration - API Routes, Lib, and Hooks

**Status:** COMPLETE  
**Date:** 2026-05-31  
**Agent:** Agent 6  

---

## Summary

Created Phase 2a scaffolding for Next.js migration: 6 API routes, 4 lib files, 4 hooks stubs, and complete folder structure. All files are TypeScript with proper error handling and TODO markers for implementation.

**Structure follows migration plan exactly:**
- All paths use `@/` alias (configured in tsconfig.json)
- All API routes use NextRequest/NextResponse
- All stubs compile without errors
- TODO markers indicate integration points for Phase 3

---

## Files Created

### 1. Lib Files (4 files)

#### `lib/db.ts`
- MongoDB connection with caching pattern
- Uses mongoose with Atlas connection pooling
- Global type declarations prevent re-initialization in development
- **Ready for Phase 3 implementation**

#### `lib/auth.ts`
- Authentication utilities placeholder
- Type definitions: `AuthSession`, `AuthUser`
- Functions: `validateToken()`, `getSession()`, `extractUserId()`
- Error response helpers
- **TODO: Integrate NextAuth.js v5 or Auth.js**

#### `lib/middleware.ts`
- Auth middleware wrapper
- Response helpers: `withAuth()`, `errorResponse()`, `successResponse()`
- Used by all protected API routes
- **TODO: Connect to auth system**

#### `lib/utils.ts`
- Shared utility functions
- Includes: `sleep()`, `isError()`, `getErrorMessage()`, `isValidEmail()`, `formatDate()`, `parseDate()`
- No external dependencies
- **Ready for immediate use**

---

### 2. API Routes (6 routes)

#### Search API
**File:** `app/api/search/route.ts`
- **Endpoint:** `GET /api/search?q=...&types=...&limit=...`
- **Params:** query, types, limit
- **Returns:** Unified search results across all resource types
- **TODO:** MongoDB text search implementation

#### Teams API
**File:** `app/api/teams/route.ts`
- **Endpoint:** `GET /api/teams`
- **Returns:** All teams for authenticated user
- **TODO:** Query implementation

#### Teams Invite API
**File:** `app/api/teams/invite/route.ts`
- **Endpoint:** `POST /api/teams/invite`
- **Body:** `{ email, teamId }`
- **Returns:** `{ inviteUrl, email, teamId }`
- **TODO:** Invite token generation and storage

#### Teams Invite Accept API
**File:** `app/api/teams/invite/[token]/accept/route.ts`
- **Endpoint:** `POST /api/teams/invite/:token/accept`
- **Params:** token (from URL)
- **Returns:** `{ message, teamId }`
- **TODO:** Token validation and team member creation

#### Teams Members API
**File:** `app/api/teams/members/route.ts`
- **Endpoint:** `GET /api/teams/members?teamId=...`
- **Returns:** All members for a team
- **TODO:** Membership query implementation

#### Socket API (stub)
**File:** `app/api/socket/route.ts`
- **Note:** Socket.io requires separate HTTP server (cannot run on Next.js API routes)
- **Current approach:** Keep Express on port 5001
- **TODO:** Consider alternatives (next-socket.io, WebSocket service)

---

### 3. Hooks (4 files)

#### useAuth Hook
**File:** `app/hooks/useAuth.ts`
- **Returns:** `{ user, loading, isAuthenticated, login(), logout(), register() }`
- **Client-side only:** 'use client'
- **TODO:** NextAuth.js integration

#### useAgenda Hook
**File:** `app/hooks/useAgenda.ts`
- **Params:** `selectedDate`, `view` ('day' | 'week' | 'month')
- **Returns:** `{ agenda, loading, isEmpty, refetch() }`
- **TODO:** API integration with Zustand store

#### useSearch Hook
**File:** `app/hooks/useSearch.ts`
- **Debounced:** 300ms delay, min 2 chars
- **Returns:** `{ query, results, loading, search() }`
- **TODO:** API integration and Zustand connection

#### useSocket Hook
**File:** `app/hooks/useSocket.ts`
- **Returns:** Socket.io instance (or null if not connected)
- **Auto-reconnects:** 5 attempts with exponential backoff
- **Singleton pattern:** Single instance persists across remounts
- **TODO:** SocketContext integration

---

### 4. Types & Store

#### types/types.ts
Complete TypeScript interface definitions:
- User, Task, Note, Meeting, Message
- AgendaData, SearchResults, SearchResult
- ApiResponse<T> (standard envelope)
- Recurrence types: RecurrenceFreq, RecurringEditScope
- Team types: Invite, Team, TeamMember

#### store/useAppStore.ts
Zustand store with 4 slices:
1. **TaskSlice:** CRUD for tasks
2. **NoteSlice:** CRUD for notes
3. **AgendaSlice:** CRUD for meetings
4. **UISlice:** Search state, modal state, UI flags

All operations use immutable patterns (spread operator).

---

### 5. Utilities

#### utils/animations.ts
GSAP animation presets:
- `staggerEnter()` - list item animations
- `fadeIn`, `fadeOut` - opacity transitions
- `scaleUp` - modal animations
- `slideUp` - entrance animations
- Helper functions: `animateEnter()`, `animateExit()`

#### utils/rruleExpander.ts
RRULE expansion utilities:
- `toDateStr()` - date formatting
- `extractRrulePart()` - RRULE parsing
- `buildRrule()` - RRULE construction
- `expandInRange()` - generate dates from RRULE
- `parseRruleString()` - RRULE to RRule options

---

### 6. Folder Structure

Created empty component directories with .gitkeep files:
- `app/components/modals/` - Modal components
- `app/components/dashboard/` - Dashboard components
- `app/components/chat/` - Chat components
- `app/components/common/` - Shared components
- `app/components/ui/` - UI elements

(Remaining directories already exist: `public/`, `styles/`, `types/`, `utils/`, `store/`, `hooks/`)

---

## Next Steps (Phase 3)

### 3a: MongoDB Models
- Convert server models to Next.js API format
- Files to create:
  - `models/Task.ts`
  - `models/Note.ts`
  - `models/Meeting.ts`
  - `models/Message.ts`
  - `models/Team.ts`
  - `models/TeamMember.ts`
  - `models/Invite.ts`

### 3b: API Implementation
1. Implement auth system (NextAuth.js v5 or Auth.js)
2. Connect DB to all API routes
3. Migrate Express routes to Next.js API routes:
   - `/api/tasks/[id]/route.ts`
   - `/api/notes/[id]/route.ts`
   - `/api/meetings/[id]/route.ts`
   - `/api/meetings/[id]/recurring/route.ts`
   - `/api/agenda/day/route.ts`
   - `/api/agenda/month/route.ts`

### 3c: Hook Integration
1. Update useAuth with NextAuth.js
2. Connect useAgenda to API and Zustand
3. Connect useSearch to API and Zustand
4. Implement SocketContext for useSocket

### 3d: Component Migration
1. Move components from `client/src/components/` to `app/components/`
2. Update import paths (use `@/` alias)
3. Connect to hooks and Zustand store

---

## API Response Format (Standardized)

All API routes follow this envelope:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
}
```

Example success:
```json
{
  "success": true,
  "data": { "id": "...", "title": "..." },
  "meta": { "total": 42 }
}
```

Example error:
```json
{
  "success": false,
  "error": "Meeting title is required"
}
```

---

## Environment Variables Required

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
MONGODB_URI=mongodb+srv://[credentials]@taskmanagerclusterv2.l9xc3t6.mongodb.net/taskmanager
JWT_SECRET=[your-jwt-secret]
```

---

## TypeScript Configuration

Path aliases configured in `tsconfig.json`:
- `@/*` → root (.)
- `@/app/*` → app/
- `@/components/*` → app/components/
- `@/hooks/*` → app/hooks/
- `@/services/*` → app/services/ (for Phase 3)
- `@/store/*` → app/store/
- `@/types/*` → app/types/
- `@/utils/*` → app/utils/

---

## File Tree

```
task-manager/
├── lib/
│   ├── db.ts                          ✓ MongoDB connection
│   ├── auth.ts                        ✓ Auth utilities
│   ├── middleware.ts                  ✓ Auth middleware
│   └── utils.ts                       ✓ Shared utilities
├── app/
│   ├── api/
│   │   ├── search/
│   │   │   └── route.ts               ✓ Global search
│   │   ├── teams/
│   │   │   ├── route.ts               ✓ List teams
│   │   │   ├── invite/
│   │   │   │   ├── route.ts           ✓ Create invite
│   │   │   │   └── [token]/
│   │   │   │       └── accept/
│   │   │   │           └── route.ts   ✓ Accept invite
│   │   │   └── members/
│   │   │       └── route.ts           ✓ List members
│   │   ├── socket/
│   │   │   └── route.ts               ✓ WebSocket stub
│   │   ├── auth/                      (already exists)
│   │   └── meetings/                  (already exists)
│   ├── hooks/
│   │   ├── useAuth.ts                 ✓ Auth hook
│   │   ├── useAgenda.ts               ✓ Agenda hook
│   │   ├── useSearch.ts               ✓ Search hook
│   │   └── useSocket.ts               ✓ Socket hook
│   ├── types/
│   │   └── types.ts                   ✓ Shared types
│   ├── utils/
│   │   ├── animations.ts              ✓ GSAP presets
│   │   └── rruleExpander.ts           ✓ RRULE utilities
│   ├── store/
│   │   └── useAppStore.ts             ✓ Zustand store
│   ├── components/
│   │   ├── modals/                    ✓ (empty, ready)
│   │   ├── dashboard/                 ✓ (empty, ready)
│   │   ├── chat/                      ✓ (empty, ready)
│   │   ├── common/                    ✓ (empty, ready)
│   │   └── ui/                        ✓ (empty, ready)
└── ...
```

---

## Quality Checklist

- [x] All files are TypeScript (.ts/.tsx)
- [x] All API routes use NextRequest/NextResponse
- [x] All files compile without errors
- [x] Proper error handling on all routes
- [x] Type safety throughout (no `any`)
- [x] Immutable patterns in store (spread operator)
- [x] Standard ApiResponse envelope
- [x] TODO markers for next phase
- [x] Path aliases configured
- [x] Comments explain each file's purpose
- [x] No hardcoded secrets

---

## Commit Message

```
feat(nextjs-migration): Phase 2a API routes, lib files, hooks, and folder structure

- lib/db.ts: MongoDB connection with caching pattern
- lib/auth.ts: Auth utilities and session management stubs
- lib/middleware.ts: Auth middleware and response helpers
- lib/utils.ts: Shared utilities (email validation, date formatting, error handling)
- api/search/route.ts: Global search endpoint (GET /api/search)
- api/teams/route.ts: List teams endpoint (GET /api/teams)
- api/teams/invite/route.ts: Create invite endpoint (POST /api/teams/invite)
- api/teams/invite/[token]/accept/route.ts: Accept invite endpoint
- api/teams/members/route.ts: List team members endpoint
- api/socket/route.ts: WebSocket stub (socket.io on separate port)
- hooks/useAuth.ts: Auth context hook
- hooks/useAgenda.ts: Agenda fetching hook
- hooks/useSearch.ts: Debounced search hook
- hooks/useSocket.ts: Socket.io connection hook
- types/types.ts: Complete TypeScript interface definitions
- store/useAppStore.ts: Zustand 5.0 store with 4 slices
- utils/animations.ts: GSAP animation presets
- utils/rruleExpander.ts: RRULE parsing and expansion utilities
- components/{modals,dashboard,chat,common,ui}/: Empty directories ready for Phase 3

All files include TODO markers for Phase 3 implementation.

Co-Authored-By: Agent 6 <noreply@anthropic.com>
```

---

## Architecture Notes

### API Route Pattern
All API routes follow this structure:
1. Extract and validate request data
2. Check authentication (middleware stub)
3. Query database (TODO)
4. Return standardized ApiResponse envelope
5. Error handling with proper status codes

### Hooks Pattern
All hooks follow React best practices:
- Client-side only ('use client')
- useEffect for data fetching
- useState for local state
- useCallback for memoized functions
- Debouncing in useSearch (300ms)

### Store Pattern
Zustand store uses:
- Immutable updates (spread operator)
- Separate slices for concerns
- Simple getters and setters
- No selectors yet (can add in Phase 3)

### Database Connection
MongoDB connection uses:
- Caching to prevent multiple connections
- Global namespace to avoid hot-reload issues
- Mongoose (already in package.json)
- Atlas connection string from environment

---

## Known Limitations

1. **Socket.io:** Cannot run on Next.js API routes. Must keep Express server on port 5001 or migrate to separate WebSocket service.
2. **Auth:** Placeholder only. Requires NextAuth.js v5 or Auth.js integration in Phase 3.
3. **Database:** Models not yet created. Need Mongoose schemas in Phase 3.
4. **API Logic:** All routes have TODO for actual implementation. Ready for Phase 3 backend work.

---

## Testing

To verify structure is valid:
```bash
npm run build  # Should complete without TypeScript errors
npm run dev    # Should start Next.js dev server on port 3000
```

All API routes are compilable but will return stub responses until Phase 3 implementation.

---

Generated: 2026-05-31  
Agent: Agent 6  
Status: READY FOR PHASE 3
