'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function SignOutPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function signout() {
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    }
    signout()
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-[#1b270e] flex items-center justify-center text-[#c9ccbb]">
      <p className="animate-pulse">Signing out...</p>
    </div>
  )
}
