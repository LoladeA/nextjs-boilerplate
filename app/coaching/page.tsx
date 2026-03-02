'use client'

import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { BookOpen, ArrowRight, Lock, Loader2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function Coaching() {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  
  // 🟢 STATE: Tracks progress AND payment status
  const [currentModule, setCurrentModule] = useState(1) 
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    async function fetchUserProgress() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 🟢 DUAL-FETCH: Progress and active subscription concurrently
        const [profileRes, subRes] = await Promise.all([
          supabase.from('users').select('current_module').eq('id', user.id).single(),
          supabase.from('subscriptions').select('status').eq('user_id', user.id).eq('status', 'active').maybeSingle()
        ])

        if (profileRes.data?.current_module) {
          setCurrentModule(profileRes.data.current_module)
        }

        if (subRes.data) {
          setHasSubscription(true)
        }
      } catch (err) {
        console.error('Failed to fetch progression', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUserProgress()
  }, [supabase])

  const modules = [
    {
      id: 1,
      title: "Foundations of Neuropsychology in Interior Design",
      subtitle: "The Home as a Second Skin for the Nervous System.",
      weeks: ["Introduction"]
    },
    {
      id: 2,
      title: "Sensory and Lighting Dynamics",
      subtitle: "Understanding Sensory Load: Beyond the Obvious.",
      weeks: [
        "Week 1: Understanding Sensory Load: Beyond the Obvious",
        "Week 2: Circadian Stability & Sensory Filtering",
        "Week 3: Designing for Regulation (Not Aesthetics)",
        "Week 4: The Evening Reset & Deep Night Setting"
      ]
    },
    {
      id: 3,
      title: "Acoustic Balance",
      subtitle: "The unseen architecture shaping your neural baseline.",
      weeks: [
        "Week 1: Sound as Neural Architecture",
        "Week 2: The Neurophysiology of Acoustic Stress",
        "Week 3: From Measurement to Intervention"
      ]
    },
    {
      id: 4,
      title: "Colour Psychology",
      subtitle: "Chromatic interventions for nervous system regulation.",
      weeks: [
        "Week 1: Colour as Neurochemical Modulator",
        "Week 2: The Physiological Cascade of Colour Exposure",
        "Week 3: From Measurement to Chromatic Intervention"
      ]
    },
    {
      id: 5,
      title: "Spatial Flow and Layout",
      subtitle: "Architectural alignment with biological movement.",
      weeks: [
        "Week 1: Spatial Cognition and the Navigating Nervous System",
        "Week 2: When Space Works Against You",
        "Week 3: From Spatial Diagnosis to Deliberate Intervention",
        "Week 4: The Home as a Coherent Nervous System"
      ]
    },
    {
      id: 6,
      title: "Biophilic Design",
      subtitle: "Reconnecting human biology to its evolutionary baseline.",
      weeks: [
        "Week 1: Why the Brain Needs Nature",
        "Week 2: What Nature Connection—or Its Absence—Is Actually Doing",
        "Week 3: From Biophilic Deficit to Living Environment",
        "Week 4: Integrating Nature Across Every Dimension of The Sentient Home"
      ]
    },
    {
      id: 7,
      title: "Air Quality and Thermal Comfort",
      subtitle: "The invisible boundaries of biological regulation.",
      weeks: [
        "Week 1: What You Cannot See Is Still Regulating You",
        "Week 2: What Poor Air Quality and Thermal Dysregulation Are Actually Costing You",
        "Week 3: From Measurement to Intervention"
      ]
    },
    {
      id: 8,
      title: "Ergonomics and Physical Alignment",
      subtitle: "Removing somatic resistance from your environment.",
      weeks: [
        "Week 1: Why How You Sit, Stand, and Move in Your Home Determines How You Feel",
        "Week 2: What Years of Poor Ergonomics Have Been Costing You",
        "Week 3: From Assessment to Sustainable Ergonomic Support"
      ]
    },
    {
      id: 9,
      title: "Whole-Home Integration and Mastery",
      subtitle: "Synchronizing all domains into a unified NeuroDesign.",
      weeks: [
        "Week 1: How Environmental Variables Interact",
        "Week 2: Your Unique Environmental Signature",
        "Week 3: Building Your Home's Operating System",
        "Week 4: Designing to Accomodate Multiple Occupants",
        "Week 5: Long-Term Maintenance and Evolution",
        "Week 6: The Sentient Home Baseline"
      ]
    }
  ]

  if (loading) return <div className="min-h-screen bg-[#1b270e] flex items-center justify-center"><Loader2 className="animate-spin text-[#b5a642]" /></div>

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-12">
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-6">Your Sensory Coaching</h1>
            
            <div className="space-y-4 text-[#c9ccbb]/80 max-w-3xl leading-relaxed">
              <p>
                Your home environment is continuously shaping your nervous system: through light, sound, texture, temperature, and layout. 
              </p>
              <p>
                This is a structured process of learning how to read those signals and respond with precision. There is no urgency here. We adjust one variable at a time, observe the effect, and build stability gradually. 
              </p>
              <p>
                The goal is not a race to completion. It is to develop the awareness and agency to shape a home environment that consistently supports you.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {modules.map((mod) => {
              // 🟢 THE BUSINESS LOGIC ENGINE
              const isModuleOne = mod.id === 1
              const hasSequentialAccess = mod.id <= currentModule
              
              // Module 1 is always free. Subsequent modules require BOTH progression AND payment.
              const isUnlocked = isModuleOne || (hasSequentialAccess && hasSubscription)
              
              return (
                <div 
                  key={mod.id} 
                  className={`glass-panel p-8 rounded-3xl border flex flex-col h-full transition-all duration-300 ${
                    isUnlocked 
                      ? 'border-[#c9ccbb]/20 bg-[#000]/30 hover:border-[#b5a642]/50' // 🟢 A bit more background color for contrast on unlocked cards
                      : 'border-[#c9ccbb]/5 bg-[#000]/10 opacity-70 cursor-default'
                  }`}
                >
                  <div className="flex-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-6 inline-block ${
                      isUnlocked 
                        ? 'border-[#b5a642]/30 text-[#b5a642] bg-[#b5a642]/10' 
                        : 'border-[#c9ccbb]/10 text-[#c9ccbb]/40'
                    }`}>
                      Module {mod.id}
                    </span>
                    
                    <h3 className="text-xl font-serif text-[#c9ccbb] mb-3 leading-tight">{mod.title}</h3>
                    <p className="text-[#c9ccbb]/60 text-xs leading-relaxed mb-8 h-10">{mod.subtitle}</p>

                    <ul className="space-y-4 mb-8">
                      {mod.weeks.map((week, index) => (
                        <li key={index} className="flex gap-3 text-xs text-[#c9ccbb]/80 items-start">
                          <BookOpen size={14} className={`shrink-0 mt-0.5 ${isUnlocked ? 'text-[#b5a642]' : 'text-[#c9ccbb]/30'}`} />
                          <span className="leading-relaxed">{week}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-[#c9ccbb]/10 mt-auto">
                    {isUnlocked ? (
                      // 🟢 THE ROUTING FIX: Direct Module 1 to /foundations
                      <Link 
                        href={isModuleOne ? "/coaching/foundations" : `/coaching/module-${mod.id}`} 
                        className="group flex items-center gap-2 text-[#c9ccbb] hover:text-[#b5a642] text-[10px] font-bold uppercase tracking-widest transition-colors w-fit"
                      >
                        {mod.id < currentModule ? "Review Module" : "Continue Module"} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest">
                        <Lock size={12} className="text-[#b5a642]/50" /> 
                        {/* 🟢 ADAPTIVE UX: Directs them to pay vs. directs them to complete previous work */}
                        {!hasSubscription ? "Sentient Membership Required" : `Complete Module ${mod.id - 1} to Unlock`}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
