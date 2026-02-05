// Test Supabase connection
// Run this in your browser console or create a test page

import { supabase } from './lib/supabase'

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...')
  
  // Test 1: Simple select
  console.log('Test 1: Simple SELECT query')
  const { data: tracks, error: tracksError } = await supabase
    .from('tracks')
    .select('id, name')
    .limit(1)
  
  console.log('Tracks result:', { tracks, tracksError })
  
  // Test 2: Check auth status
  console.log('Test 2: Check auth status')
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  console.log('Auth session:', { session, authError })
  
  // Test 3: Try RPC call
  console.log('Test 3: Test RPC call')
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_lesson_rpc', {
      lesson_data: {
        title: 'TEST',
        type: 'video',
        content: '',
        video_url: '',
        duration: '',
        week_id: 'adc6b1b7-ff68-4140-bb75-d4dd1a43bc0c',
        order_index: 1
      }
    })
    console.log('RPC result:', { rpcData, rpcError })
  } catch (err) {
    console.error('RPC error:', err)
  }
  
  console.log('Connection test complete!')
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  testSupabaseConnection()
}
