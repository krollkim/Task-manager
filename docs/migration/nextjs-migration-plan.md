# Next.js Migration Plan

**Status:** Ready to begin (after Phase 2 testing)  
**Estimated Duration:** 3 weeks (1 week migration, 1 week polish/security, 1 week optimization)  
**Risk Level:** Medium (requires careful testing, but proven pattern)  
**Timeline:** Start 2026-05-31, target completion 2026-06-20

---

## Executive Summary

We're migrating from **Vite + React + Express** to **Next.js 15+** to:
- Simplify architecture (one codebase instead of separate frontend/backend)
- Enable better deployment (Vercel, serverless)
- Improve performance (built-in optimization, ISR, edge)
- Better TypeScript integration
- Cleaner API contract (tRPC potential in Phase 4)
- Standard for modern SaaS (easier hiring, more examples, ecosystem)

**Key Constraint:** Zero downtime on production. Staging tests first, then blue-green deploy.

---

## Phase 1: Preparation (Days 1–2)

### 1a: Create Staging Branch

```bash
git checkout -b feature/nextjs-migration
git push -u origin feature/nextjs-migration
```

### 1b: Initialize Next.js Project

```bash
# Option 1: Create fresh Next.js app (recommended for clean migration)
npx create-next-app@latest task-manager-next --typescript --tailwind --eslint

# Option 2: Add to existing project (more complex, don't use)
```

**Next.js Configuration:**

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ["zustand", "gsap", "socket.io-client"],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  },
};

