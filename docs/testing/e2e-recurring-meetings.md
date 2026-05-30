# E2E Testing Plan: Recurring Meetings (Phase 2-B8)

**Status:** Phase 2-B8 implementation complete, ready for testing  
**Last Updated:** 2026-05-29  
**Feature:** Recurring meetings with scoped edit/delete (this/following/all)

---

## Setup

### Prerequisites
- Server running on port 5001: `cd server && npm start`
- Client running on port 3001: `cd client && npm run dev`
- Browser: Open `http://localhost:3001`
- Logged in with a test user account

### Duration
Estimated **30–45 minutes** to complete all phases.

---

## Test Phases

### Phase 1: CREATE a Recurring Meeting ✅

**Objective:** Verify recurring meeting creation with frequency selection

**Steps:**
1. Navigate to Dashboard → Calendar widget
2. Click **"+ Meeting"** button
3. Fill in meeting details:
   - **Title:** `"Weekly Team Standup"`
   - **Date:** Today's date
   - **Start Time:** `10:00 AM`
   - **End Time:** `10:30 AM`
   - **Description:** `"Daily sync"`
4. In **RecurrenceSelector**, select `Weekly`
5. Click the day-of-week pill matching today (e.g., "Mon")
6. Verify the selector displays `FREQ=WEEKLY;BYDAY=MO`
7. Click **Save**

**Expected Results:**
- ✅ Modal closes
- ✅ Meeting appears in Calendar with **↻ Recurring** badge
- ✅ Meeting saved to database with `rrule` and `isRecurringBase: true`

**Failure Scenarios:**
- ❌ RecurrenceSelector doesn't load → Check console for component import errors
- ❌ Badge doesn't show → Check CalendarWidget rendering logic
- ❌ Save fails → Check server logs for rrule validation

---

### Phase 2: VIEW Virtual Instances (Week View) ✅

**Objective:** Verify recurring meetings expand correctly to all occurrences

**Steps:**
1. In CalendarWidget, click **"Week"** button
2. Navigate forward using **Next Week** button (3–4 times)
3. Observe the calendar grid

**Expected Results:**
- ✅ Meeting appears on every Monday in the 7-day span
- ✅ Each instance shows **↻ Recurring** badge
- ✅ No new database entries created (virtual instances only)

**Database Check (Browser Console):**
```javascript
// Check meeting data structure
console.log(agendaData);
// Should show isRecurringInstance: true on expanded instances
// Should show _id format: `baseId_YYYY-MM-DD`
```

**Failure Scenarios:**
- ❌ Meeting only appears once → Check `fetchWeekAgenda()` expansion logic
- ❌ Dates are wrong → Check timezone handling in `expandInRange`
- ❌ Database has duplicate meetings → Expansion should be client-side only

---

### Phase 3: EDIT - Scope "This" (Single Occurrence) ✅

**Objective:** Change one instance without affecting others

**Steps:**
1. Navigate to Week view
2. Click on a Monday meeting (NOT the first occurrence created)
3. MeetingModal opens in edit mode:
   - Should show **↻ Recurring** badge
   - Should show scope picker: "This occurrence" | "This & following" | "All occurrences"
4. **Scope:** Select "This occurrence" (default)
5. Change **End Time** to `11:00 AM`
6. Click **Save**

**Expected Results:**
- ✅ Modal closes
- ✅ Original base meeting unchanged
- ✅ This ONE Monday now shows `10:00–11:00` (1 hour)
- ✅ Other Mondays still show `10:00–10:30` (30 min)
- ✅ Exception record created in database

**Database Check:**
```javascript
// Should see:
// 1. Original base meeting untouched
// 2. New exception meeting with:
//    - _id = random UUID (NOT base_YYYY-MM-DD format)
//    - recurringId = baseId
//    - isRecurringBase: false
//    - date = edited date
//    - endTime = 11:00
```

**Failure Scenarios:**
- ❌ Base meeting modified → Should add to exceptedDates, create new exception record
- ❌ All instances change → Check scope logic in MeetingModal/Dashboard
- ❌ Exception not saved → Check server `PATCH /recurring` endpoint with scope="this"

---

### Phase 4: EDIT - Scope "Following" (This & All Future) ✅

**Objective:** Split a recurring series at a point, change future occurrences

