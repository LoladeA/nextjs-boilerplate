'use client'

import HeroSection from '@/components/HeroSection'
import WhatThisIs from '@/components/WhatThisIs'
import HowItWorks from '@/components/HowItWorks'
import WhatYouWillLearn from '@/components/WhatYouWillLearn'
import HowToUse from '@/components/HowToUse'
import AuthPlaceholder from '@/components/AuthPlaceholder'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <main className="flex flex-col">
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
