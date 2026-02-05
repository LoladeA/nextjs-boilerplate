'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Clock, PlayCircle, CheckCircle } from 'lucide-react'
import { coachingModules } from '../../data/coaching-modules'
import { useState } from 'react'

export default function ModuleReader() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.slug as string
  
  // Find Data
  const module = coachingModules.find(m => m.id === moduleId)
  const [activeLessonIndex, setActiveLessonIndex] = useState(0)

  if (!module) return <div className="p-12 text-[#c9ccbb]">Module not found.</div>

  const activeLesson = module.lessons[activeLessonIndex]

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans flex flex-col md:flex-row">
      
      {/* SIDEBAR (Lesson List) */}
      <div className="w-full md:w-80 border-r border-[#c9ccbb]/10 bg-[#000]/20 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-[#c9ccbb]/10">
           <Link href="/coaching" className="flex items-center text-[#c9ccbb]/40 hover:text-[#c9ccbb] text-xs uppercase tracking-widest mb-4">
             <ArrowLeft size={14} className="mr-2" /> Back to Modules
           </Link>
           <h2 className="text-[#c9ccbb] font-serif text-xl">{module.title}</h2>
           <p className="text-[#c9ccbb]/50 text-xs mt-1">{module.weekLabel}</p>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
           {module.lessons.map((lesson, idx) => (
             <button
               key={lesson.id}
               onClick={() => setActiveLessonIndex(idx)}
               className={`w-full text-left p-4 rounded-lg transition-all flex items-start gap-3 ${
                 activeLessonIndex === idx 
                   ? 'bg-[#b5a642]/10 border border-[#b5a642]/30' 
                   : 'hover:bg-[#c9ccbb]/5 border border-transparent'
               }`}
             >
               <div className={`mt-1 ${activeLessonIndex === idx ? 'text-[#b5a642]' : 'text-[#c9ccbb]/40'}`}>
                 {idx + 1}
               </div>
               <div>
                 <h4 className={`text-sm font-medium ${activeLessonIndex === idx ? 'text-[#c9ccbb]' : 'text-[#c9ccbb]/60'}`}>
                   {lesson.title}
                 </h4>
                 <div className="flex items-center gap-2 mt-1 text-[10px] text-[#c9ccbb]/30 uppercase tracking-widest">
                    <Clock size={10} /> {lesson.duration}
                 </div>
               </div>
             </button>
           ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-grow overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8 md:p-16">
           
           {/* Lesson Header */}
           <div className="mb-8 border-b border-[#c9ccbb]/10 pb-8">
              <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2 block">
                {activeLesson.type === 'exercise' ? 'Somatic Practice' : 'Core Concept'}
              </span>
              <h1 className="text-3xl md:text-4xl font-serif text-[#c9ccbb] mb-6">
                {activeLesson.title}
              </h1>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 px-3 py-1 bg-[#c9ccbb]/5 rounded-full text-[#c9ccbb]/60 text-xs">
                   <Clock size={14} /> {activeLesson.duration}
                 </div>
              </div>
           </div>

           {/* Lesson Body */}
           <div className="prose prose-invert prose-lg max-w-none text-[#c9ccbb]/80 leading-loose">
             {/* Note: In a real app, use a Markdown parser here. For now, simple text. */}
             <p className="whitespace-pre-wrap">{activeLesson.content}</p>
           </div>

           {/* Footer Action */}
           <div className="mt-16 pt-8 border-t border-[#c9ccbb]/10 flex justify-end">
             {activeLessonIndex < module.lessons.length - 1 ? (
               <button 
                 onClick={() => setActiveLessonIndex(prev => prev + 1)}
                 className="px-8 py-3 bg-[#c9ccbb] text-[#1b270e] font-bold rounded-xl hover:bg-[#fff] transition-all"
               >
                 Next Lesson
               </button>
             ) : (
               <Link href="/coaching">
                 <button className="px-8 py-3 bg-[#b5a642] text-[#1b270e] font-bold rounded-xl hover:bg-[#d4c55e] transition-all flex items-center gap-2">
                   <CheckCircle size={18} /> Complete Module
                 </button>
               </Link>
             )}
           </div>

        </div>
      </div>

    </div>
  )
}
