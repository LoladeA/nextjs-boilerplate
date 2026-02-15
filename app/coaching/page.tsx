'use client'

import Sidebar from '../components/Sidebar'
import { Lock, ArrowRight, CheckCircle, BookOpen, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export default function Coaching() {
  const supabase = createClientComponentClient()
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([])

  // 🟢 FIXED: Variable declared only once with your exact word-for-word content
  const modules = [
    { 
      week: "Module 1", 
      slug: "foundations",
      title: "Foundations of Neuropsychology in Interior Design", 
      subtitle: "The Home as a Second Skin for the Nervous System.",
      items: ["Neuro Load Scoring", "ACC & Theta Activity", "Hormonal Health"],
      isLocked: false,
      link: "/coaching/foundations"
    },
    { 
      week: "Module 2", 
      slug: "sensory-lighting-dynamics", 
      title: "Sensory and Lighting Dynamics", 
      subtitle: "Understanding Sensory Load: Beyond the Obvious.",
      items: [
        "Week 1: Visual Density", 
        "Week 2: Circadian Stability & Sensory Filtering", 
        "Week 3: Designing for Regulation (Not Aesthetics)", 
        "Week 4: The Evening Reset & Deep Night Setting"
      ],
      isLocked: true, 
      isPremium: true,
      link: "/upgrade" 
    }
  ]

  // FETCH PROGRESS
  useEffect(() => {
    async function getProgress() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('quiz_submissions').select('module_slug').eq('user_id', user.id)
      if (data) setCompletedSlugs(data.map(row => row.module_slug))
    }
    getProgress()
  }, [supabase])

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        <div className="max-w-7xl mx-auto">
          
          <Link href="/dashboard" className="text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest hover:text-[#b5a642] mb-8 inline-block">
            ← Back to Dashboard
          </Link>

          {/* --- HEADER SECTION --- */}
          <div className="mb-12">
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-6">Your Sensory Coaching Journey</h1>
            <div className="text-[#c9ccbb]/70 max-w-3xl leading-relaxed space-y-4">
              <p>
                Your home is constantly communicating with your nervous system, whether you’re aware of it or not.
              </p>
              <p>
                This is a guided process of learning to listen, understand, and respond, without urgency or pressure to change everything at once.
                The aim isn’t completion, but an ongoing relationship between you and the environment you live inside.
              </p>
            </div>
          </div>

          {/* GRID SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((item, i) => {
              const isDone = completedSlugs.includes(item.slug)

              return (
                <Link 
                  href={item.link} 
                  key={i}
                  className={`group relative flex flex-col justify-between p-8 rounded-3xl border transition-all duration-500 overflow-hidden min-h-[400px]
                    ${item.isPremium 
                      ? 'bg-gradient-to-br from-[#b5a642]/20 to-[#b5a642]/5 border-[#b5a642]/30' 
                      : 'bg-[#1b270e] border-[#c9ccbb]/50 hover:border-[#b5a642]/50' 
                    }
                  `}
                >
                  <div>
                      <div className="flex justify-between items-start mb-6">
                          <span className={`px-3 py-1 rounded border text-[10px] font-bold uppercase tracking-widest 
                            ${item.isPremium ? 'border-[#1b270e]/20 text-[#1b270e]' : 'border-[#c9ccbb]/20 text-[#c9ccbb]/60'}`}>
                              {item.week}
                          </span>
                          {item.isLocked && <Lock size={16} className="text-[#c9ccbb]/40" />}
                      </div>

                      <h3 className="text-2xl font-serif mb-2 text-[#c9ccbb]">
                          {item.title}
                      </h3>
                      <p className="text-[#c9ccbb]/70 text-sm mb-8">{item.subtitle}</p>
                      
                      <div className="space-y-3 mb-8">
                        {item.items.map((subItem, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm text-[#c9ccbb]/80">
                                <BookOpen size={14} className="shrink-0 opacity-50" />
                                <span>{subItem}</span>
                            </div>
                        ))}
                      </div>
                  </div>

                  <div className={`pt-6 border-t ${item.isPremium ? 'border-[#1b270e]/10' : 'border-[#c9ccbb]/10'} flex justify-between items-center`}>
                      {item.isLocked ? (
                          <span className="text-xs font-bold uppercase tracking-widest text-[#b5a642] flex items-center gap-2">
                              Upgrade to Unlock <Lock size={12} />
                          </span>
                      ) : isDone ? (
                          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                              Completed <CheckCircle size={14} />
                          </span>
                      ) : (
                          <span className="text-xs font-bold uppercase tracking-widest text-[#c9ccbb] group-hover:text-[#b5a642] transition-colors flex items-center gap-2">
                              Start Module <ArrowRight size={14} />
                          </span>
                      )}
                  </div>
                </Link>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