**Steps:**
1. Navigate to Week view
2. Click another Monday (not first, not exception from Phase 3)
3. MeetingModal opens
4. **Scope:** Select "This & following"
5. Change **Title** to `"Weekly Team Standup v2"`
6. Click **Save**

**Expected Results:**
- ✅ Modal closes
- ✅ Original base meeting truncated with `UNTIL = day before this Monday`
- ✅ NEW base meeting created starting THIS Monday with "v2" title
- ✅ Mondays BEFORE this point → original title
- ✅ Mondays FROM this point onward → "v2" title

**Database Check:**
```javascript
// Should see TWO base meetings:
// 1. Original base: rrule with UNTIL = [this Monday - 1 day]
// 2. New base: rrule with DTSTART = this Monday, title = "v2"
```

**Failure Scenarios:**
- ❌ Series not truncated → Check UNTIL insertion logic
- ❌ New base not created → Check `extractRrulePart()` and `buildRrule()`
- ❌ Wrong date used for UNTIL → Check date math (should be day before, not same day)

---

### Phase 5: EDIT - Scope "All" (Entire Series) ✅

**Objective:** Modify the entire recurring series at once

**Steps:**
1. Click any Monday meeting
2. MeetingModal opens
3. **Scope:** Select "All occurrences"
4. Change **Description** to `"Team sync + planning"`
5. **RecurrenceSelector should be ENABLED** (only when scope="all")
6. Click **Save**

**Expected Results:**
- ✅ Modal closes
- ✅ Base meeting is updated directly
- ✅ ALL Mondays (past and future) show new description
- ✅ RecurrenceSelector was editable (user could change frequency if desired)

**Failure Scenarios:**
- ❌ RecurrenceSelector disabled → Check conditional rendering logic
- ❌ Exceptions override new description → Exceptions should be separate, base should update independently
- ❌ Some Mondays don't update → Verify expansion logic pulls from updated base

---

### Phase 6: DELETE - Scope "This" (Skip One Occurrence) ✅

**Objective:** Cancel one meeting, keep the series intact

**Steps:**
1. Click a Monday meeting (one you want to skip)
2. MeetingModal opens
3. **Scope:** "This occurrence"
4. Click **Delete** button
5. Confirm deletion

**Expected Results:**
- ✅ Modal closes
- ✅ THIS Monday's meeting disappears from calendar
- ✅ Date added to base's `exceptedDates` array
- ✅ Other Mondays still appear with ↻ badge
- ✅ Base meeting record still in DB

**Database Check:**
```javascript
// Original base should now have:
// exceptedDates: ["2026-05-06", "2026-05-13", ...]
```

**Failure Scenarios:**
- ❌ Base deleted → Should add to exceptedDates, NOT delete base
- ❌ Future Mondays affected → Only this date should be excepted
- ❌ exceptedDates not updated → Check server `PATCH /recurring` with scope="this", action="delete"

---

### Phase 7: DELETE - Scope "Following" (Cancel Series From Here) ✅

**Objective:** End recurrence at a specific point

**Steps:**
1. Click a future Monday (you want to stop the series)
2. MeetingModal opens
3. **Scope:** "This & following"
4. Click **Delete** button

**Expected Results:**
- ✅ Modal closes
- ✅ Base meeting's RRULE updated with `UNTIL = day before this Monday`
- ✅ Mondays FROM this point forward disappear
- ✅ Earlier Mondays still appear

**Failure Scenarios:**
- ❌ Series not truncated → Check UNTIL logic
- ❌ Wrong date for UNTIL → Should be day before, not same date
- ❌ Entire series deleted → Should only update UNTIL, not delete base

---

### Phase 8: DELETE - Scope "All" (Remove Entire Series) ✅

**Objective:** Permanently delete the recurring series

**Steps:**
1. Click any Monday from the "Weekly Team Standup" series
2. MeetingModal opens
3. **Scope:** "All occurrences"
4. Click **Delete** button

**Expected Results:**
- ✅ Modal closes
- ✅ Base meeting deleted from database
- ✅ ALL Mondays disappear from all views
- ✅ Switching to Month view → no more standup meetings

**Failure Scenarios:**
- ❌ Only one instance deleted → Should delete base, not just one occurrence
- ❌ Some Mondays remain → Verify full base deletion

