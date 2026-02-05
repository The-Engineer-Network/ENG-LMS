// Add this button to student pages for easy cache clearing
// You can add it to app/student/weeks/page.tsx temporarily

"use client"

import { RefreshCw } from "lucide-react"

export function ClearCacheButton() {
  const handleClearCache = () => {
    // Clear localStorage
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Reload page to fetch fresh data
    window.location.reload()
  }

  return (
    <button
      onClick={handleClearCache}
      className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
      title="Clear cache and reload"
    >
      <RefreshCw className="w-4 h-4" />
      Refresh Data
    </button>
  )
}
