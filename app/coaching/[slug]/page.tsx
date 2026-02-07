'use client'

import { useParams } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import { ArrowLeft, PlayCircle, CheckCircle, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// --- COACHING CONTENT DATABASE ---
// (Identical to before, keeping your content safe)
const modules: any = {
  "acoustic-safety": {
    title: "Module 1: Acoustic Safety",
    subtitle: "Mapping soundscapes and reducing sonic friction.",
    videoLength: "12 min",
    content: `
      <h3 class="text-xl font-serif text-[#c9ccbb] mb-4">Why Sound Matters</h3>
      <p class="text-[#c9ccbb]/80 mb-6">
        Unpredictable noise is one of the fastest ways to trigger a cortisol spike. In this module, we will learn how to map the "sonic friction" in your home.
      </p>
      <h3 class="text-xl font-serif text-[#c9ccbb] mb-4">Your Action Plan</h3>
      <ul class="list-disc pl-5 text-[#c9ccbb]/80 space-y-2">
        <li>Identify the loudest room in your house.</li>
        <li>Add one "absorption anchor" (rug, curtain, or canvas).</li>
        <li>Test the reverberation change.</li>
      </ul>
    `
  },
  "light-circadian": {
    title: "Module 2: Light & Circadian Rhythm",
    subtitle: "Aligning your lighting with your hormonal cycle.",
    videoLength: "18 min",
    content: `
      <h3 class="text-xl font-serif text-[#c9ccbb] mb-4">The Sunset Protocol</h3>
      <p class="text-[#c9ccbb]/80 mb-6">
        We will design a lighting schedule that mimics the sun, signalling safety to your biological clock.
      </p>
    `
  }
}

export default function CoachingModulePage() {
  const supabase = createClientComponentClient()
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const module = modules[slug]

  // STATE
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // 1. CHECK PROGRESS ON LOAD
  useEffect(() => {
    checkProgress()
  }, [])

  const checkProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('module_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_slug', slug)
      .single()

    if (data) setIsCompleted(true)
    setIsLoading(false)
  }

  // 2. HANDLE CLICK
  const markComplete = async () => {
    if (isCompleted) return // Don't save twice
    setIsSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('module_progress')
        .insert({ user_id: user.id, module_slug: slug })
      
      setIsCompleted(true)
    }
    setIsSaving(false)
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-[#1b270e] flex items-center justify-center text-[#c9ccbb]">
        <div className="text-center">
            <h1 className="text-4xl font-serif mb-4">Module Locked or Missing</h1>
            <Link href="/coaching" className="text-[#b5a642] underline">Return to Curriculum</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen relative p-6 md:p-12">
        
        <div className="max-w-4xl mx-auto">
            
            {/* Back Button */}
            <Link href="/coaching" className="inline-flex items-center gap-2 text-[#c9ccbb]/60 hover:text-[#b5a642] transition-colors mb-8 uppercase tracking-widest text-xs font-bold">
                <ArrowLeft size={16} /> Back to Curriculum
            </Link>

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl md:text-5xl font-serif text-[#c9ccbb] mb-2">
                        {module.title}
                    </h1>
                    <p className="text-[#c9ccbb]/60 text-lg mb-8">{module.subtitle}</p>
                </div>
                {/* Visual Badge if done */}
                {isCompleted && !isLoading && (
                    <div className="hidden md:flex px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest items-center gap-2">
                        <CheckCircle size={14} /> Completed
                    </div>
                )}
            </div>

            {/* VIDEO PLAYER PLACEHOLDER */}
            <div className="w-full aspect-video bg-[#000]/40 rounded-3xl border border-[#c9ccbb]/10 flex items-center justify-center mb-12 group cursor-pointer hover:border-[#b5a642]/50 transition-all relative overflow-hidden">
                <div className="w-20 h-20 rounded-full bg-[#b5a642] flex items-center justify-center text-[#1b270e] group-hover:scale-110 transition-transform relative z-10">
                    <PlayCircle size={40} />
                </div>
                {/* Subtle background glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000]/80 to-transparent" />
            </div>

            {/* LESSON CONTENT */}
            <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10">
                <div className="prose prose-invert prose-lg max-w-none mb-12">
                    <div dangerouslySetInnerHTML={{ __html: module.content }} />
                </div>
                
                {/* THE INTERACTIVE BUTTON */}
                <button 
                    onClick={markComplete}
                    disabled={isCompleted || isSaving}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        isCompleted 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 cursor-default'
                        : 'bg-[#b5a642] text-[#1b270e] hover:bg-[#d4c55e] hover:scale-[1.01]'
                    }`}
                >
                    {isSaving ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : isCompleted ? (
                        <motion.div 
                            initial={{ scale: 0.8 }} 
                            animate={{ scale: 1 }} 
                            className="flex items-center gap-2"
                        >
                            <CheckCircle size={18} /> Module Completed
                        </motion.div>
                    ) : (
                        <>Mark Module Complete</>
                    )}
                </button>
            </div>

        </div>
      </div>
    </div>
  )
}
