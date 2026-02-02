import { createServerSupabase } from '@/lib/supabase'; // your existing helper
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Default to your actual protected starting point
  const next = searchParams.get('next') ?? '/assessments/step0';

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Optional: log for debugging in Supabase logs or console
      // console.log('Session exchanged successfully');
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Optional: log error for insight
    // console.error('Code exchange failed:', error);
  }

  // Fallback — consider creating a simple /auth/error page later
  return NextResponse.redirect(`${origin}/auth/error`);
}
