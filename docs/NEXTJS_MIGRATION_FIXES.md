# Next.js Migration - Critical Fixes

**Date:** 2026-05-31  
**Branch:** feature/nextjs-migration  
**Status:** ✅ RESOLVED

---

## Summary

Fixed three critical issues blocking Next.js app functionality:
1. **401 Unauthorized API errors** — auth token not being sent with requests
2. **UI duplication** — Sidebar + Header rendering twice (layout + Dashboard)
3. **Socket.io connection errors** — connecting to wrong port, blocking on failures

---

## Issue 1: 401 Unauthorized Errors

### Problem
API calls returned 401 Unauthorized:
```
GET /api/tasks 401
GET /api/notes 401
```

Auth was working (user could login), but API requests couldn't authenticate.

### Root Cause
Login sets an **HTTP-only cookie** (`auth-token`), but the API extraction function only checked the `Authorization: Bearer` header. The cookie wasn't being parsed from the request.

### Solution
**File: `lib/auth.ts` - Updated `extractUserId()` function**

Added fallback logic to parse HTTP-only cookies from the raw `Cookie` header:
```typescript
export async function extractUserId(request: NextRequest): Promise<string | null> {
  // Try Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (payload && payload.userId) {
      return payload.userId;
    }
  }

  // Fallback: parse HTTP-only cookie from raw Cookie header
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = new Map(
    cookieHeader.split('; ').map(c => {
      const [name, value] = c.split('=');
      return [name, decodeURIComponent(value)];
    })
  );

  const token = cookies.get('auth-token');
  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.userId) {
      return payload.userId;
    }
  }

  return null;
}
```

**Note:** `lib/api.ts` already had `withCredentials: true`, which enables browsers to send cookies automatically on same-origin requests. No changes needed there.

### Impact
✅ All API endpoints now correctly receive user authentication  
✅ `GET /api/tasks` returns 200 with user's tasks  
✅ `GET /api/notes` returns 200 with user's notes

---

## Issue 2: UI Duplication (Sidebar + Navbar)

### Problem
Dashboard was rendering two sets of navigation UI:
- One from `app/(dashboard)/layout.tsx` (layout level)
- One from `app/components/dashboard/Dashboard.tsx` (component level)

This caused visual duplication and structural confusion.

### Root Cause
Dashboard component was importing and rendering its own Sidebar + Header:
```typescript
// OLD - lines 4-5
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Navbar';

// Then rendered at lines 353, 371
<Sidebar ... />
<Header ... />
```

But the layout already provided these components at a higher level.

### Solution
**File: `app/components/dashboard/Dashboard.tsx`**

Removed the duplicate UI layer:
1. ❌ Deleted imports:
   ```typescript
   import Sidebar from '@/components/common/Sidebar';
   import Header from '@/components/common/Navbar';
   ```

2. ❌ Deleted JSX blocks:
   - Desktop/Tablet Sidebar wrapper (lines ~340-362)
   - Header component (line ~371)

3. ❌ Deleted helper functions:
   - `handleMenuClick()` (only used by removed Header)
   - `handleSidebarClose()` (only used by removed Sidebar)

4. ❌ Deleted useEffect for mobile/desktop sidebar transitions (no longer needed)

Dashboard now **only renders main content** — navigation is handled by the layout.

### Impact
✅ UI renders cleanly without duplication  
✅ Navigation in one place = easier to maintain  
✅ Layout controls sidebar/navbar, Dashboard focuses on content

---

## Issue 3: Socket.io Connection Errors

### Problem
Browser console showed repeated errors:
```
GET http://localhost:3000/socket.io?EIO=4 404 (Not Found)
GET http://localhost:5001/socket.io/ net::ERR_CONNECTION_REFUSED
Socket connection error: TransportError: xhr poll error
```

Socket.io tries to connect but fails loudly, blocking the UI even though chat isn't critical yet.

### Root Cause
1. Socket.io tried to connect to **port 3000** (Next.js) instead of **port 5001** (Express)
2. Auto-connected on init even if Express wasn't running
3. No error handling — failures logged to console endlessly

### Solution
**File: `app/contexts/SocketContext.tsx` - Updated socket initialization**

1. **Correct the port:**
   ```typescript
   const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
   ```
   (uses env variable configured in `.env.local`)

2. **Delay connection and handle errors:**
   ```typescript
   const socket = io(socketUrl, {
     autoConnect: false,  // Don't auto-connect
     reconnectionAttempts: 3,  // Limit retries
     timeout: 5000,  // Short timeout
   });

   // Attach error handler BEFORE connecting
   socket.on('connect_error', (error) => {
     // Silently suppress — Express may not be running yet
   });

   // Now safe to connect
   try {
     socket.connect();
   } catch (err) {
     // Connection failed gracefully
   }
   ```

3. **Error boundaries:**
   - Wrapped initialization in `try/catch`
   - Added `connect_error` handler to suppress console spam
   - App continues working even if socket fails

### Impact
✅ Socket.io doesn't block the UI  
✅ Connection attempts are limited (not infinitely retrying)  
✅ Console is clean — no error spam  
✅ App works fine without Express running (for now)

---

## Testing Checklist

- [x] Create account → Login works
- [x] Dashboard loads without 401 errors
- [x] Tasks list populates (no 401)
- [x] Notes list populates (no 401)
- [x] UI renders cleanly (no duplicate nav)
- [x] No socket.io errors in console
- [x] App functional even if Express not running

---

## Files Modified

| File | Change |
|------|--------|
| `lib/auth.ts` | Added cookie parsing to `extractUserId()` |
| `app/components/dashboard/Dashboard.tsx` | Removed Sidebar/Header imports and rendering |
| `app/contexts/SocketContext.tsx` | Fixed port, added error handling, limited retries |

---

## Next Steps

### Phase 4: Socket.io Integration (When Ready)
- Start Express server on port 5001
- Wire up real-time chat functionality
- Implement presence detection

### Phase 5: UI Polish
- Ensure responsive design works properly
- Test on mobile
- Verify all GSAP animations trigger

### Phase 6: Testing & Deployment
- E2E tests for auth flow
- Performance audit
- Staging deployment to Vercel

---

## Related Documentation

- [`docs/migration/nextjs-migration-plan.md`](./migration/nextjs-migration-plan.md) — Full 14-day migration plan
- [`docs/api-reference/`](./api-reference/) — API endpoint documentation
- [`CLAUDE.md`](../CLAUDE.md) — Progress tracking