export default nextConfig;
```

### 1c: Set Up Environment Variables

**`.env.local` (local development):**
```
NEXT_PUBLIC_API_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://[credentials]@taskmanagerclusterv2.l9xc3t6.mongodb.net/taskmanager
JWT_SECRET=[your-jwt-secret]
GOOGLE_CLIENT_ID=[google-oauth-id]
GOOGLE_CLIENT_SECRET=[google-oauth-secret]
```

**`.env.production` (deployed to Vercel):**
```
NEXT_PUBLIC_API_URL=https://taskmanager.vercel.app
MONGODB_URI=[production-mongodb-uri]
JWT_SECRET=[production-jwt-secret]
GOOGLE_CLIENT_ID=[production-google-oauth-id]
GOOGLE_CLIENT_SECRET=[production-google-oauth-secret]
```

### 1d: Install Dependencies

```bash
npm install zustand socket.io-client gsap rrule uuid axios
npm install -D @types/node typescript
```

---

## Phase 2: File Structure Migration (Days 3–5)

### 2a: Create App Router Structure

```
task-manager-next/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home (redirect to /dashboard)
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx             # Auth layout (no sidebar)
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Main dashboard
│   │   ├── layout.tsx             # Dashboard layout (with sidebar)
│   │   └── [...404].tsx           # 404 page
│   ├── join/
│   │   └── [token]/
│   │       └── page.tsx           # Invite join page
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   └── logout/route.ts
│       ├── tasks/
│       │   ├── route.ts           # GET, POST
│       │   └── [id]/
│       │       ├── route.ts       # GET, PATCH, DELETE
│       │       └── quick-reschedule/route.ts
│       ├── meetings/
│       │   ├── route.ts           # GET, POST
│       │   ├── [id]/
│       │   │   ├── route.ts       # GET, PATCH, DELETE
│       │   │   └── recurring/
│       │   │       └── route.ts   # PATCH /meetings/:id/recurring
│       │       └── search/route.ts
│       ├── notes/
│       │   ├── route.ts           # GET, POST
│       │   └── [id]/
│       │       └── route.ts       # GET, PATCH, DELETE
│       ├── agenda/
│       │   ├── day/route.ts       # GET /agenda/day?date=
│       │   ├── week/route.ts      # GET /agenda/week?date=
│       │   └── month/route.ts     # GET /agenda/month?year=&month=
│       ├── search/route.ts        # GET /search?q=&types=&limit=
│       ├── teams/
│       │   ├── route.ts           # GET
│       │   ├── invite/
│       │   │   ├── route.ts       # POST /teams/invite
│       │   │   └── [token]/
│       │   │       └── accept/route.ts  # POST /teams/invite/:token/accept
│       │   └── members/route.ts
│       └── socket/
│           └── route.ts           # WebSocket endpoint (socket.io)
├── lib/
│   ├── auth.ts                    # Next.js Auth.js/NextAuth setup
│   ├── db.ts                      # MongoDB connection
│   ├── middleware.ts              # Auth middleware
│   └── utils.ts                   # Helper functions
├── hooks/
│   ├── useAuth.ts                 # Auth context hook
│   ├── useAgenda.ts               # Agenda fetching hook
│   ├── useSearch.ts               # Search hook
│   └── useSocket.ts               # Socket.io hook (moved from client)
├── store/
│   └── useAppStore.ts             # Zustand store (unchanged)
├── components/
│   ├── modals/
│   │   ├── MeetingModal.tsx
│   │   ├── NoteModal.tsx
│   │   ├── ModalComponent.tsx
│   │   └── RecurrenceSelector.tsx
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── CalendarWidget.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskListItem.tsx
│   │   └── NotesWidget.tsx
│   ├── chat/
│   │   ├── ChatPanel.tsx
│   │   ├── MessageBubble.tsx
│   │   └── TeamsPanel.tsx
│   ├── common/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── CommandPalette.tsx
│   └── ui/
│       └── [reusable components]
├── public/
│   └── [static assets]
├── styles/
│   └── globals.css                # Tailwind + custom CSS
├── types/
│   └── types.ts                   # Shared types
├── utils/
│   ├── animations.ts              # GSAP presets
│   ├── rruleExpander.ts           # Moved from server
│   └── [other utils]
├── middleware.ts                  # Next.js middleware (auth checks)
├── next.config.js
├── tsconfig.json
└── package.json
```

### 2b: Migrate Components (React Code Unchanged)

Most React components move as-is:
1. Move from `client/src/components/` → `app/components/`
2. Update import paths
3. Remove references to old API calls (we'll create a client layer)

### 2c: Create API Layer

Instead of calling Express directly, create a `lib/api.ts`:

```typescript
// lib/api.ts
import axios, { AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

export const tasksApi = {
  getAll: () => apiClient.get("/tasks"),
  getOne: (id: string) => apiClient.get(`/tasks/${id}`),
  create: (data: any) => apiClient.post("/tasks", data),
  update: (id: string, data: any) => apiClient.patch(`/tasks/${id}`, data),
  delete: (id: string) => apiClient.delete(`/tasks/${id}`),
};

export const meetingsApi = {
  getAll: () => apiClient.get("/meetings"),
  create: (data: any) => apiClient.post("/meetings", data),
  update: (id: string, data: any) => apiClient.patch(`/meetings/${id}`, data),
  updateRecurring: (id: string, scope: string, action: string, data: any) =>
    apiClient.patch(`/meetings/${id}/recurring`, { scope, action, ...data }),
  delete: (id: string) => apiClient.delete(`/meetings/${id}`),
};

// ... similar for notes, agenda, search, etc.
```

---

## Phase 3: Backend → API Routes (Days 5–8)

### 3a: Convert Express Routes to Next.js API Routes

**Example: GET /api/tasks**

**Before (Express):**
```javascript
// server/routes/TaskRouter.js
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await getTasks(req.user.id);
    res.json(tasks);
  } catch (err) {
    handleError(res, 500, err.message);
  }
});
```

**After (Next.js API Route):**
```typescript
// app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTasks } from "@/lib/services/taskService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await getTasks(session.user.id);
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
```

### 3b: Migrate All Express Routes

| Express Route | Next.js API Route | Priority |
|---------------|-------------------|----------|
| GET /tasks | GET /api/tasks/route.ts | P0 |
| POST /tasks | POST /api/tasks/route.ts | P0 |
| PATCH /tasks/:id | PATCH /api/tasks/[id]/route.ts | P0 |
| DELETE /tasks/:id | DELETE /api/tasks/[id]/route.ts | P0 |
| GET /agenda/month | GET /api/agenda/month/route.ts | P0 |
| GET /search | GET /api/search/route.ts | P0 |
| POST /meetings | POST /api/meetings/route.ts | P0 |
| PATCH /meetings/:id/recurring | PATCH /api/meetings/[id]/recurring/route.ts | P0 |
| POST /teams/invite | POST /api/teams/invite/route.ts | P1 |
| All other routes | Migrate same pattern | P1 |

### 3c: MongoDB Connection (lib/db.ts)

```typescript
// lib/db.ts
import mongoose from "mongoose";

