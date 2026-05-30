# Security Checklist

**Purpose:** Pre-commit security verification for TaskManager  
**When to use:** Before every commit/PR to main  
**Severity levels:** CRITICAL (block commit) | HIGH (fix before merge) | MEDIUM (fix before launch)

---

## CRITICAL ❌ (Block Commit)

These MUST be fixed before committing:

- [ ] **No hardcoded secrets** (API keys, DB passwords, JWTs, tokens)
  - Search: `password:`, `api_key:`, `secret:`, `token:`
  - Search: Database URIs with credentials
  - All `.env` values must be in environment variables, NOT source code
  
- [ ] **All user inputs validated**
  - Validate at system boundaries (API endpoints, file uploads)
  - Use schema validation (Zod, Joi, etc.)
  - Fail fast with clear error messages
  
- [ ] **SQL/NoSQL injection prevention**
  - Use parameterized queries (Mongoose query builders, NOT string concatenation)
  - Never pass user input directly to `find()` filters without sanitization
  
- [ ] **XSS prevention (output escaping)**
  - React: Use `textContent` or proper escaping for user-generated content
  - HTML: Sanitize before rendering raw HTML
  - All user-provided text must be escaped before display

- [ ] **No console.log in production code**
  - Remove all `console.log`, `console.error`, etc. from shipped code
  - Use proper logging library (Winston, Pino, etc.)

---

## HIGH 🔴 (Fix Before Merge)

These should be fixed before the PR merges to main:

- [ ] **CSRF protection enabled**
  - SameSite cookie attributes set correctly
  - CSRF tokens on state-changing endpoints (POST, PATCH, DELETE)
  
- [ ] **Authentication verified**
  - All protected endpoints require `auth` middleware
  - Auth tokens not exposed in URLs (use headers)
  - Token expiration implemented
  
- [ ] **Authorization checks**
  - Users can only access/modify their own data
  - Check `userId` on all queries: `{ userId: req.user.id, ... }`
  - Admin endpoints protected with role checks
  
- [ ] **Rate limiting on endpoints**
  - Public endpoints: rate limit to prevent abuse
  - Auth endpoints: aggressive limits (login, password reset)
  
- [ ] **Error messages don't leak sensitive data**
  - Don't expose database field names, query structures, or stack traces to client
  - Use generic error messages: "Invalid request" instead of "User with email not found"
  - Log detailed errors server-side only
  
- [ ] **CORS configured correctly**
  - Whitelist only trusted origins (not `*`)
  - `credentials: true` only when necessary
  - Current config: `http://localhost:3000`, `http://localhost:3001`, `http://localhost:3002`
  
- [ ] **Sensitive routes authenticated**
  - GET /users/:id requires auth
  - GET /tasks/:id requires auth + ownership check
  - PUT/DELETE always require auth + ownership
  
- [ ] **File upload handling**
  - If implemented: validate file types, size limits
  - Store outside web root
  - Serve with `Content-Disposition: attachment` to prevent XSS

---

## MEDIUM 🟠 (Fix Before Launch to Production)

These should be addressed before real users:

- [ ] **Password requirements**
  - Minimum length: 8 characters
  - Complexity: uppercase, lowercase, number, symbol (or equivalent strength check)
  - Hash algorithm: bcrypt with salt (currently using bcrypt ✅)
  
- [ ] **Data encryption at rest**
  - Sensitive fields: encrypted before storage (email, phone, PII)
  - MongoDB: enable encryption at rest (Atlas supports this)
  
- [ ] **HTTPS enforcement**
  - All traffic must be HTTPS (not HTTP)
  - HSTS headers set
  - Redirect HTTP → HTTPS
  
- [ ] **Secure headers**
  - `Content-Security-Policy`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  
- [ ] **Logging & monitoring**
  - Log authentication events (login, logout, failed attempts)
  - Log sensitive operations (delete, export, permission changes)
  - Logs stored securely, not accessible to users
  
- [ ] **Dependency scanning**
  - Run: `npm audit` (fix HIGH/CRITICAL)
  - Review new dependencies before adding
  - Update dependencies regularly
  
