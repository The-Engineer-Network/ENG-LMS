// Simple in-memory cache for frequently accessed data
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class DataCache {
  private cache: Map<string, CacheEntry<any>> = new Map()

  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys())
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    })
  }

  clear(): void {
    this.cache.clear()
  }

  // Get or fetch pattern - returns cached data immediately if available
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 60000
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetchFn()
    this.set(key, data, ttl)
    return data
  }
}

export const dataCache = new DataCache()

// Cache keys
export const CACHE_KEYS = {
  TRACKS: 'tracks',
  COHORTS: 'cohorts',
  WEEKS: 'weeks',
  ALL_WEEKS: 'all_weeks',
  STUDENTS: 'students',
  SUBMISSIONS: 'submissions',
  CERTIFICATES: 'certificates',
  PARTNERS: 'partners',
  WHITELIST: 'whitelist',
  ADMIN_DASHBOARD: 'admin_dashboard',
  STUDENT_DASHBOARD: (userId: string) => `student_dashboard_${userId}`,
  STUDENT_ENROLLMENT: (userId: string) => `student_enrollment_${userId}`,
  WEEKS_BY_TRACK: (trackId: string) => `weeks_track_${trackId}`,
  WEEK_PROGRESS: (userId: string) => `week_progress_${userId}`,
}

// Cache TTLs (in milliseconds)
export const CACHE_TTL = {
  INSTANT: 10000,    // 10 seconds - for real-time data
  SHORT: 30000,      // 30 seconds - for frequently changing data
  MEDIUM: 120000,    // 2 minutes - for moderately changing data
  LONG: 300000,      // 5 minutes - for rarely changing data
  VERY_LONG: 600000, // 10 minutes - for very stable data
}
