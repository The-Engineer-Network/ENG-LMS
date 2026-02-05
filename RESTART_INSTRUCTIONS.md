# Fix for Supabase Hanging Issue

## The Problem
Supabase works fine in a standalone HTML file but hangs in your Next.js app. This suggests Next.js dev server is interfering.

## Solution Steps:

### 1. Stop your Next.js dev server
Press `Ctrl+C` in the terminal where `npm run dev` is running

### 2. Clear Next.js cache
```bash
rm -rf .next
```

On Windows:
```cmd
rmdir /s /q .next
```

### 3. Clear node_modules cache (optional but recommended)
```bash
rm -rf node_modules/.cache
```

On Windows:
```cmd
rmdir /s /q node_modules\.cache
```

### 4. Restart the dev server
```bash
npm run dev
```

### 5. Hard refresh your browser
- Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or open DevTools > Network tab > Check "Disable cache"

### 6. Try creating a lesson again

## If it still doesn't work:

Try opening your app in an **incognito/private window** to rule out browser extensions interfering.

## Alternative: Use the working HTML test
Since the HTML test works, you could temporarily use that to create lessons while we debug the Next.js issue.
