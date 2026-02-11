'use client'

import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Sparkles, CheckCircle, ArrowRight, Brain, Shield, ExternalLink, Gem, Loader2 } from 'lucide-react'

export default function Upgrade() {
  const [isLoading, setIsLoading] = useState(false)

  // LINKS
  const EXTERNAL_PORTFOLIO_LINK = "https://www.lolade-ajai.com/services" 

  const digitalFeatures = [
    "Full Sensory Coaching Library",
    "Longitudinal Progress Tracking",
    "Priority Access to New Protocols",
    "Full Somatic Insights & Strategy"
  ]

  const privateFeatures = [
    "NeuroDesign Blueprint™ Foundation",
    "End to End Design Service",
    "Turnkey Implementation & Styling"
  ]

  // This function triggers the Stripe Checkout using your Vercel Keys
  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // We send the Price ID we just set in your Environment Variables
        body: JSON.stringify({ 
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID 
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        console.error('Stripe error:', data);
        alert('Payment system is initializing. Please try again in a moment.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12 flex flex-col justify-center">
        
        <div className="max-w-6xl mx-auto w-full">
          
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-4">
              Choose your level of <span className="text-[#b5a642]">integration.</span>
            </h1>
            <p className="text-[#c9ccbb]/70 max-w-2xl mx-auto text-lg">
              Whether you need the tools to self-regulate or a complete environmental transformation, we have a path for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* OPTION 1: FOUNDATION ACCESS (Digital) */}
            <div className="glass-panel p-10 rounded-3xl border border-[#b5a642]/20 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 bg-[#b5a642] text-[#1b270e] text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-bl-xl">
                Recommended
              </div>
              
              <div className="mb-8">
                <div className="w-12 h-12 bg-[#b5a642]/10 rounded-full flex items-center justify-center text-[#b5a642] mb-6">
                  <Brain size={24} />
                </div>
                {/* UPDATED TITLE */}
                <h3 className="text-2xl font-serif text-[#c9ccbb] mb-2">Foundation Access</h3>
                <p className="text-[#cfc993]/70 text-sm h-10">
                  The intelligence layer for interior design. Methodology, audits, and regulation protocols.
                </p>
              </div>

              <div className="mb-8">
                {/* UPDATED PRICE */}
                <span className="text-4xl font-serif text-[#c9ccbb]">€49.00</span>
                <span className="text-[#cfc993]/70 text-sm"> / month</span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {digitalFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#c9ccbb] text-sm">
                    <CheckCircle size={16} className="text-[#b5a642] shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* UPDATED BUTTON: Calls API instead of simple link */}
              <button 
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-[#b5a642] text-[#1b270e] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#d4c55e] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>Processing <Loader2 size={16} className="animate-spin" /></>
                ) : (
                  <>Start Membership <ArrowRight size={16} /></>
                )}
              </button>
              
              {/* UPDATED TEXT COLOR: Now using the headline color for better readability */}
              <div className="mt-4 flex justify-center items-center gap-2 text-[#c9ccbb] text-[10px] uppercase tracking-widest">
                <Shield size={12} /> Secure Stripe Payment • 30-Day Guarantee
              </div>
            </div>

            {/* OPTION 2: PRIVATE PRACTICE (High Ticket) */}
            <div className="glass-panel p-10 rounded-3xl border border-[#c9ccbb]/10 flex flex-col bg-[#000]/20">
              
              <div className="mb-8">
                <div className="w-12 h-12 bg-[#c9ccbb]/5 rounded-full flex items-center justify-center text-[#c9ccbb] mb-6">
                  <Gem size={24} />
                </div>
                <h3 className="text-2xl font-serif text-[#c9ccbb] mb-2">Interior Design Service</h3>
                <p className="text-[#cfc993]/70 text-sm h-10">
                  Full-service interior design service.
                </p>
              </div>

              <div className="mb-8">
                <span className="text-2xl font-serif text-[#c9ccbb]">By Request</span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {privateFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#c9ccbb]/80 text-sm">
                    <CheckCircle size={16} className="text-[#c9ccbb]/70 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a 
                href={EXTERNAL_PORTFOLIO_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-8 py-4 border border-[#c9ccbb]/20 text-[#c9ccbb] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#c9ccbb]/5 transition-all"
              >
                Inquire for 1:1 Service <ExternalLink size={16} />
              </a>
              {/* UPDATED TEXT COLOR: Now using the headline color for better readability */}
              <div className="mt-4 text-center text-[#c9ccbb] text-[10px] uppercase tracking-widest">
                Limited Availability for 2026
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
