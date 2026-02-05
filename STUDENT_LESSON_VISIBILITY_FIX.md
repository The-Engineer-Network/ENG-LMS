# Student Lesson Visibility Fix

## Problem
- Admin can create lessons successfully ✅
- Lessons save to database ✅
- **Students cannot see the lessons created by admin** ❌

## Root Causes

### 1. RLS Policy Issue
The SELECT policy on the `lessons` table might be too restrictive, preventing students from reading lessons.

### 2. Cache Issue
In-memory cache on client side means students might be seeing old data even after admin creates new lessons.

### 3. No Real-time Updates
When admin creates a lesson, students don't get notified and their cached data isn't invalidated.

## Solution

### Step 1: Run Diagnostic SQL (Optional)
First, let's check what's actually in the database:

**File:** `diagnose-student-lesson-visibility.sql`

Run this in Supabase SQL Editor to see:
- How many lessons exist
- Which weeks have lessons
- RLS policy status
- If lessons are visible to authenticated users

### Step 2: Fix RLS Policies (Required)
Run this SQL script to ensure students can read lessons:

**File:** `fix-student-lesson-visibility.sql`

This will:
1. Verify lessons exist in database
2. Update SELECT policy on lessons to allow all users to read
3. Test the exact query students use
4. Show final policy summary

**Run this in Supabase SQL Editor:**
1. Go to https://mwjpvemxsaaxfri.supabase.co
2. Click "SQL Editor"
3. Copy and paste `fix-student-lesson-visibility.sql`
4. Click "Run"
5. Check for success messages

### Step 3: Code Changes (Already Applied)
The following changes have been made to help debug and fix the issue:

**1. Added logging to student pages:**
- `app/student/weeks/page.tsx` - logs enrollment and weeks data
- `app/student/weeks/[id]/page.tsx` - logs week detail and lessons

**2. Added logging to data fetching:**
- `lib/data.ts` - `getWeeksByTrack` now logs results

**3. Better error handling:**
- Console logs will show exactly what data is being fetched

## Testing Steps

### 1. Clear Browser Cache
Students need to clear their browser cache to get fresh data:

**Chrome/Edge:**
- Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
- Select "Cached images and files"
- Click "Clear data"

**Or use Incognito/Private mode:**
- Open a new incognito window
- Login as student
- Check if lessons appear

### 2. Check Console Logs
Open browser DevTools (F12) and check Console tab:

**Expected logs when student views weeks:**
```
Loading weeks data for student: [user-id]
Enrollment data: {...}
Fetching weeks for track: [track-id]
Weeks data received: [...]
Lessons in weeks: [{week: "Week 1", lessons: 2}, ...]
```

**If you see `lessons: 0` for all weeks:**
- RLS policy is blocking reads
- Run the SQL fix script

**If you see `lessons: 2` but UI shows 0:**
- Frontend rendering issue
- Check browser console for errors

### 3. Test as Student
1. Login as a student account
2. Go to "Weeks" page
3. Click on a week that should have lessons
4. Check if lessons appear in the "Lessons" section

### 4. Verify in Database
Run this quick check in Supabase SQL Editor:

```sql
-- Check lessons exist
SELECT 
  w.title as week,
  COUNT(l.id) as lesson_count
FROM weeks w
LEFT JOIN lessons l ON l.week_id = w.id
GROUP BY w.id, w.title
ORDER BY w.week_number;
```

Should show lesson counts > 0 for weeks where admin created lessons.

## Common Issues and Solutions

### Issue 1: "No lessons showing but database has them"
**Solution:** RLS policy blocking reads
- Run `fix-student-lesson-visibility.sql`
- Verify SELECT policy allows `true` (everyone can read)

### Issue 2: "Lessons show for admin but not students"
**Solution:** Different RLS policies for admin vs students
- Make sure SELECT policy uses `USING (true)` not role-based checks
- Admin and students should see same data

### Issue 3: "Old data showing, new lessons not appearing"
**Solution:** Browser cache
- Clear browser cache
- Use incognito mode
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

### Issue 4: "Console shows lessons but UI doesn't render them"
**Solution:** Frontend rendering issue
- Check if `week.lessons` is an array
- Check if lessons have required fields (id, title, type)
- Look for JavaScript errors in console

## Expected Behavior After Fix

### Admin Side:
1. Create lesson in Admin → Weeks Management
2. Lesson saves to database
3. Lesson appears in admin's week view immediately

### Student Side:
1. Student refreshes page (or clears cache)
2. Student goes to Weeks page
3. Week shows correct lesson count (e.g., "3 lessons")
4. Student clicks on week
5. All lessons appear in "Lessons" section
6. Student can click on each lesson to view content

## Verification Checklist

- [ ] Run `fix-student-lesson-visibility.sql` in Supabase
- [ ] See success messages from SQL script
- [ ] Clear browser cache or use incognito mode
- [ ] Login as student
- [ ] Check console logs show lessons data
- [ ] Verify lessons appear in UI
- [ ] Click on a lesson to view details
- [ ] Confirm video/content loads properly

## If Still Not Working

1. **Check console logs** - Share any errors you see
2. **Run diagnostic SQL** - Share the results
3. **Check Network tab** - See if API calls are returning lesson data
4. **Verify student enrollment** - Make sure student is enrolled in correct track

The most common issue is RLS policies blocking reads. The SQL fix script should resolve this.
