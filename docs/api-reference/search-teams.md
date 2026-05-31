# API Reference: Search & Teams Routes

## Quick API Reference

### Search Endpoints

#### GET /api/search
Global search across tasks, notes, meetings, and messages.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| q | string | Yes | - | Search query (min 2 chars) |
| types | string | No | task,note,meeting,message | Comma-separated types to search |
| limit | number | No | 10 | Results per type (max 50) |

**Example Requests:**
```bash
# Search all types for "meeting"
curl "http://localhost:3000/api/search?q=meeting"

# Search only tasks and notes
curl "http://localhost:3000/api/search?q=urgent&types=task,note"

# Get more results
curl "http://localhost:3000/api/search?q=project&limit=20"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "uuid",
        "title": "Task title",
        "type": "task",
        "score": 2.5,
        "snippet": "Task description excerpt..."
      }
    ],
    "notes": [
      {
        "_id": "uuid",
        "title": "Note title",
        "type": "note",
        "score": 2.0,
        "snippet": "Note content excerpt..."
      }
    ],
    "meetings": [],
    "messages": []
  }
}
```

**Error Responses:**
- 400: Query < 2 chars or invalid types
- 500: Database error

---

### Team Endpoints

#### GET /api/teams
Get all team members and pending invites for a workspace.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| workspaceId | string | No | default | Workspace identifier |

**Example Requests:**
```bash
# Default workspace
curl "http://localhost:3000/api/teams"

# Specific workspace
curl "http://localhost:3000/api/teams?workspaceId=acme-corp"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "_id": "uuid",
        "userId": "user123",
        "teamId": "default",
        "role": "owner",
        "createdAt": "2026-05-31T12:00:00Z"
      }
    ],
    "pendingInvites": [
      {
        "_id": "uuid",
        "token": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "teamId": "default",
        "expiresAt": "2026-06-07T12:00:00Z",
        "accepted": false,
        "createdAt": "2026-05-31T12:00:00Z"
      }
    ],
    "workspaceId": "default"
  }
}
```

---

#### POST /api/teams/invite
Create an invite link for someone to join the workspace.

**Request Body:**
```json
{
  "email": "user@example.com",
  "workspaceId": "default"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/teams/invite \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","workspaceId":"default"}'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "inviteUrl": "http://localhost:3000/join/550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "token": "550e8400-e29b-41d4-a716-446655440000",
    "expiresIn": "7 days"
  }
}
```

**Error Responses:**
- 400: Missing email or invalid format
- 500: Database error

**Notes:**
- Returns existing token if invite already pending (idempotent)
- Token expires in 7 days
- Share `inviteUrl` with the user to accept the invite

---

#### POST /api/teams/invite/:token/accept
Accept an invite and join the workspace.

**URL Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Invite token from email/URL |

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/teams/invite/550e8400-e29b-41d4-a716-446655440000/accept"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Invite accepted successfully",
    "workspaceId": "default",
    "role": "member",
    "userId": "user123"
  }
}
```

**Error Responses:**
- 400: Token invalid or wrong status
- 404: Token not found
- 410: Invite expired
- 500: Database error

**Notes:**
- Automatically creates TeamMember record with 'member' role
- Invite marked as 'accepted' after successful join
- User immediately has access to workspace

---

#### GET /api/teams/members
Get all members of a workspace.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| workspaceId | string | No | default | Workspace identifier |

**Example Requests:**
```bash
# Default workspace
curl "http://localhost:3000/api/teams/members"

# Specific workspace
curl "http://localhost:3000/api/teams/members?workspaceId=acme-corp"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "uuid",
      "userId": "user123",
      "teamId": "default",
      "role": "owner",
      "createdAt": "2026-05-31T12:00:00Z"
    },
    {
      "_id": "uuid",
      "userId": "user456",
      "teamId": "default",
      "role": "member",
      "createdAt": "2026-05-31T14:00:00Z"
    }
  ],
  "meta": {
    "total": 2,
    "workspaceId": "default"
  }
}
```

---

## Common Workflows

### Inviting a User
```bash
# 1. Create invite
RESPONSE=$(curl -X POST http://localhost:3000/api/teams/invite \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}')

# Extract URL from response
INVITE_URL=$(echo $RESPONSE | jq -r '.data.inviteUrl')

# 2. Share $INVITE_URL with user via email

# 3. User accepts (called from /join/[token] page)
curl -X POST "$INVITE_URL/accept"
```

### Searching and Filtering
```bash
# Search all (default)
curl "http://localhost:3000/api/search?q=project"

# Search specific type
curl "http://localhost:3000/api/search?q=meeting&types=meeting"

# Multiple types
curl "http://localhost:3000/api/search?q=team&types=task,note,meeting"

# Paginate results
curl "http://localhost:3000/api/search?q=urgent&limit=5"
```

### Team Management
```bash
# Get all workspace info
curl "http://localhost:3000/api/teams"

# Get just members
curl "http://localhost:3000/api/teams/members"
```

---

## Status Codes Reference

| Code | Meaning | Routes |
|------|---------|--------|
| 200 | Success | GET, POST (accept) |
| 201 | Created | POST (create invite) |
| 400 | Bad request | All |
| 404 | Not found | POST accept |
| 410 | Gone (expired) | POST accept |
| 500 | Server error | All |

---

## Authentication Integration (TODO)

All routes currently use `placeholder-user-id`. When auth is implemented:

1. Extract userId from request headers:
   ```typescript
   const userId = extractUserId(request.headers);
   if (!userId) return 401 Unauthorized
   ```

2. Filter by userId where appropriate:
   - Search: Filter tasks/notes/meetings by userId
   - Teams: Verify user belongs to workspace

3. Replace placeholder userId in:
   - `/api/search` (line 45)
   - `/api/teams` (line ~20)
   - `/api/teams/invite` (userId for invitedBy)
   - `/api/teams/invite/:token/accept` (userId for TeamMember)
   - `/api/teams/members` (verify workspace access)

---

## Implementation Details

### Search Performance
- Uses MongoDB text indexes for O(log n) performance
- `.lean()` queries for faster document retrieval
- Parallel execution ready (results computed independently)
- Score-based sorting for relevance

### Team Invite System
- 7-day TTL on tokens (automatic expiration via MongoDB TTL index)
- Duplicate detection prevents multiple pending invites
- UUID tokens for security
- Proper error status codes guide client retry logic

### Data Isolation
- Workspace-based isolation (workspaceId field)
- Users belong to workspaces via TeamMember records
- Default workspace: 'default'
- Support for multi-workspace architecture

---

## Files Modified

- `/app/api/search/route.ts` - Search endpoint
- `/app/api/teams/route.ts` - Team info endpoint
- `/app/api/teams/invite/route.ts` - Create invite
- `/app/api/teams/invite/[token]/accept/route.ts` - Accept invite
- `/app/api/teams/members/route.ts` - List members
- `/lib/services/searchService.ts` - Search service
- `/lib/services/teamService.ts` - Team service
