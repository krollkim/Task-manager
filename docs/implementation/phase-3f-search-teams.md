# Phase 3f: Search + Teams API Routes Implementation

**Date:** 2026-05-31  
**Status:** COMPLETE  
**Commit Ready:** YES

## Overview

Implemented Phase 3f of the Next.js migration: Global search and team management API routes with full MongoDB text search integration and team invite system.

## Files Created

### Service Layer (lib/services/)

#### `lib/services/searchService.ts` (3.3 KB)
- **searchAll(userId, query, types[], limit)** - MongoDB text search across all collections
  - Searches Task, Note, Meeting, Message models with text indexes
  - Returns typed `SearchResults` with score ranking and snippets
  - Filters by userId (except messages, which are shared)
  - Limits results to max 50 per query, default 10 per type
  - Uses `.lean()` for performance optimization

**Key Features:**
- MongoDB `$text` operator with `$meta: 'textScore'` for relevance ranking
- Snippet extraction (first 100 chars)
- Type-safe return values matching `SearchResults` interface
- Error handling with descriptive messages

#### `lib/services/teamService.ts` (4.3 KB)
- **createInvite(invitedBy, email, workspaceId)** - Generate unique invite tokens
  - Auto-detects duplicate pending invites, returns existing token
  - Sets 7-day TTL on `expiresAt` field
  - Validates email format
  - Returns both token and full invite URL
  - Uses UUID for token generation

- **acceptInvite(token, userId)** - Accept invite and add user to workspace
  - Validates token exists and not expired
  - Marks invite as 'accepted'
  - Creates/upserts TeamMember record
  - Returns workspaceId and role

- **getTeamMembers(workspaceId)** - Fetch workspace members
  - Returns all members with userId, role, joinedAt
  - Type-safe return value

- **getPendingInvites(workspaceId)** - Fetch pending invites
  - Returns pending invites only
  - Sorted by createdAt descending
  - Includes expiration date

**Key Features:**
- Duplicate invite prevention (single pending invite per email per workspace)
- Proper expiration checking
- Workspace isolation (users belong to workspaceId, default: 'default')
- Compound unique index on (userId, workspaceId) for TeamMember
- Comprehensive error messages

### API Routes (app/api/)

#### 1. GET `/api/search` (route.ts)
**Query Parameters:**
- `q` (required) - Search query, minimum 2 characters
- `types` (optional) - Comma-separated: task,note,meeting,message (default: all)
- `limit` (optional) - Results per type, default 10, max 50

**Response Format:**
```typescript
{
  success: boolean,
  data: {
    tasks?: SearchResult[],
    notes?: SearchResult[],
    meetings?: SearchResult[],
    messages?: SearchResult[]
  }
}
```

**Each SearchResult includes:**
- `_id` - Document ID
- `title` / `text` - Item title or message text
- `type` - One of: 'task' | 'note' | 'meeting' | 'message'
- `score` - MongoDB text search relevance score
- `snippet` - First 100 characters of content/description

**Status Codes:**
- 200 - Success
- 400 - Invalid query (< 2 chars) or invalid types
- 500 - Database error

**Implementation Notes:**
- Placeholder userId: 'placeholder-user-id' (replace with `extractUserId` when auth is implemented)
- Text indexes required on all models (already present)
- Uses `.lean()` for query performance
- Type validation filters out invalid types

---

#### 2. GET `/api/teams` (route.ts)
**Query Parameters:**
- `workspaceId` (optional) - Defaults to 'default'

**Response Format:**
```typescript
{
  success: boolean,
  data: {
    members: TeamMember[],
    pendingInvites: Invite[],
    workspaceId: string
  }
}
```

**Status Codes:**
- 200 - Success
- 500 - Database error

**Implementation Notes:**
- Fetches both members and pending invites in parallel
- Placeholder userId (replace with auth)

---

#### 3. POST `/api/teams/invite` (route.ts)
**Request Body:**
```typescript
{
  email: string,
  workspaceId?: string  // defaults to 'default'
}
```

**Response Format:**
```typescript
{
  success: boolean,
  data: {
    inviteUrl: string,    // Full join URL
    email: string,
    token: string,
    expiresIn: "7 days"
  }
}
```

**Status Codes:**
- 201 - Invite created
- 400 - Missing email or invalid format
- 500 - Database error

**Implementation Notes:**
- Email format validation with regex
- Returns existing token if duplicate invite found (idempotent)
- InviteUrl uses `NEXT_PUBLIC_APP_URL` env var (fallback: localhost:3000)
- Placeholder userId: 'placeholder-user-id'

---

#### 4. POST `/api/teams/invite/:token/accept` (route.ts)
**URL Parameters:**
- `token` - Invite token from email/URL

