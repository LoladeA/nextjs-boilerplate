'use client'

import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { Heart, Wind, Sun, Volume2, CheckCircle, TrendingUp, Activity, Zap, Loader2, Moon, Sunrise, Brain, Fingerprint, ChevronDown, ChevronUp, Lock, AlertCircle, HelpCircle, X, BedDouble, Sparkles, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import CorrelationGraph from './CorrelationGraph'
import { LightSensorModal } from '../tools/light-meter/page'
import { NoiseSensorModal } from '../tools/noise-meter/page'
import {
  getBSFIContext,
  getMorningFeedback as getSleepMorningCopy,
  getEveningFeedback as getSleepEveningCopy,
} from '@/lib/sleep-copy'

export default function Progress() {
  const supabase = createClientComponentClient()

  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning')

  // --- ACCESS CONTROL ---
  const [tier, setTier] = useState<'core' | 'blueprint' | null>(null)
  const [godMode, setGodMode] = useState(false)

  // --- LOGGING STATE ---
  const [morningMood, setMorningMood] = useState<number | null>(null)
  const [morningTags, setMorningTags] = useState<string[]>([])
  const [morningNote, setMorningNote] = useState('')

  // --- TEMPORAL ENVIRONMENTAL INPUTS ---
  const [morningLux, setMorningLux] = useState<string>('')
  const [daytimeDb, setDaytimeDb] = useState<string>('')
  const [eveningLux, setEveningLux] = useState<string>('')

  // --- SLEEP CONDITIONS ---
  const [bedtimeDb, setBedtimeDb] = useState<string>('')
  const [bedtimeLux, setBedtimeLux] = useState<string>('')
  const [sleepReadiness, setSleepReadiness] = useState<number>(3)

  // --- METER MODAL STATES ---
  const [isLightMeterOpen, setIsLightMeterOpen] = useState(false)
  const [isAcousticMeterOpen, setIsAcousticMeterOpen] = useState(false)
  const [activeMeterTarget, setActiveMeterTarget] = useState<'morningLux' | 'eveningLux' | 'daytimeDb' | 'bedtimeDb' | 'bedtimeLux' | null>(null)

  const [isManualOpen, setIsManualOpen] = useState(false)

  // BIO-METRICS
  const [focusScore, setFocusScore] = useState<number>(0)
  const [tensionScore, setTensionScore] = useState<number>(0)
  const [wakeScore, setWakeScore] = useState<number>(0)

  // ─────────────────────────────────────────────────────────────────────────
  // SOCIAL DEMAND — evening log only
  // Three-option selector: low | moderate | high
  // Stored as text in daily_logs.social_demand
  // Feeds BSFI correlation layer (Step 4) and 14-day synthesis
  // ─────────────────────────────────────────────────────────────────────────
  const [socialDemand, setSocialDemand] = useState<'low' | 'moderate' | 'high' | null>(null)

  // ─────────────────────────────────────────────────────────────────────────
  // eveningMood is DERIVED from sleepReadiness
  // ─────────────────────────────────────────────────────────────────────────
  const [eveningMood, setEveningMood] = useState<number | null>(null)
  const [eveningTags, setEveningTags] = useState<string[]>([])
  const [eveningNote, setEveningNote] = useState('')

  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [showAccuracyWarning, setShowAccuracyWarning] = useState(false)

  const [morningBsfi, setMorningBsfi] = useState<{
    total_score:           number
    dominant_domain:       string
    is_internal_driver:    boolean
    integration_pattern:   string | null
    sensory_pattern:       string | null
    accumulative_ali_flag: boolean
  } | null>(null)

  const [eveningBsfi, setEveningBsfi] = useState<{
    total_score:           number
    dominant_domain:       string
    is_internal_driver:    boolean
    integration_pattern:   string | null
    sensory_pattern:       string | null
    accumulative_ali_flag: boolean
  } | null>(null)

  const [bsfiLoading, setBsfiLoading] = useState(true)

  // ACCORDION STATES
  const [isMorningOpen, setIsMorningOpen] = useState(false)
  const [isEveningOpen, setIsEveningOpen] = useState(false)
  const [isSynthesisExpanded, setIsSynthesisExpanded] = useState(false)

  // ─────────────────────────────────────────────────────────────────────────
  // BSFI SCORE ACCORDION STATES
  // Score is optional viewing — interpretation leads
  // ─────────────────────────────────────────────────────────────────────────
  const [showMorningScore, setShowMorningScore] = useState(false)
  const [showEveningScore, setShowEveningScore] = useState(false)

  const [chartLogs, setChartLogs] = useState<any[]>([])

  useEffect(() => {
    setEveningMood(sleepReadiness)
  }, [sleepReadiness])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 19) setActiveTab('evening')
  }, [])

  useEffect(() => {
    checkAccess()
    fetchTodayLog()
    fetchHistory()
  }, [])

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (user.email === 'christchilde@gmail.com') {
      setGodMode(true)
      return
    }

    try {
      const res = await fetch('/api/subscription-status')
      if (res.ok) {
        const data = await res.json()
        if (data.tier === 'core' || data.tier === 'blueprint') {
          setTier(data.tier)
        }
      }
    } catch (err) {
      console.error('Access check error:', err)
    }
  }

  const hasAccess   = tier !== null || godMode
  const isBlueprint = tier === 'blueprint' || godMode

  // ---------------------------------------------------------------------------
  // CIRCADIAN COHERENCE SCORE
  // ---------------------------------------------------------------------------
  const deriveLuxScore = (morningLux: string, eveningLux: string): number | null => {
    const morning = morningLux !== '' ? parseInt(morningLux) : null
    const evening = eveningLux !== '' ? parseInt(eveningLux) : null
    if (morning === null && evening === null) return null
    const morningComponent = morning !== null ? Math.min(morning, 1000) / 1000 * 50 : 0
    const eveningComponent = evening !== null ? (1 - Math.min(evening, 800) / 800) * 50 : 50
    return Math.round(morningComponent + eveningComponent)
  }

  // ---------------------------------------------------------------------------
  // ACOUSTIC COMPOSITE SCORE
  // ---------------------------------------------------------------------------
  const deriveDbScore = (daytimeDb: string, bedtimeDb: string): number | null => {
    const d = daytimeDb !== '' ? parseInt(daytimeDb) : null
    const n = bedtimeDb !== '' ? parseInt(bedtimeDb) : null
    if (d === null && n === null) return null
    const DAYTIME_THRESHOLD   = 55
    const NIGHTTIME_THRESHOLD = 40
    const CEILING = 100
    const scores: number[] = []
    if (d !== null) scores.push(Math.max(0, d - DAYTIME_THRESHOLD)  / (CEILING - DAYTIME_THRESHOLD)  * 100)
    if (n !== null) scores.push(Math.max(0, n - NIGHTTIME_THRESHOLD) / (CEILING - NIGHTTIME_THRESHOLD) * 100)
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  // ---------------------------------------------------------------------------
  // DOMAIN DISPLAY
  // ---------------------------------------------------------------------------
  const DAILY_DOMAINS = new Set([
    'Recovery Disruption',
    'Circadian Rhythm Index',
    'Autonomic Load Index',
    'Sensory Load',
  ])

  const sanitiseDomain = (domain: string): string | null =>
    DAILY_DOMAINS.has(domain) ? domain : null

  const getDomainDisplay = (domain: string): { label: string, driver: string } => {
    const map: Record<string, { label: string, driver: string }> = {
      'Recovery Disruption':    { label: 'Overnight Recovery',   driver: 'Sleep interruptions, bedtime sound level, and sleep readiness' },
      'Circadian Rhythm Index': { label: 'Light & Sleep Timing', driver: 'Morning and evening light readings' },
      'Autonomic Load Index':   { label: 'Stress & Tension',     driver: 'Body tension and mood on waking' },
      'Sensory Load':           { label: 'Sound & Visual Load',  driver: 'Sound levels, light readings, and daily environment tags' },
    }
    return map[domain] ?? { label: 'Environmental Load', driver: 'Environmental readings today' }
  }

  // ---------------------------------------------------------------------------
  // BSFI LABEL SYSTEM
  // ---------------------------------------------------------------------------
  const getBsfiLabel = (score: number) => {
    if (score <= 20) return { label: 'Your Home Is Supporting You',   color: 'text-[#b5a642]',    border: 'border-[#b5a642]/60' }
    if (score <= 40) return { label: 'Mild Friction Present',         color: 'text-[#b5a642]/80', border: 'border-[#b5a642]/40' }
    if (score <= 60) return { label: 'Moderate Environmental Load',   color: 'text-[#b5a642]/70', border: 'border-[#b5a642]/35' }
    if (score <= 80) return { label: 'Significant Friction Detected', color: 'text-[#b5a642]/60', border: 'border-[#b5a642]/30' }
    return             { label: 'High Environmental Load',            color: 'text-[#b5a642]/50', border: 'border-[#b5a642]/25' }
  }

  // ---------------------------------------------------------------------------
  // FEEDBACK ENGINE
  // ---------------------------------------------------------------------------
  const getMorningFeedback = () => {
    const moodScore = morningMood ?? 3

    if (moodScore <= 2 && tensionScore >= 7 && wakeScore >= 3) return {
      title: "You Slept, But Your Body Didn't Fully Recover",
      reframe: "Three or more wake events alongside high somatic tension and low mood on rising is a specific stress pattern — not a reflection of how well you slept in a subjective sense, but of how much biological work your system was required to do overnight. Fragmented sleep prevents full progression through deep and dream sleep, leaving stress hormones elevated and your body already on alert before the day begins.",
      direction: "Your sleep envelope is the priority — not optimisation, but structural protection. Tonight: close the doors, draw the curtains, use soft weighted bedding, and switch to warm dim light at least 90 minutes before bed. Do not attempt to compensate for last night through output today. Your body needs less asked of it today, not more."
    }

    if (moodScore <= 2 && tensionScore >= 7) return {
      title: "You Slept Through, But Not Restfully",
      reframe: "Sleep continuity is a necessary condition for restoration, but it is not sufficient. Sustained body tension on waking, alongside low mood, indicates that your body's regulation system remained on alert overnight. Without your body's calm-down response needed for deep sleep, you continue processing stress and emotional load rather than clearing it. You slept through. Your body did not fully let go.",
      direction: "Work backwards from pre-sleep conditions: unresolved physical tension in the hour before bed typically originates from temperature discomfort, unresolved mental activity, or the absence of physical grounding. Introduce soft, weighted bedding tonight and reduce your pre-sleep light exposure to warm-toned sources below 50 lux."
    }

    if (moodScore >= 3 && wakeScore >= 3) return {
      title: "Sleep Interruptions Are Worth Investigating",
      reframe: "Waking three or more times through the night, in the presence of stable mood, is more reliably an environmental pattern than a dysregulation one. The most common causes are temperature disruption and sounds that pull you partially awake without fully waking you. You are coping well with the disruption. The disruption itself is still worth addressing.",
      direction: "Audit your sleep environment for two variables tonight: ambient temperature and acoustic consistency. The ideal sleep temperature for most adults is 17–19°C. For acoustic disruption, notice whether the waking pattern is tied to a specific time and introduce low-level white or pink noise to soften those disruptions."
    }

    if (moodScore >= 4 && tensionScore <= 3) return {
      title: "A Genuinely Good Night",
      reframe: "Low body tension and elevated mood on waking are the measurable output of a sleep environment that genuinely supported you overnight. Your natural morning energy signal is following its arc, deep sleep likely proceeded without disruption, and your thinking capacity is arriving at the day fully charged.",
      direction: "Identify and record what was consistent yesterday evening. Your light habits, temperature, and pre-sleep routine are currently functioning as an aligned system. Protect those conditions — especially during periods of elevated schedule demand, travel, or seasonal light change."
    }

    return {
      title: "Nothing Unusual This Morning",
      reframe: "Your morning readings sit within a neutral functional range today: no acute recovery deficit, no clear environmental signal in either direction. Neutral is not absence of data. It is the system in maintenance mode: not under significant load, not in peak restoration. The pattern becomes legible over time, not in a single morning.",
      direction: "Log your environmental readings accurately: light levels, sounds, and sleep conditions. No acute intervention is required today. Use this session to build the baseline your fourteen-day synthesis will draw from."
    }
  }

  const getEveningFeedback = () => {
    const moodScore = eveningMood ?? 3

    if (focusScore >= 8 && moodScore <= 2) return {
      title: "A Demanding Day. Recovery Is Non-Negotiable Tonight",
      reframe: "Extended deep work alongside low mood regulation is a recognisable autonomic signature: you sustained performance by drawing on stress-driven energy rather than actual reserves. The output was real. So is the cost. Your brain's overnight emotional processing is carrying a heavier load into sleep than your focus score would suggest.",
      direction: "Tonight's environment must match today's demand. Transition away from screens and bright overhead light within the next thirty minutes to warm-toned sources below 100 lux only. Remove high-stimulation zones from your evening sightline. Your body needs a firm, unhurried wind-down tonight."
    }

    if (focusScore >= 8 && moodScore >= 4) return {
      title: "A Great Day. Protect the Close",
      reframe: "Deep work sustained across the day without a corresponding drop in mood regulation indicates that your environment was supporting your cognitive load rather than extracting from it. The question now is not what today cost — it is what tonight's environment does with that state.",
      direction: "Do not coast through the evening without a deliberate transition. Make a deliberate close: shift to warm light, step away from your work zone, and do one low-stimulation activity before you prepare for sleep."
    }

    if (focusScore <= 2 && moodScore <= 2) return {
      title: "Low Focus Today Isn't About You. Let's Examine Your Space",
      reframe: "When attentional capacity feels constrained despite effort, the instinct is to attribute it to discipline or motivation. The more precise reading — particularly when mood and focus drop together — is environmental: your space was not providing the sensory conditions required for sustained cognitive engagement.",
      direction: "Do not attempt to recover through effort or extended hours tonight. Identify one controllable sensory variable in your primary space — noise, light quality, or visual clutter — and address only that. One intentional environmental change will do more for tomorrow than any amount of extra effort tonight."
    }

    return {
      title: "A Steady Day. Keep The Transition Intentional",
      reframe: "Output and mood regulation have remained within a functional range today: neither a high-cost performance day nor a low-capacity one. The evening's role in this context is not recovery from deficit, but maintenance of the baseline your system is already holding.",
      direction: "Step away from high-stimulation zones within the next hour. Your evening transition does not need to be elaborate — it needs to be consistent. A reliable pre-sleep routine is cumulative in its effect: your body learns to begin winding down in response to environmental cues before you are even consciously aware of them."
    }
  }

  // ---------------------------------------------------------------------------
  // 14-DAY MACRO SYNTHESIS
  // ---------------------------------------------------------------------------
  const getMacroSynthesis = () => {
    if (chartLogs.length < 14) {
      return {
        ready: false,
        title: "Still Gathering Data",
        paragraphs: [`${Math.max(0, 14 - chartLogs.length)} days of logs remaining before your pattern is readable.`]
      }
    }

    const bsfiRef = morningBsfi || eveningBsfi

    if (bsfiRef) {
      if (bsfiRef.is_internal_driver) {
        return {
          ready: true,
          title: "Your Environment Is Stable. What You're Feeling Is Coming From Inside.",
          paragraphs: [
            "Over the last fourteen days, your somatic tension and mood have shown significant variance, but your measured environmental conditions have remained largely consistent.",
            "This data signature has a specific meaning: the primary source of friction right now is not your physical space. Biological fluctuations — cyclical hormonal shifts, periods of elevated emotional demand, accumulated stress — produce real, measurable changes in tension, sleep quality, focus, and mood that register in your logs independently of what your space is doing.",
            "The appropriate response to this phase is accommodation, not optimisation. Ask your environment to do one thing: reduce the additional friction layered on top of an already-demanding internal state. Quieter, warmer, simpler."
          ]
        }
      }

      const score = bsfiRef.total_score
      const domain = bsfiRef.dominant_domain

      if (score <= 20) return {
        ready: true,
        title: "Your Home Is Supporting You",
        paragraphs: [
          "Across fourteen days, your Bio-Spatial Friction Index has remained exceptionally low. Your home is doing precisely what it should: absorbing daily sensory load, supporting overnight recovery, and returning your body to a settled baseline each morning.",
          "What this data confirms is that your current sensory conditions are not accidental. Your light habits, acoustic boundaries, sleep ecology, and spatial practices are functioning as a coherent, mutually reinforcing system.",
          "The task now is protection, not improvement. Document the specific conditions that are producing this baseline in sufficient detail that you can replicate them accurately during periods of elevated stress, travel, or seasonal change."
        ]
      }

      if (score <= 60) return {
        ready: true,
        title: `Moderate Friction: ${getDomainDisplay(domain).label} Is The Primary Source`,
        paragraphs: [
          `Over the last fourteen days, your home environment has been introducing a moderate but consistent level of friction. ${getDomainDisplay(domain).label} is the source generating the greatest sustained demand. This is where the leverage is.`,
          "The output you are producing is beginning to happen against environmental resistance rather than from regulated reserves. At moderate friction levels, this distinction is easy to miss. Performance remains intact while the underlying cost accumulates.",
          `Address ${getDomainDisplay(domain).label} this week as a priority. A targeted change in your highest-friction area will produce a disproportionate return, reducing the load on every other area simultaneously.`
        ]
      }

      return {
        ready: true,
        title: "High Friction Across The Board. Your Environment Needs Attention",
        paragraphs: [
          "Your fourteen-day pattern indicates a high-load, dysregulated environmental pattern. Across light timing, sound, spatial clarity, and overnight recovery, your home is generating friction that arrives before your day begins.",
          "Sustained multi-domain environmental friction at this level carries a specific physiological signature: your body shifts into a low-level stress state, running on stress-fuelled performance rather than restored capacity. The reserves that sustain that are finite.",
          "Stop optimising for output. Start optimising for environmental recovery. Three priorities in order: close and soften your sleep environment acoustically, enforce a warm dim light boundary after 8pm, and clear one low-stimulation space you can access easily during the day."
        ]
      }
    }

    const avgMood    = chartLogs.reduce((acc, log) => acc + log.mood,    0) / (chartLogs.length || 1)
    const avgTension = chartLogs.reduce((acc, log) => acc + log.tension, 0) / (chartLogs.length || 1)
    const avgFocus   = chartLogs.reduce((acc, log) => acc + log.focus,   0) / (chartLogs.length || 1)

    if (avgTension >= 6 && avgFocus <= 4) return {
      ready: true,
      title: "Your Home Is Draining You Before The Day Begins",
      paragraphs: [
        "Fourteen days of consistently elevated somatic tension alongside constrained cognitive output describes a recognisable pattern: your body is absorbing sustained environmental friction and arriving at each day already partially depleted.",
        "At this pattern level, the gap between how capable you are and how capable you feel is environmental in origin. Your home is spending your capacity before you have the chance to direct it.",
        "The two most probable friction sources at this profile are your sleep ecology and the sensory load of your primary daytime environment. Both are structurally addressable."
      ]
    }

    if (avgFocus >= 6 && avgMood <= 2.5) return {
      ready: true,
      title: "Strong Output, But Your Reserves Are Being Used Up",
      paragraphs: [
        "Fourteen days of sustained cognitive output alongside consistently low mood regulation carries a specific autonomic signature: your body is maintaining performance through stress-driven energy rather than from a genuinely recovered baseline.",
        "This is a viable short-term strategy. Over weeks and months, it progressively narrows the floor it is borrowing from. The early indicators are already present in your data.",
        "What this pattern requires is a firm boundary between your work zone and your rest zone, and a deliberate evening transition that your body can begin to recognise as a signal to wind down."
      ]
    }

    if (avgMood >= 4 && avgTension <= 3) return {
      ready: true,
      title: "Fourteen Days of A Regulated Home",
      paragraphs: [
        "Across fourteen days, your somatic tension has remained consistently low and your mood regulation consistently high. This is the measurable output of a home that is absorbing daily load, supporting overnight recovery, and returning your body to a settled baseline each morning.",
        "What the data confirms is that your current environmental conditions are not accidental. Your sensory practices, thermal ecology, sleep habits, and spatial routines are functioning as a coherent, mutually reinforcing system.",
        "The task now is to understand what is working precisely enough to protect it — particularly during elevated stress periods, travel, or seasonal light change."
      ]
    }

    return {
      ready: true,
      title: "Still Working Out The Pattern",
      paragraphs: [
        "The last fourteen days show significant fluctuation across mood, tension, and focus without a consistent directional pattern. Before locating the source of that variance in your physical environment, it is worth naming what the data cannot distinguish: not all fluctuation is environmental in origin.",
        "Hormonal shifts, periods of elevated relational or cognitive demand, and natural energy cycles produce real, measurable changes in tension, sleep quality, focus, and mood — changes that register in your logs independently of what your physical space is doing.",
        "Continue logging consistently. The appropriate response during periods of internal fluctuation is friction reduction, not optimisation. Ask your environment to do less against you, not more for you."
      ]
    }
  }

  const morningInsight  = getMorningFeedback()
  const eveningInsight  = getEveningFeedback()
  const macroSynthesis  = getMacroSynthesis()

  const moods = [
    { val: 1, label: 'Burned Out',   desc: 'Running on empty',      color: 'bg-[#b5a642]/10 border-[#b5a642]/25 text-[#b5a642]/50' },
    { val: 2, label: 'Tense / Edgy', desc: 'Buzzing with stress',   color: 'bg-[#b5a642]/12 border-[#b5a642]/30 text-[#b5a642]/60' },
    { val: 3, label: 'Neutral',      desc: 'Holding steady',        color: 'bg-[#c9ccbb]/10 border-[#c9ccbb]/30 text-[#c9ccbb]/70' },
    { val: 4, label: 'Grounded',     desc: 'Breathing deeper',      color: 'bg-[#b5a642]/18 border-[#b5a642]/50 text-[#b5a642]/80' },
    { val: 5, label: 'In Flow',      desc: 'Effortless movement',   color: 'bg-[#b5a642]/20 border-[#b5a642]/60 text-[#b5a642]'    },
  ]

  const morningTagOptions = [
    { id: 'ventilation',  label: 'Opened Windows / Aired The Home',    icon: <Wind size={14} />        },
    { id: 'sunlight',     label: 'Got Early Morning Sunlight',          icon: <Sun size={14} />         },
    { id: 'noise_buffer', label: 'Reduced Intrusive Noise',             icon: <Volume2 size={14} />     },
    { id: 'declutter',    label: 'Cleared / Decluttered One Area',      icon: <CheckCircle size={14} /> },
  ]

  const eveningTagOptions = [
    { id: 'entropy_reset',    label: 'Decluttered The First Surface I See In The Morning', icon: <CheckCircle size={14} /> },
    { id: 'acoustic_seal',    label: 'Reduced or Softened Noise For The Night',            icon: <Volume2 size={14} />     },
    { id: 'tactile_enclosure',label: 'Using Gentle Weight & Soft Textures for Sleep',      icon: <Heart size={14} />       },
  ]

  // ---------------------------------------------------------------------------
  // DATA FETCHING
  // ---------------------------------------------------------------------------
  const fetchTodayLog = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const todayStr      = new Date().toLocaleDateString('en-CA')
      const startOfToday  = new Date().setHours(0, 0, 0, 0)
      const endOfToday    = new Date().setHours(23, 59, 59, 999)

      const { data: logData } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', todayStr)
        .single()

      const { data: bsfiResults } = await supabase
        .from('bsfi_results')
        .select('id, total_score, dominant_domain, domain_scores, created_at, session, integration_pattern, sensory_pattern, accumulative_ali_flag')
        .eq('user_id', user.id)
        .eq('calculated_for_date', todayStr)
        .order('created_at', { ascending: true })
        .limit(2)

      if (bsfiResults && bsfiResults.length > 0) {
        bsfiResults.forEach((result: any) => {
          const savedHour = new Date(result.created_at).getHours()
          const isEvening =
            result.session === 'evening' ||
            (result.session == null && savedHour >= 17)

          const entry = {
            total_score:           result.total_score,
            dominant_domain:       result.dominant_domain,
            is_internal_driver:    result.domain_scores?.is_internal_driver || false,
            integration_pattern:   result.integration_pattern   ?? null,
            sensory_pattern:       result.sensory_pattern       ?? null,
            accumulative_ali_flag: result.accumulative_ali_flag ?? false,
          }
          if (isEvening) setEveningBsfi(entry)
          else           setMorningBsfi(entry)
        })
      }

      const { data: scanData } = await supabase
        .from('meter_scans')
        .select('metric_type, value, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(startOfToday).toISOString())
        .lte('created_at', new Date(endOfToday).toISOString())

      let autoMorningLux = '', autoEveningLux = '', autoDaytimeDb = '', autoBedtimeDb = '', autoBedtimeLux = ''

      if (scanData && scanData.length > 0) {
        scanData.forEach(scan => {
          const scanHour = new Date(scan.created_at).getHours()
          if (scan.metric_type === 'lux') {
            if (scanHour >= 4  && scanHour < 12) autoMorningLux  = scan.value.toString()
            if (scanHour >= 16 && scanHour < 21) autoEveningLux  = scan.value.toString()
            if (scanHour >= 21)                  autoBedtimeLux  = scan.value.toString()
          }
          if (scan.metric_type === 'db') {
            if (scanHour >= 8  && scanHour < 18) autoDaytimeDb   = scan.value.toString()
            if (scanHour >= 21)                  autoBedtimeDb   = scan.value.toString()
          }
        })
      }

      if (logData) {
        setMorningMood(logData.mood_score)
        setMorningTags(logData.tags || [])
        setMorningNote(logData.note || '')
        setMorningLux(logData.morning_lux !== null ? logData.morning_lux.toString() : autoMorningLux)
        setEveningLux(logData.evening_lux !== null ? logData.evening_lux.toString() : autoEveningLux)
        setDaytimeDb(logData.daytime_db   !== null ? logData.daytime_db.toString()  : autoDaytimeDb)
        setBedtimeDb(logData.bedtime_db   !== null ? logData.bedtime_db.toString()  : autoBedtimeDb)
        setBedtimeLux(logData.bedtime_lux !== null ? logData.bedtime_lux.toString() : autoBedtimeLux)
        if (logData.sleep_readiness !== null) setSleepReadiness(logData.sleep_readiness)
        if (logData.focus_hours     !== null) setFocusScore(logData.focus_hours)
        if (logData.morning_tension !== null) setTensionScore(logData.morning_tension)
        if (logData.sleep_wakes     !== null) setWakeScore(logData.sleep_wakes)
        // ─────────────────────────────────────────────────────────────────
        // SOCIAL DEMAND — read from daily_logs on load
        // ─────────────────────────────────────────────────────────────────
        if (logData.social_demand) setSocialDemand(logData.social_demand as 'low' | 'moderate' | 'high')
        setEveningTags(logData.evening_tags || [])
        setEveningNote(logData.evening_note || '')
      } else {
        setMorningLux(autoMorningLux)
        setEveningLux(autoEveningLux)
        setDaytimeDb(autoDaytimeDb)
        setBedtimeDb(autoBedtimeDb)
        setBedtimeLux(autoBedtimeLux)
      }
    } catch (err) {
      console.error('fetchTodayLog failed:', err)
      setStatus('error')
      setErrorMessage('Could not load today\'s log. Please refresh.')
    } finally {
      setBsfiLoading(false)
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
      const formatted = [...data].reverse().map((log: any) => {
        const [year, month, day] = log.date.split('-')
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        return {
          date:    dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
          mood:    log.mood_score       || 0,
          tension: log.morning_tension  || 0,
          focus:   log.focus_hours      || 0,
          wakes:   log.sleep_wakes      || 0,
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

  const handleSave = async (isForced = false) => {
    const criticalFields = activeTab === 'morning'
      ? [morningLux, daytimeDb]
      : [bedtimeDb, bedtimeLux]
    const isMissing = criticalFields.some(val => val === null || val === '')

    if (isMissing && isForced !== true) {
      setShowAccuracyWarning(true)
      return
    }

    setStatus('saving')
    setErrorMessage('')
    setShowAccuracyWarning(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user logged in')

      const today = new Date().toLocaleDateString('en-CA')

      const payload = {
        user_id:            user.id,
        date:               today,
        mood_score:         morningMood,
        tags:               morningTags,
        note:               morningNote,
        morning_tension:    tensionScore,
        sleep_wakes:        wakeScore,
        morning_lux:        morningLux  ? parseInt(morningLux)  : null,
        evening_lux:        eveningLux  ? parseInt(eveningLux)  : null,
        daytime_db:         daytimeDb   ? parseInt(daytimeDb)   : null,
        bedtime_db:         bedtimeDb   ? parseInt(bedtimeDb)   : null,
        bedtime_lux:        bedtimeLux  ? parseInt(bedtimeLux)  : null,
        sleep_readiness:    sleepReadiness,
        lux_score:          deriveLuxScore(morningLux, eveningLux),
        db_score:           deriveDbScore(daytimeDb, bedtimeDb),
        readiness_score:    null,
        focus_hours:        Math.round(focusScore),
        evening_mood_score: eveningMood,
        evening_tags:       eveningTags,
        evening_note:       eveningNote,
        // ─────────────────────────────────────────────────────────────────
        // SOCIAL DEMAND — written to daily_logs on every save
        // null-safe: null when user has not selected an option
        // ─────────────────────────────────────────────────────────────────
        social_demand:      socialDemand ?? null,
      }

      const { error } = await supabase
        .from('daily_logs')
        .upsert(payload, { onConflict: 'user_id, date' })

      if (error) throw error

      setStatus('success')
      fetchHistory()
      setTimeout(() => setStatus('idle'), 2000)

      try {
        const res  = await fetch('/api/calculate-bsfi', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ ...payload, session: activeTab })
        })
        const data = await res.json()
        if (data.success && data.bsfiResult) {
          const entry = {
            total_score:           data.bsfiResult.bsfi_total,
            dominant_domain:       data.bsfiResult.dominant_domain,
            is_internal_driver:    data.bsfiResult.is_internal_driver,
            integration_pattern:   data.profileContext?.integration_pattern   ?? null,
            sensory_pattern:       data.profileContext?.sensory_pattern       ?? null,
            accumulative_ali_flag: data.profileContext?.accumulative_ali_flag ?? false,
          }
          if (activeTab === 'morning') setMorningBsfi(entry)
          else                         setEveningBsfi(entry)
        }
      } catch {
        console.warn('BSFI engine skipped — save was successful.')
      }

    } catch (err: any) {
      console.error('Save Error:', err)
      setStatus('error')
      setErrorMessage(err.message || 'Could not save entry.')
    }
  }

  const currentTags     = activeTab === 'morning' ? morningTags    : eveningTags
  const currentNote     = activeTab === 'morning' ? morningNote    : eveningNote
  const setCurrentNote  = activeTab === 'morning' ? setMorningNote : setEveningNote
  const currentOptions  = activeTab === 'morning' ? morningTagOptions : eveningTagOptions

  const canSave = activeTab === 'morning'
    ? morningMood !== null && status !== 'saving'
    : status !== 'saving'

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        <div className="max-w-4xl mx-auto">

          {/* PAGE HEADER */}
          <div className="mb-12 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2 flex items-center gap-4">
                Your Daily Logs
                <button
                  onClick={() => setIsManualOpen(true)}
                  className="text-[#b5a642]/80 hover:text-[#b5a642] transition-colors p-2 rounded-full hover:bg-[#b5a642]/10"
                >
                  <HelpCircle size={24} />
                </button>
              </h1>
              <p className="text-[#c9ccbb]/80">
                Track how your home affects your nervous system each day to reveal patterns over time.
              </p>
            </div>
          </div>

          {/* LOGGING PANEL */}
          <div className="glass-panel p-8 rounded-3xl mb-16 relative overflow-hidden border border-[#b5a642]/15">

            {/* MORNING / EVENING TAB */}
            <div className="flex justify-center mb-8">
              <div className="bg-[#000]/30 p-1 rounded-full flex gap-1 border border-[#b5a642]/15">
                <button
                  onClick={() => setActiveTab('morning')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'morning' ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/80 hover:text-[#c9ccbb]'
                  }`}
                >
                  <Sunrise size={14} /> Morning
                </button>
                <button
                  onClick={() => setActiveTab('evening')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'evening' ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/80 hover:text-[#c9ccbb]'
                  }`}
                >
                  <Moon size={14} /> Evening
                </button>
              </div>
            </div>

            {/* MORNING MOOD CARDS */}
            {activeTab === 'morning' && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 flex items-center justify-center text-[#b5a642]">
                    <Heart size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif text-[#c9ccbb]">How You Woke Up</h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                  {moods.map((mood) => (
                    <button
                      key={mood.val}
                      onClick={() => setMorningMood(mood.val)}
                      className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-28 group relative overflow-hidden ${
                        morningMood === mood.val
                          ? `${mood.color} shadow-lg scale-105`
                          : 'bg-[#000]/20 border-[#b5a642]/10 text-[#c9ccbb]/60 hover:bg-[#b5a642]/5'
                      }`}
                    >
                      <span className="text-xl font-serif font-bold relative z-10">{mood.val}</span>
                      <div className="relative z-10">
                        <div className={`font-bold text-xs mb-1 ${morningMood === mood.val ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                          {mood.label}
                        </div>
                      </div>
                      {morningMood === mood.val && <div className="absolute inset-0 bg-white/5 blur-md" />}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* MORNING BIO-METRICS + INSIGHT */}
            {activeTab === 'morning' && (
              <div className="mb-8 p-6 bg-[#b5a642]/5 rounded-2xl border border-[#b5a642]/10 animate-fade-in">
                <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-6 block flex items-center gap-2">
                  <Activity size={12} /> How Your Body Woke Up
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                        <Activity size={14} className="text-[#b5a642]" /> Jaw / Body Tension
                      </label>
                      <span className="text-[#b5a642] font-mono text-xs">{tensionScore}/10</span>
                    </div>
                    <p className="text-[#c9ccbb]/80 text-[10px] mb-3">Jaw/shoulder tightness upon waking.</p>
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
                        <button onClick={() => setWakeScore(Math.max(0, wakeScore - 1))} className="text-[#c9ccbb] hover:text-[#b5a642]">−</button>
                        <span className="text-[#b5a642] font-mono text-xs">{wakeScore}</span>
                        <button onClick={() => setWakeScore(wakeScore + 1)} className="text-[#c9ccbb] hover:text-[#b5a642]">+</button>
                      </div>
                    </div>
                    <p className="text-[#c9ccbb]/80 text-[10px] mb-3">How many times you woke up during the night.</p>
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
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-0">
                            <div className="w-full h-px bg-[#b5a642]/10" />
                            {(() => {
                              const sleepCopy = getSleepMorningCopy({
                                sleep_wakes:     wakeScore,
                                mood_score:      morningMood,
                                morning_tension: tensionScore,
                              })
                              return sleepCopy.environmental_note ? (
                                <div className="px-4 pt-4 pb-2">
                                  <p className="text-[#c9ccbb]/80 text-[10px] leading-relaxed italic">
                                    {sleepCopy.environmental_note}
                                  </p>
                                </div>
                              ) : null
                            })()}
                            <div className="p-4">
                              <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Direction:</strong>
                                {morningInsight.direction}
                              </p>
                            </div>
                            {hasAccess ? (
                              <div className="px-4 pb-4">
                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                  <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Why this is happening:</strong>
                                  {morningInsight.reframe}
                                </p>
                              </div>
                            ) : (
                              <div className="relative px-4 pb-4">
                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                <div className="filter blur-[3px] opacity-30 select-none pointer-events-none text-xs leading-relaxed text-[#c9ccbb]/80">
                                  <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Why this is happening:</strong>
                                  {morningInsight.reframe}
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
                                  <Lock size={14} className="text-[#b5a642]" />
                                  <span className="text-[9px] font-bold text-[#c9ccbb]/80 uppercase tracking-widest text-center">Understand the why through the lens of NeuroDesign</span>
                                  <Link href="/upgrade">
                                    <button className="px-5 py-1.5 bg-[#b5a642] text-[#1b270e] text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-[#d4c55e] transition-all">
                                      Unlock Now
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* EVENING BIO-METRICS + INSIGHT */}
            {activeTab === 'evening' && (
              <div className="mb-8 p-6 bg-[#b5a642]/5 rounded-2xl border border-[#b5a642]/10 animate-fade-in">
                <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-6 block flex items-center gap-2">
                  <Brain size={12} /> How Did Your Day Go?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">

                  {/* FOCUSED WORK HOURS */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                        <Brain size={14} className="text-[#b5a642]" /> Focused Work (Hours)
                      </label>
                      <span className="text-[#b5a642] font-mono text-xs">{focusScore}h</span>
                    </div>
                    <p className="text-[#c9ccbb]/80 text-[10px] mb-3">Hours where you were focused and uninterrupted.</p>
                    <input
                      type="range" min="0" max="12" step="1"
                      value={focusScore}
                      onChange={(e) => setFocusScore(parseInt(e.target.value))}
                      className="w-full accent-[#b5a642] h-1 bg-[#000]/50 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* ─────────────────────────────────────────────────────────
                      SOCIAL DEMAND SELECTOR
                      Three options: low | moderate | high
                      Neutral framing — measures demand level, not quality
                      of relationships or personal circumstances.
                  ───────────────────────────────────────────────────────── */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb] mb-2">
                      <Users size={14} className="text-[#b5a642]" /> Social Demand Today
                    </label>
                    <p className="text-[#c9ccbb]/80 text-[10px] mb-3">
                      How much relational or social engagement did today involve?
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { value: 'low',      label: 'Low to zero' },
                        { value: 'moderate', label: 'Moderate'    },
                        { value: 'high',     label: 'High demand' },
                      ] as const).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSocialDemand(
                            socialDemand === opt.value ? null : opt.value
                          )}
                          className={`py-2.5 px-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all text-center ${
                            socialDemand === opt.value
                              ? 'border-[#b5a642]/60 bg-[#b5a642]/15 text-[#b5a642]'
                              : 'border-[#b5a642]/15 text-[#c9ccbb]/60 hover:border-[#b5a642]/30 hover:text-[#c9ccbb]/80'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
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
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-0">
                            <div className="w-full h-px bg-[#b5a642]/10" />
                            <div className="p-4">
                              <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Direction:</strong>
                                {eveningInsight.direction}
                              </p>
                            </div>
                            {hasAccess ? (
                              <div className="px-4 pb-4">
                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                  <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Why this is happening:</strong>
                                  {eveningInsight.reframe}
                                </p>
                              </div>
                            ) : (
                              <div className="relative px-4 pb-4">
                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                <div className="filter blur-[3px] opacity-30 select-none pointer-events-none text-xs leading-relaxed text-[#c9ccbb]/80">
                                  <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Why this is happening:</strong>
                                  {eveningInsight.reframe}
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
                                  <Lock size={14} className="text-[#b5a642]" />
                                  <span className="text-[9px] font-bold text-[#c9ccbb]/80 uppercase tracking-widest text-center">Understand the why through the lens of NeuroDesign</span>
                                  <Link href="/upgrade">
                                    <button className="px-5 py-1.5 bg-[#b5a642] text-[#1b270e] text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-[#d4c55e] transition-all">
                                      Unlock Now
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* ENVIRONMENTAL READINGS — morning */}
            {activeTab === 'morning' && (
              <div className="mb-8 p-6 bg-[#000]/20 rounded-2xl border border-[#b5a642]/10 animate-fade-in">
                <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-4 block flex items-center gap-2">
                  <Activity size={12} /> Your Home Environment Today
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest">
                        <Sun size={14} className="text-[#b5a642]/80" /> Morning Light Level
                      </div>
                      <button
                        onClick={() => { setActiveMeterTarget('morningLux'); setIsLightMeterOpen(true) }}
                        className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                      >
                        <Activity size={12} /> Measure
                      </button>
                    </div>
                    <input
                      type="number" min="0" max="100000"
                      placeholder="e.g. 250 (Dim) or 2500 (Bright)"
                      value={morningLux}
                      onChange={(e) => setMorningLux(e.target.value)}
                      className="w-full bg-[#1b270e] border border-[#b5a642]/15 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest">
                        <Volume2 size={14} className="text-[#b5a642]/80" /> Daytime Sound Level
                      </div>
                      <button
                        onClick={() => { setActiveMeterTarget('daytimeDb'); setIsAcousticMeterOpen(true) }}
                        className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                      >
                        <Activity size={12} /> Measure
                      </button>
                    </div>
                    <input
                      type="number" min="0" max="140"
                      placeholder="e.g. 45 (Kitchen) or 70 (Busy room)"
                      value={daytimeDb}
                      onChange={(e) => setDaytimeDb(e.target.value)}
                      className="w-full bg-[#1b270e] border border-[#b5a642]/15 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* EVENING WIND-DOWN PROMPT */}
            {activeTab === 'evening' && (
              <button
                onClick={() => toggleTag('low_horizon')}
                className={`w-full mb-8 p-5 rounded-2xl border text-left transition-all duration-300 group relative overflow-hidden animate-fade-in ${
                  eveningTags.includes('low_horizon')
                    ? 'bg-[#b5a642]/15 border-[#b5a642]/60 shadow-lg shadow-[#b5a642]/10'
                    : 'bg-[#000]/20 border-[#b5a642]/10 hover:border-[#b5a642]/30 hover:bg-[#b5a642]/5'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      eveningTags.includes('low_horizon') ? 'bg-[#b5a642] text-[#1b270e]' : 'bg-[#b5a642]/10 text-[#b5a642]'
                    }`}>
                      {eveningTags.includes('low_horizon') ? <CheckCircle size={18} /> : <Zap size={18} />}
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 transition-colors ${
                        eveningTags.includes('low_horizon') ? 'text-[#b5a642]' : 'text-[#c9ccbb]/80'
                      }`}>
                        Evening Wind-Down
                      </span>
                      <p className={`text-sm font-serif transition-colors ${
                        eveningTags.includes('low_horizon') ? 'text-[#c9ccbb]' : 'text-[#c9ccbb]/80'
                      }`}>
                        Have you adjusted the brightness and temperature of your lighting for the evening?
                      </p>
                      <p className={`text-[10px] mt-1 leading-relaxed transition-colors ${
                        eveningTags.includes('low_horizon') ? 'text-[#c9ccbb]/80' : 'text-[#c9ccbb]/70'
                      }`}>
                        Turn off the overhead lights and switch to warm, low-level light sources below 100 lux.
                      </p>
                    </div>
                  </div>
                  <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    eveningTags.includes('low_horizon') ? 'border-[#b5a642] bg-[#b5a642]' : 'border-[#b5a642]/20 group-hover:border-[#b5a642]/40'
                  }`}>
                    {eveningTags.includes('low_horizon') && <CheckCircle size={12} className="text-[#1b270e]" />}
                  </div>
                </div>
              </button>
            )}

            {/* ACTION TAGS */}
            <div className="flex flex-wrap gap-2 mb-8 animate-fade-in">
              {currentOptions.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`flex items-center gap-2 px-4 py-3 h-auto rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                    currentTags.includes(tag.id)
                      ? 'bg-[#b5a642] border-[#b5a642] text-[#1b270e]'
                      : 'bg-[#000]/20 border-[#b5a642]/10 text-[#c9ccbb]/80 hover:text-[#c9ccbb]'
                  }`}
                >
                  {tag.icon}
                  <span className="whitespace-normal text-left leading-tight">{tag.label}</span>
                </button>
              ))}
            </div>

            {/* NOTE */}
            <div className="mb-8">
              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder={activeTab === 'morning' ? 'Anything worth noting about your morning?' : 'Anything worth noting about your evening?'}
                className="w-full h-24 bg-[#000]/20 border border-[#b5a642]/10 rounded-xl p-4 text-[#c9ccbb] text-sm placeholder:text-[#c9ccbb]/80 focus:outline-none focus:border-[#b5a642]/50 resize-none font-sans"
              />
            </div>

            {/* SLEEP CONDITIONS — evening only */}
            {activeTab === 'evening' && (
              <div className="mb-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-[#b5a642]/15 flex items-center justify-center text-[#b5a642]">
                      <BedDouble size={15} />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-[#b5a642]/10 blur-md" />
                  </div>
                  <div>
                    <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest block">
                      Sleep Conditions
                    </span>
                    <span className="text-[#c9ccbb]/80 text-[10px]">
                      These contribute to your overnight recovery score, which is your most weighted domain.
                    </span>
                  </div>
                </div>

                <div className="mb-6 p-5 bg-[#000]/20 rounded-2xl border border-[#b5a642]/10">
                  <div className="flex justify-between mb-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                      <Sparkles size={13} className="text-[#b5a642]" /> How settled does your body feel?
                    </label>
                    <span className="font-mono text-xs font-bold text-[#b5a642]">
                      {['', 'Wired', 'Restless', 'Neutral', 'Winding Down', 'Ready to Sleep'][sleepReadiness]}
                    </span>
                  </div>
                  <input
                    type="range" min="1" max="5" step="1"
                    value={sleepReadiness}
                    onChange={(e) => setSleepReadiness(parseInt(e.target.value))}
                    className="w-full accent-[#b5a642] h-1 bg-[#000]/50 rounded-lg appearance-none cursor-pointer mb-1"
                  />
                  <div className="flex justify-between mb-4">
                    <span className="text-[#c9ccbb]/80 text-[9px]">Tired but Wired</span>
                    <span className="text-[#c9ccbb]/80 text-[9px]">Ready to Sleep</span>
                  </div>

                  {(() => {
                    const state = getSleepEveningCopy(sleepReadiness as 1|2|3|4|5)
                    return (
                      <div className="p-4 rounded-xl bg-[#b5a642]/5 border border-[#b5a642]/15">
                        <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-1">
                          {state.headline}
                        </p>
                        <p className="text-[#c9ccbb]/80 text-[10px] leading-relaxed mb-2">
                          {state.body}
                        </p>
                        <p className="text-[#c9ccbb]/80 text-[10px] leading-relaxed italic">
                          {state.environment_action}
                        </p>
                      </div>
                    )
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-[#000]/20 rounded-2xl border border-[#b5a642]/10 relative overflow-hidden group hover:border-[#b5a642]/20 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#b5a642]/5 rounded-full blur-2xl group-hover:bg-[#b5a642]/10 transition-all" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest">
                        <Volume2 size={13} className="text-[#b5a642]/80" /> Bedroom Sound
                      </div>
                      <button
                        onClick={() => { setActiveMeterTarget('bedtimeDb'); setIsAcousticMeterOpen(true) }}
                        className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                      >
                        <Activity size={11} /> Measure
                      </button>
                    </div>
                    <p className="text-[#c9ccbb]/80 text-[10px] mb-3">Target: below 35 dB for sleep onset.</p>
                    <input
                      type="number" min="0" max="140"
                      placeholder="e.g. 30 (Quiet) or 48 (Audible)"
                      value={bedtimeDb}
                      onChange={(e) => setBedtimeDb(e.target.value)}
                      className="w-full bg-[#1b270e] border border-[#b5a642]/15 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                    />
                  </div>

                  <div className="p-5 bg-[#000]/20 rounded-2xl border border-[#b5a642]/10 relative overflow-hidden group hover:border-[#b5a642]/20 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#b5a642]/5 rounded-full blur-2xl group-hover:bg-[#b5a642]/10 transition-all" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest">
                        <Moon size={13} className="text-[#b5a642]/80" /> Bedroom Light
                      </div>
                      <button
                        onClick={() => { setActiveMeterTarget('bedtimeLux'); setIsLightMeterOpen(true) }}
                        className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                      >
                        <Activity size={11} /> Measure
                      </button>
                    </div>
                    <p className="text-[#c9ccbb]/80 text-[10px] mb-3">Target: below 10 lux for melatonin onset.</p>
                    <input
                      type="number" min="0" max="10000"
                      placeholder="e.g. 5 (Dark) or 80 (Lamp on)"
                      value={bedtimeLux}
                      onChange={(e) => setBedtimeLux(e.target.value)}
                      className="w-full bg-[#1b270e] border border-[#b5a642]/15 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SAVE CONTROLS */}
            <div className="flex flex-col gap-4 pt-6 border-t border-[#b5a642]/10">
              <AnimatePresence>
                {showAccuracyWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex justify-between items-center p-4 bg-[#b5a642]/10 border border-[#b5a642]/30 rounded-xl"
                  >
                    <p className="text-sm text-[#c9ccbb] leading-relaxed">
                      <strong className="text-[#b5a642] uppercase tracking-widest text-[10px] mr-2 block mb-1">Data Accuracy Notice:</strong>
                      Some readings haven't been added yet. Your entry will still be saved, but your score will only reflect the information provided.
                    </p>
                    <button
                      onClick={() => handleSave(true)}
                      className="px-6 py-2 rounded-xl border border-[#b5a642] text-[#b5a642] text-xs font-bold uppercase tracking-widest hover:bg-[#b5a642]/10 transition-all shrink-0"
                    >
                      Save As Is
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end items-center gap-4">
                <AnimatePresence>
                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      className="text-[#c9ccbb]/80 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                      <AlertCircle size={14} /> {errorMessage}
                    </motion.div>
                  )}
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
                  onClick={() => handleSave(false)}
                  disabled={!canSave}
                  className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                    canSave
                      ? 'bg-[#b5a642] text-[#1b270e] hover:bg-[#d4c55e]'
                      : 'bg-[#b5a642]/10 text-[#b5a642]/20 cursor-not-allowed'
                  }`}
                >
                  {status === 'saving' ? <><Loader2 size={14} className="animate-spin" /> Saving</> : 'Save Entry'}
                </button>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* BSFI SESSION CARD                                                   */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* CHANGE: morning card shows only on morning tab                      */}
          {/*         evening card shows only on evening tab                      */}
          {/* CHANGE: interpretation leads — score is optional (accordion)        */}
          {/* ------------------------------------------------------------------ */}
          <AnimatePresence mode="wait">
            {activeTab === 'morning' && morningBsfi && (
              <motion.div
                key="morning-bsfi"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Sparkles size={12} className="text-[#b5a642]/60" />
                  <span className="text-[#b5a642]/70 text-[10px] font-bold uppercase tracking-widest">
                    Morning · What last night produced
                  </span>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-[#b5a642]/20 relative overflow-hidden bg-gradient-to-br from-[#b5a642]/8 to-transparent">
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#b5a642]/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10">

                    {/* INTERPRETATION LEADS */}
                    <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">
                      {getBsfiLabel(morningBsfi.total_score).label}
                    </h3>

                    {morningBsfi.is_internal_driver ? (
                      <p className="text-[#c9ccbb]/70 text-sm leading-relaxed mb-4">
                        There is some internal friction present, but your environment appears stable. This suggests the load is coming from within rather than from your space.
                      </p>
                    ) : (() => {
                      const safeDomain = sanitiseDomain(morningBsfi.dominant_domain)
                      return safeDomain ? (
                        <div className="mb-4">
                          <span className="text-[#c9ccbb]/60 text-[10px] uppercase tracking-widest font-bold block mb-1">Primary source of friction</span>
                          <span className="text-[#c9ccbb] bg-[#000]/30 px-3 py-1.5 rounded-lg text-xs font-bold inline-block">
                            {getDomainDisplay(safeDomain).label}
                          </span>
                        </div>
                      ) : null
                    })()}

                    {(() => {
                      const ctx = getBSFIContext(morningBsfi.total_score)
                      return (
                        <div className="p-4 bg-[#b5a642]/5 rounded-xl border border-[#b5a642]/10 mb-4">
                          <p className="text-[#c9ccbb]/80 text-xs leading-relaxed mb-2">{ctx.reframe}</p>
                          <p className="text-[#c9ccbb]/60 text-xs leading-relaxed italic">{ctx.environment_lens}</p>
                        </div>
                      )
                    })()}

                    {/* ACCUMULATIVE ALI FLAG */}
                    {morningBsfi.accumulative_ali_flag && (
                      <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-[#b5a642]/5 border border-[#b5a642]/15">
                        <AlertCircle size={13} className="text-[#b5a642] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[#b5a642] text-[9px] font-bold uppercase tracking-widest block mb-1">
                            Acoustic Load: Context Note
                          </span>
                          <p className="text-[#c9ccbb]/60 text-[9px] leading-relaxed">
                            Your acoustic load score appears moderate, but your accumulative processing pattern means your nervous system is under more strain than the score suggests. Mid-range friction on an accumulative profile requires the same attention as high friction on an integrative one.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SCORE — OPTIONAL ACCORDION */}
                    <button
                      onClick={() => setShowMorningScore(!showMorningScore)}
                      className="flex items-center gap-2 text-[#c9ccbb]/40 hover:text-[#b5a642]/60 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-300 ${showMorningScore ? 'rotate-180' : ''}`}
                      />
                      {showMorningScore ? 'Hide score' : 'See your score'}
                    </button>
                    <AnimatePresence>
                      {showMorningScore && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full border-4 ${getBsfiLabel(morningBsfi.total_score).border} flex flex-col items-center justify-center bg-[#1b270e] shrink-0`}>
                              <span className={`text-xl font-serif ${getBsfiLabel(morningBsfi.total_score).color}`}>
                                {morningBsfi.total_score}
                              </span>
                              <span className="text-[8px] text-[#c9ccbb]/60 font-bold uppercase tracking-widest">BSFI</span>
                            </div>
                            <p className="text-[#c9ccbb]/50 text-xs leading-relaxed">
                              Your Bio-Spatial Friction Index for this morning. Lower is better. This score reflects how much environmental load your nervous system absorbed overnight.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'evening' && eveningBsfi && (
              <motion.div
                key="evening-bsfi"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Sparkles size={12} className="text-[#b5a642]/60" />
                  <span className="text-[#b5a642]/70 text-[10px] font-bold uppercase tracking-widest">
                    Evening · What will be processed tonight
                  </span>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-[#b5a642]/20 relative overflow-hidden bg-gradient-to-br from-[#b5a642]/8 to-transparent">
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#b5a642]/8 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10">

                    {/* INTERPRETATION LEADS */}
                    <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">
                      {getBsfiLabel(eveningBsfi.total_score).label}
                    </h3>

                    {eveningBsfi.is_internal_driver ? (
                      <p className="text-[#c9ccbb]/70 text-sm leading-relaxed mb-4">
                        There is some internal friction present, but your environment appears stable. Dim the lights, reduce background noise, and keep the bedroom cool and quiet.
                      </p>
                    ) : (() => {
                      const safeDomain = sanitiseDomain(eveningBsfi.dominant_domain)
                      return safeDomain ? (
                        <div className="mb-4">
                          <span className="text-[#c9ccbb]/60 text-[10px] uppercase tracking-widest font-bold block mb-1">Primary source of friction</span>
                          <span className="text-[#c9ccbb] bg-[#000]/30 px-3 py-1.5 rounded-lg text-xs font-bold inline-block">
                            {getDomainDisplay(safeDomain).label}
                          </span>
                        </div>
                      ) : null
                    })()}

                    {(() => {
                      const ctx = getBSFIContext(eveningBsfi.total_score)
                      return (
                        <div className="p-4 bg-[#b5a642]/5 rounded-xl border border-[#b5a642]/10 mb-4">
                          <p className="text-[#c9ccbb]/80 text-xs leading-relaxed mb-2">{ctx.reframe}</p>
                          <p className="text-[#c9ccbb]/60 text-xs leading-relaxed italic">{ctx.environment_lens}</p>
                        </div>
                      )
                    })()}

                    {/* ACCUMULATIVE ALI FLAG */}
                    {eveningBsfi.accumulative_ali_flag && (
                      <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-[#b5a642]/5 border border-[#b5a642]/15">
                        <AlertCircle size={13} className="text-[#b5a642] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[#b5a642] text-[9px] font-bold uppercase tracking-widest block mb-1">
                            Acoustic Load: Context Note
                          </span>
                          <p className="text-[#c9ccbb]/60 text-[9px] leading-relaxed">
                            Your acoustic load score appears moderate, but your accumulative processing pattern means your nervous system is under more strain than the score suggests. Mid-range friction on an accumulative profile requires the same attention as high friction on an integrative one.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SCORE — OPTIONAL ACCORDION */}
                    <button
                      onClick={() => setShowEveningScore(!showEveningScore)}
                      className="flex items-center gap-2 text-[#c9ccbb]/40 hover:text-[#b5a642]/60 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-300 ${showEveningScore ? 'rotate-180' : ''}`}
                      />
                      {showEveningScore ? 'Hide score' : 'See your score'}
                    </button>
                    <AnimatePresence>
                      {showEveningScore && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full border-4 ${getBsfiLabel(eveningBsfi.total_score).border} flex flex-col items-center justify-center bg-[#1b270e] shrink-0`}>
                              <span className={`text-xl font-serif ${getBsfiLabel(eveningBsfi.total_score).color}`}>
                                {eveningBsfi.total_score}
                              </span>
                              <span className="text-[8px] text-[#c9ccbb]/60 font-bold uppercase tracking-widest">BSFI</span>
                            </div>
                            <p className="text-[#c9ccbb]/50 text-xs leading-relaxed">
                              Your Bio-Spatial Friction Index for this evening. Lower is better. This score reflects the environmental load your nervous system will carry into tonight's sleep.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 14-DAY PATTERN PANEL */}
          <div className={`glass-panel p-6 rounded-3xl mb-8 border relative overflow-hidden transition-all ${
            !macroSynthesis.ready || hasAccess
              ? 'bg-gradient-to-r from-[#b5a642]/10 to-transparent border-[#b5a642]/20'
              : 'bg-[#b5a642]/10 border-[#b5a642]/40 shadow-lg shadow-[#b5a642]/5'
          }`}>
            <div
              className={`flex items-center justify-between w-full relative z-10 ${hasAccess && macroSynthesis.ready ? 'cursor-pointer group' : ''}`}
              onClick={() => { if (hasAccess && macroSynthesis.ready) setIsSynthesisExpanded(!isSynthesisExpanded) }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#b5a642]/20 rounded-full text-[#b5a642] shrink-0">
                  {macroSynthesis.ready && !hasAccess ? <Lock size={20} /> : <Fingerprint size={20} />}
                </div>
                <div>
                  <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-1 block">
                    {macroSynthesis.ready ? 'Your 14-Day Pattern · Based on your last 14 days of logs' : 'Building Your Picture'}
                  </span>
                  <h4 className="text-xl font-serif text-[#c9ccbb]">{macroSynthesis.title}</h4>
                </div>
              </div>
              {hasAccess && macroSynthesis.ready && (
                <div className="text-[#c9ccbb]/80 group-hover:text-[#b5a642] transition-colors ml-4 shrink-0">
                  {isSynthesisExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              )}
            </div>

            {!macroSynthesis.ready ? (
              <div className="mt-4 pt-4 border-t border-[#b5a642]/15 w-full relative z-10">
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
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden relative z-10"
                  >
                    <div className="mt-6 space-y-4 text-[#c9ccbb]/80 text-sm leading-relaxed border-t border-[#b5a642]/15 pt-6">
                      {macroSynthesis.paragraphs.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div className="mt-6 pt-6 border-t border-[#b5a642]/15 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full relative z-10">
                <p className="text-sm text-[#c9ccbb]/80 leading-relaxed max-w-xl">
                  14 days of data collected. Your home's friction pattern is ready. Unlock now to see what it means for you.
                </p>
                <Link href="/upgrade" className="shrink-0 w-full md:w-auto">
                  <button className="w-full md:w-auto px-8 py-3 bg-[#b5a642] text-[#1b270e] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#d4c55e] transition-all shadow-lg shadow-[#b5a642]/20">
                    Read My Pattern
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* TREND CHART */}
          <div className="animate-fade-in-up delay-100 mb-12">
            <div className="flex justify-between items-end mb-6">
              <div>
                <div className="flex items-center gap-2 text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest mb-1">
                  <TrendingUp size={14} /> Your Daily Pattern
                </div>
                <h3 className="text-xl font-serif text-[#c9ccbb]">Mood, Tension & Focus Over Time</h3>
              </div>
            </div>
            <div className="glass-panel p-4 md:p-8 rounded-3xl border border-[#b5a642]/15 relative overflow-hidden">
              <div className="w-full overflow-x-auto hide-scrollbar">
                <div className="min-w-[600px] h-[300px]">
                  <CorrelationGraph data={chartLogs} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* HOW THIS WORKS MODAL */}
      <AnimatePresence>
        {isManualOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000]/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto hide-scrollbar bg-[#1b270e] border border-[#b5a642]/30 rounded-3xl shadow-2xl relative p-8 md:p-12"
            >
              <button
                onClick={() => setIsManualOpen(false)}
                className="absolute top-6 right-6 text-[#c9ccbb]/50 hover:text-[#b5a642] z-10 transition-colors bg-[#000]/20 p-2 rounded-full"
              >
                <X size={20} />
              </button>
              <h2 className="text-3xl font-serif text-[#c9ccbb] mb-8 border-b border-[#b5a642]/15 pb-6">Why We Log</h2>
              <div className="space-y-8 text-[#c9ccbb]/70 text-sm leading-relaxed font-light">
                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">The Purpose of Logging</h3>
                  <p>This isn't about optimising yourself. It's about understanding the subtle dialogue between your nervous system and your environment. One day tells you very little. However, when you record consistently, patterns begin to appear, showing which parts of your home restore you and which quietly ask your body to compensate.</p>
                </section>
                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">How Your Body Woke Up (Morning)</h3>
                  <p>What your body experienced during the night is reflected in the morning entry. Jaw tension, tight shoulders or frequent waking are not personal shortcomings. They are signals. They often point to conditions relating to light, temperature, sound, materials or internal states that prevented your nervous system from fully settling.</p>
                </section>
                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">How Your Day Went (Evening)</h3>
                  <p>The evening entry records how much effort your day required. A demanding day puts a real strain on the nervous system. If the environment doesn't shift to match that demand, the body continues to carry it into the night. This helps us to see whether your evening routines are truly allowing you to recover.</p>
                </section>
                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">Social Demand</h3>
                  <p>How much relational engagement your day involved is a meaningful signal for your nervous system. High social demand, regardless of whether the interactions were positive or negative, draws on regulatory resources that affect both your evening state and overnight recovery. This field helps the synthesis engine understand patterns that pure environmental data cannot explain.</p>
                </section>
                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">Home Friction Score</h3>
                  <p>This score reflects the amount of effort your environment required from you that day. Lower scores suggest that your home absorbed the demands placed on your body. Higher scores indicate friction, or small environmental pressures that accumulate over time. This is not a judgement, but a signal that is worth paying attention to.</p>
                </section>
                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">The 14-Day Pattern</h3>
                  <p>After two weeks of entries, a clearer picture begins to emerge. Patterns reveal what is coming from the environment and what may be part of normal internal cycles, such as stress, hormones or natural energy fluctuations. Not everything you feel originates in your home. The 14-day view helps distinguish what truly does.</p>
                </section>
              </div>
            </motion.div>
          </div>
        )}

        {isLightMeterOpen && (
          <LightSensorModal
            onClose={() => setIsLightMeterOpen(false)}
            onSave={(lux) => {
              if (activeMeterTarget === 'morningLux') setMorningLux(lux.toString())
              if (activeMeterTarget === 'eveningLux')  setEveningLux(lux.toString())
              if (activeMeterTarget === 'bedtimeLux')  setBedtimeLux(lux.toString())
              setIsLightMeterOpen(false)
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
              <button onClick={() => setIsAcousticMeterOpen(false)} className="absolute top-4 right-4 text-[#c9ccbb]/80 hover:text-[#b5a642] z-10">✕</button>
              <NoiseSensorModal
                onClose={() => setIsAcousticMeterOpen(false)}
                onSave={(db) => {
                  if (activeMeterTarget === 'daytimeDb') setDaytimeDb(db.toString())
                  if (activeMeterTarget === 'bedtimeDb') setBedtimeDb(db.toString())
                  setIsAcousticMeterOpen(false)
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
