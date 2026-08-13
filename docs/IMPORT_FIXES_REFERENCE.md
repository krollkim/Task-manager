# Import Fixes Reference - Component Migration

This document provides a detailed reference of all import pattern changes made during the Vite-to-Next.js migration.

## Import Pattern Transformations

### 1. Type Imports

**Pattern**: `../types/types`
```typescript
// BEFORE (Vite)
import { Task, Meeting, Note } from '../types/types';

// AFTER (Next.js)
import { Task, Meeting, Note } from '@/types/types';
```

**Applied to**: All components in dashboard/, auth/, chat/, modals/

---

### 2. Service Layer Imports

**Pattern**: `../services/...`
```typescript
// BEFORE (Vite)
import { loginUser, registerUser } from '../../services/AuthServices';
import { getTasks, createTask } from '../../services/TaskServices';

// AFTER (Next.js)
import { loginUser, registerUser } from '@/services/AuthServices';
import { getTasks, createTask } from '@/services/TaskServices';
```

**Files affected**:
- `auth/AuthContext.tsx`
- `auth/GoogleLogin.tsx` (uses API directly)
- Dashboard components

---

### 3. State Management (Zustand)

**Pattern**: `../store/...`
```typescript
// BEFORE (Vite)
import { useAppStore } from '../../store/useAppStore';

// AFTER (Next.js)
import { useAppStore } from '@/store/useAppStore';
```

**Files affected**:
- `dashboard/Dashboard.tsx`
- `dashboard/CommandPalette.tsx`
- `chat/ChatPanel.tsx`
- `chat/MessageBubble.tsx`

---

### 4. Hooks

**Pattern**: `../hooks/...`
```typescript
// BEFORE (Vite)
import { useAgenda } from '../../hooks/useAgenda';
import { useSearch } from '../../hooks/useSearch';
import { useSocket } from '../../hooks/useSocket';

// AFTER (Next.js)
import { useAgenda } from '@/hooks/useAgenda';
import { useSearch } from '@/hooks/useSearch';
import { useSocket } from '@/hooks/useSocket';
```

**Files affected**:
- `dashboard/Dashboard.tsx`
- `dashboard/CalendarWidget.tsx`
- `dashboard/CommandPalette.tsx`
- `chat/ChatPanel.tsx`

---

### 5. Context Imports

**Pattern**: `../contexts/...`
```typescript
// BEFORE (Vite)
import { useSocket } from '../../contexts/SocketContext';

// AFTER (Next.js)
import { useSocket } from '@/contexts/SocketContext';
```

**Files affected**:
- `chat/ChatPanel.tsx`
- `chat/MessageBubble.tsx`

---

### 6. Animation Libraries

**Pattern**: `../lib/animations`
```typescript
// BEFORE (Vite)
import { modalEnter, staggerEnter } from '../lib/animations';

// AFTER (Next.js)
import { modalEnter, staggerEnter } from '@/lib/animations';
```

**Files affected**:
- `ModalComponent.tsx`
- `modals/CommandPalette.tsx`
- Other modal components

---

### 7. CSS Imports (Removed)

**Pattern**: `../App.css`
```typescript
// BEFORE (Vite) - Components imported App.css directly
import '../App.css';

// AFTER (Next.js) - All CSS in globals.css
// No CSS import needed in components
// Utilities like .pro-glass, .pro-button-gradient, etc. are in app/globals.css
```

**Files affected**:
- `ModalComponent.tsx`
- `MeetingModal.tsx`
- `NoteModal.tsx`
- All modal components

---

### 8. Router Integration

**Pattern**: React Router → Next.js Navigation

#### useNavigate
```typescript
// BEFORE (Vite)
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');

// AFTER (Next.js)
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/dashboard');
```

#### Link Component
```typescript
// BEFORE (Vite)
import { Link } from 'react-router-dom';
<Link to="/register">Register</Link>

// AFTER (Next.js)
import Link from 'next/link';
<Link href="/register">Register</Link>
```

#### Navigate Component
```typescript
// BEFORE (Vite)
import { Navigate } from 'react-router-dom';
return <Navigate to="/login" replace />;

// AFTER (Next.js)
router.push('/login');
return null;
```

