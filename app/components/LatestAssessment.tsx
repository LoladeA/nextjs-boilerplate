'use client'

import { motion } from 'framer-motion'

export default function LatestAssessment({ data }: { data: any[] }) {
  // Helper: Convert 1-5 scale (where 5 is bad) to a 0-100 Score (where 100 is good)
  const calculateScore = (key: string) => {
    const entry = data.find(d => d.question_key === key)
    const val = entry?.answer?.response || 3 
    // Formula: (5 - value) * 25. Example: Value 1 (No fatigue) = 100. Value 5 (High fatigue) = 0.
    return (5 - Number(val)) * 25
  }

  const scores = [
    { label: 'Lighting', val: calculateScore('lighting_fatigue') },
    { label: 'Acoustics', val: calculateScore('acoustic_intrusions') },
    { label: 'Spatial Flow', val: calculateScore('movement_flow') },
    { label: 'Texture', val: calculateScore('tactile_aversions') },
    { label: 'Color', val: 100 }, // Placeholder until we add Color questions
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl p-8 border border-[#c9ccbb]/20 shadow-sm mb-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1b270e]">Latest Assessment</h2>
          <p className="text-sm text-[#1b270e]/50">Breakdown of your sensory load factors</p>
        </div>
        <button className="px-6 py-2 border border-[#c9ccbb] rounded-lg text-sm hover:bg-[#c9ccbb]/10 transition-colors text-[#1b270e]">
          View Full Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        {scores.map((s) => (
          <div key={s.label} className="flex flex-col">
            <span className="text-xs font-bold text-[#1b270e]/60 mb-1">{s.label}</span>
            <span className="text-3xl font-serif text-[#1b270e]">
              {s.val.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
