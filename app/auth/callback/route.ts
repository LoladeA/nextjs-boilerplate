import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // SENIOR UPGRADE: Security Validation
  // 1. Get the param
  let next = requestUrl.searchParams.get('next') ?? '/dashboard'

  // 2. Security Check: Prevent Open Redirects
  // Ensure the path starts with '/' and DOES NOT start with '//' (protocol relative)
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/dashboard' // Fallback to safe default if malicious
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 3. Dynamic Origin: Uses the request's own origin, so it works on Localhost AND Vercel automatically
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
