'use client'

import { useMemo } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

export function useSupabaseClient(): SupabaseClient {
  return useMemo(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment variables are missing')
    }
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }, [])
}