---

### Phase 9: Switch Views (Day → Week → Month) ✅

**Objective:** Verify recurring meetings display correctly across all view modes

**Steps:**
1. Create another recurring meeting: `"Daily Standup"` → Daily frequency
2. **Day view:** Click "Day" button → Should show today's instance
3. **Week view:** Click "Week" button → Should show instances for all 7 days
4. **Month view:** Click "Month" button → Should show event dots on each calendar day

**Expected Results:**
- ✅ Day view: Meeting with ↻ badge
- ✅ Week view: Meeting on all 7 days with ↻ badge
- ✅ Month view: Event dots (color-coded for type) on each day
- ✅ Click event dot in Month view → Switches to Day view with that day selected

**Failure Scenarios:**
- ❌ Views empty → Check `fetchDayAgenda()` / `fetchWeekAgenda()` / `fetchMonthAgenda()`
- ❌ Event dots missing → Check `buildMonthMap()` logic
- ❌ Dots don't link to Day view → Check click handler on event dots

---

### Phase 10: Edge Cases 🔍

**Objective:** Verify robustness and error handling

#### 10a: Edit → Click Month Dot → Should Land in Day View
**Steps:**
1. Edit a recurring meeting's description
2. Save
3. Switch to Month view
4. Click an event dot for that meeting
5. Should switch to Day view with correct meeting prefilled

**Expected:** Day view shows the meeting with updated description

#### 10b: Multiple Overlapping Recurring Meetings
**Steps:**
1. Create `"Daily Standup"` (Daily)
2. Create `"Weekly Review"` (Weekly, same day)
3. Navigate to that day in Day/Week view

**Expected:** Both meetings display without conflicts

#### 10c: Recurrence Edit → Scope "All" → Edit Again
**Steps:**
1. Create recurring meeting
2. Edit with scope="all"
3. Edit again with scope="all"
4. Change frequency (e.g., Weekly → Monthly)

**Expected:** RecurrenceSelector is enabled, user can change frequency

#### 10d: Close Modal Without Saving
**Steps:**
1. Open meeting
2. Make changes
3. Click close/backdrop (don't click Save)
4. Reopen same meeting

**Expected:** Changes not persisted, original values shown

#### 10e: Create with No Recurrence, Then Add Later
**Steps:**
1. Create meeting WITHOUT selecting recurrence (None)
2. Edit same meeting
3. Now select Daily recurrence
4. Save with scope="all"

**Expected:** Meeting marked as recurring base, creates instances going forward

---

## Browser Console Checks

These can be run in DevTools while testing:

```javascript
// Check current agenda data structure
console.log(window.__agenda);

// Check Zustand store
import { useAppStore } from '@/store/useAppStore';
useAppStore.getState().agenda;

// Check network requests (Network tab)
// Should see: GET /agenda/month?year=...&month=...
// Should see: PATCH /meetings/:id/recurring with scope + action
```

---

## Success Criteria

All 10 phases + edge cases pass:
- ✅ Recurring meetings create correctly
- ✅ Virtual instances expand correctly
- ✅ Scoped edits (this/following/all) work independently
- ✅ Scoped deletes remove only intended instances
- ✅ Views switch cleanly with correct data
- ✅ Edge cases handled gracefully
- ✅ Database state consistent after each operation

---

## Known Limitations (Document These)

| Limitation | Reason | Workaround |
|-----------|--------|-----------|
| Can't edit past occurrences after base is deleted | Design: base deletion removes all instances | Delete with scope="this" individually, or restore from backup |
| Timezone handling | Using UTC only | Document as UTC-only for now; upgrade in Phase 3 |
| Exception editing | Can't edit an exception once created | Delete exception, recreate, or edit series with scope="this" |

---

## Bugs Found & Fixed

| Bug | Severity | Status |
|-----|----------|--------|
| RRule import (CommonJS mismatch) | CRITICAL | ✅ Fixed |
| [New bugs found during testing] | - | [Document here] |

---

## Next Steps

After all phases pass:
1. Commit with message: `feat(b8): recurring meetings with scoped edit/delete`
2. Create PR to main branch
3. Code review (security-reviewer + code-reviewer agents)
4. Deploy to staging
5. Move to Phase 3 (performance hardening)
