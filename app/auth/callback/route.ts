import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // 1. Extract the 'next' parameter with a fallback
  let next = requestUrl.searchParams.get('next') ?? '/dashboard'

  // 2. Security Check: Prevent Open Redirects
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/dashboard' 
  }

  if (code) {
    // 🟢 THE FIX: Pass the imported cookies function directly
    const supabase = createRouteHandlerClient({ cookies })
    
    // Exchange the temporary code for a permanent session and set the cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
        console.error("Auth Callback Error:", error.message)
    }
  }

  // 🟢 THE FIX: Native Next.js URL constructor for bulletproof routing
  return NextResponse.redirect(new URL(next, request.url))
}
