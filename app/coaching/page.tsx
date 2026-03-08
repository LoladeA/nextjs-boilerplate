'use client'
import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { BookOpen, ArrowRight, Lock, Loader2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function Coaching() {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [currentModule, setCurrentModule] = useState(1)
  const [isBlueprint, setIsBlueprint]     = useState(false)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const isGod = user.email === 'christchilde@gmail.com'
        const [profileRes, statusRes] = await Promise.all([
          supabase.from('users').select('current_module').eq('id', user.id).single(),
          isGod ? Promise.resolve(null) : fetch('/api/subscription-status')
        ])
        if (profileRes.data?.current_module) setCurrentModule(profileRes.data.current_module)
        if (isGod) {
          setIsBlueprint(true)
        } else if (statusRes) {
          const data = await (statusRes as Response).json()
          setIsBlueprint(data.tier === 'blueprint')
        }
      } catch (err) {
        console.error('Failed to fetch user data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
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
        "Week 4: Designing to Accommodate Multiple Occupants",
        "Week 5: Long-Term Maintenance and Evolution",
        "Week 6: The Sentient Home Baseline"
      ]
    }
  ]

  if (loading) return (
    <div className="min-h-screen bg-[#1b270e] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#b5a642]" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        <div className="max-w-6xl mx-auto">

          <div className="mb-12">
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-6">Your Sensory Coaching</h1>
            <div className="space-y-4 text-[#c9ccbb]/80 max-w-3xl leading-relaxed">
              <p>Your home environment is continuously shaping your nervous system: through light, sound, texture, temperature, and layout.</p>
              <p>This is a structured process of learning how to read those signals and respond with precision. There is no urgency here. We adjust one variable at a time, observe the effect, and build stability gradually.</p>
              <p>The goal is not a race to completion. It is to develop the awareness and agency to shape a home environment that consistently supports you.</p>
            </div>

            {!isBlueprint && currentModule >= 1 && (
              <div className="mt-8 p-6 rounded-2xl border border-[#b5a642]/20 bg-[#b5a642]/5 max-w-xl flex items-start gap-4">
                <Lock size={16} className="text-[#b5a642] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#c9ccbb]/80 text-sm leading-relaxed mb-3">
                    Modules 2–9 are part of the Blueprint programme. When you are ready to go further, the full coaching curriculum is waiting.
                  </p>
                  <Link href="/upgrade" className="inline-flex items-center gap-2 text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                    Upgrade to Blueprint <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {modules.map((mod) => {
              const isModuleOne      = mod.id === 1
              const hasProgressed    = mod.id <= currentModule
              const isUnlocked       = isModuleOne || (isBlueprint && hasProgressed)
              const needsBlueprint   = !isModuleOne && !isBlueprint
              const needsProgression = !isModuleOne && isBlueprint && !hasProgressed
              const isCompleted      = mod.id < currentModule
              const isCurrent        = mod.id === currentModule
              const SLUGS: Record<number, string> = {
                1: 'foundations',
                2: 'sensory-lighting-dynamics',
                3: 'acoustic-balance',
                4: 'colour-psychology',
                5: 'spatial-flow-layout',
                6: 'biophilic-design',
                7: 'air-quality-thermal-comfort',
                8: 'ergonomics-physical-alignment',
                9: 'whole-home-integration',
              }
              const href = `/coaching/${SLUGS[mod.id]}`

              const cardContent = (
                <div
                  style={isUnlocked ? {
                    // Sandblasted gold glass effect — layered gradients + translucency
                    background: `
                      linear-gradient(
                        135deg,
                        rgba(181,166,66,0.18) 0%,
                        rgba(181,166,66,0.06) 30%,
                        rgba(0,0,0,0.25) 60%,
                        rgba(181,166,66,0.10) 100%
                      )
                    `,
                    backdropFilter: 'blur(12px) saturate(1.4)',
                    WebkitBackdropFilter: 'blur(12px) saturate(1.4)',
                    borderColor: 'rgba(181,166,66,0.35)',
                    boxShadow: `
                      inset 0 1px 0 rgba(181,166,66,0.30),
                      inset 0 -1px 0 rgba(0,0,0,0.40),
                      inset 1px 0 0 rgba(181,166,66,0.12),
                      0 8px 32px rgba(0,0,0,0.35),
                      0 0 0 1px rgba(181,166,66,0.08)
                    `,
                  } : {
                    background: 'rgba(0,0,0,0.12)',
                    borderColor: 'rgba(201,204,187,0.06)',
                  }}
                  className={`
                    relative p-8 rounded-3xl border flex flex-col h-full
                    transition-all duration-500 overflow-hidden
                    ${isUnlocked
                      ? 'hover:border-[#b5a642]/60 cursor-pointer'
                      : 'opacity-60 cursor-default'
                    }
                  `}
                >
                  {/* Sandblasted grain overlay — unlocked cards only */}
                  {isUnlocked && (
                    <>
                      {/* Top-left gold light catch */}
                      <div
                        className="absolute top-0 left-0 w-48 h-48 pointer-events-none"
                        style={{
                          background: 'radial-gradient(ellipse at top left, rgba(181,166,66,0.22) 0%, transparent 70%)',
                        }}
                      />
                      {/* Bottom-right depth shadow */}
                      <div
                        className="absolute bottom-0 right-0 w-56 h-40 pointer-events-none"
                        style={{
                          background: 'radial-gradient(ellipse at bottom right, rgba(0,0,0,0.40) 0%, transparent 70%)',
                        }}
                      />
                      {/* Horizontal frosted band — mimics sandblasted glass light catch */}
                      <div
                        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(181,166,66,0.60) 40%, rgba(255,255,255,0.15) 55%, rgba(181,166,66,0.30) 70%, transparent 100%)',
                        }}
                      />
                    </>
                  )}

                  {/* Content — sits above decorative layers */}
                  <div className="relative flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-block ${
                        isUnlocked
                          ? 'border-[#b5a642]/40 text-[#b5a642] bg-[#b5a642]/10'
                          : 'border-[#c9ccbb]/10 text-[#c9ccbb]/30'
                      }`}>
                        Module {mod.id}
                      </span>
                      {isUnlocked && (isCompleted || isCurrent) && (
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          isCompleted
                            ? 'bg-[#7ec89a]/12 text-[#7ec89a] border-[#7ec89a]/25'
                            : 'bg-[#b5a642]/12 text-[#b5a642] border-[#b5a642]/25'
                        }`}>
                          {isCompleted ? 'Completed' : 'In Progress'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-serif text-[#c9ccbb] mb-3 leading-tight">{mod.title}</h3>
                    <p className="text-[#c9ccbb]/60 text-xs leading-relaxed mb-8 h-10">{mod.subtitle}</p>

                    <ul className="space-y-3.5 mb-8">
                      {mod.weeks.map((week, index) => (
                        <li key={index} className="flex gap-3 text-xs items-start">
                          <BookOpen
                            size={13}
                            className={`shrink-0 mt-0.5 ${isUnlocked ? 'text-[#b5a642]/70' : 'text-[#c9ccbb]/20'}`}
                          />
                          <span className={`leading-relaxed ${isUnlocked ? 'text-[#c9ccbb]/80' : 'text-[#c9ccbb]/30'}`}>
                            {week}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer */}
                  <div
                    className="relative pt-5 mt-auto"
                    style={{
                      borderTop: isUnlocked
                        ? '1px solid rgba(181,166,66,0.20)'
                        : '1px solid rgba(201,204,187,0.06)'
                    }}
                  >
                    {isUnlocked ? (
                      <div className="flex items-center gap-2 text-[#c9ccbb]/80 group-hover:text-[#b5a642] text-[10px] font-bold uppercase tracking-widest transition-colors duration-300">
                        {isCompleted ? 'Review Module' : 'Continue Module'}
                        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[#c9ccbb]/30 text-[10px] font-bold uppercase tracking-widest">
                        <Lock size={11} className="text-[#b5a642]/30" />
                        {needsBlueprint   && 'Blueprint membership required'}
                        {needsProgression && `Complete Module ${mod.id - 1} to unlock`}
                      </div>
                    )}
                  </div>
                </div>
              )

              return isUnlocked ? (
                <Link key={mod.id} href={href} className="group flex flex-col h-full">
                  {cardContent}
                </Link>
              ) : (
                <div key={mod.id} className="flex flex-col h-full">
                  {cardContent}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
