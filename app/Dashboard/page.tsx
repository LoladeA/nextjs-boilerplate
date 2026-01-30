'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const RadarChart = dynamic(() => import('@/components/RadarChart'), { ssr: false })
const TrendChart = dynamic(() => import('@/components/TrendChart'), { ssr: false })

interface UserResponse {
  assessment_step: number
  question_key: string
  answer: { response: string | number }
}

export default function DashboardPage() {
  const router = useRouter()
  const [responses, setResponses] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResponses() {
      const user = await supabaseBrowser.auth.getUser()
      const userId = user.data.user?.id
      if (!userId) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      const { data, error } = await supabaseBrowser
        .from<UserResponse>('user_responses')
        .select('*')
        .eq('user_id', userId)

      if (error) setError(error.message)
      else setResponses(data || [])
      setLoading(false)
    }

    fetchResponses()
  }, [])

  // Compute simple signal scores
  const signals = {
    environmentalLoad: 0,
    spatialDysregulation: 0,
    biologicalMismatch: 0
  }

  responses.forEach((r) => {
    const val = Number(r.answer.response) || 0
    if (['thermal_friction', 'stress_spikes', 'cognitive_fog', 'circadian_sync'].includes(r.question_key)) {
      signals.environmentalLoad += val
    } else if (
      [
        'visual_entropy',
        'acoustic_intrusions',
        'lighting_fatigue',
        'tactile_grounding',
        'spatial_resonance',
        'movement_flow',
        'zoning_conflict',
        'glare_sensitivity',
        'internal_noise',
        'acoustic_privacy',
        'tactile_aversions'
      ].includes(r.question_key)
    ) {
      signals.spatialDysregulation += val
    } else {
      signals.biologicalMismatch += val
    }
  })

  return (
    <div className="min-h-screen p-6 bg-green-900 text-cfc993">
      <h1 className="text-4xl font-semibold mb-8 text-center opacity-0 animate-fadeIn">
        Your Home Nervous System Dashboard
      </h1>

      {loading ? (
        <p className="text-center text-yellow-500 opacity-0 animate-fadeIn">Loading your assessment data...</p>
      ) : error ? (
        <p className="text-center text-red-600 opacity-0 animate-fadeIn">{error}</p>
      ) : (
        <div className="space-y-8">
          {/* Signal Summaries */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-0 animate-fadeIn">
            <div className="bg-6d6f52/80 p-6 rounded-xl text-center transform transition duration-300 hover:scale-105 hover:shadow-lg">
              <h2 className="text-xl font-semibold mb-2">Environmental Load</h2>
              <p className="text-3xl">{signals.environmentalLoad}</p>
            </div>
            <div className="bg-6d6f52/80 p-6 rounded-xl text-center transform transition duration-300 hover:scale-105 hover:shadow-lg">
              <h2 className="text-xl font-semibold mb-2">Spatial Dysregulation</h2>
              <p className="text-3xl">{signals.spatialDysregulation}</p>
            </div>
            <div className="bg-6d6f52/80 p-6 rounded-xl text-center transform transition duration-300 hover:scale-105 hover:shadow-lg">
              <h2 className="text-xl font-semibold mb-2">Biological Mismatch</h2>
              <p className="text-3xl">{signals.biologicalMismatch}</p>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-6d6f52/80 p-6 rounded-xl opacity-0 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">Visual Summary</h2>
            <RadarChart data={signals} />
          </div>

          {/* Trend Chart */}
          <div className="bg-6d6f52/80 p-6 rounded-xl opacity-0 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">Trends Over Time</h2>
            <TrendChart responses={responses} />
          </div>

          {/* Priority Recommendations */}
          <div className="bg-6d6f52/80 p-6 rounded-xl opacity-0 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">Priority Recommendations</h2>
            <ul className="list-disc pl-6 space-y-2">
              {signals.environmentalLoad > 10 && <li>Reduce small environmental stressors (noise, clutter, lighting).</li>}
              {signals.spatialDysregulation > 15 && <li>Optimize room flow and zoning conflicts.</li>}
              {signals.biologicalMismatch > 8 && <li>Adjust for sensory alignment and thermal comfort.</li>}
            </ul>
          </div>

          {/* Coaching Modules CTA */}
          <div className="text-center opacity-0 animate-fadeIn">
            <button
              onClick={() => router.push('/coaching')}
              className="bg-yellow-500 text-green-900 font-semibold py-3 px-8 rounded-lg transform transition duration-300 hover:scale-105 hover:shadow-lg"
            >
              Explore Sensory Coaching Modules
            </button>
          </div>

          {/* Bottom Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 opacity-0 animate-fadeIn">
            <div
              onClick={() => router.push('/assessments')}
              className="bg-6d6f52/80 p-6 rounded-xl cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-lg hover:bg-green-800"
            >
              <h3 className="text-lg font-semibold mb-2">Retake Assessment</h3>
              <p>Complete a new sensory intelligence questionnaire.</p>
            </div>
            <div
              onClick={() => router.push('/wellbeing')}
              className="bg-6d6f52/80 p-6 rounded-xl cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-lg hover:bg-green-800"
            >
              <h3 className="text-lg font-semibold mb-2">Log Wellbeing</h3>
              <p>Track your mood, stress, and focus levels.</p>
            </div>
            <div
              onClick={() => router.push('/photos')}
              className="bg-6d6f52/80 p-6 rounded-xl cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-lg hover:bg-green-800"
            >
              <h3 className="text-lg font-semibold mb-2">Upload Photos</h3>
              <p>Document your priority rooms and track changes over time.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
