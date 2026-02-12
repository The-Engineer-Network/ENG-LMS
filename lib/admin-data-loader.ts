// Optimized data loader for admin pages with parallel loading and caching
import { dataCache, CACHE_KEYS, CACHE_TTL } from './cache'

interface AdminDataLoaderOptions {
  useCache?: boolean
  parallel?: boolean
}

export class AdminDataLoader {
  private static instance: AdminDataLoader
  private loadingPromises: Map<string, Promise<any>> = new Map()

  private constructor() {}

  static getInstance(): AdminDataLoader {
    if (!AdminDataLoader.instance) {
      AdminDataLoader.instance = new AdminDataLoader()
    }
    return AdminDataLoader.instance
  }

  // Deduplicate concurrent requests for the same data
  private async deduplicateRequest<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)!
    }

    const promise = fetcher().finally(() => {
      this.loadingPromises.delete(key)
    })

    this.loadingPromises.set(key, promise)
    return promise
  }

  // Load admin dashboard data with optimizations
  async loadDashboardData(options: AdminDataLoaderOptions = {}) {
    const { useCache = true } = options

    if (useCache) {
      const cached = dataCache.get('admin_dashboard')
      if (cached) return cached
    }

    return this.deduplicateRequest('admin_dashboard', async () => {
      const [dashboardData, analyticsData] = await Promise.all([
        fetch('/api/admin/dashboard').then(r => r.json()),
        fetch('/api/admin/analytics').then(r => r.json())
      ])

      const result = { dashboardData, analyticsData }
      dataCache.set('admin_dashboard', result, CACHE_TTL.SHORT)
      return result
    })
  }

  // Load students with pagination and caching
  async loadStudents(options: AdminDataLoaderOptions = {}) {
    const { useCache = true } = options

    if (useCache) {
      const cached = dataCache.get(CACHE_KEYS.STUDENTS)
      if (cached) return cached
    }

    return this.deduplicateRequest('students', async () => {
      const [studentsData, tracksData, cohortsData] = await Promise.all([
        fetch('/api/admin/students').then(r => r.json()),
        fetch('/api/tracks').then(r => r.json()),
        fetch('/api/cohorts').then(r => r.json())
      ])

      const result = { students: studentsData, tracks: tracksData, cohorts: cohortsData }
      dataCache.set(CACHE_KEYS.STUDENTS, result, CACHE_TTL.SHORT)
      return result
    })
  }

  // Load weeks and lessons with optimizations
  async loadWeeksData(trackId: string, options: AdminDataLoaderOptions = {}) {
    const { useCache = true } = options
    const cacheKey = `weeks_${trackId}`

    if (useCache) {
      const cached = dataCache.get(cacheKey)
      if (cached) return cached
    }

    return this.deduplicateRequest(cacheKey, async () => {
      const response = await fetch(`/api/weeks?trackId=${trackId}`)
      const data = await response.json()
      
      dataCache.set(cacheKey, data, CACHE_TTL.MEDIUM)
      return data
    })
  }

  // Clear specific cache
  clearCache(key: string) {
    dataCache.delete(key)
    this.loadingPromises.delete(key)
  }

  // Clear all admin caches
  clearAllCaches() {
    dataCache.clear()
    this.loadingPromises.clear()
  }
}

export const adminDataLoader = AdminDataLoader.getInstance()
