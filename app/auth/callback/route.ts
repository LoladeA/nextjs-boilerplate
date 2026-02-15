import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // 1. Extract the 'next' parameter with a fallback
  let next = requestUrl.searchParams.get('next') ?? '/dashboard'

  // 2. Security Check: Prevent Open Redirects
  // Ensure the path is internal (starts with '/') and not protocol-relative ('//')
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/dashboard' 
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the temporary code for a permanent session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 3. Dynamic Origin: Automatically maps to 'sentienthome.lolade-ajai.com' 
  // or localhost based on the incoming request URL.
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
