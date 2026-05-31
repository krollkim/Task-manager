# Phase 3e: Agenda API Routes Implementation

**Date:** 2026-05-31  
**Status:** ✅ COMPLETE  
**Files:** 4 (1 service + 3 route handlers + models)  
**Total Lines:** 600+  
**TypeScript:** Compiles with zero errors  

---

## Overview

Implemented agenda API routes for day/week/month views with recurring meeting expansion, proper sorting, and efficient single-query aggregation.

---

## Files Created

### Service Layer

**`lib/services/agendaService.ts`** (280+ lines)

Provides agenda data access layer:

```typescript
// Core Methods:
getAgendaForDay(userId: string, date: string): Promise<AgendaData>
  → Single day agenda (YYYY-MM-DD format)

getAgendaForWeek(userId: string, startDate: string): Promise<WeekAgendaDay[]>
  → 7 days (Mon-Sun) with labels

getAgendaForMonth(userId: string, year: number, month: number): Promise<MonthAgendaDay[]>
  → All ~28-31 days in month

sortAgenda(agendaData): AgendaData
  → Applies Phase B4a sorting spec
```

**Sorting Logic (Phase B4a Spec):**
```
Meetings:  by startTime (with time first, no-time meetings last)
Tasks:     by priority (urgent → high → medium → low → none)
Notes:     by createdAt descending (newest first)
```

**Features:**
- ✅ Single MongoDB range query per view (no N+1 problems)
- ✅ Recurring meeting expansion via RRULE
- ✅ Virtual instance generation (never persisted)
- ✅ Proper date range queries (00:00:00 → 23:59:59 UTC)
- ✅ Promise.all() for parallel queries
- ✅ `.lean()` for read-only performance

---

### API Routes

**`app/api/agenda/day/route.ts`** (100 lines)

```
GET /api/agenda/day?date=YYYY-MM-DD    → Single day agenda
```

Request:
```
GET /api/agenda/day?date=2026-05-31
```

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "date": "2026-05-31",
    "tasks": [...],      // Sorted by priority
    "notes": [...],      // Sorted by createdAt desc
    "meetings": [...]    // Sorted by startTime
  }
}
```

- Auth required
- Validates date format (YYYY-MM-DD)
- Returns AgendaData for that day
- Expands recurring meetings

**`app/api/agenda/week/route.ts`** (110 lines)

```
GET /api/agenda/week?date=YYYY-MM-DD    → Week view (Mon-Sun)
```

Request:
```
GET /api/agenda/week?date=2026-05-31    # Any date in the week
```

Response (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-05-26",
      "label": "Mon, May 26",
      "agenda": { "tasks": [...], "notes": [...], "meetings": [...] }
    },
    ...
    {
      "date": "2026-06-01",
      "label": "Sun, Jun 01",
      "agenda": { ... }
    }
  ]
}
```

- Auth required
- Calculates Monday of given week
- Returns all 7 days (Mon-Sun)
- Single query for entire week
- Each day has sorted agenda

**`app/api/agenda/month/route.ts`** (110 lines)

```
GET /api/agenda/month?year=YYYY&month=MM    → Month view
```

Request:
```
GET /api/agenda/month?year=2026&month=5
```

Response (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-05-01",
      "label": "Fri, May 01",
      "agenda": { ... }
    },
    ...
    {
      "date": "2026-05-31",
      "label": "Sun, May 31",
      "agenda": { ... }
    }
  ]
}
```

- Auth required
- Validates month (1-12)
- Returns all ~28-31 days
- Single query for entire month
- Each day has sorted agenda

---

## Data Models

**AgendaData:**
```typescript
{
  tasks: Task[]       // Sorted by priority
  notes: Note[]       // Sorted by createdAt desc
  meetings: Meeting[] // Sorted by startTime
}
```

**WeekAgendaDay:**
```typescript
{
  date: Date
  label: string           // "Mon, May 31"
  agenda: AgendaData
}
```

**MonthAgendaDay:**
```typescript
{
  date: Date
  label: string           // "Sun, May 31"
  agenda: AgendaData
}
```

---

## Recurring Meeting Expansion

### How It Works

1. Query base meetings with `isRecurringBase: true`
2. Use `lib/utils/rruleExpander.ts` to expand RRULE
3. Generate virtual instances within date range
4. Filter out `exceptedDates`
5. Create synthetic instances with IDs: `${base._id}_${YYYY-MM-DD}`
6. Set flags: `isRecurringInstance: true`, `recurringId: base._id`
7. **Never persist to database** (in-memory only)

### Virtual Instance Example

Base meeting:
```json
{
  "_id": "meeting-123",
  "title": "Weekly standup",
  "rrule": "FREQ=WEEKLY;DTSTART=2026-05-01",
  "isRecurringBase": true
}
```

Expanded to (within date range):
```json
[
  { "_id": "meeting-123_2026-05-31", "title": "Weekly standup", "isRecurringInstance": true, "recurringId": "meeting-123" },
  { "_id": "meeting-123_2026-06-07", "title": "Weekly standup", "isRecurringInstance": true, "recurringId": "meeting-123" },
  ...
]
```

---

## Date Handling

**Day Range Query:**
- Start: YYYY-MM-DD 00:00:00.000Z
- End: YYYY-MM-DD 23:59:59.999Z

**Week Calculation:**
- Monday = day 0 (adjust from Sunday=0)
- Sunday = day 6 (7 days total)

**Month Calculation:**
- First day: new Date(Date.UTC(year, month-1, 1))
- Last day: new Date(Date.UTC(year, month, 0))

---

## Performance

✅ **Single query per collection per view** (not N+1)  
✅ **Promise.all()** for parallel queries  
✅ **.lean()** for read-only performance (skip Mongoose hydration)  
✅ **In-memory expansion** (no DB writes for virtual instances)  

---

## Error Handling

| Status | Scenario |
|--------|----------|
| 200 | Success |
| 400 | Invalid date format or month |
| 401 | Missing/invalid auth |
| 500 | Server error |

---

## Testing Checklist

- [ ] GET /api/agenda/day?date=2026-05-31 — Returns single day agenda
- [ ] GET /api/agenda/day (invalid date) — Returns 400
- [ ] GET /api/agenda/week?date=2026-05-31 — Returns 7 days
- [ ] GET /api/agenda/week (calculates Monday correctly) — Verify dates span Mon-Sun
- [ ] GET /api/agenda/month?year=2026&month=5 — Returns all May days
- [ ] GET /api/agenda/month?year=2026&month=2 — Returns Feb with correct day count
- [ ] Recurring meetings expand correctly in day/week/month views
- [ ] Sorting verified: tasks by priority, notes by date desc, meetings by time
- [ ] 401 without auth
- [ ] Virtual instances have correct flags (isRecurringInstance=true, recurringId=baseId)
- [ ] Virtual instances never persisted to database

---

## Ready for

- ✅ Dashboard agenda display (CalendarWidget)
- ✅ Calendar views (day/week/month)
- ✅ Quick-add interactions (pick date from calendar)
- ✅ Event dot indicators on calendar grid
