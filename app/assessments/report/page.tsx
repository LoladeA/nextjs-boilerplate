import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, AlertCircle, Home } from 'lucide-react'

export default async function AssessmentReport() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: { session } } = await supabase.auth.getSession()
  const { data: responses } = await supabase
    .from('user_responses')
    .select('*')
    .eq('user_id', session?.user.id)

  // Calculate scores (Simple logic for now - expandable later)
  const safeResponses = responses || []
  const visualNoise = safeResponses.filter(r => r.question_key === 'visual_clutter').pop()?.answer?.response || 50
  const acoustic = safeResponses.filter(r => r.question_key === 'acoustic_irritation').pop()?.answer?.response || 50
  
  // Categorize
  const priorities = [
    { area: 'Visual Regulation', score: Number(visualNoise), priority: Number(visualNoise) < 50 ? 'High' : 'Low' },
    { area: 'Acoustic Comfort', score: Number(acoustic), priority: Number(acoustic) < 60 ? 'Medium' : 'Low' },
  ].filter(p => p.priority !== 'Low') // Only show issues

  return (
    <div className="min-h-screen p-6 md:p-12">
      <Link href="/dashboard" className="flex items-center text-[#c9ccbb]/60 hover:text-[#b5a642] mb-8">
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Sensory Intelligence Report</h1>
        <p className="text-[#c9ccbb]/60 mb-12">Analysis of your environment's impact on your nervous system.</p>

        {/* PRIORITY RECOMMENDATIONS */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif text-[#b5a642] mb-6">High Priority Actions</h2>
          <div className="grid gap-6">
            {priorities.length > 0 ? priorities.map((p, i) => (
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
            )) : (
              <div className="glass-panel p-8 rounded-2xl">
                <p className="text-[#c9ccbb]">Your environment is currently well-regulated. Continue monitoring.</p>
              </div>
            )}
          </div>
        </div>

        {/* HOME ENHANCEMENT */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif text-[#c9ccbb] mb-6">Home Enhancement Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-xl">
              <Home className="text-[#b5a642] mb-4" size={24} />
              <h3 className="text-lg text-[#c9ccbb] mb-2">Biophilic Integration</h3>
              <p className="text-sm text-[#c9ccbb]/60">Increase visible plant life in your peripheral vision to lower cortisol.</p>
            </div>
            <div className="glass-panel p-6 rounded-xl">
              <AlertCircle className="text-[#b5a642] mb-4" size={24} />
              <h3 className="text-lg text-[#c9ccbb] mb-2">Lighting Rhythm</h3>
              <p className="text-sm text-[#c9ccbb]/60">Your light intake data suggests a need for warmer temperatures (2700K) after sunset.</p>
            </div>
          </div>
        </div>

        {/* NEXT STEPS */}
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
