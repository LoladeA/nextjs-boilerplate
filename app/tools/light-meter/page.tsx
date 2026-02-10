'use client'

import Sidebar from '../../../components/Sidebar'
import { useState, useEffect } from 'react'
import { Sun, Moon, Zap, ArrowDown, ArrowUp, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import Link from 'next/link'

export default function LightMeterTool() {
  
  // STATE
  const [lux, setLux] = useState<string>('')
  const [mood, setMood] = useState<number>(3) // 1 (Dysregulated) - 5 (Resonant)
  const [time, setTime] = useState<Date | null>(null)
  const [recommendation, setRecommendation] = useState<any>(null)

  // 1. GET LOCAL TIME ON MOUNT
  useEffect(() => {
    setTime(new Date())
  }, [])

  // 2. THE INTELLIGENCE ENGINE
  const analyzeLight = () => {
    if (!lux || !time) return

    const currentLux = parseInt(lux)
    const hour = time.getHours()
    const isDysregulated = mood <= 2 // High Stress
    
    let phase = ''
    let target = ''
    let status: 'ideal' | 'too_high' | 'too_low' = 'ideal'
    let advice = ''
    let science = ''

    // --- PHASE 1: MORNING (5AM - 11AM) ---
    if (hour >= 5 && hour < 11) {
      phase = 'Circadian Awakening'
      const minLux = 1000
      
      if (currentLux < minLux) {
        status = 'too_low'
        advice = isDysregulated 
          ? "Your nervous system needs an anchor. Sit within 1 meter of a window to reset your cortisol rhythm."
          : "Light level is insufficient for wakefulness. Step outside or maximise window exposure."
        science = "Morning photons trigger the suprachiasmatic nucleus to clear adenosine (sleep pressure)."
      } else {
        advice = "Excellent. This intensity supports optimal cortisol production."
      }
    } 
    
    // --- PHASE 2: MIDDAY (11AM - 5PM) ---
    else if (hour >= 11 && hour < 17) {
      phase = 'Active Focus'
      const minLux = 500
      
      if (currentLux < minLux) {
        status = 'too_low'
        advice = "Low light may cause drowsiness. Increase ambient brightness to sustain cognitive load."
      } else if (currentLux > 2000 && isDysregulated) {
        status = 'too_high'
        advice = "High intensity may overstimulate a sensitised nervous system. Use blinds or sheer curtains to diffuse direct glare."
      } else {
        advice = "Optimal range for executive function."
      }
    }

    // --- PHASE 3: EVENING (5PM - 9PM) ---
    else if (hour >= 17 && hour < 21) {
      phase = 'Biological Wind-Down'
      const maxLux = 50 // Strict limit
      
      if (currentLux > maxLux) {
        status = 'too_high'
        advice = isDysregulated
          ? "CRITICAL: High light is blocking melatonin. Turn off ALL overhead lights immediately."
          : "Too bright. Switch to floor and table lamps (< 2700K) to signal sleep onset."
        science = "Lux > 50 in the evening suppresses melatonin by up to 50%, delaying recovery."
      } else {
        advice = "Perfect. This 'twilight' level signals safety and recovery."
      }
    }

    // --- PHASE 4: NIGHT (9PM - 5AM) ---
    else {
      phase = 'Cellular Repair'
      const maxLux = 10
      
      if (currentLux > maxLux) {
        status = 'too_high'
        advice = "Light pollution detected. Use blackout curtains or an eye mask to protect sleep architecture."
      } else {
        advice = "Deep darkness achieved. Rest well."
      }
    }

    setRecommendation({ phase, status, advice, science })
  }

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12 flex flex-col justify-center items-center">
        
        <div className="max-w-2xl w-full">
          
          {/* HEADER */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b5a642]/10 text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-4">
              <Sun size={14} /> Circadian Alignment Tool
            </div>
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Light Logic™ Meter</h1>
            <p className="text-[#c9ccbb]/60">
              Measure, don't guess. Align your environment with your biology.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 bg-[#000]/20">
            
            {/* INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              
              {/* 1. LUX INPUT */}
              <div>
                <label className="text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest mb-3 block">
                  Current Lux Reading
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={lux}
                    onChange={(e) => setLux(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full bg-[#1b270e] border border-[#c9ccbb]/20 rounded-xl p-4 text-[#c9ccbb] text-lg font-serif focus:outline-none focus:border-[#b5a642]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9ccbb]/30 text-xs font-bold">LUX</span>
                </div>
                <p className="text-[10px] text-[#c9ccbb]/30 mt-2">
                  *Use a phone app (e.g. "Lux Light Meter") to get this number.
                </p>
              </div>

              {/* 2. NERVOUS SYSTEM STATE */}
              <div>
                <label className="text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest mb-3 block">
                  Current State
                </label>
                <div className="flex justify-between gap-2 bg-[#1b270e] p-1 rounded-xl border border-[#c9ccbb]/20">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setMood(level)}
                      className={`
                        w-full py-3 rounded-lg text-sm font-bold transition-all
                        ${mood === level ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/40 hover:text-[#c9ccbb]'}
                      `}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-[#c9ccbb]/40 uppercase tracking-widest">
                  <span>Dysregulated</span>
                  <span>Resonant</span>
                </div>
              </div>
            </div>

            {/* ACTION */}
            <button 
              onClick={analyzeLight}
              disabled={!lux}
              className="w-full py-4 bg-[#c9ccbb]/10 border border-[#c9ccbb]/20 hover:bg-[#b5a642] hover:text-[#1b270e] hover:border-[#b5a642] text-[#c9ccbb] rounded-xl font-bold text-xs uppercase tracking-widest transition-all mb-8"
            >
              Analyse Light Load
            </button>

            {/* RESULTS DASHBOARD */}
            {recommendation && (
              <div className="animate-fade-in-up">
                <div className={`p-6 rounded-2xl border mb-6 ${
                  recommendation.status === 'ideal' ? 'bg-emerald-900/20 border-emerald-500/30' : 
                  recommendation.status === 'too_high' ? 'bg-amber-900/20 border-amber-500/30' : 
                  'bg-blue-900/20 border-blue-500/30'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      recommendation.status === 'ideal' ? 'bg-emerald-500/20 text-emerald-400' : 
                      recommendation.status === 'too_high' ? 'bg-amber-500/20 text-amber-400' : 
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {recommendation.status === 'ideal' ? <CheckCircle size={24} /> : 
                       recommendation.status === 'too_high' ? <ArrowDown size={24} /> : 
                       <ArrowUp size={24} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-serif text-[#c9ccbb] mb-1">
                        {recommendation.status === 'ideal' ? 'Environment Aligned' : 
                         recommendation.status === 'too_high' ? 'Reduce Intensity' : 
                         'Increase Intensity'}
                      </h3>
                      <p className="text-[#c9ccbb]/80 text-sm leading-relaxed mb-4">
                        {recommendation.advice}
                      </p>
                      
                      {recommendation.science && (
                        <div className="flex gap-2 text-[10px] text-[#c9ccbb]/50 uppercase tracking-widest border-t border-[#c9ccbb]/10 pt-3">
                          <Info size={12} />
                          <span>Science: {recommendation.science}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center">
                <Link href="/dashboard" className="text-[#c9ccbb]/40 text-xs hover:text-[#b5a642] transition-colors">
                    ← Back to Toolkit
                </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
