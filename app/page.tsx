import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Import your custom design components
import HeroSection from './components/HeroSection'
import WhatThisIs from './components/WhatThisIs' // "The Intelligence Layer"
import HowItWorks from './components/HowItWorks' // "The Methodology of Restoration"
import WhatYouWillLearn from './components/WhatYouWillLearn'
import HowToUse from './components/HowToUse'
import Footer from './components/Footer'

// FORCE DYNAMIC: This ensures we check the session instantly every time
export const dynamic = 'force-dynamic'

export default async function LandingPage() {
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
    <main className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <HeroSection />
      <WhatThisIs />
      <HowItWorks />
      <WhatYouWillLearn />
      <HowToUse />
      
      {/* "The Final Shift" CTA Section (If it's not inside Footer) */}
      <div className="py-24 px-6 text-center border-t border-[#c9ccbb]/10">
         <h2 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-8">
           Ready to Transform <br/> <span className="text-[#b5a642]">Your Space?</span>
         </h2>
         <a 
           href="/dashboard" 
           className="inline-flex items-center gap-2 px-8 py-4 bg-[#b5a642] text-[#1b270e] font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-[#d4c55e] transition-all hover:scale-105"
         >
           Sign Up To Begin Assessment
         </a>
      </div>

      <Footer />
    </main>
  )
}