**Files affected**:
- `auth/Login.tsx`
- `auth/Register.tsx`
- `auth/ProtectedRoute.tsx`
- `dashboard/Header.tsx`

---

### 9. Environment Variables

**Pattern**: Vite env vars → Next.js public env vars

```typescript
// BEFORE (Vite)
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// AFTER (Next.js)
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
```

**Files affected**:
- `auth/AuthContext.tsx`
- `auth/GoogleLogin.tsx`

**Important**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser in Next.js.

---

### 10. Component-to-Component Relative Imports (Preserved)

**Pattern**: Relative imports within same directory remain relative
```typescript
// BEFORE (Vite)
import RecurrenceSelector from './modals/RecurrenceSelector';

// AFTER (Next.js) - stays the same
import RecurrenceSelector from './modals/RecurrenceSelector';
```

**Rationale**: Component-specific imports stay relative for better refactoring safety.

---

## Import Alias Configuration

All `@/` aliases are defined in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/app/*": ["./app/*"],
      "@/components/*": ["./app/components/*"],
      "@/types/*": ["./types/*"],
      "@/services/*": ["./lib/services/*"],
      "@/store/*": ["./app/store/*"],
      "@/hooks/*": ["./app/hooks/*"],
      "@/contexts/*": ["./app/contexts/*"],
      "@/lib/*": ["./lib/*"],
      "@/utils/*": ["./lib/utils/*"],
      "@/pages/*": ["./app/*"]
    }
  }
}
```

---

## Common Migration Patterns

### Pattern 1: Deep Relative Paths

```typescript
// BEFORE: Multiple ../../../ levels
import { Task } from '../../../types/types';
import { useAppStore } from '../../../store/useAppStore';

// AFTER: Flat @ alias paths
import { Task } from '@/types/types';
import { useAppStore } from '@/store/useAppStore';
```

### Pattern 2: React Router → Next.js

```typescript
// BEFORE
import { useNavigate, useParams, useLocation } from 'react-router-dom';
const navigate = useNavigate();
const params = useParams();
const location = useLocation();

// AFTER
import { useRouter, useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';
const router = useRouter();
const params = useParams();
const searchParams = useSearchParams();
```

### Pattern 3: Removing CSS Imports

```typescript
// BEFORE
import '../App.css';

// AFTER
// Remove entirely - styles are in:
// - app/globals.css (for global utilities)
// - component-specific Tailwind classes
```

---

## Migration Checklist

When copying additional files or creating new components:

- [ ] Replace `../types/types` with `@/types/types`
- [ ] Replace `../services/*` with `@/services/*`
- [ ] Replace `../store/*` with `@/store/*`
- [ ] Replace `../hooks/*` with `@/hooks/*`
- [ ] Replace `../contexts/*` with `@/contexts/*`
- [ ] Replace `../lib/*` with `@/lib/*`
- [ ] Replace `import.meta.env` with `process.env.NEXT_PUBLIC_*`
- [ ] Replace React Router with Next.js routing
- [ ] Remove `import '../App.css'` statements
- [ ] Add `'use client'` directive at the top
- [ ] Test in Next.js dev server

---

## Troubleshooting

### Issue: "Module not found" after migration

**Cause**: Import path doesn't match tsconfig.json aliases

**Solution**:
1. Check the actual file location
2. Verify the path alias in tsconfig.json
3. Use correct alias pattern

### Issue: Styles not loading

**Cause**: App.css imports removed but styles not in globals.css

**Solution**:
1. Check if utility classes are in app/globals.css
2. Add missing styles to globals.css
3. Verify Tailwind config includes the right paths

### Issue: Component can't access environment variables

**Cause**: Using `process.env` for non-public variables

**Solution**:
1. Only use variables with `NEXT_PUBLIC_` prefix in client components
2. Private API keys belong on the server only
3. Use API routes to access private env vars

---

## Documentation Links

- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js Path Aliases](https://nextjs.org/docs/app/building-your-application/configuring/absolute-imports-and-module-aliases)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Next.js Navigation](https://nextjs.org/docs/app/api-reference/functions/use-router)
