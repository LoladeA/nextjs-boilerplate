import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// --- YOUR DESIGN COMPONENTS ---
import HeroSection from '@/components/HeroSection'
import WhatThisIs from '@/components/WhatThisIs'
import HowItWorks from '@/components/HowItWorks'
import WhatYouWillLearn from '@/components/WhatYouWillLearn'
import HowToUse from '@/components/HowToUse'
import AuthPlaceholder from '@/components/AuthPlaceholder'
import Footer from '@/components/Footer'

// FORCE DYNAMIC: This ensures we check the session instantly every time
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // --- LOGIC LAYER (The Traffic Control) ---
  // 1. Check if the user is already logged in
  const { data: { session } } = await supabase.auth.getSession()

  // 2. If logged in, skip the landing page entirely -> Go to Dashboard
  if (session) {
    redirect('/dashboard')
  }

  // --- VISUAL LAYER (Your Design) ---
  // If NOT logged in, render your full landing page structure
  return (
    <main className="flex flex-col font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <HeroSection />
      <WhatThisIs />
      <HowItWorks />
      <WhatYouWillLearn />
      <HowToUse />
      <AuthPlaceholder />
      <Footer />
    </main>
  )
}
