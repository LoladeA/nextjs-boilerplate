'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

// High-integrity chart imports
const RadarChart = dynamic(() => import('../components/RadarChart'), { ssr: false })
const TrendChart = dynamic(() => import('../components/TrendChart'), { ssr: false })

interface UserResponse {
  assessment_step: number
  question_key: string
  answer: { response: string | number }
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [responses, setResponses] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResponses() {
      // 1. Identify the inhabitant via session
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError || !session) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      // 2. Fetch the data from our Intelligence Layer
      const { data, error: fetchError } = await supabase
        .from('user_responses')
        .select('assessment_step, question_key, answer')
        .eq('user_id', session.user.id)

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setResponses((data as UserResponse[]) || [])
      }
      setLoading(false)
    }

    fetchResponses()
  }, [supabase])

  // 3. Compute Intelligence Layers (Refined Signal Logic)
  const signals = {
    environmentalLoad: 0,
    spatialDysregulation: 0,
    biologicalMismatch: 0
  }

  responses.forEach((r) => {
    const val = Number(r.answer?.response) || 0
    // Grouping logic based on your neuro-design methodology
    if (['thermal_friction', 'stress_spikes', 'cognitive_fog', 'circadian_sync'].includes(r.question_key)) {
      signals.environmentalLoad += val
    } else if (
      ['visual_entropy', 'acoustic_intrusions', 'lighting_fatigue', 'tactile_grounding', 'spatial_resonance'].includes(r.question_key)
    ) {
      signals.spatialDysregulation += val
    } else {
      signals.biologicalMismatch += val
    }
  })

  return (
    <div className="min-h-screen p-8 bg-[#1b270e] text-[#c9ccbb]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-serif text-[#b5a642] mb-4">Internal Landscape Dashboard</h1>
          <p className="opacity-60 uppercase tracking-widest text-sm">Regulation Metrics & Sensory Clarity</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="animate-pulse text-[#b5a642]">Calibrating sensory data...</p>
          </div>
        ) : error ? (
          <p className="text-center text-red-400">{error}</p>
        ) : (
          <div className="space-y-12">
            
            {/* Signal Summaries: Mirroring the User's State */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Environmental Load', value: signals.environmentalLoad, desc: 'External stressors taxing the nervous system.' },
                { label: 'Spatial Dysregulation', value: signals.spatialDysregulation, desc: 'Misalignment between layout and flow.' },
                { label: 'Biological Mismatch', value: signals.biologicalMismatch, desc: 'Home failing to adapt to neuro-biological needs.' }
              ].map((signal) => (
                <div key={signal.label} className="bg-[#c9ccbb]/5 border border-[#c9ccbb]/10 p-8 rounded-3xl transition-all hover:bg-[#c9ccbb]/10">
                  <h3 className="text-[#b5a642] text-xs uppercase tracking-widest mb-4">{signal.label}</h3>
                  <p className="text-4xl font-light mb-2">{signal.value}</p>
                  <p className="text-xs opacity-60 leading-relaxed">{signal.desc}</p>
                </div>
              ))}
            </div>

            {/* Visualization Layer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#c9ccbb]/5 border border-[#c9ccbb]/10 p-8 rounded-3xl">
                <h3 className="text-[#b5a642] text-xs uppercase tracking-widest mb-6">Visual Summary (Radar)</h3>
                <div className="h-[300px] flex items-center justify-center">
                   <RadarChart data={signals} />
                </div>
              </div>
              <div className="bg-[#c9ccbb]/5 border border-[#c9ccbb]/10 p-8 rounded-3xl">
                <h3 className="text-[#b5a642] text-xs uppercase tracking-widest mb-6">Response Timeline</h3>
                <div className="h-[300px] flex items-center justify-center">
                   <TrendChart responses={responses} />
                </div>
              </div>
            </div>

            {/* Priority Recommendations: The Path Forward */}
            <section className="bg-[#b5a642] text-[#1b270e] p-10 rounded-3xl">
              <h2 className="text-2xl font-serif mb-6">Strategic Directions</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <ul className="space-y-4">
                  {signals.environmentalLoad > 10 && (
                    <li className="flex gap-3">
                      <span className="font-bold">→</span> 
                      <p>Implement **Acoustic Dampening** to reduce the current Environmental Load.</p>
                    </li>
                  )}
                  {signals.spatialDysregulation > 15 && (
                    <li className="flex gap-3">
                      <span className="font-bold">→</span> 
                      <p>Address **Zoning Conflicts** in the primary living space to restore agency.</p>
                    </li>
                  )}
                </ul>
                <div className="flex flex-col justify-center">
                  <button
                    onClick={() => router.push('/coaching')}
                    className="bg-[#1b270e] text-[#c9ccbb] py-4 px-8 rounded-full font-medium transition-all hover:scale-105"
                  >
                    Enter Coaching Modules
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
