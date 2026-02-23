'use client'

import { useState, useEffect } from 'react'
import { Loader2, ShieldCheck, Brain, LockOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type SubscriptionStatus = {
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | null
  tier: string | null
}

export default function UpgradePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/subscription-status')
        if (!res.ok) throw new Error('Failed to fetch subscription status')
        const data = await res.json()
        setSubscription(data)
      } catch (err) {
        console.error('Subscription fetch error:', err)
      } finally {
        setCheckingStatus(false)
      }
    }

    fetchStatus()
  }, [])

  const isPremium =
    subscription?.status === 'active' ||
    subscription?.status === 'trialing'

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize checkout')
      }

      window.location.href = data.url
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-[#1b270e] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#b5a642]" size={28} />
      </div>
    )
  }

  if (isPremium) {
    return (
      <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-serif text-[#c9ccbb] mb-4">
          You Already Have Premium Access
        </h1>
        <p className="text-[#c9ccbb]/70 mb-6">
          Your intelligence layer is fully active.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-xl bg-[#b5a642] text-[#1b270e] font-bold uppercase tracking-widest text-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">

      <div className="max-w-md w-full p-10 rounded-3xl border border-[#b5a642]/30 bg-[#000]/20 relative overflow-hidden shadow-2xl shadow-[#b5a642]/5">

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#b5a642] to-transparent opacity-50"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#b5a642]/10 border border-[#b5a642]/30 mb-6">
            <LockOpen size={28} className="text-[#b5a642]" />
          </div>

          <h1 className="text-3xl font-serif text-[#c9ccbb] mb-3">
            Unlock Premium
          </h1>

          <p className="text-[#c9ccbb]/70 text-sm leading-relaxed">
            Gain access to all the features of The Sentient home. 
            Move from environmental overwhelm to measurable regulation.
          </p>

          {/* Pricing Transparency */}
          <p className="text-[#b5a642] text-sm font-semibold mt-4">
            €49 / month — Cancel anytime
          </p>
        </div>

        <div className="space-y-4 mb-10">

          <div className="flex items-start gap-3 text-sm text-[#c9ccbb]/90 p-4 bg-[#000]/30 rounded-xl border border-[#c9ccbb]/5">
            <Brain size={18} className="text-[#b5a642] shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Full access to the Sensory Coaching modules, Room Audit and Neuro Somatic Insights.
            </span>
          </div>

          <div className="flex items-start gap-3 text-sm text-[#c9ccbb]/90 p-4 bg-[#000]/30 rounded-xl border border-[#c9ccbb]/5">
            <ShieldCheck size={18} className="text-[#b5a642] shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Priority customer care response from The Sentient Home team.
            </span>
          </div>

        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-[#b5a642] text-[#1b270e] hover:bg-white shadow-lg shadow-[#b5a642]/20 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Securing Session...
            </>
          ) : (
            <>
              Upgrade to Premium
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 text-red-400 text-xs text-center bg-red-900/20 py-2 rounded-lg border border-red-900/30">
            {error}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/dashboard"
            className="text-[#c9ccbb]/40 hover:text-[#c9ccbb] text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>

      </div>
    </div>
  )
}
