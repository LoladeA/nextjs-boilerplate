'use client'

import { useState, useEffect } from 'react'
import { Loader2, ArrowRight, Check, Brain, Home, MessageCircle, Calendar, Fingerprint, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

type SubscriptionStatus = {
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | null
  tier: 'core' | 'blueprint' | null
}

const CORE_FEATURES = [
  'Daily friction scores with direction insights',
  'The neuropsychology behind each daily pattern (Why This Is Happening)',
  '14-day environmental pattern synthesis',
  'Neuro Insights: ongoing environmental interpretation',
]

const BLUEPRINT_FEATURES = [
  'Everything in Core',
  'Full Room Audit across six neural domains: apply your insights to one priority room a month',
  'Sensory Coaching Modules',
  'Priority practitioner response within 48 hours',
]

export default function UpgradePage() {
  const [loadingTier, setLoadingTier] = useState<'core' | 'blueprint' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [consultExpanded, setConsultExpanded] = useState(false)

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

  const isCore = subscription?.status === 'active' && subscription?.tier === 'core'
  const isBlueprint = subscription?.status === 'active' && subscription?.tier === 'blueprint'
  const isTrialing = subscription?.status === 'trialing'

  const handleCheckout = async (tier: 'core' | 'blueprint') => {
    setLoadingTier(tier)
    setError(null)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to initialize checkout')
      window.location.href = data.url
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message)
      setLoadingTier(null)
    }
  }

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-[#1b270e] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#b5a642]" size={28} />
      </div>
    )
  }

  if (isBlueprint) {
    return (
      <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#b5a642]/10 border border-[#b5a642]/30 flex items-center justify-center mb-6">
          <Fingerprint size={28} className="text-[#b5a642]" />
        </div>
        <h1 className="text-3xl font-serif text-[#c9ccbb] mb-3">Blueprint Access Active</h1>
        <p className="text-[#c9ccbb]/60 mb-8 max-w-sm text-sm leading-relaxed">
          You have full access to every layer of The Sentient Home: diagnostic, coaching, and practitioner support.
        </p>
        <Link
          href="/dashboard"
          className="px-8 py-3 rounded-full bg-[#b5a642] text-[#1b270e] font-bold uppercase tracking-widest text-xs hover:bg-white transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">

      {/* ── HEADER ── */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-5">
          The Sentient Home
        </p>
        <h1 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-6 leading-tight">
          Your home is negotiating<br className="hidden md:block" /> with your nervous system.
        </h1>
        <p className="text-[#c9ccbb]/60 text-lg max-w-xl mx-auto leading-relaxed">
          Choose how far you want to go. Every tier builds on the last.
        </p>
      </div>

      {/* ── TIER CARDS ── */}
      <div className="max-w-5xl mx-auto px-6 pb-8">
        <div className="grid md:grid-cols-2 gap-6">

          {/* ── CORE ── */}
          <div className={`relative rounded-[2rem] border p-8 flex flex-col transition-all ${
            isCore
              ? 'border-[#b5a642]/50 bg-[#b5a642]/5'
              : 'border-[#c9ccbb]/10 bg-[#000]/20'
          }`}>
            {isCore && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#b5a642] text-[#1b270e] text-[9px] font-bold uppercase tracking-widest rounded-full">
                Current Plan
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 border border-[#b5a642]/20 flex items-center justify-center shrink-0">
                  <Brain size={18} className="text-[#b5a642]" />
                </div>
                <div>
                  <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest">Core</p>
                  <p className="text-[#c9ccbb]/50 text-[10px]">Understand your environment</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-serif text-[#c9ccbb]">€29</span>
                <span className="text-[#c9ccbb]/40 text-sm ml-2">/ month</span>
              </div>

              <p className="text-[#c9ccbb]/70 text-sm leading-relaxed mb-8">
                The Core tier gives you the intelligence to see what your environment is doing to your nervous system. Log daily, see your pattern, understand what your home is doing to your body, and get actionable insights.
              </p>

              <ul className="space-y-3 mb-8">
                {CORE_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#c9ccbb]/80">
                    <Check size={14} className="text-[#b5a642] shrink-0 mt-0.5" />
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              {isCore ? (
                <div className="w-full py-4 rounded-xl text-center text-[#b5a642] text-xs font-bold uppercase tracking-widest border border-[#b5a642]/30 bg-[#b5a642]/5">
                  Active
                </div>
              ) : (
                <button
                  onClick={() => handleCheckout('core')}
                  disabled={!!loadingTier}
                  className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-[#c9ccbb]/20 text-[#c9ccbb] hover:border-[#b5a642]/50 hover:bg-[#b5a642]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingTier === 'core' ? (
                    <><Loader2 size={14} className="animate-spin" /> Securing Session...</>
                  ) : (
                    <>Start with Core <ArrowRight size={14} /></>
                  )}
                </button>
              )}
              <p className="text-center text-[#c9ccbb]/30 text-[9px] uppercase tracking-widest mt-3">Cancel anytime</p>
            </div>
          </div>

          {/* ── BLUEPRINT ── */}
          <div className="relative rounded-[2rem] border border-[#b5a642]/40 bg-gradient-to-b from-[#b5a642]/10 to-[#000]/30 p-8 flex flex-col shadow-2xl shadow-[#b5a642]/10">

            {/* Recommended badge */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#b5a642] text-[#1b270e] text-[9px] font-bold uppercase tracking-widest rounded-full">
              {isCore ? 'Upgrade Available' : 'Full Programme'}
            </div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#b5a642]/60 to-transparent rounded-t-[2rem]" />

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#b5a642]/20 border border-[#b5a642]/40 flex items-center justify-center shrink-0">
                  <Home size={18} className="text-[#b5a642]" />
                </div>
                <div>
                  <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest">Blueprint</p>
                  <p className="text-[#c9ccbb]/50 text-[10px]">Change your environment</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-serif text-[#c9ccbb]">€99</span>
                <span className="text-[#c9ccbb]/40 text-sm ml-2">/ month</span>
              </div>

              <p className="text-[#c9ccbb]/70 text-sm leading-relaxed mb-8">
                The Blueprint tier gives you the structured methodology and the professional tools to change your home environment, one room at a time, with measurable results.
              </p>

              <ul className="space-y-3 mb-8">
                {BLUEPRINT_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#c9ccbb]/80">
                    <Check size={14} className="text-[#b5a642] shrink-0 mt-0.5" />
                    <span className={`leading-snug ${i === 0 ? 'text-[#c9ccbb]/50 italic' : ''}`}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* 48hr Q&A callout */}
              <div className="p-4 rounded-xl bg-[#1b270e]/60 border border-[#b5a642]/15 flex items-start gap-3">
                <MessageCircle size={16} className="text-[#b5a642] shrink-0 mt-0.5" />
                <p className="text-[#c9ccbb]/60 text-xs leading-relaxed">
                  <strong className="text-[#c9ccbb] block mb-0.5">48-hour practitioner response</strong>
                  Submit questions directly to Lolade. When the app reaches its limit, you have a human expert in your corner.
                </p>
              </div>
            </div>

            <div className="mt-auto">
              <button
                onClick={() => handleCheckout('blueprint')}
                disabled={!!loadingTier}
                className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-[#b5a642] text-[#1b270e] hover:bg-white shadow-lg shadow-[#b5a642]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingTier === 'blueprint' ? (
                  <><Loader2 size={14} className="animate-spin" /> Securing Session...</>
                ) : isCore ? (
                  <>Upgrade to Blueprint <ArrowRight size={14} /></>
                ) : (
                  <>Start Blueprint Programme <ArrowRight size={14} /></>
                )}
              </button>
              <p className="text-center text-[#c9ccbb]/30 text-[9px] uppercase tracking-widest mt-3">Cancel anytime</p>
            </div>
          </div>

        </div>

        {error && (
          <div className="mt-6 text-red-400 text-xs text-center bg-red-900/20 py-3 rounded-xl border border-red-900/30 max-w-md mx-auto">
            {error}
          </div>
        )}
      </div>

      {/* ── PROFESSIONAL SERVICES ── */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="rounded-[2rem] border border-[#c9ccbb]/10 bg-[#000]/20 overflow-hidden">

          <button
            onClick={() => setConsultExpanded(!consultExpanded)}
            className="w-full p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left hover:bg-[#c9ccbb]/2 transition-colors group"
          >
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-full bg-[#c9ccbb]/5 border border-[#c9ccbb]/10 flex items-center justify-center shrink-0">
                <Calendar size={20} className="text-[#c9ccbb]/50" />
              </div>
              <div>
                <p className="text-[#c9ccbb]/80 text-[10px] font-bold uppercase tracking-widest mb-1">Professional Services</p>
                <h3 className="text-xl font-serif text-[#c9ccbb] mb-1">Transform your environment</h3>
                <p className="text-[#c9ccbb]/80 text-sm">
                  For clients whose space requires professional hands.
                </p>
              </div>
            </div>
            <div className="text-[#c9ccbb]/30 group-hover:text-[#b5a642] transition-colors shrink-0">
              {consultExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>

          {consultExpanded && (
            <div className="px-8 pb-10 border-t border-[#c9ccbb]/5">
              <div className="grid md:grid-cols-2 gap-10 pt-8">
                <div>
                  <p className="text-[#c9ccbb]/80 text-sm leading-relaxed mb-4">
                    The NeuroDesign Blueprint™ methodology, applied to your physical space. This is where the data your home has been generating becomes a professional brief, and where environmental change becomes permanent.
                  </p>
                  <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
                    Consultations have limited availability. The work that emerges from your 48-hour Q&A conversations often surfaces whether a full professional engagement is the right next step.
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    'Residential design consultations',
                    'Full NeuroDesign Blueprint™ implementation',
                    'Sensory audit with professional report',
                    'Corporate and B2B environmental assessments',
                    'Ongoing design support and review',
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-[#c9ccbb]/70">
                      <div className="w-1 h-1 rounded-full bg-[#b5a642]/60 shrink-0" />
                      {s}
                    </div>
                  ))}
                  <div className="pt-4">
                    <a
                      href="https://www.lolade-ajai.com/services"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 border border-[#c9ccbb]/20 text-[#c9ccbb]/80 rounded-full text-xs font-bold uppercase tracking-widest hover:border-[#b5a642]/40 hover:text-[#c9ccbb] transition-all"
                    >
                      Book a Consultation <ArrowRight size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PROGRESSION STATEMENT ── */}
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="flex items-center justify-center gap-4 mb-10 flex-wrap">
          {['Understand', 'Change', 'Transform'].map((step, i) => (
            <div key={step} className="flex items-center gap-4">
              <span className={`text-sm font-serif ${i === 0 ? 'text-[#c9ccbb]/50' : i === 1 ? 'text-[#c9ccbb]/70' : 'text-[#c9ccbb]'}`}>
                {step}
              </span>
              {i < 2 && <ArrowRight size={12} className="text-[#b5a642]/40" />}
            </div>
          ))}
        </div>
        <p className="text-[#c9ccbb]/80 text-sm leading-relaxed max-w-lg mx-auto">
          You don't need more willpower. You need a space designed for how you're actually wired.
        </p>
        <div className="mt-10">
          <Link
            href="/dashboard"
            className="text-[#c9ccbb]/80 hover:text-[#c9ccbb] text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>

    </div>
  )
}
