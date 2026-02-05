// Suppress AbortError in console (Next.js 15 known issue)
if (typeof window !== 'undefined') {
  const originalError = console.error
  console.error = (...args: any[]) => {
    if (
      args[0]?.name === 'AbortError' ||
      args[0]?.toString?.().includes('AbortError') ||
      args[0]?.toString?.().includes('signal is aborted')
    ) {
      return
    }
    originalError.apply(console, args)
  }
}

export {}
