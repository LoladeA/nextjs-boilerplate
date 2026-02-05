'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, PlayCircle, BookOpen, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react'
import { coachingModules } from '../data/coaching-modules'

export default function CoachingHub() {
  return (
    <div className="min-h-screen p-6 md:p-12 font-sans bg-[#1b270e]">
      
      {/* HEADER */}
      <Link href="/dashboard" className="flex items-center text-[#c9ccbb]/60 hover:text-[#b5a642] mb-8 w-fit">
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Nervous System Gym</h1>
        <p className="text-[#c9ccbb]/60 max-w-2xl">
          Move from awareness to regulation. A sequenced curriculum to align your home environment with your biology.
        </p>
      </div>

      {/* MODULE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coachingModules.map((module, i) => (
          <motion.div 
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative group rounded-2xl overflow-hidden border border-[#c9ccbb]/10 bg-gradient-to-br ${module.image}`}
          >
            {/* CARD CONTENT */}
            <div className="p-8 h-full flex flex-col justify-between min-h-[320px] relative z-10">
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-[#000]/30 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#c9ccbb]">
                    {module.weekLabel}
                  </span>
                  {module.isLocked && <Lock size={16} className="text-[#c9ccbb]/40" />}
                </div>
                
                <h2 className="text-2xl font-serif text-[#f2f2f2] mb-2">{module.title}</h2>
                <p className="text-[#f2f2f2]/70 text-sm leading-relaxed">{module.subtitle}</p>
              </div>

              <div className="space-y-3 mt-8">
                {module.lessons.slice(0, 3).map((lesson, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-[#f2f2f2]/80">
                     {lesson.type === 'exercise' ? <Sparkles size={14} /> : <BookOpen size={14} />}
                     <span className="truncate">{lesson.title}</span>
                  </div>
                ))}
                {module.lessons.length > 3 && (
                   <div className="text-xs text-[#f2f2f2]/50 pl-7">+ {module.lessons.length - 3} more lessons</div>
                )}
              </div>

              {/* HOVER ACTION */}
              <div className="mt-8 pt-6 border-t border-[#f2f2f2]/10 flex justify-between items-center group-hover:text-[#b5a642] transition-colors">
                 <span className="text-xs font-bold uppercase tracking-widest">
                   {module.isLocked ? "Upgrade to Unlock" : "Start Module"}
                 </span>
                 {module.isLocked ? (
                   <Lock size={16} /> 
                 ) : (
                   <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                 )}
              </div>
            </div>

            {/* CLICK HANDLER */}
            <Link 
              href={module.isLocked ? "/upgrade" : `/coaching/${module.id}`} 
              className="absolute inset-0 z-20"
            />
            
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 bg-[#000]/20 group-hover:bg-[#000]/10 transition-colors" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
