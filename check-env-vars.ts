// Add this to your page temporarily to check env vars
// Put this at the top of app/admin/weeks/page.tsx

console.log('=== ENVIRONMENT CHECK ===')
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('SUPABASE_ANON_KEY length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length)

// Also check if supabase client is properly initialized
import { supabase } from '@/lib/supabase'
console.log('Supabase client:', supabase)
console.log('Supabase client type:', typeof supabase)
console.log('Supabase has rpc method:', typeof supabase.rpc === 'function')
