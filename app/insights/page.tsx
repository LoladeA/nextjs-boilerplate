'use client'

import Sidebar from '../components/Sidebar'
import { BookOpen, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default function Insights() {
  const articles = [
    {
      slug: "cortisol-space-connection", // <--- ADDED SLUG
      category: "Neuroscience",
      title: "The Cortisol-Space Connection",
      excerpt: "How open floor plans can inadvertently trigger low-level fight-or-flight responses.",
      readTime: "6 min read"
    },
    {
      slug: "circadian-anchors", // <--- ADDED SLUG
      category: "Light",
      title: "Circadian Anchors in the Home",
      excerpt: "Designing lighting protocols that reset your biological clock rather than disrupting it.",
      readTime: "4 min read"
    },
    {
      slug: "silent-stressor-reverberation", // <--- ADDED SLUG
      category: "Acoustics",
      title: "The Silent Stressor: Reverberation",
      excerpt: "Why modern hard surfaces increase cognitive load and reduce social connection.",
      readTime: "5 min read"
    },
    {
      slug: "refuge-and-prospect", // <--- ADDED SLUG
      category: "Psychology",
      title: "Refuge and Prospect",
      excerpt: "The evolutionary reason you feel safer with your back to a wall.",
      readTime: "7 min read"
    },
    {
      slug: "somatic-grounding", // <--- ADDED SLUG
      category: "Texture",
      title: "Somatic Grounding",
      excerpt: "Using tactile surfaces to manually down-regulate the nervous system.",
      readTime: "3 min read"
    }
  ]

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Insights Library</h1>
        <p className="text-[#c9ccbb]/60 mb-12 max-w-2xl">
          Evidence-based research on Neuroscience, Environmental Psychology, Interior Design and Sensory Health.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            // WRAPPER LINK ADDED BELOW
            <Link key={i} href={`/insights/${article.slug}`} className="block h-full">
                <div className="glass-panel p-8 rounded-2xl group cursor-pointer hover:bg-[#c9ccbb]/5 transition-all h-full flex flex-col justify-between border border-[#c9ccbb]/10 hover:border-[#b5a642]/30">
                  
                  <div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest border border-[#b5a642]/30 px-2 py-1 rounded">
                          {article.category}
                        </span>
                        <ArrowUpRight className="text-[#c9ccbb]/20 group-hover:text-[#b5a642] group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" size={20} />
                      </div>
                      
                      <h3 className="text-xl font-serif text-[#c9ccbb] mb-3 group-hover:text-[#f0e6b5] transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-[#c9ccbb]/60 text-sm leading-relaxed mb-6">
                        {article.excerpt}
                      </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[#c9ccbb]/40 text-xs uppercase tracking-widest pt-4 border-t border-[#c9ccbb]/5">
                    <BookOpen size={12} />
                    {article.readTime}
                  </div>
                </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