declare global {
  var mongoose: { conn: any; promise: any };
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI not defined");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
```

---

## Phase 4: Socket.io Integration (Days 8–9)

### 4a: Socket.io with Next.js

Socket.io requires a separate HTTP server (can't use Next.js API routes alone). Options:

**Option A: Use `next-socket.io` (Recommended)**
```bash
npm install next-socket.io
```

**Option B: Keep Express running on different port (compatible with Vercel)**

For this project, I recommend **Option B** for now:
- Keep Express running for socket.io on port 5001
- Next.js API routes on port 3000
- They communicate via HTTP for non-socket calls
- During Vercel deployment: socket server runs separately or use Vercel's functions

### 4b: Socket.io Client Hook (Unchanged)

The `useSocket.ts` hook remains as-is in `hooks/useSocket.ts`. The socket client connects to `http://localhost:5001` (or production URL).

### 4c: Keep Express Server (For socket.io)

During transition:
```
Next.js: 3000 (web + API routes)
Express: 5001 (socket.io only)
```

Post-migration: Consider migrating socket.io to ws-based solution or serverless alternative.

---

## Phase 5: TypeScript & Type Safety (Days 9–10)

### 5a: Convert All `.js` Files to `.ts`

Priority order:
1. Utilities (`rruleExpander.ts`, `animations.ts`)
2. Services (`tasksService.ts`, `meetingsService.ts`)
3. Hooks (all `.ts` already, verify types)
4. Components (already `.tsx`, verify prop types)

### 5b: Create Shared Types

`types/types.ts` is already strong. Verify all API responses match:

```typescript
// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface TasksResponse extends ApiResponse<Task[]> {}
export interface MeetingResponse extends ApiResponse<Meeting> {}
```

### 5c: Auth Type Safety

```typescript
// lib/auth.ts
import { Session } from "next-auth";

export interface AuthSession extends Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export async function auth(): Promise<AuthSession | null> {
  // Implementation (NextAuth or similar)
}
```

---

## Phase 6: Testing & Validation (Days 10–12)

### 6a: Test Checklist

**API Routes:**
- [ ] GET /api/tasks returns user's tasks
- [ ] POST /api/tasks creates task
- [ ] PATCH /api/tasks/:id updates task
- [ ] DELETE /api/tasks/:id deletes task
- [ ] GET /api/agenda/month returns meetings + tasks for month
- [ ] GET /api/search returns results
- [ ] PATCH /api/meetings/:id/recurring handles scopes correctly

**Authentication:**
- [ ] Login creates session
- [ ] Protected routes require auth
- [ ] Logout clears session
- [ ] Token refresh works

**Real-time:**
- [ ] Socket.io still connects (from port 5001)
- [ ] Chat messages send/receive
- [ ] Presence updates correctly
- [ ] Message→task conversion works

**UI:**
- [ ] Dashboard loads and displays data
- [ ] Modals open/close
- [ ] Recurring meetings display correctly
- [ ] Search works
- [ ] Calendar view (day/week/month) works

### 6b: Performance Testing

```bash
# Build and measure
npm run build

# Check bundle size
npm run build -- --analyze

# Target: < 400kb gzipped
```

### 6c: Security Testing

Run from docs/security/checklist.md:
- [ ] No console.log in production code
- [ ] No hardcoded secrets
- [ ] Input validation on all API routes
- [ ] Auth checks on protected routes
- [ ] Rate limiting configured
- [ ] CORS headers correct

---

## Phase 7: Deployment Preparation (Days 12–14)

### 7a: Vercel Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Link project
vercel link

# Configure environment variables in Vercel dashboard:
# - MONGODB_URI
# - JWT_SECRET
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
```

### 7b: Build & Deploy to Staging

```bash
# Preview deployment
vercel --prod

# This deploys to staging URL (e.g., task-manager-staging.vercel.app)
```

### 7c: Blue-Green Deployment Strategy

1. **Current production:** task-manager.vercel.app (old Vite + Express)
2. **New staging:** task-manager-next.vercel.app (Next.js)
3. **Full testing on staging**
4. **Switch DNS:** task-manager.vercel.app → Next.js version
5. **Keep old version as fallback** (rollback via DNS)

### 7d: Database Backup

Before deploying to production:
```bash
# Backup MongoDB
mongodump --uri="mongodb+srv://..." --out=./backup_$(date +%Y%m%d)
```

---

## Phase 8: Production Deployment (Day 14+)

### 8a: Final Checks

- [ ] Staging fully tested (all 10 test phases from E2E plan)
- [ ] Security review passed
- [ ] Performance acceptable (< 3s first load, < 100ms interactions)
- [ ] All team members notified
- [ ] Rollback plan documented

### 8b: Deploy to Production

```bash
# Promote staging to production
vercel --prod --prod

# Or use GitHub integration: push to main, auto-deploys
```

### 8c: Monitor for Issues

```bash
# Watch logs
vercel logs --tail

# Check performance
# - Vercel Analytics dashboard
# - Web Vitals
# - Error tracking (Sentry, if configured)
```

### 8d: Rollback Plan

If critical issues:
```bash
# Rollback DNS to old version (within 5 minutes)
# Or redeploy staging version to production slot
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **API route bugs** | Broken features | Thorough testing on staging before production |
| **Socket.io disconnect** | Lost real-time sync | Keep Express running separately, add reconnect logic |
| **MongoDB connection issues** | Data access errors | Connection pooling, retry logic, monitoring |
| **Performance regression** | Slower page load | Bundle analysis, lazy loading, ISR configuration |
| **Database downtime during migration** | Can't deploy | Schedule deployment during low-traffic hours, have backup |
| **Auth broken in Next.js** | Users can't log in | Test login/logout thoroughly before production |

---

## Success Criteria

After migration:
- ✅ All features work (recurring meetings, chat, search, etc.)
- ✅ API responses identical to Express version
- ✅ Page load < 3s first load, < 100ms interactions
- ✅ TypeScript strict mode passes
- ✅ Zero security vulnerabilities
- ✅ Can deploy to Vercel in 2 minutes
- ✅ Database queries unchanged (same performance)
- ✅ 0 console.log in production code
- ✅ All tests pass (E2E + unit)

---

## Post-Migration (Phase 3 Work)

Once migrated to Next.js, Phase 3 becomes:
1. **Performance optimization** (ISR, lazy loading, edge caching)
2. **Security hardening** (rate limiting, encryption, audit logging)
3. **Monitoring** (Sentry, Web Vitals, error tracking)
4. **UI/UX polish** (animations, responsiveness, accessibility)

These are easier to implement in Next.js than in Vite + Express.

---

## Timeline Summary

```
Day 1–2:   Preparation + Next.js setup
Day 3–5:   File structure + component migration
Day 5–8:   API routes migration
Day 8–9:   Socket.io integration
Day 9–10:  TypeScript conversion
Day 10–12: Testing & validation
Day 12–14: Deployment preparation
Day 14+:   Production deployment + monitoring
```

**Total:** 2–3 weeks (can be parallelized with careful planning)

---

## Rollback Checklist

If we need to rollback to Vite + Express:
- [ ] Old version tagged in git: `git tag production-vite-backup`
- [ ] Old deployment URL accessible
- [ ] DNS reverted to old server
- [ ] Database restored from backup (if needed)
- [ ] Old version still running on separate server

---

## Handoff Notes

After migration:
1. Update CLAUDE.md with new architecture
2. Update docs/architecture/phases.md
3. Create docs/setup/nextjs-deployment.md
4. Train team on new structure (if applicable)
5. Archive old Vite project (don't delete, just archive)

---

**Status:** Ready to begin after Phase 2 testing ✅  
**Owner:** [Your name]  
**Reviewers:** [Code review team]  
**Next Step:** Test B8 recurring meetings, then begin migration
