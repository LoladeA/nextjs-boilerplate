'use client'

import { useParams } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import { ArrowLeft, CheckCircle, Lock, Loader2, BookOpen, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// --- THE CONTENT LIBRARY ---
const modules: any = {
  
  // WEEK 0: SENSORY ORIENTATION (Updated with your text)
  "sensory-orientation": {
    week: "Week 0",
    title: "Sensory Orientation",
    subtitle: "Understanding your biological baseline.",
    readTime: "3 min read",
    content: `
      <p class="text-xl text-[#c9ccbb] leading-relaxed mb-8">
        The results of your Sensory Intelligence Assessment are now visible. It is vital to understand that this profile is neither a personality type, a label, nor a judgment.
      </p>
      <p class="text-[#c9ccbb]/80 mb-8 leading-relaxed">
        Rather, it is a snapshot of your nervous system's current interaction with your home environment.
      </p>

      <div class="bg-[#b5a642]/5 p-6 rounded-2xl border border-[#b5a642]/20 mb-10">
        <p class="text-[#c9ccbb]/90 italic leading-relaxed">
          "Research in neuroscience and environmental psychology
          suggests that human functioning is not confined solely to the skull. Your cognitive load, emotional regulation, and stress physiology are continuously shaped by sensory inputs: light, sound, spatial layout, tactile feedback, and colour."
        </p>
      </div>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">The Mirror</h3>
      <p class="text-[#c9ccbb]/80 mb-8 leading-relaxed">
        Your sensory profile reflects interaction patterns, not personal traits. It describes the conditions you are operating within.
      </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">The Reframe</h3>
      <p class="text-[#c9ccbb]/80 mb-6 leading-relaxed">
        Most dysregulation is contextual, not character-based. When you feel overstimulated, fatigued, or unsettled, environmental misalignment is often the cause; not personal deficiency. 
      </p>
      <p class="text-[#c9ccbb] text-lg font-serif">
        Your results make these invisible conditions visible.
      </p>
    `
  },

  // WEEK 1: THE SILENT CONVERSATION (Placeholder Text)
  "silent-conversation": {
    week: "Week 1",
    title: "The Silent Conversation",
    subtitle: "Cognitive load & environmental vigilance.",
    readTime: "5 min read",
    content: `
      <h3 class="text-2xl font-serif text-[#c9ccbb] mb-4">The Always-On Monitor</h3>
      <p class="text-[#c9ccbb]/80 mb-6 leading-relaxed">
        Your brain is constantly scanning for threats. This is the "Silent Conversation" happening between your amygdala and your room.
      </p>
      <h3 class="text-2xl font-serif text-[#c9ccbb] mb-4">Practice: The Sigh Test</h3>
      <p class="text-[#c9ccbb]/80 mb-6 leading-relaxed">
        Walk into a room. Do you naturally inhale (brace) or exhale (release)? If you don't involuntarily sigh with relief, the room is costing you energy.
      </p>
    `
  },

  // WEEK 2: LIGHT AS SIGNAL (Premium Placeholder)
  "light-as-signal": {
    week: "Week 2",
    title: "Light as Signal",
    subtitle: "Circadian rhythms and cortisol control.",
    readTime: "4 min read",
    content: `
      <h3 class="text-2xl font-serif text-[#c9ccbb] mb-4">Light Tells Time</h3>
      <p class="text-[#c9ccbb]/80 mb-6 leading-relaxed">
        Light is the primary zeitgeber (time-giver) for the human body.
      </p>
    `
  }
}

export default function CoachingModulePage() {
  const supabase = createClientComponentClient()
  const params = useParams()
  
  // 1. GET THE SLUG
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  
  // 2. FIND THE CONTENT
  const module = modules[slug]

  // STATE
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // CHECK PROGRESS ON LOAD
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

  // HANDLE CLICK
  const markComplete = async () => {
    if (isCompleted) return 
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

  // IF MODULE DOESN'T EXIST (404)
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
        
        <div className="max-w-3xl mx-auto">
            
            {/* Back Button */}
            <Link href="/coaching" className="inline-flex items-center gap-2 text-[#c9ccbb]/60 hover:text-[#b5a642] transition-colors mb-8 uppercase tracking-widest text-xs font-bold">
                <ArrowLeft size={16} /> Back to Curriculum
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 border-b border-[#c9ccbb]/10 pb-8">
                <div>
                    <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2 block flex items-center gap-2">
                       <Sparkles size={14} /> {module.week}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-serif text-[#c9ccbb] mb-4">
                        {module.title}
                    </h1>
                    <div className="flex items-center gap-4 text-[#c9ccbb]/60 text-sm">
                       <span className="flex items-center gap-2"><BookOpen size={16} /> {module.readTime}</span>
                    </div>
                </div>
                
                {/* Visual Badge if done */}
                {isCompleted && !isLoading && (
                    <div className="flex px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest items-center gap-2">
                        <CheckCircle size={14} /> Completed
                    </div>
                )}
            </div>

            {/* LESSON CONTENT (Text Only Mode) */}
            <div className="prose prose-invert prose-lg max-w-none mb-16">
                <div dangerouslySetInnerHTML={{ __html: module.content }} />
            </div>
            
            {/* THE INTERACTIVE BUTTON */}
            <div className="sticky bottom-6 glass-panel p-4 rounded-2xl border border-[#c9ccbb]/10 shadow-2xl">
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
