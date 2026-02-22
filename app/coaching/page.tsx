'use client'

import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { BookOpen, ArrowRight, Lock, Loader2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function Coaching() {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  
  // 🟢 The user's progress state. Defaulting to 2 since you have 2 built.
  const [currentModule, setCurrentModule] = useState(2) 

  useEffect(() => {
    async function fetchUserProgress() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Future-proofing: Fetching their actual progression from your users table
        const { data: profile } = await supabase
          .from('users')
          .select('current_module')
          .eq('id', user.id)
          .single()

        if (profile?.current_module) {
          setCurrentModule(profile.current_module)
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
      weeks: ["Neuro Load Scoring", "ACC & Theta Activity", "Hormonal Health"]
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
        "Week 4: Integrating Nature Across Every Dimension"
      ]
    },
    {
      id: 7,
      title: "Air Quality and Thermal Comfort",
      subtitle: "The invisible boundaries of biological regulation.",
      weeks: [
        "Week 1: Olfactory Processing and Threat Detection",
        "Week 2: Thermal Consistency vs. Friction",
        "Week 3: Interventions for Atmospheric Stability"
      ]
    },
    {
      id: 8,
      title: "Ergonomics and Physical Alignment",
      subtitle: "Removing somatic resistance from your environment.",
      weeks: [
        "Week 1: Somatic Load Mapping",
        "Week 2: Postural Priming for Deep Work",
        "Week 3: The Architecture of Decompression",
        "Week 4: Long-term Biomechanical Support"
      ]
    },
    {
      id: 9,
      title: "Whole-Home Integration and Mastery",
      subtitle: "Synchronising all domains into a unified NeuroDesign ecosystem.",
      weeks: [
        "Week 1: The Synthesis Protocol",
        "Week 2: Identifying Competing Interventions",
        "Week 3: Seasonal Adaptation Strategies",
        "Week 4: Scaling to Multiple Occupants",
        "Week 5: Longitudinal Tracking",
        "Week 6: The Sentient Home Baseline"
      ]
    }
  ]

  if (loading) return <div className="min-h-screen bg-[#1b270e] flex items-center justify-center"><Loader2 className="animate-spin text-[#b5a642]" /></div>

  return (
    <div className="mb-12">
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-6">Your Sensory Coaching</h1>
            
            {/* 🟢 Replaced the single <p> with a flex container of multiple <p> tags */}
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
              // 🟢 SEQUENTIAL LOCK LOGIC
              const isUnlocked = mod.id <= currentModule
              
              return (
                <div 
                  key={mod.id} 
                  className={`glass-panel p-8 rounded-3xl border flex flex-col h-full transition-all duration-300 ${
                    isUnlocked 
                      ? 'border-[#c9ccbb]/20 bg-[#000]/20 hover:border-[#b5a642]/50' 
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
                      <Link href={`/coaching/module-${mod.id}`} className="group flex items-center gap-2 text-[#c9ccbb] hover:text-[#b5a642] text-[10px] font-bold uppercase tracking-widest transition-colors w-fit">
                        {mod.id < currentModule ? "Review Module" : "Continue Module"} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ) : (
                      // 🟢 EXPLICIT PREREQUISITE REQUIREMENT
                      <div className="flex items-center gap-2 text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest">
                        <Lock size={12} className="text-[#b5a642]/50" /> Complete Module {mod.id - 1} to Unlock
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