**Response Format:**
```typescript
{
  success: boolean,
  data: {
    message: string,
    workspaceId: string,
    role: string,
    userId: string
  }
}
```

**Status Codes:**
- 200 - Invite accepted
- 400 - Invalid token / wrong status
- 404 - Token not found
- 410 - Invite expired
- 500 - Database error

**Implementation Notes:**
- Validates token exists and is pending
- Checks expiration date
- Creates TeamMember record with 'member' role
- Returns appropriate HTTP status codes for different error scenarios
- Placeholder userId: 'placeholder-user-id'

---

#### 5. GET `/api/teams/members` (route.ts)
**Query Parameters:**
- `workspaceId` (optional) - Defaults to 'default'

**Response Format:**
```typescript
{
  success: boolean,
  data: TeamMember[],
  meta: {
    total: number,
    workspaceId: string
  }
}
```

**Status Codes:**
- 200 - Success
- 500 - Database error

**Implementation Notes:**
- Returns all members for workspace
- Includes meta count
- Placeholder userId (replace with auth)

---

## Database Models Used

### Text Indexes (for search)
- `Task`: `{ task: 'text', description: 'text' }`
- `Note`: `{ title: 'text', content: 'text' }`
- `Meeting`: `{ title: 'text', description: 'text' }`
- `Message`: `{ text: 'text', senderName: 'text' }`

### Collections
- `Task` - Indexed on userId
- `Note` - Indexed on userId
- `Meeting` - Indexed on userId
- `Message` - No userId filter (shared chat)
- `Invite` - Fields: token (unique), email, invitedBy, workspaceId, status, expiresAt
- `TeamMember` - Compound unique index: (userId, workspaceId)

## Environment Variables Required

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://...
```

## Type Definitions (app/types/types.ts)

All types already defined:
- `SearchResult` - Search result with score and snippet
- `SearchResults` - Grouped results by type
- `Invite` - Team invite
- `TeamMember` - Team membership record

## Authentication Integration Points

The following routes have `TODO` comments for auth integration:

1. **Search**: `GET /api/search`
   - Line: Extract userId with `extractUserId(request.headers)`
   - Filter: Tasks/Notes/Meetings by userId only

2. **Teams**: `GET /api/teams`
   - Line: Extract userId and verify workspace membership

3. **Invite Create**: `POST /api/teams/invite`
   - Line: Extract userId (invitedBy field)
   - Verify: User can create invites for workspace

4. **Invite Accept**: `POST /api/teams/invite/:token/accept`
   - Line: Extract userId (join TeamMember record)

5. **Members List**: `GET /api/teams/members`
   - Line: Extract userId
   - Verify: User belongs to workspace before listing members

**Implementation Status:** Auth layer (lib/auth.ts) exists but not yet integrated. Replace all `'placeholder-user-id'` with `extractUserId(request.headers)` when auth is ready.

## Error Handling

All routes implement:
- ✅ Try-catch with error message normalization
- ✅ Appropriate HTTP status codes
- ✅ User-friendly error messages
- ✅ Type-safe error handling (Error instanceof check)

## Performance Considerations

### Search Route
- Uses MongoDB text index for O(1) search performance
- `.lean()` query optimization (no Mongoose documents)
- Limit capped at 50 results max
- Searches executed in parallel (Promise.all ready)

### Teams Routes
- Compound indexes prevent N+1 queries
- `.lean()` on all queries
- Parallel fetches where possible (`Promise.all` in GET /teams)
- Dedupe logic prevents duplicate invites in DB

## Testing Checklist

Routes can be tested with curl or Postman:

```bash
# Search all types
curl "http://localhost:3000/api/search?q=meeting&types=task,note,meeting,message&limit=5"

# Search tasks only
curl "http://localhost:3000/api/search?q=urgent&types=task"

# Get teams
curl "http://localhost:3000/api/teams?workspaceId=default"

# Create invite
curl -X POST http://localhost:3000/api/teams/invite \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","workspaceId":"default"}'

# Accept invite
curl -X POST "http://localhost:3000/api/teams/invite/{TOKEN}/accept"

# List members
curl "http://localhost:3000/api/teams/members?workspaceId=default"
```

## Summary

✅ **Search Service** - Full MongoDB text search across all collections  
✅ **Team Service** - Invite generation, acceptance, and member management  
✅ **5 API Routes** - Complete REST endpoints with validation and error handling  
✅ **Type Safety** - Full TypeScript integration  
✅ **Performance** - Text indexes, `.lean()` queries, parallel execution  
✅ **Auth Hooks** - Clear integration points for when auth is ready  

**Ready for:** Phase 4 (Performance hardening) or direct deployment with auth layer integration.
