# MongoDB Connection Audit: Express vs. Next.js

**Date:** 2026-05-31  
**Status:** 🔴 **CRITICAL ISSUE FOUND**

---

## Executive Summary

The Next.js app has all the code in place to connect to MongoDB and handle authentication, **BUT the `.env.local` file has placeholder credentials instead of the real ones**. This means the app WILL NOT connect to the database.

---

## Express Server (Working) ✅

### Database Connection
**File:** `server/DB/mongoDB/connectToAtlas.js`

```javascript
const userName = config.get("DB_NAME");                    // "kimkroll2000_db_user"
const password = config.get("DB_PASSWORD");                // "z9OswbB315kx6Lw8"
const clusterUrl = "taskmanagerclusterv2.l9xc3t6.mongodb.net";
const dbName = "task_manager";

const uri = `mongodb+srv://${userName}:${password}@${clusterUrl}/${dbName}?retryWrites=true&w=majority&appName=TaskManagerClusterV2`;
```

**Credentials Source:** `server/config/default.json`
```json
{
  "DB_NAME": "kimkroll2000_db_user",
  "DB_PASSWORD": "z9OswbB315kx6Lw8",
  "NODE_ENV": "development"
}
```

**Full Connection String (Express):**
```
mongodb+srv://kimkroll2000_db_user:z9OswbB315kx6Lw8@taskmanagerclusterv2.l9xc3t6.mongodb.net/task_manager?retryWrites=true&w=majority&appName=TaskManagerClusterV2
```

### Express Routes
- ✅ `/tasks` → TaskRouter (GET, POST, PATCH, DELETE)
- ✅ `/notes` → NoteRouter (GET, POST, PATCH, DELETE)
- ✅ `/meetings` → MeetingRouter (GET, POST, PATCH, DELETE, /recurring)
- ✅ `/agenda` → AgendaRouter (GET /day, /week, /month)
- ✅ `/search` → SearchRouter (GET text search)
- ✅ `/messages` → MessageRouter
- ✅ `/teams` → TeamsRouter (GET, POST /invite, /accept)
- ✅ `/` → Auth (register, login, logout)

### Socket.io
- ✅ Running on same server as API routes
- ✅ Port: 5001
- ✅ CORS configured for localhost:3000, 3001, 3002

---

## Next.js App (Partially Configured) ⚠️

### Database Connection
**File:** `lib/db.ts`

✅ **CORRECT STRUCTURE:**
```typescript
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function dbConnect() {
  // Connection pooling with caching
  // Proper error handling
  // Works with Mongoose models
}
```

✅ **PROPER CONFIG:**
- Connection pooling ✅
- Caching to prevent multiple connections ✅
- Retry logic ✅
- Error handling ✅

### 🔴 **CRITICAL ISSUE: Wrong Credentials in .env.local**

**File:** `.env.local`

```
MONGODB_URI=mongodb+srv://user:password@taskmanagerclusterv2.l9xc3t6.mongodb.net/taskmanager
```

❌ **PROBLEM:** This is a PLACEHOLDER, not the real credentials!

**Should be:**
```
MONGODB_URI=mongodb+srv://kimkroll2000_db_user:z9OswbB315kx6Lw8@taskmanagerclusterv2.l9xc3t6.mongodb.net/task_manager
```

**Differences:**
| Part | Express | Next.js (Current) | Next.js (Should Be) |
|------|---------|-------------------|-------------------|
| User | `kimkroll2000_db_user` | `user` ❌ | `kimkroll2000_db_user` ✅ |
| Password | `z9OswbB315kx6Lw8` | `password` ❌ | `z9OswbB315kx6Lw8` ✅ |
| Database | `task_manager` | `taskmanager` ❌ | `task_manager` ✅ |
| Options | `?retryWrites=true&w=majority` | (missing) ❌ | (optional but good to have) |

### API Routes & Services (All Properly Implemented) ✅

**Auth Flow Example:**

**Route:** `app/api/auth/login/route.ts`
```typescript
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Connect to database ✅
    await dbConnect()
    
    // 2. Validate input ✅
    if (!body.email || !body.password) {
      return NextResponse.json({ success: false, error: '...' }, { status: 400 })
    }
    
    // 3. Call service ✅
    const authResult = await authenticateUser(email, body.password)
    
    // 4. Return token with HTTP-only cookie ✅
    response.cookies.set('auth-token', token, { httpOnly: true, ... })
    
    return response
  } catch (error) {
    // Error handling ✅
  }
}
```

**Service:** `lib/services/authService.ts`
```typescript
export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email)              // Query MongoDB ✅
  const passwordMatch = await comparePassword(...)       // Bcryptjs ✅
  const token = generateToken(user._id)                  // JWT ✅
  return { success: true, user, token }                  // Response ✅
}

