'use client'

import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { Heart, Wind, Sun, Volume2, CheckCircle, TrendingUp, Activity, AlertCircle, Zap, ShieldAlert, Loader2, Moon, Sunrise, Brain, Fingerprint, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import CorrelationGraph from './CorrelationGraph'
import { LightSensorModal } from '../tools/light-meter/page'
import { NoiseSensorModal } from '../tools/noise-meter/page'

export default function Progress() {
  const supabase = createClientComponentClient()
  
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning')

  // --- ACCESS CONTROL ---
  const [isPremium, setIsPremium] = useState(false)
  const [godMode, setGodMode] = useState(false)

  // --- LOGGING STATE ---
  const [morningMood, setMorningMood] = useState<number | null>(null)
  const [morningTags, setMorningTags] = useState<string[]>([])
  const [morningNote, setMorningNote] = useState('')
  
  // --- TEMPORAL ENVIRONMENTAL INPUTS ---
  const [morningLux, setMorningLux] = useState<string>('') 
  const [nighttimeDb, setNighttimeDb] = useState<string>('')
  const [eveningLux, setEveningLux] = useState<string>('')
  const [daytimeDb, setDaytimeDb] = useState<string>('')

  // --- METER MODAL STATES ---
  const [isLightMeterOpen, setIsLightMeterOpen] = useState(false)
  const [isAcousticMeterOpen, setIsAcousticMeterOpen] = useState(false)
  const [activeMeterTarget, setActiveMeterTarget] = useState<'morningLux' | 'eveningLux' | 'daytimeDb' | 'nighttimeDb' | null>(null)
  
  // BIO-METRICS
  const [focusScore, setFocusScore] = useState<number>(0)
  const [tensionScore, setTensionScore] = useState<number>(0)
  const [wakeScore, setWakeScore] = useState<number>(0)

  const [eveningMood, setEveningMood] = useState<number | null>(null)
  const [eveningTags, setEveningTags] = useState<string[]>([])
  const [eveningNote, setEveningNote] = useState('')

  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  // --- SOFT-GATE VALIDATION STATE ---
  const [showAccuracyWarning, setShowAccuracyWarning] = useState(false)

  // --- 🟢 BSFI STATE ---
  const [bsfiData, setBsfiData] = useState<{ total_score: number, dominant_domain: string, is_internal_driver: boolean } | null>(null)

  // ACCORDION STATES
  const [isMorningOpen, setIsMorningOpen] = useState(false)
  const [isEveningOpen, setIsEveningOpen] = useState(false)
  const [isSynthesisExpanded, setIsSynthesisExpanded] = useState(false) 
  
  // CHART STATE
  const [chartLogs, setChartLogs] = useState<any[]>([])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 17) setActiveTab('evening')
  }, [])

  useEffect(() => {
    checkAccess()
    fetchTodayLog()
    fetchHistory()
  }, [])

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email === 'christchilde@gmail.com') {
      setGodMode(true)
    }
  }

  const hasAccess = isPremium || godMode

  // --- FEEDBACK ENGINE LOGIC ---
  const getMorningFeedback = () => {
    if (tensionScore >= 7 && wakeScore >= 3) return {
      title: "The System Was Working Through the Night",
      reframe: "What you felt on waking is not a failure of sleep. It is the trace of active biological labour. Your nervous system was processing accumulated daytime load, navigating hormonal cycles, or responding to sensory intrusion that your sleeping environment did not adequately support or absorb. Your body did what it was designed to do. The environment did not hold it.",
      direction: "The priority is your sleep envelope: absolute darkness, a stable ambient temperature, a robust pre-sleep routine and organic breathable sleepwear that removes thermoregulatory friction from the recovery equation. Reduce what the system has to manage at 2am, and it will spend that energy on restoration instead."
    }
    if (tensionScore >= 7) return {
      title: "You Slept Through, But Your Body Was Bracing Itself",
      reframe: "Continuous sleep is not the same as restorative sleep. When muscular tension persists through the night, it indicates the nervous system remained in a low-grade protective state: bracing against residual stress, uncomfortable materials, inadequate sleep support or acoustic intrusion that never fully resolved. You rested. You did not recover.",
      direction: "Work backwards from the source: unresolved physical tension before bed, the acoustic quality of your sleep environment, and the materials you are sleeping on and in. Each is a variable within your control."
    }
    if (wakeScore >= 3) return {
      title: "Interrupted Sleep Is Often an Environmental Signal",
      reframe: "Waking through the night —particularly if re-entry is relatively easy— is less often a sign of dysregulation than a sign of thermoregulatory shift. Night sweats, hormonal fluctuations, or subtle changes in ambient temperature are among the most common and most overlooked disruptors. Your nervous system is not the problem. Its environment may not be matching its needs.",
      direction: "Focus on the recovery envelope: breathable organic sleepwear, a cooler ambient temperature, and complete darkness. These three variables together reduce the physiological triggers that pull the system up from deep sleep."
    }
    return {
      title: "Environment Held. System Restored",
      reframe: "This is what successful environmental design produces: a night in which your nervous system was not required to manage, defend, or compensate. It simply recovered. That distinction matters: a regulated morning is not luck. It is the result of an environment that absorbed your physical needs and returned you to capacity.",
      direction: "Maintain what is working. Your sensory boundaries, thermal ecology, and evening wind-down pattern are functioning as an eco-system. The task now is to protect them, particularly during periods of higher stress, when the temptation to compromise the environment increases."
    }
  }

  const getEveningFeedback = () => {
    if (focusScore >= 8) return {
      title: "High Cognitive Output Requires Deliberate Recovery",
      reframe: "Extended time in high-beta execution mode — sustained focus, decision-making, problem-solving — is a central nervous system stressor in the same category as physical exertion. The day was productive. The nervous system is now carrying that cost. Recovery is not optional tonight; it is proportional to output.",
      direction: "Tonight's environment must match today's demand. Transition strictly to warm, low-level lighting. This is not aesthetic preference but a direct instruction to your melatonin pathway. Protect your wind down routine after work with the same intentionality you protect your peak focus window."
    }
    if (focusScore >= 4) return {
      title: "Output Was Balanced. Protect the Transition",
      reframe: "A sustainable ratio of deep work to recovery indicates your environment was supporting your capacity rather than extracting from it. That balance reflects an alignment between your energy curve and your spatial conditions. Your nervous system is not depleted, but transitions matter: how the evening begins determines whether that capacity is replenished or quietly eroded overnight.",
      direction: "Step out of optimisation mode with a deliberate act, not a gradual drift. One small environmental reset, such as clearing the first surface you will see tomorrow morning or closing the workshop moving away from your work zone, signals to the nervous system that the day has ended and the recovery cycle has begun."
    }
    return {
      title: "Low Output Is an Environmental Symptom, Not a Personal One",
      reframe: "When capacity feels constrained despite effort, the instinct is to attribute it to discipline or motivation. That is rarely the case. Constrained cognitive output is most often the product of environmental friction such as visual noise, interruption patterns, inadequate lighting, or a space that does not signal focus clearly enough for the brain to enter and sustain it. The environment set the conditions. You responded to them.",
      direction: "Do not attempt to recover through effort tonight. Instead, remove friction: evaluate the visual noise in your primary spaces, identify what broke your attention during the day, and approach this evening as architectural decompression, the deliberate restoration of the conditions capacity requires."
    }
  }

  const getMacroSynthesis = () => {
    // 1. If not enough days or BSFI hasn't calculated yet
    if (chartLogs.length < 14 || !bsfiData) {
      return {
        ready: false,
        daysLeft: Math.max(0, 14 - chartLogs.length),
        title: "System Calibrating",
        paragraphs: [
          `Log ${Math.max(0, 14 - chartLogs.length)} more days to generate your biological rhythm synthesis. The engine requires a complete cycle to identify environmental friction patterns.`
        ]
      }
    }

    // 2. 🟢 THE NEUROTYPE INCLUSIVITY SAFEGUARD
    if (bsfiData.is_internal_driver) {
       return {
          ready: true,
          title: "Environment is Stable. Fluctuation is Internal.",
          paragraphs: [
            "Over the last fourteen days, your somatic tension and focus have shown high variance, but your environmental metrics (light, noise) have remained remarkably stable.",
            "This data signature tells us the friction you are feeling is not coming from your physical space. It is biological or cognitive, such as a period of high emotional demand, cyclical changes, or natural energy rhythms.",
            "The appropriate response to this phase is not spatial optimisation. Do not attempt to fix the room today; instead, lower your overall demands and allow your body to move through its natural rhythm without adding extra friction."
          ]
       }
    }

    const score = bsfiData.total_score;
    const domain = bsfiData.dominant_domain;

    // 3. 0–20: LOW FRICTION
    if (score <= 20) {
      return {
        ready: true,
        title: "Low Friction Environment: Regulated Ground",
        paragraphs: [
          "Across the board, your Bio-Spatial Friction Index is exceptionally low. This is the result of an environment that is doing its job: absorbing daily load, supporting overnight recovery, and returning you to capacity.",
          "What this data confirms is that your current environmental conditions are not accidental. Your sensory boundaries, thermal ecology, and recovery architecture are functioning as a coherent system.",
          "The task now is to protect this baseline. Document what is working right now so you can replicate it during periods of elevated stress or seasonal change."
        ]
      }
    }
    
    // 4. 21–60: MODERATE STRAIN (Targeting the Sub-Score)
    if (score <= 60) { 
      return {
        ready: true,
        title: `Moderate Strain: ${domain} Dominance`,
        paragraphs: [
          `Your environment is introducing a moderate level of friction, pulling your nervous system out of baseline. The algorithm has identified ${domain} as the primary source of this drain.`,
          "The output you are generating is beginning to happen against resistance, not from reserves. You are spending cognitive capacity just to manage the space.",
          `Target the ${domain} immediately. If it is Acoustic Load, upgrade your buffering. If it is Circadian Friction, audit your evening light exposure. Removing this specific friction point will return you to baseline.`
        ]
      }
    }

    // 5. 61–100: DYSREGULATED LOAD
    return {
      ready: true,
      title: "Dysregulated Load Pattern: System Under Extraction",
      paragraphs: [
         "Your Bio-Spatial Friction Index indicates a high-load, dysregulated pattern. The environment is actively extracting from your capacity before you even begin your day.",
         "Fourteen days of sustained environmental friction alongside lowered mood regulation carries a specific signature: your nervous system is maintaining performance by drawing on sympathetic activation (stress hormones) rather than restorative capacity.",
         "Deploy immediate architectural interventions. You need strict acoustic sealing, absolute darkness for sleep, and a rigid boundary between work and rest zones. Stop optimising for output and start optimising for spatial recovery."
      ]
    }
  }
  
  const morningInsight = getMorningFeedback()
  const eveningInsight = getEveningFeedback()
  const macroSynthesis = getMacroSynthesis()

  const moods = [
    { val: 1, label: 'Burned Out', desc: 'Running on empty', color: 'bg-red-500/20 border-red-500/50 text-red-400' },
    { val: 2, label: 'Tense / Edgy', desc: 'Buzzing with stress', color: 'bg-orange-500/20 border-orange-500/50 text-orange-400' },
    { val: 3, label: 'Neutral', desc: 'Surviving baseline', color: 'bg-[#c9ccbb]/70 border-[#c9ccbb]/50 text-[#c9ccbb]' },
    { val: 4, label: 'Grounded', desc: 'Breathing deeper', color: 'bg-[#b5a642]/20 border-[#b5a642]/50 text-[#b5a642]' },
    { val: 5, label: 'In Flow', desc: 'Effortless movement', color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' }
  ]
  
  const morningTagOptions = [
    { id: 'ventilation', label: 'Ventilated Home (Air Exchange)', icon: <Wind size={14} /> },
    { id: 'sunlight', label: 'Got Early Morning Sunlight', icon: <Sun size={14} /> },
    { id: 'noise_buffer', label: 'Buffered Against Intrustive Noise', icon: <Volume2 size={14} /> },
    { id: 'declutter', label: 'Cleared/ Decluttered One Priority Area', icon: <CheckCircle size={14} /> },
  ]

  const eveningTagOptions = [
    { id: 'low_horizon', label: 'Turned Off The Big Lights & Switched To Warm, Low-Level Lighting', icon: <Zap size={14} /> },
    { id: 'entropy_reset', label: 'Decluttered The First Surface I See In The Morning', icon: <CheckCircle size={14} /> },
    { id: 'acoustic_seal', label: 'Using Sound-Softening Barriers (Curtains, Doors & Mechanical Noise)', icon: <Volume2 size={14} /> },
    { id: 'tactile_enclosure', label: 'Using Gentle Weight & Soft Textures for Sleep', icon: <Heart size={14} /> },
  ]

  // 🟢 BSFI LABEL HELPER
  const getBsfiLabel = (score: number) => {
    if (score <= 20) return { label: 'Low Environmental Friction', color: 'text-emerald-400', border: 'border-emerald-500/30' }
    if (score <= 40) return { label: 'Mild Load', color: 'text-blue-400', border: 'border-blue-500/30' }
    if (score <= 60) return { label: 'Moderate Strain', color: 'text-yellow-400', border: 'border-yellow-500/30' }
    if (score <= 80) return { label: 'High Friction', color: 'text-orange-400', border: 'border-orange-500/30' }
    return { label: 'Dysregulated Pattern', color: 'text-red-400', border: 'border-red-500/30' }
  }

  const fetchTodayLog = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const todayStr = new Date().toLocaleDateString('en-CA') 
    const startOfToday = new Date().setHours(0, 0, 0, 0)
    const endOfToday = new Date().setHours(23, 59, 59, 999)

    // Fetch Base Log
    const { data: logData } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayStr)
      .single()
      
    // 🟢 NEW: Fetch Existing BSFI Score for today
    const { data: existingBsfi } = await supabase
      .from('bsfi_results')
      .select('*')
      .eq('user_id', user.id)
      .eq('calculated_for_date', todayStr)
      .single()
      
    if (existingBsfi) {
      setBsfiData({
        total_score: existingBsfi.total_score,
        dominant_domain: existingBsfi.dominant_domain,
        is_internal_driver: existingBsfi.domain_scores?.is_internal_driver || false
      })
    }

    // Fetch Meter Scans
    const { data: scanData } = await supabase
      .from('meter_scans')
      .select('metric_type, value, created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(startOfToday).toISOString())
      .lte('created_at', new Date(endOfToday).toISOString())

    let autoMorningLux = ''
    let autoEveningLux = ''
    let autoDaytimeDb = ''
    let autoNighttimeDb = ''

    if (scanData && scanData.length > 0) {
      scanData.forEach(scan => {
        const scanHour = new Date(scan.created_at).getHours()
        
        if (scan.metric_type === 'lux') {
          if (scanHour >= 4 && scanHour < 12) autoMorningLux = scan.value.toString()
          if (scanHour >= 16) autoEveningLux = scan.value.toString()
        }
        
        if (scan.metric_type === 'db') {
          if (scanHour >= 8 && scanHour < 18) autoDaytimeDb = scan.value.toString()
          if (scanHour < 6 || scanHour >= 22) autoNighttimeDb = scan.value.toString()
        }
      })
    }

    if (logData) {
      setMorningMood(logData.mood_score)
      setMorningTags(logData.tags || [])
      setMorningNote(logData.note || '')
      
      setMorningLux(logData.morning_lux !== null ? logData.morning_lux.toString() : autoMorningLux)
      setEveningLux(logData.evening_lux !== null ? logData.evening_lux.toString() : autoEveningLux)
      setDaytimeDb(logData.daytime_db !== null ? logData.daytime_db.toString() : autoDaytimeDb)
      setNighttimeDb(logData.nighttime_db !== null ? logData.nighttime_db.toString() : autoNighttimeDb)

      if (logData.focus_hours !== null) setFocusScore(logData.focus_hours)
      if (logData.morning_tension !== null) setTensionScore(logData.morning_tension)
      if (logData.sleep_wakes !== null) setWakeScore(logData.sleep_wakes)

      setEveningMood(logData.evening_mood_score)
      setEveningTags(logData.evening_tags || [])
      setEveningNote(logData.evening_note || '')
    } else {
      setMorningLux(autoMorningLux)
      setEveningLux(autoEveningLux)
      setDaytimeDb(autoDaytimeDb)
      setNighttimeDb(autoNighttimeDb)
    }
  }

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('daily_logs')
      .select('date, mood_score, focus_hours, morning_tension, sleep_wakes') 
      .eq('user_id', user.id)
      .order('date', { ascending: false }) 
      .limit(14) 

    if (data) {
        const chronologicalData = data.reverse()
        
        const formatted = chronologicalData.map((log: any) => {
            const [year, month, day] = log.date.split('-')
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            
            return {
                date: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
                mood: log.mood_score || 0,        
                tension: log.morning_tension || 0,
                focus: log.focus_hours || 0,
                wakes: log.sleep_wakes || 0
            }
        })
        setChartLogs(formatted)
    }
  }

  const toggleTag = (id: string) => {
    if (activeTab === 'morning') {
        setMorningTags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    } else {
        setEveningTags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }
  }

  // AGENCY-FIRST SAVE PROTOCOL
  const handleSave = async (isForced = false) => {
    const criticalFields = [
      { value: morningLux, label: 'Morning Light' },
      { value: eveningLux, label: 'Evening Light' },
      { value: daytimeDb, label: 'Daytime Noise' },
      { value: nighttimeDb, label: 'Nighttime Noise' }
    ];

    const missing = criticalFields.filter(f => f.value === null || f.value === '');

    if (missing.length > 0 && isForced !== true) {
      setShowAccuracyWarning(true);
      return;
    }

    setStatus('saving')
    setErrorMessage('')
    setShowAccuracyWarning(false)

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("No user logged in")

        const today = new Date().toLocaleDateString('en-CA') 

        const payload = {
            user_id: user.id,
            date: today,
            mood_score: morningMood,
            tags: morningTags,
            note: morningNote,
            morning_lux: morningLux ? parseInt(morningLux) : null,
            evening_lux: eveningLux ? parseInt(eveningLux) : null,
            daytime_db: daytimeDb ? parseInt(daytimeDb) : null,
            nighttime_db: nighttimeDb ? parseInt(nighttimeDb) : null,
            focus_hours: focusScore,
            morning_tension: tensionScore,
            sleep_wakes: wakeScore,
            evening_mood_score: eveningMood,
            evening_tags: eveningTags,
            evening_note: eveningNote
        }

        const { error } = await supabase
        .from('daily_logs')
        .upsert(payload, { onConflict: 'user_id, date' })

        if (error) throw error

        // 🟢 Trigger Background BSFI Calc
        const res = await fetch('/api/calculate-bsfi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const data = await res.json()
        
        if (data.success && data.bsfiResult) {
            setBsfiData({
                total_score: data.bsfiResult.bsfi_total,
                dominant_domain: data.bsfiResult.dominant_domain,
                is_internal_driver: data.bsfiResult.is_internal_driver
            })
        }

        setStatus('success')
        fetchHistory() 
        setTimeout(() => setStatus('idle'), 2000)

    } catch (err: any) {
        console.error("Save Error:", err)
        setStatus('error')
        setErrorMessage(err.message || "Failed to save")
    }
  }

  const currentMood = activeTab === 'morning' ? morningMood : eveningMood
  const setCurrentMood = activeTab === 'morning' ? setMorningMood : setEveningMood
  const currentTags = activeTab === 'morning' ? morningTags : eveningTags
  const currentNote = activeTab === 'morning' ? morningNote : eveningNote
  const setCurrentNote = activeTab === 'morning' ? setMorningNote : setEveningNote
  const currentOptions = activeTab === 'morning' ? morningTagOptions : eveningTagOptions

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-12">
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Your Daily Logs</h1>
            <p className="text-[#c9ccbb]/80">
              Log your daily state to train the nervous system and reveal long-term patterns.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl mb-16 relative overflow-hidden border border-[#c9ccbb]/10">
            
            <div className="flex justify-center mb-8">
                <div className="bg-[#000]/30 p-1 rounded-full flex gap-1 border border-[#c9ccbb]/10">
                    <button 
                        onClick={() => setActiveTab('morning')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'morning' ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/70 hover:text-[#c9ccbb]'
                        }`}
                    >
                        <Sunrise size={14} /> Morning
                    </button>
                    <button 
                        onClick={() => setActiveTab('evening')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'evening' ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/70 hover:text-[#c9ccbb]'
                        }`}
                    >
                        <Moon size={14} /> Evening
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 flex items-center justify-center text-[#b5a642]">
                 <Heart size={20} />
               </div>
               <h2 className="text-2xl font-serif text-[#c9ccbb]">
                   {activeTab === 'morning' ? 'Morning Baseline' : 'Evening Wind-Down'}
               </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {moods.map((mood) => (
                <button
                  key={mood.val}
                  onClick={() => setCurrentMood(mood.val)}
                  className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-28 group relative overflow-hidden ${
                    currentMood === mood.val 
                      ? `${mood.color} shadow-lg scale-105` 
                      : 'bg-[#000]/20 border-[#c9ccbb]/10 text-[#c9ccbb]/40 hover:bg-[#c9ccbb]/5'
                  }`}
                >
                  <span className="text-xl font-serif font-bold relative z-10">{mood.val}</span>
                  <div className="relative z-10">
                    <div className={`font-bold text-xs mb-1 ${currentMood === mood.val ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                      {mood.label}
                    </div>
                  </div>
                  {currentMood === mood.val && <div className="absolute inset-0 bg-white/5 blur-md" />}
                </button>
              ))}
            </div>

            {activeTab === 'morning' && (
                <div className="mb-8 p-6 bg-[#b5a642]/5 rounded-2xl border border-[#b5a642]/10 animate-fade-in">
                    <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-6 block flex items-center gap-2">
                        <Activity size={12} /> Somatic Baseline
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                                   <Activity size={14} className="text-[#b5a642]" /> Jaw/Body Tension
                                </label>
                                <span className="text-[#b5a642] font-mono text-xs">{tensionScore}/10</span>
                            </div>
                            <p className="text-[#c9ccbb]/40 text-[10px] mb-3">Jaw/Shoulder tightness upon waking.</p>
                            <input 
                                type="range" min="0" max="10" step="1"
                                value={tensionScore}
                                onChange={(e) => setTensionScore(parseInt(e.target.value))}
                                className="w-full accent-[#b5a642] h-1 bg-[#000]/50 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                                   <Moon size={14} className="text-[#b5a642]" /> Sleep Interruptions
                                </label>
                                <div className="flex gap-3">
                                    <button onClick={() => setWakeScore(Math.max(0, wakeScore - 1))} className="text-[#c9ccbb] hover:text-[#b5a642]">-</button>
                                    <span className="text-[#b5a642] font-mono text-xs">{wakeScore}</span>
                                    <button onClick={() => setWakeScore(wakeScore + 1)} className="text-[#c9ccbb] hover:text-[#b5a642]">+</button>
                                </div>
                            </div>
                            <p className="text-[#c9ccbb]/40 text-[10px] mb-3">Sleep interruptions.</p>
                        </div>
                    </div>

                    {(tensionScore > 0 || wakeScore > 0) && (
                        <div className="mt-6 bg-[#1b270e] border-l-2 border-[#b5a642] rounded-r-xl overflow-hidden shadow-md">
                            <button 
                                onClick={() => setIsMorningOpen(!isMorningOpen)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#b5a642]/5 transition-colors"
                            >
                                <span className="text-[#b5a642] text-[10px] uppercase font-bold tracking-widest">
                                    {morningInsight.title}
                                </span>
                                <motion.div animate={{ rotate: isMorningOpen ? 180 : 0 }}>
                                    <ChevronDown size={14} className="text-[#b5a642]" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {isMorningOpen && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }} 
                                        animate={{ height: "auto", opacity: 1 }} 
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden relative"
                                    >
                                        {hasAccess ? (
                                            <div className="p-4 pt-0 space-y-3">
                                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                    <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Reframe:</strong> 
                                                    {morningInsight.reframe}
                                                </p>
                                                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                    <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Direction:</strong> 
                                                    {morningInsight.direction}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="relative p-4 pt-0">
                                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                                <div className="filter blur-[3px] opacity-30 select-none space-y-3 pointer-events-none">
                                                    <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                        <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Reframe:</strong> 
                                                        Waking through the night is less often a sign of dysregulation than a sign of thermoregulatory shift. Your environment may not be matching its needs.
                                                    </p>
                                                    <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                        <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Direction:</strong> 
                                                        Focus on the recovery envelope: breathable organic sleepwear, a cooler ambient temperature, and complete darkness.
                                                    </p>
                                                </div>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                                                    <Lock size={16} className="text-[#b5a642] mb-2" />
                                                    <span className="text-[10px] font-bold text-[#c9ccbb] uppercase tracking-widest mb-3 text-center">Unlock Somatic Reframes</span>
                                                    <Link href="/upgrade">
                                                        <button className="px-6 py-2 bg-[#b5a642] text-[#1b270e] text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-white transition-all">
                                                            Upgrade
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'evening' && (
                <div className="mb-8 p-6 bg-[#b5a642]/5 rounded-2xl border border-[#b5a642]/10 animate-fade-in">
                    <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-6 block flex items-center gap-2">
                        <Brain size={12} /> Cognitive Output
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                                   <Brain size={14} className="text-[#b5a642]" /> Deep Work (Hrs)
                                </label>
                                <span className="text-[#b5a642] font-mono text-xs">{focusScore}h</span>
                            </div>
                            <p className="text-[#c9ccbb]/40 text-[10px] mb-3">Hours of uninterrupted workflow.</p>
                            <input 
                                type="range" min="0" max="12" step="0.5"
                                value={focusScore}
                                onChange={(e) => setFocusScore(parseFloat(e.target.value))}
                                className="w-full accent-[#b5a642] h-1 bg-[#000]/50 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    {focusScore > 0 && (
                        <div className="mt-6 bg-[#1b270e] border-l-2 border-[#b5a642] rounded-r-xl overflow-hidden shadow-md">
                            <button 
                                onClick={() => setIsEveningOpen(!isEveningOpen)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#b5a642]/5 transition-colors"
                            >
                                <span className="text-[#b5a642] text-[10px] uppercase font-bold tracking-widest">
                                    {eveningInsight.title}
                                </span>
                                <motion.div animate={{ rotate: isEveningOpen ? 180 : 0 }}>
                                    <ChevronDown size={14} className="text-[#b5a642]" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {isEveningOpen && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }} 
                                        animate={{ height: "auto", opacity: 1 }} 
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden relative"
                                    >
                                        {hasAccess ? (
                                            <div className="p-4 pt-0 space-y-3">
                                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                    <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Reframe:</strong> 
                                                    {eveningInsight.reframe}
                                                </p>
                                                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                    <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Direction:</strong> 
                                                    {eveningInsight.direction}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="relative p-4 pt-0">
                                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                                <div className="filter blur-[3px] opacity-30 select-none space-y-3 pointer-events-none">
                                                    <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                        <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Reframe:</strong> 
                                                        Extended time in high-beta execution mode is a central nervous system stressor. The day was productive.
                                                    </p>
                                                    <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                        <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Direction:</strong> 
                                                        Tonight's environment must match today's demand. Transition strictly to warm, low-level lighting.
                                                    </p>
                                                </div>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                                                    <Lock size={16} className="text-[#b5a642] mb-2" />
                                                    <span className="text-[10px] font-bold text-[#c9ccbb] uppercase tracking-widest mb-3 text-center">Unlock Somatic Reframes</span>
                                                    <Link href="/upgrade">
                                                        <button className="px-6 py-2 bg-[#b5a642] text-[#1b270e] text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-white transition-all">
                                                            Upgrade
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}

            <div className="mb-8 p-6 bg-[#000]/20 rounded-2xl border border-[#c9ccbb]/5">
                <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-4 block flex items-center gap-2">
                    <Activity size={12} /> Environmental Exposure
                </label>
                
                {activeTab === 'morning' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
                                    <Sun size={14} className="text-orange-400" /> Morning Light (Lux)
                                </div>
                                <button 
                                    onClick={() => { setActiveMeterTarget('morningLux'); setIsLightMeterOpen(true); }}
                                    className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                                >
                                    <Activity size={12} /> Measure
                                </button>
                            </div>
                            <input 
                                type="number" 
                                placeholder="e.g. 250 (Dim) or 2500 (Bright)"
                                value={morningLux}
                                onChange={(e) => setMorningLux(e.target.value)}
                                className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
                                    <Moon size={14} className="text-blue-400" /> Nighttime Noise (dB)
                                </div>
                                <button 
                                    onClick={() => { setActiveMeterTarget('nighttimeDb'); setIsAcousticMeterOpen(true); }}
                                    className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                                >
                                    <Activity size={12} /> Measure
                                </button>
                            </div>
                            <input 
                                type="number" 
                                placeholder="e.g. 35 (Quiet) or 55 (Loud)"
                                value={nighttimeDb}
                                onChange={(e) => setNighttimeDb(e.target.value)}
                                className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
                                    <Volume2 size={14} className="text-red-400" /> Daytime Avg Noise (dB)
                                </div>
                                <button 
                                    onClick={() => { setActiveMeterTarget('daytimeDb'); setIsAcousticMeterOpen(true); }}
                                    className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                                >
                                    <Activity size={12} /> Measure
                                </button>
                            </div>
                            <input 
                                type="number" 
                                placeholder="e.g. 45 (Office) or 70 (Street)"
                                value={daytimeDb}
                                onChange={(e) => setDaytimeDb(e.target.value)}
                                className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
                                    <Zap size={14} className="text-orange-400" /> Evening Light (Lux)
                                </div>
                                <button 
                                    onClick={() => { setActiveMeterTarget('eveningLux'); setIsLightMeterOpen(true); }}
                                    className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                                >
                                    <Activity size={12} /> Measure
                                </button>
                            </div>
                            <input 
                                type="number" 
                                placeholder="e.g. 100 (Warm) or 800 (Overhead)"
                                value={eveningLux}
                                onChange={(e) => setEveningLux(e.target.value)}
                                className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mb-8 animate-fade-in">
              {currentOptions.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`flex items-center gap-2 px-4 py-3 h-auto rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                    currentTags.includes(tag.id)
                      ? 'bg-[#b5a642] border-[#b5a642] text-[#1b270e]'
                      : 'bg-[#000]/20 border-[#c9ccbb]/10 text-[#c9ccbb]/50 hover:text-[#c9ccbb]'
                  }`}
                >
                  {tag.icon} 
                  <span className="whitespace-normal text-left leading-tight">{tag.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-8">
              <textarea 
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder={activeTab === 'morning' ? "Morning Observations?" : "Evening Observations?"}
                className="w-full h-24 bg-[#000]/20 border border-[#c9ccbb]/10 rounded-xl p-4 text-[#c9ccbb] text-sm placeholder:text-[#c9ccbb]/50 focus:outline-none focus:border-[#b5a642]/50 resize-none font-sans"
              />
            </div>

            <div className="flex flex-col gap-4 pt-6 border-t border-[#c9ccbb]/10">
              <AnimatePresence>
                {showAccuracyWarning && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-4 bg-[#b5a642]/10 border border-[#b5a642]/30 rounded-xl"
                  >
                    <p className="text-sm text-[#c9ccbb] leading-relaxed">
                      <strong className="text-[#b5a642] uppercase tracking-widest text-[10px] mr-2 block mb-1">Data Integrity Notice:</strong> 
                      Your Bio-Spatial Friction Index requires all sensory inputs to accurately calculate correlations. Saving now will result in an incomplete score.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end items-center gap-4">
                 <AnimatePresence>
                   {status === 'success' && (
                     <motion.span 
                       initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                       className="text-[#b5a642] text-xs font-bold uppercase tracking-widest flex items-center gap-1"
                     >
                       <CheckCircle size={14} /> Saved
                     </motion.span>
                   )}
                 </AnimatePresence>
                 
                 <button 
                   onClick={() => handleSave(showAccuracyWarning)}
                   disabled={currentMood === null || status === 'saving'}
                   className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                     currentMood === null 
                       ? 'bg-[#c9ccbb]/10 text-[#c9ccbb]/50 cursor-not-allowed'
                       : showAccuracyWarning
                         ? 'bg-transparent border border-[#b5a642] text-[#b5a642] hover:bg-[#b5a642]/10'
                         : 'bg-[#c9ccbb] text-[#1b270e] hover:bg-white' 
                   }`}
                 >
                   {status === 'saving' ? (
                      <>Saving <Loader2 size={14} className="animate-spin" /></>
                   ) : showAccuracyWarning ? 'Save Incomplete Entry' : 'Log Entry'}
                 </button>
              </div>
            </div>
          </div>

          {/* --- 🟢 NEW: BSFI DAILY RESULT WIDGET --- */}
          <AnimatePresence>
            {bsfiData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="glass-panel p-6 rounded-3xl mb-8 border border-[#b5a642]/30 relative overflow-hidden bg-gradient-to-br from-[#b5a642]/10 to-transparent"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className={`w-24 h-24 rounded-full border-4 ${getBsfiLabel(bsfiData.total_score).border} flex flex-col items-center justify-center bg-[#1b270e] shrink-0 shadow-xl shadow-[#b5a642]/10`}>
                      <span className={`text-3xl font-serif ${getBsfiLabel(bsfiData.total_score).color}`}>
                        {bsfiData.total_score}
                      </span>
                      <span className="text-[10px] text-[#c9ccbb]/50 font-bold uppercase tracking-widest">BSFI</span>
                    </div>
                    <div>
                      <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-1 block">
                        Today's Bio-Spatial Friction
                      </span>
                      <h3 className="text-xl font-serif text-[#c9ccbb] mb-1">
                        {getBsfiLabel(bsfiData.total_score).label}
                      </h3>
                      {bsfiData.is_internal_driver ? (
                         <p className="text-[#c9ccbb]/80 text-xs max-w-md leading-relaxed mt-2">
                           <strong className="text-[#b5a642] uppercase tracking-widest text-[10px] block mb-1">Biological Variance Detected:</strong> 
                           Pattern suggests an internal driver. Focus on nervous system accommodation today rather than spatial optimisation.
                         </p>
                      ) : (
                         <p className="text-[#c9ccbb]/80 text-xs mt-2">
                           Dominant Friction Source: <strong className="text-white bg-[#000]/30 px-2 py-1 rounded ml-1">{bsfiData.dominant_domain}</strong>
                         </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right md:text-left self-start md:self-center">
                    <p className="text-[10px] text-[#c9ccbb]/50 uppercase tracking-widest max-w-[150px] leading-relaxed">
                      Calculated via 14-day relational synergy engine
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`glass-panel p-6 rounded-3xl mb-8 border relative overflow-hidden transition-all ${!macroSynthesis.ready || hasAccess ? 'bg-gradient-to-r from-[#b5a642]/10 to-transparent border-[#b5a642]/20' : 'bg-[#b5a642]/10 border-[#b5a642]/40 shadow-lg shadow-[#b5a642]/5'}`}>
            <div 
              className={`flex items-center justify-between w-full relative z-10 ${hasAccess && macroSynthesis.ready ? 'cursor-pointer group' : ''}`}
              onClick={() => {
                if (hasAccess && macroSynthesis.ready) setIsSynthesisExpanded(!isSynthesisExpanded)
              }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#b5a642]/20 rounded-full text-[#b5a642] shrink-0">
                  {macroSynthesis.ready && !hasAccess ? <Lock size={20} /> : <Fingerprint size={20} />}
                </div>
                <div>
                  <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-1 block">
                    {macroSynthesis.ready ? "14-Day Rhythm Synthesis" : "Calibration Status"}
                  </span>
                  <h4 className="text-xl font-serif text-[#c9ccbb]">{macroSynthesis.title}</h4>
                </div>
              </div>

              {hasAccess && macroSynthesis.ready && (
                <div className="text-[#c9ccbb]/40 group-hover:text-[#b5a642] transition-colors ml-4 shrink-0">
                  {isSynthesisExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              )}
            </div>

            {!macroSynthesis.ready ? (
               <div className="mt-4 pt-4 border-t border-[#c9ccbb]/10 w-full relative z-10">
                 <p className="text-sm text-[#c9ccbb]/80 leading-relaxed max-w-2xl">
                    {macroSynthesis.paragraphs[0]}
                 </p>
                 <div className="w-full max-w-md h-1 bg-[#000]/50 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="h-full bg-[#b5a642] transition-all duration-1000" 
                      style={{ width: `${(chartLogs.length / 14) * 100}%` }}
                    />
                 </div>
               </div>
            ) : hasAccess ? (
               <AnimatePresence>
                 {isSynthesisExpanded && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }} 
                     animate={{ height: "auto", opacity: 1 }} 
                     exit={{ height: 0, opacity: 0 }}
                     transition={{ duration: 0.3, ease: "easeInOut" }}
                     className="overflow-hidden relative z-10"
                   >
                     <div className="mt-6 space-y-4 text-[#c9ccbb]/80 text-sm leading-relaxed border-t border-[#c9ccbb]/10 pt-6">
                       {macroSynthesis.paragraphs.map((para, i) => (
                         <p key={i}>{para}</p>
                       ))}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            ) : (
               <div className="mt-6 pt-6 border-t border-[#c9ccbb]/10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full relative z-10">
                 <p className="text-sm text-[#c9ccbb]/80 leading-relaxed max-w-xl">
                   14 days of bio-spatial data successfully collected. The algorithm has identified your environmental friction patterns. Upgrade to reveal your biological rhythm signature.
                 </p>
                 <Link href="/upgrade" className="shrink-0 w-full md:w-auto">
                   <button className="w-full md:w-auto px-8 py-3 bg-[#b5a642] text-[#1b270e] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-lg shadow-[#b5a642]/20">
                     Unlock Report
                   </button>
                 </Link>
               </div>
            )}
          </div>

          <div className="animate-fade-in-up delay-100 mb-12">
              <div className="flex justify-between items-end mb-6">
                <div>
                   <div className="flex items-center gap-2 text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest mb-1">
                     <TrendingUp size={14} /> Your Bio-Spatial Rhythm
                   </div>
                   <h3 className="text-xl font-serif text-[#c9ccbb]">Nervous System Rhythm & Cognitive Capacity</h3>
                </div>
              </div>
              
              <div className="glass-panel p-4 md:p-8 rounded-3xl border border-[#c9ccbb]/10 relative overflow-hidden">
                   <div className="w-full overflow-x-auto hide-scrollbar">
                     <div className="min-w-[600px] h-[300px]">
                       <CorrelationGraph data={chartLogs} />
                     </div>
                   </div>
              </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {isLightMeterOpen && (
          <LightSensorModal 
            onClose={() => setIsLightMeterOpen(false)} 
            onSave={(lux) => {
              if (activeMeterTarget === 'morningLux') setMorningLux(lux.toString());
              if (activeMeterTarget === 'eveningLux') setEveningLux(lux.toString());
              setIsLightMeterOpen(false);
            }} 
          />
        )}

        {isAcousticMeterOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000]/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1b270e] border border-[#b5a642]/30 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <button onClick={() => setIsAcousticMeterOpen(false)} className="absolute top-4 right-4 text-[#c9ccbb]/50 hover:text-[#b5a642] z-10">✕</button>
              
              <NoiseSensorModal 
                onClose={() => setIsAcousticMeterOpen(false)}
                onSave={(db) => {
                  if (activeMeterTarget === 'nighttimeDb') setNighttimeDb(db.toString());
                  if (activeMeterTarget === 'daytimeDb') setDaytimeDb(db.toString());
                  setIsAcousticMeterOpen(false);
                }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
