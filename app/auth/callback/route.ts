import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    // This exchanges the temporary code for a permanent session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // THE FIX: Redirects explicitly to Step 0
  return NextResponse.redirect(new URL('/assessments/step0', request.url))
}