export async function findUserByEmail(email: string) {
  const User = getUserModel()
  const user = await User.findOne({ email }).lean()      // Mongoose query ✅
  return user
}

export async function createUser(userData) {
  const hashedPassword = await hashPassword(...)         // Bcryptjs ✅
  const User = getUserModel()
  const user = await User.create({ ... })                // MongoDB insert ✅
  return user
}
```

---

## What's Implemented in Next.js ✅

### Authentication (Phase 3a)
- ✅ `POST /api/auth/register` — Create user
- ✅ `POST /api/auth/login` — Authenticate & return JWT
- ✅ `POST /api/auth/logout` — Clear session
- ✅ `lib/services/authService.ts` — All auth logic
  - Password hashing (bcryptjs) ✅
  - JWT generation & verification ✅
  - User lookup & creation ✅
  - Duplicate email prevention ✅

### Task Routes (Phase 3b)
- ✅ `GET /api/tasks` — Fetch all user tasks
- ✅ `POST /api/tasks` — Create task
- ✅ `GET /api/tasks/[id]` — Fetch single task
- ✅ `PATCH /api/tasks/[id]` — Update task
- ✅ `DELETE /api/tasks/[id]` — Delete task
- ✅ `PATCH /api/tasks/[id]/quick-reschedule`
- ✅ `lib/services/taskService.ts` — 6 service methods with MongoDB queries

### Meeting Routes (Phase 3c)
- ✅ All CRUD operations ✅
- ✅ Recurring meetings with RRULE expansion ✅
- ✅ `lib/services/meetingService.ts` with MongoDB queries ✅

### Note Routes (Phase 3d)
- ✅ All CRUD operations ✅
- ✅ `lib/services/noteService.ts` ✅

### Agenda Routes (Phase 3e)
- ✅ Day/week/month views ✅
- ✅ `lib/services/agendaService.ts` with aggregation ✅

### Search + Teams Routes (Phase 3f)
- ✅ Global search with MongoDB $text operator ✅
- ✅ Team management with invites ✅
- ✅ `lib/services/{searchService,teamService}.ts` ✅

---

## The Flow (How It Should Work)

```
1. User visits http://localhost:3000
2. Clicks "Sign In"
3. Enters email/password
4. Browser POSTs to /api/auth/login
5. Next.js route handler calls dbConnect()
6. dbConnect() reads MONGODB_URI from .env.local
7. Connects to MongoDB Atlas using Mongoose
8. authService.findUserByEmail() queries the User collection
9. Password comparison with bcryptjs
10. JWT token generated
11. User logged in ✅

BUT RIGHT NOW:
- Step 6: dbConnect() will read "mongodb+srv://user:password@..." 
- Step 7: MongoDB will reject "user:password" as invalid credentials
- Step 8-11: FAIL ❌
```

---

## Fix Required: Update .env.local

**Change from:**
```
MONGODB_URI=mongodb+srv://user:password@taskmanagerclusterv2.l9xc3t6.mongodb.net/taskmanager
```

**Change to:**
```
MONGODB_URI=mongodb+srv://kimkroll2000_db_user:z9OswbB315kx6Lw8@taskmanagerclusterv2.l9xc3t6.mongodb.net/task_manager?retryWrites=true&w=majority&appName=TaskManagerClusterV2
```

---

## Summary: What's Ready, What's Missing

| Component | Status | Notes |
|-----------|--------|-------|
| Database Connection Logic | ✅ READY | `lib/db.ts` properly configured |
| Auth Service | ✅ READY | Hashing, JWT, queries all implemented |
| API Routes (19 total) | ✅ READY | All endpoints implemented with MongoDB logic |
| Services (7 total) | ✅ READY | taskService, meetingService, noteService, etc. |
| Mongoose Models | ✅ READY | Dynamically created in services |
| **Credentials in .env.local** | ❌ **WRONG** | Using placeholder, not real credentials |
| Socket.io Integration | ⏳ TODO | Keep Express on 5001 (Phase 4) |

---

## Next Step

✅ **Update `.env.local` with real MongoDB credentials**

Once you do that, you can:
1. Start Next.js on port 3000
2. Visit login page
3. Click "Sign In"
4. Create account → should write to MongoDB ✅
5. Login → should query MongoDB ✅

---

**Ready to fix the credentials and test?** 🚀
