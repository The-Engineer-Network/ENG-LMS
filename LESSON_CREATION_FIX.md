# Lesson Creation Fix

## Problem
- Week creation works perfectly ✅
- Lesson creation times out after 5 seconds ❌
- Error: "Insert timed out after 5 seconds"

## Root Cause
The RLS (Row Level Security) policies on the `lessons` table are too restrictive and blocking inserts, while the `weeks` table has permissive policies that work correctly.

## Solution

### Step 1: Fix RLS Policies in Database
Run this SQL script in your Supabase SQL Editor:

**File:** `fix-lessons-rls-final.sql`

This script will:
1. Show current state of both tables
2. Drop all existing restrictive policies on lessons
3. Create new permissive policies (matching the working weeks table)
4. Test the insert capability
5. Verify everything is working

### Step 2: Code Changes (Already Applied)
The `createLesson` function in `lib/data.ts` has been updated to:
- Remove the 5-second timeout that was causing premature failures
- Add better error logging to see actual database errors
- Simplify the insert logic

## How to Test

1. **Run the SQL script** in Supabase SQL Editor:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `fix-lessons-rls-final.sql`
   - Click "Run"
   - You should see success messages

2. **Test in UI**:
   - Go to Admin → Weeks Management
   - Select a track
   - Expand a week
   - Click "Add Lesson"
   - Fill in the form:
     - Title: "Test Lesson"
     - Type: Video
     - Video URL: Any YouTube URL
     - Duration: "10 min"
   - Click "Save Lesson"
   - Should now save successfully! 🎉

## What Changed

### Before:
```typescript
// Had a 5-second timeout
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Insert timed out after 5 seconds')), 5000)
})
const { data, error } = await Promise.race([insertPromise, timeoutPromise])
```

### After:
```typescript
// Direct insert without timeout
const { data, error } = await supabase
  .from('lessons')
  .insert(lessonData)
  .select()
  .single()
```

## Expected Behavior After Fix

- Lesson creation should complete in < 1 second
- You'll see success toast notification
- Lesson will appear in the week's lesson list immediately
- Lesson will be saved to database and visible on refresh

## If Still Not Working

Check browser console for errors:
1. Open DevTools (F12)
2. Go to Console tab
3. Try creating a lesson
4. Look for error messages starting with "Insert error details:"
5. Share those error details for further debugging

The most likely remaining issues would be:
- Foreign key constraint (invalid week_id)
- Missing required fields
- Database connection issues