- [ ] **Secrets rotation policy**
  - Document how to rotate: API keys, DB passwords, JWT secret
  - Implement automatic rotation (if applicable)

---

## Recurring Meetings Specific (Phase 2-B8)

### Data Validation

- [ ] **RRULE validation**
  - Only accept: FREQ=DAILY|WEEKLY|MONTHLY|YEARLY
  - Validate DTSTART format (ISO 8601)
  - Prevent infinite recurrence without end date (add max years limit)
  - Reject malformed RRULE strings
  
  **Code example:**
  ```javascript
  if (meeting.rrule) {
    try {
      const rule = RRule.fromString(meeting.rrule);
      // Validate frequency
      if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(rule.freq)) {
        throw new Error('Invalid frequency');
      }
    } catch (err) {
      return handleError(res, 400, 'Invalid recurrence rule');
    }
  }
  ```

- [ ] **Date range validation**
  - exceptedDates must be valid YYYY-MM-DD format
  - Prevent excepting dates outside RRULE range
  - Limit expansion to reasonable range (e.g., ±5 years from today)

### Access Control

- [ ] **Recurring edit only by owner**
  - Verify `userId === req.user.id` on PATCH /meetings/:id/recurring
  - Check base meeting ownership, not just base ID
  
- [ ] **Scope validation**
  - Only accept: scope = 'this' | 'following' | 'all'
  - Only accept: action = 'edit' | 'delete'
  - Reject invalid combinations

---

## API Endpoints Security Review

### GET /agenda/month

- [ ] Returns only user's own meetings, tasks, notes
- [ ] Date range validation (prevent year 2000 → 3000 queries)
- [ ] Response doesn't leak other users' data

### POST /meetings

- [ ] Auth required
- [ ] User ID set from `req.user.id`, not request body
- [ ] RRULE validated if provided
- [ ] Date validation

### PATCH /meetings/:id/recurring

- [ ] Auth required
- [ ] Ownership verification
- [ ] Scope + action validation
- [ ] Date validation
- [ ] RRULE manipulation safe (no injection)

### GET /search

- [ ] Auth required
- [ ] Search term length validation (prevent DOS via huge queries)
- [ ] Returns only user's own data
- [ ] Score/snippet don't leak sensitive data

---

## Testing & Verification

- [ ] **Run security-reviewer agent** before PRs
- [ ] **Manual testing:**
  - Try to access another user's meeting (should fail)
  - Try invalid RRULE format (should reject)
  - Try XSS payload in title: `<img src=x onerror=alert(1)>` (should be escaped)
  - Try SQL injection: `'; DROP TABLE meetings; --` (should fail safely)
  
- [ ] **Dependency audit:**
  ```bash
  npm audit --audit-level=high
  ```

---

## Current Status

| Item | Status | Notes |
|------|--------|-------|
| Hardcoded secrets | ✅ PASS | Using .env, no secrets in code |
| Input validation | 🟡 PARTIAL | RRULE validation added, task/note validation existing |
| Auth middleware | ✅ PASS | Auth required on protected endpoints |
| Ownership checks | 🟡 PARTIAL | Meetings checked, verify all endpoints |
| Error messages | 🟡 PARTIAL | Some generic, some may leak data — review |
| CORS | ✅ PASS | Whitelisted origins configured |
| console.log | 🟡 PARTIAL | rruleExpander has console.error — OK for logging, change to logger in Phase 3 |
| HTTPS | ❌ NOT YET | Local development only (HTTP OK), required for production |
| Rate limiting | ❌ NOT YET | No rate limiting implemented yet |

---

## Phase 3 Security Tasks

- [ ] Remove console.log/error, use proper logging library
- [ ] Add rate limiting to public endpoints
- [ ] Implement HTTPS + HSTS headers
- [ ] Add Content-Security-Policy header
- [ ] Encrypt sensitive fields at rest (email, etc.)
- [ ] Password requirement enforcement
- [ ] Audit logging for sensitive operations

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Last Reviewed

**Date:** 2026-05-29  
**Reviewer:** [Your name]  
**Next Review:** Before Phase 3 (performance hardening)
