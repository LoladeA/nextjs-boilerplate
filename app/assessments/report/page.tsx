import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, AlertCircle, Home, Download } from 'lucide-react'
import LightingAnalysis from '@/app/components/LightingAnalysis' // <--- IMPORT THE NEW ENGINE

export default async function AssessmentReport() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: { session } } = await supabase.auth.getSession()
  const { data: responses } = await supabase
    .from('user_responses')
    .select('*')
    .eq('user_id', session?.user.id)

  // 1. DATA PROCESSING
  const safeResponses = responses || []
  
  // General Scores
  const visualNoise = safeResponses.filter(r => r.question_key === 'visual_clutter').pop()?.answer?.response || 50
  const acoustic = safeResponses.filter(r => r.question_key === 'acoustic_irritation').pop()?.answer?.response || 50
  
  // Lighting Specific Scores (Defaults to 40 "Low" so you can see the UI for now)
  const lightScores = {
    circadian: Number(safeResponses.find(r => r.question_key === 'light_timing')?.answer?.response || 40),
    cortisol: Number(safeResponses.find(r => r.question_key === 'light_spectrum')?.answer?.response || 40),
    geometry: Number(safeResponses.find(r => r.question_key === 'light_geometry')?.answer?.response || 40)
  }

  // 2. CATEGORIZATION (High Level)
  const priorities = [
    { area: 'Visual Regulation', score: Number(visualNoise), priority: Number(visualNoise) < 50 ? 'High' : 'Low' },
    { area: 'Acoustic Comfort', score: Number(acoustic), priority: Number(acoustic) < 60 ? 'Medium' : 'Low' },
  ].filter(p => p.priority !== 'Low') 

  return (
    <div className="min-h-screen p-6 md:p-12">
      <Link href="/dashboard" className="flex items-center text-[#c9ccbb]/60 hover:text-[#b5a642] mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Sensory Intelligence Report</h1>
            <p className="text-[#c9ccbb]/60">Analysis of your environment's impact on your nervous system.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 px-6 py-3 border border-[#c9ccbb]/20 rounded-lg text-[#c9ccbb] hover:bg-[#c9ccbb]/10 text-sm">
             <Download size={16} /> Export PDF
          </button>
        </div>

        {/* SECTION 1: CRITICAL ALERTS (Acoustics & Visuals) */}
        {priorities.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-serif text-[#b5a642] mb-6">High Priority Actions</h2>
            <div className="grid gap-6">
              {priorities.map((p, i) => (
                <div key={i} className="glass-panel p-8 rounded-2xl border-l-4 border-[#b5a642]">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl text-[#c9ccbb] font-medium">{p.area}</h3>
                    <span className="px-3 py-1 bg-[#b5a642]/20 text-[#b5a642] text-xs rounded-full uppercase tracking-widest">
                      {p.priority} Priority
                    </span>
                  </div>
                  <p className="text-[#c9ccbb]/80 leading-relaxed">
                    Your score ({p.score}%) indicates this area is a significant drain on your energy. 
                    Immediate intervention is recommended to restore cognitive capacity.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: THE LIGHTING INTELLIGENCE ENGINE (Inserted Here) */}
        <div className="mb-16">
          <LightingAnalysis scores={lightScores} />
        </div>

        {/* SECTION 3: GENERAL ENHANCEMENT */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-[#c9ccbb] mb-6">General Enhancement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-xl">
              <Home className="text-[#b5a642] mb-4" size={24} />
              <h3 className="text-lg text-[#c9ccbb] mb-2">Biophilic Integration</h3>
              <p className="text-sm text-[#c9ccbb]/60">Increase visible plant life in your peripheral vision to lower cortisol.</p>
            </div>
            {/* You can add more cards here later */}
          </div>
        </div>

        {/* SECTION 4: NEXT STEPS */}
        <div className="border-t border-[#c9ccbb]/10 pt-12">
          <h3 className="text-xl text-[#c9ccbb] mb-6">Next Steps</h3>
          <div className="flex gap-4">
             <Link href="/photos" className="px-6 py-3 bg-[#c9ccbb] text-[#1b270e] rounded-lg font-bold hover:bg-[#e3e6d5]">
               Document Space
             </Link>
             <Link href="/wellbeing" className="px-6 py-3 glass-panel text-[#c9ccbb] rounded-lg hover:bg-[#c9ccbb]/10">
               Track Wellbeing
             </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
