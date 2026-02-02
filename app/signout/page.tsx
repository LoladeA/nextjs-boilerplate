'use client';

import { createClient } from '../lib/supabase';

async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export default function SignOut() {
  return (
    <button onClick={signOut}>Sign Out</button>
  );
}
