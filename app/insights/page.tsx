'use client'
import Sidebar from '../components/Sidebar'
import { BookOpen, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default function Insights() {

  // ---------------------------------------------------------------------------
  // NEW — pinned to top. Direct platform companions.
  // ---------------------------------------------------------------------------
  const featuredArticles = [
    {
      slug: "why-sleep-is-not-linear",
      category: "Sleep",
      title: "Why Sleep Is Not Linear",
      excerpt: "What night-to-night variability actually means, and why it is not evidence that something is wrong with you.",
      readTime: "6 min read"
    },
    {
      slug: "the-two-hour-window",
      category: "Sleep",
      title: "The Two-Hour Window",
      excerpt: "What your nervous system is doing in the 90–120 minutes before sleep and why your environment either supports or disrupts it.",
      readTime: "5 min read"
    },
    {
      slug: "why-14-days",
      category: "Pattern",
      title: "Why 14 Days",
      excerpt: "Why a single reading tells you almost nothing, and what a rolling two-week window reveals that no single day can.",
      readTime: "5 min read"
    },
  ]

  // ---------------------------------------------------------------------------
  // EXISTING — follow below
  // ---------------------------------------------------------------------------
  const articles = [
    {
      slug: "cortisol-space-connection",
      category: "Neuroscience",
      title: "The Cortisol-Space Connection",
      excerpt: "How open floor plans can inadvertently trigger low-level fight-or-flight responses.",
      readTime: "6 min read"
    },
    {
      slug: "circadian-anchors",
      category: "Light",
      title: "Circadian Anchors in the Home",
      excerpt: "Designing lighting protocols that reset your biological clock rather than disrupting it.",
      readTime: "4 min read"
    },
    {
      slug: "silent-stressor-reverberation",
      category: "Acoustics",
      title: "The Silent Stressor: Reverberation",
      excerpt: "Why modern hard surfaces increase cognitive load and reduce social connection.",
      readTime: "5 min read"
    },
    {
      slug: "refuge-and-prospect",
      category: "Psychology",
      title: "Refuge and Prospect",
      excerpt: "The evolutionary reason you feel safer with your back to a wall.",
      readTime: "7 min read"
    },
    {
      slug: "somatic-grounding",
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
        <p className="text-[#c9ccbb]/70 mb-12 max-w-2xl">
          Evidence-based research on Neuroscience, Environmental Psychology, Interior Design and Sensory Health.
        </p>

        {/* ------------------------------------------------------------------ */}
        {/* FEATURED — gold sandblasted glass, same treatment as coaching cards */}
        {/* ------------------------------------------------------------------ */}
        <div className="mb-3">
          <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest">
            Start Here
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {featuredArticles.map((article, i) => (
            <Link key={i} href={`/insights/${article.slug}`} className="block h-full">
              <div
                className="glass-panel p-8 rounded-3xl border flex flex-col justify-between h-full group cursor-pointer transition-all duration-300 border-[#c9ccbb]/20 hover:border-[#b5a642]/50 hover:shadow-[0_0_30px_rgba(181,166,66,0.07)]"
                style={{
                  background: 'linear-gradient(135deg, rgba(181,166,66,0.14) 0%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.38) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(181,166,66,0.18), inset 0 -1px 0 rgba(0,0,0,0.30)',
                }}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest border border-[#b5a642]/40 bg-[#b5a642]/8 px-2 py-1 rounded">
                      {article.category}
                    </span>
                    <ArrowUpRight
                      className="text-[#b5a642]/30 group-hover:text-[#b5a642] group-hover:-translate-y-1 group-hover:translate-x-1 transition-all"
                      size={20}
                    />
                  </div>
                  <h3 className="text-xl font-serif text-[#c9ccbb] mb-3 group-hover:text-[#f0e6b5] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-[#c9ccbb]/70 text-sm leading-relaxed mb-6">
                    {article.excerpt}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#c9ccbb]/50 text-xs uppercase tracking-widest pt-4 border-t border-[#b5a642]/15">
                  <BookOpen size={12} />
                  {article.readTime}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* ALL ARTICLES — same gold glass treatment for visual consistency     */}
        {/* ------------------------------------------------------------------ */}
        <div className="mb-3">
          <span className="text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest">
            All Articles
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <Link key={i} href={`/insights/${article.slug}`} className="block h-full">
              <div
                className="glass-panel p-8 rounded-3xl border flex flex-col justify-between h-full group cursor-pointer transition-all duration-300 border-[#c9ccbb]/10 hover:border-[#b5a642]/40 hover:shadow-[0_0_30px_rgba(181,166,66,0.05)]"
                style={{
                  background: 'linear-gradient(135deg, rgba(181,166,66,0.08) 0%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.32) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(181,166,66,0.10)',
                }}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest border border-[#b5a642]/30 px-2 py-1 rounded">
                      {article.category}
                    </span>
                    <ArrowUpRight
                      className="text-[#c9ccbb]/20 group-hover:text-[#b5a642] group-hover:-translate-y-1 group-hover:translate-x-1 transition-all"
                      size={20}
                    />
                  </div>
                  <h3 className="text-xl font-serif text-[#c9ccbb] mb-3 group-hover:text-[#f0e6b5] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-[#c9ccbb]/70 text-sm leading-relaxed mb-6">
                    {article.excerpt}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#c9ccbb]/50 text-xs uppercase tracking-widest pt-4 border-t border-[#c9ccbb]/8">
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
