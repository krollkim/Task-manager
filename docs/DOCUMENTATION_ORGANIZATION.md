# Documentation Organization Guide

**Last Updated:** 2026-05-31  
**Purpose:** Clarify folder structure and purpose of all migration & implementation docs  

---

## Folder Structure

```
docs/
├── migration/              ← Migration planning & completion tracking
│   ├── nextjs-migration-plan.md
│   ├── PHASE_2A_COMPLETION.md
│   └── PHASE_2B_PLAN.md
│
├── implementation/         ← Detailed implementation guides & technical docs
│   ├── PHASE_3_COMPLETION_INDEX.md    (Master index for all Phase 3)
│   ├── phase-3a-auth-routes.md        (Auth implementation)
│   ├── phase-3b-task-routes.md        (Task CRUD implementation)
│   ├── phase-3c-meeting-routes.md     (Meeting + recurring implementation)
│   ├── phase-3d-note-routes.md        (Note CRUD implementation)
│   ├── phase-3e-agenda-routes.md      (Agenda aggregation implementation)
│   └── phase-3f-search-teams.md       (Search + teams implementation)
│
├── api-reference/          ← Quick API endpoint references with curl examples
│   └── search-teams.md     (API examples for search & teams endpoints)
│
├── architecture/           ← System design & architecture decisions
├── security/              ← Security checklists & guidelines
└── testing/               ← Testing plans & procedures
```

---

## File Purposes

### Migration Folder (`docs/migration/`)
**Purpose:** Track Next.js migration progress from Vite → Next.js

**Contents:**
- `nextjs-migration-plan.md` — Full 14-day migration timeline
- `PHASE_2A_COMPLETION.md` — Phase 2a deliverables (app router structure)
- `PHASE_2B_PLAN.md` — Phase 2b component migration strategy

**When to Read:** Track overall migration progress, understand phases

---

### Implementation Folder (`docs/implementation/`)
**Purpose:** Detailed technical documentation for each phase implementation

**PHASE_3_COMPLETION_INDEX.md:**
- Master index for entire Phase 3
- Overview of all 7 API domains (auth, tasks, meetings, notes, agenda, search, teams)
- Links to all phase-specific docs
- Code statistics & verification checklist

**phase-3a through phase-3f files:**
- Detailed implementation guide for each phase
- Files created, routes implemented, service methods, data models
- Error handling, security measures, testing checklist
- Integration points with frontend components

**When to Read:**
- Understanding how specific API routes work
- Implementing frontend components that use the routes
- Debugging API integration issues
- Setting up tests

---

### API Reference Folder (`docs/api-reference/`)
**Purpose:** Quick lookup of API endpoints with curl examples

**Contents:**
- `search-teams.md` — Quick reference for search & teams endpoints

**Format:** Each file includes:
- List of all endpoints
- Query/body parameters with types
- Example curl requests
- Response format (200/400/401/etc)

**When to Read:** Quick endpoint lookup, testing with curl, understanding request/response format

---

## Document Hierarchy

### For Understanding Migration Progress
1. Start: `docs/migration/nextjs-migration-plan.md` (big picture)
2. Phase tracking: `docs/migration/PHASE_2A_COMPLETION.md`, `PHASE_2B_PLAN.md`
3. Current phase: `docs/implementation/PHASE_3_COMPLETION_INDEX.md`

### For Understanding Specific API Implementation
1. Master index: `docs/implementation/PHASE_3_COMPLETION_INDEX.md` (overview)
2. Phase guide: `docs/implementation/phase-3X-*.md` (detailed implementation)
3. Quick ref: `docs/api-reference/search-teams.md` (for testing)

### For Frontend Integration
1. Identify which API routes you need
2. Read relevant phase-3X implementation doc (understand data model, error codes)
3. Use api-reference for quick endpoint lookup
4. Refer to service layer docs for expected response format

---

## Naming Conventions

**Migration docs:** `PHASE_[number]_*.md`  
- Describes plan and completion status for a phase
- Located in `docs/migration/`

**Implementation docs:** `phase-[number][letter]-*.md`  
- Detailed technical implementation for a specific phase
- Located in `docs/implementation/`
- 3a = Auth, 3b = Tasks, 3c = Meetings, 3d = Notes, 3e = Agenda, 3f = Search/Teams

**API reference:** `[domain].md`  
- Quick lookup for endpoint examples
- Located in `docs/api-reference/`
- Example: `search-teams.md` for search and teams endpoints

**Index documents:** `*_COMPLETION_INDEX.md` or `*_PLAN.md`  
- Master index or planning document
- Cross-links to all related documentation

---

## Keep This Structure Going Forward

When adding new documentation:

**For migration milestones:** Create in `docs/migration/`  
Example: `PHASE_4_COMPLETION.md`

**For implementation details:** Create in `docs/implementation/`  
Example: `phase-4-performance-optimization.md`

**For API references:** Create in `docs/api-reference/`  
Example: `pagination.md`

---

## Last Updated

- 2026-05-31: Reorganized Phase 3 documentation, created this guide
