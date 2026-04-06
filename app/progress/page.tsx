'use client'

// =============================================================================
// DAILY LOGS PAGE — The Sentient Home
// =============================================================================
//
// EXTRACTED MODULES (do not inline these back — keep them separate):
//
//   lib/progress-domains.ts      — BsfiState type, DAILY_DOMAINS, sanitiseDomain,
//                                  getDomainDisplay, getBsfiLabel
//   lib/progress-score-utils.ts  — deriveLuxScore, deriveDbScore
//   lib/progress-feedback.ts     — getMorningFeedback, getEveningFeedback,
//                                  getMacroSynthesis
//   app/daily-logs/constants.tsx — moods, morningTagOptions, eveningTagOptions
//
// GRAPH SAFETY:
//   fetchHistory(), chartLogs state, and <CorrelationGraph /> remain in this
//   file. They must not be extracted. The correlation graph and dashboard mood
//   graph read from daily_logs directly — the write payload must preserve
//   all legacy field names alongside v8 additions.
//
// DATABASE WRITE — all fields in the upsert payload:
//   LEGACY (graph + existing consumers — must always be written):
//     user_id, date, mood_score, tags, note, morning_tension, sleep_wakes,
//     morning_lux, evening_lux, daytime_db, bedtime_db, bedtime_lux,
//     sleep_readiness, lux_score, db_score, readiness_score, focus_hours,
//     evening_mood_score, evening_tags, evening_note, social_demand
//   V8 ADDITIONS:
//     cycle_phase, nighttime_db, daytime_db_avg, daytime_db_peak,
//     noise_character, environmental_control_score, task_init_drag,
//     spatial_reset, morning_mood, morning_tags, morning_note
// =============================================================================

import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import {
  Heart, Wind, Sun, Volume2, CheckCircle, TrendingUp, Activity,
  Zap, Loader2, Moon, Sunrise, Brain, Fingerprint, ChevronDown,
  ChevronUp, Lock, AlertCircle, HelpCircle, X, BedDouble, Sparkles,
  Users, MapPin, Waves
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import CorrelationGraph from './CorrelationGraph'
import { LightSensorModal } from '../tools/light-meter/page'
import { NoiseSensorModal } from '../tools/noise-meter/page'
import {
  getBSFIContext,
  getMorningEnvironmentalNote as getSleepMorningCopy,
  getEveningFeedback as getSleepEveningCopy,
} from '@/lib/sleep-copy'
import { getAttributionCopy } from '@/lib/bsfi-attribution-copy'

// Extracted modules
import { sanitiseDomain, getDomainDisplay, getBsfiLabel, shouldShowPrimarySource } from '@/lib/progress-domains'
import type { BsfiState }                                 from '@/lib/progress-domains'
import { getSynthesisState }                              from '@/lib/synthesis-state'
import { deriveLuxScore, deriveDbScore }                  from '@/lib/progress-score-utils'
import {
  getMorningFeedback,
  getEveningFeedback,
  getMacroSynthesis,
} from '@/lib/progress-feedback'
import { moods, morningTagOptions, eveningTagOptions }    from '@/app/daily-logs/constants'

// --- UI CONFIGURATION CONSTANTS (v8) ---
const NOISE_CHARACTER_OPTIONS = [
  { value: 'continuous_hum',           label: 'Continuous Hum'          },
  { value: 'intermittent_loud',        label: 'Intermittent Loud'       },
  { value: 'unpredictable_startling',  label: 'Unpredictable Startling' },
] as const

const TASK_DRAG_OPTIONS = [
  { value: 'none',     label: 'None'     },
  { value: 'light',    label: 'Light'    },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy',    label: 'Heavy'    },
] as const

// =============================================================================
// COMPONENT
// =============================================================================

export default function Progress() {
  const supabase = createClientComponentClient()

  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning')

  // --- ACCESS CONTROL ---
  const [tier, setTier]       = useState<'core' | 'blueprint' | null>(null)
  const [godMode, setGodMode] = useState(false)

  // --- MORNING STATE ---
  const [morningMood, setMorningMood] = useState<number | null>(null)
  const [morningTags, setMorningTags] = useState<string[]>([])
  const [morningNote, setMorningNote] = useState('')

  // --- ENVIRONMENTAL INPUTS ---
  const [morningLux,   setMorningLux]   = useState<string>('')
  const [eveningLux,   setEveningLux]   = useState<string>('')
  // daytimeDb is the single source of truth for daytime sound level.
  // Written to both daytime_db (legacy — graph reads this) and
  // daytime_db_avg (v8 engine). No separate daytimeDbAvg state needed.
  const [daytimeDb,    setDaytimeDb]    = useState<string>('')
  const [daytimeDbPeak, setDaytimeDbPeak] = useState<string>('')
  const [nighttimeDb,  setNighttimeDb]  = useState<string>('')
  const [noiseCharacter, setNoiseCharacter] = useState<
    'continuous_hum' | 'intermittent_loud' | 'unpredictable_startling' | null
  >(null)

  // --- SLEEP CONDITIONS ---
  const [bedtimeDb,       setBedtimeDb]       = useState<string>('')
  const [bedtimeLux,      setBedtimeLux]      = useState<string>('')
  const [sleepReadiness,  setSleepReadiness]  = useState<number>(3)

  // --- METER MODAL STATES ---
  const [isLightMeterOpen,    setIsLightMeterOpen]    = useState(false)
  const [isAcousticMeterOpen, setIsAcousticMeterOpen] = useState(false)
  const [activeMeterTarget,   setActiveMeterTarget]   = useState<
    'morningLux' | 'eveningLux' | 'daytimeDb' | 'bedtimeDb' | 'bedtimeLux' | null
  >(null)

  const [isManualOpen, setIsManualOpen] = useState(false)

  // --- BIO-METRICS ---
  const [tensionScore, setTensionScore] = useState<number>(0)
  const [wakeScore,    setWakeScore]    = useState<number>(0)
  // focusHours is the single focus state — feeds both the trend chart
  // (focus_hours column) and the v8 engine. The slider updates this directly.
  const [focusHours, setFocusHours] = useState<number>(0)

  // --- V8 PROPRIETARY SIGNALS ---
  const [taskInitDrag,              setTaskInitDrag]              = useState<string | null>(null)
  const [spatialReset,              setSpatialReset]              = useState<boolean>(false)
  const [environmentalControlScore, setEnvironmentalControlScore] = useState<number>(5)

  // --- SOCIAL + BIOLOGICAL ---
  const [socialDemand, setSocialDemand] = useState<'low' | 'moderate' | 'high' | null>(null)
  const [cyclePhase,   setCyclePhase]   = useState<
    'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | null
  >(null)

  // --- EVENING STATE ---
  // eveningMood is derived from sleepReadiness (1–5 → same scale)
  const [eveningMood, setEveningMood] = useState<number | null>(null)
  const [eveningTags, setEveningTags] = useState<string[]>([])
  const [eveningNote, setEveningNote] = useState('')

  // --- UI STATE ---
  const [status,               setStatus]               = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMessage,         setErrorMessage]         = useState('')
  const [showAccuracyWarning,  setShowAccuracyWarning]  = useState(false)

  // --- BSFI STATE ---
  const [morningBsfi, setMorningBsfi] = useState<BsfiState | null>(null)
  const [eveningBsfi, setEveningBsfi] = useState<BsfiState | null>(null)
  const [bsfiLoading, setBsfiLoading] = useState(true)

  // --- ACCORDION STATES ---
  const [isMorningOpen,       setIsMorningOpen]       = useState(false)
  const [isEveningOpen,       setIsEveningOpen]       = useState(false)
  const [isSynthesisExpanded, setIsSynthesisExpanded] = useState(false)
  const [showMorningScore,    setShowMorningScore]    = useState(false)
  const [showEveningScore,    setShowEveningScore]    = useState(false)

  // ─────────────────────────────────────────────────────────────────────────
  // GRAPH STATE — must stay in this component
  // chartLogs feeds <CorrelationGraph /> directly as a prop.
  // fetchHistory() writes to chartLogs. Neither can be extracted.
  // ─────────────────────────────────────────────────────────────────────────
  const [chartLogs,      setChartLogs]      = useState<any[]>([])
  const [synthesisState, setSynthesisState] = useState<'building' | 'ready' | 'recalibrating'>('building')
  const [logsSinceAck,   setLogsSinceAck]   = useState<number>(0)
  const [logsUntilReady, setLogsUntilReady] = useState<number>(14)

  // Sync eveningMood from sleepReadiness
  useEffect(() => { setEveningMood(sleepReadiness) }, [sleepReadiness])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 19) setActiveTab('evening')
  }, [])

  useEffect(() => {
    checkAccess()
    fetchTodayLog()
    fetchHistory()
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // ACCESS CONTROL
  // ─────────────────────────────────────────────────────────────────────────
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
        if (data.tier === 'core' || data.tier === 'blueprint') setTier(data.tier)
      }
    } catch (err) {
      console.error('Access check error:', err)
    }
  }

  const hasAccess   = tier !== null || godMode
  const isBlueprint = tier === 'blueprint' || godMode

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH TODAY'S LOG
  // ─────────────────────────────────────────────────────────────────────────
  const fetchTodayLog = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const todayStr     = new Date().toLocaleDateString('en-CA')
      const startOfToday = new Date().setHours(0, 0, 0, 0)
      const endOfToday   = new Date().setHours(23, 59, 59, 999)

      const { data: logData } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', todayStr)
        .single()

      const { data: bsfiResults } = await supabase
        .from('bsfi_results')
        .select('id, total_score, dominant_domain, domain_scores, created_at, session, integration_pattern, sensory_pattern')
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

          const entry: BsfiState = {
            total_score:         result.total_score,
            dominant_domain:     result.dominant_domain,
            load_attribution:    result.domain_scores?.load_attribution ?? 'environmental',
            biological_load:     result.domain_scores?.biological_load  ?? false,
            integration_pattern: result.integration_pattern ?? null,
            sensory_pattern:     result.sensory_pattern     ?? null,
          }
          if (isEvening) setEveningBsfi(entry)
          else           setMorningBsfi(entry)
        })
      }

      // Auto-fill from meter scans
      const { data: scanData } = await supabase
        .from('meter_scans')
        .select('metric_type, value, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(startOfToday).toISOString())
        .lte('created_at', new Date(endOfToday).toISOString())

      let autoMorningLux = '', autoEveningLux = '', autoDaytimeDb = '',
          autoBedtimeDb = '', autoBedtimeLux = ''

      if (scanData && scanData.length > 0) {
        scanData.forEach(scan => {
          const scanHour = new Date(scan.created_at).getHours()
          if (scan.metric_type === 'lux') {
            if (scanHour >= 4  && scanHour < 12) autoMorningLux = scan.value.toString()
            if (scanHour >= 16 && scanHour < 21) autoEveningLux = scan.value.toString()
            if (scanHour >= 21)                  autoBedtimeLux = scan.value.toString()
          }
          if (scan.metric_type === 'db') {
            if (scanHour >= 8  && scanHour < 18) autoDaytimeDb  = scan.value.toString()
            if (scanHour >= 21)                  autoBedtimeDb  = scan.value.toString()
          }
        })
      }

      if (logData) {
        // Legacy morning fields
        setMorningMood(logData.mood_score ?? logData.morning_mood ?? null)
        setMorningTags(logData.tags || logData.morning_tags || [])
        setMorningNote(logData.note || logData.morning_note || '')
        setMorningLux(logData.morning_lux  !== null ? logData.morning_lux.toString()  : autoMorningLux)
        setEveningLux(logData.evening_lux  !== null ? logData.evening_lux.toString()  : autoEveningLux)

        // daytime dB: prefer v8 avg column, fall back to legacy daytime_db
        const dbVal = logData.daytime_db_avg ?? logData.daytime_db
        setDaytimeDb(dbVal !== null && dbVal !== undefined ? dbVal.toString() : autoDaytimeDb)

        // v8 new fields
        if (logData.daytime_db_peak   !== null && logData.daytime_db_peak   !== undefined)
          setDaytimeDbPeak(logData.daytime_db_peak.toString())
        if (logData.nighttime_db      !== null && logData.nighttime_db      !== undefined)
          setNighttimeDb(logData.nighttime_db.toString())
        if (logData.noise_character)
          setNoiseCharacter(logData.noise_character)
        if (logData.task_init_drag)
          setTaskInitDrag(logData.task_init_drag)
        if (logData.spatial_reset !== null && logData.spatial_reset !== undefined)
          setSpatialReset(Boolean(logData.spatial_reset))
        if (logData.environmental_control_score !== null && logData.environmental_control_score !== undefined)
          setEnvironmentalControlScore(logData.environmental_control_score)

        // Bedroom
        setBedtimeDb(logData.bedtime_db  !== null ? logData.bedtime_db.toString()  : autoBedtimeDb)
        setBedtimeLux(logData.bedtime_lux !== null ? logData.bedtime_lux.toString() : autoBedtimeLux)
        if (logData.sleep_readiness !== null && logData.sleep_readiness !== undefined)
          setSleepReadiness(logData.sleep_readiness)

        // Bio-metrics
        if (logData.focus_hours     !== null && logData.focus_hours     !== undefined) setFocusHours(logData.focus_hours)
        if (logData.morning_tension !== null && logData.morning_tension !== undefined) setTensionScore(logData.morning_tension)
        if (logData.sleep_wakes     !== null && logData.sleep_wakes     !== undefined) setWakeScore(logData.sleep_wakes)

        // Social + biological
        if (logData.social_demand) setSocialDemand(logData.social_demand as 'low' | 'moderate' | 'high')
        if (logData.cycle_phase)   setCyclePhase(logData.cycle_phase as 'menstrual' | 'follicular' | 'ovulatory' | 'luteal')

        setEveningTags(logData.evening_tags || [])
        setEveningNote(logData.evening_note || '')

      } else {
        // No log today — use meter auto-fill
        setMorningLux(autoMorningLux)
        setEveningLux(autoEveningLux)
        setDaytimeDb(autoDaytimeDb)
        setBedtimeDb(autoBedtimeDb)
        setBedtimeLux(autoBedtimeLux)
      }
    } catch (err) {
      console.error('fetchTodayLog failed:', err)
      setStatus('error')
      setErrorMessage("Could not load today's log. Please refresh.")
    } finally {
      setBsfiLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH HISTORY — feeds chartLogs → CorrelationGraph + synthesis state
  // Must stay in this component. Do not extract.
  // ─────────────────────────────────────────────────────────────────────────
  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [historyRes, countRes, profileRes] = await Promise.all([
      supabase
        .from('daily_logs')
        .select('date, mood_score, focus_hours, morning_tension, sleep_wakes, social_demand')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(14),
      supabase
        .from('daily_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('user_profiles')
        .select('last_synthesis_acknowledged_at')
        .eq('user_id', user.id)
        .single(),
    ])

    const totalLogs          = countRes.count ?? 0
    const lastAcknowledgedAt = profileRes.data?.last_synthesis_acknowledged_at ?? null

    let logsSinceAcknowledged = 0
    if (lastAcknowledgedAt) {
      const { count } = await supabase
        .from('daily_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('date', lastAcknowledgedAt.split('T')[0])
      logsSinceAcknowledged = count ?? 0
    }

    const result = getSynthesisState(totalLogs, lastAcknowledgedAt, logsSinceAcknowledged)
    setSynthesisState(result.state)
    setLogsSinceAck(logsSinceAcknowledged)
    setLogsUntilReady(result.logsUntilReady)

    if (historyRes.data) {
      const formatted = [...historyRes.data].reverse().map((log: any) => {
        const [year, month, day] = log.date.split('-')
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        return {
          date:         dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
          mood:         log.mood_score      || 0,
          tension:      log.morning_tension || 0,
          focus:        log.focus_hours     || 0,
          wakes:        log.sleep_wakes     || 0,
          socialDemand: log.social_demand   || 'low',
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

  // ─────────────────────────────────────────────────────────────────────────
  // SAVE
  //
  // Dual-write strategy: v8 field names AND legacy field names are both
  // written on every save. This ensures:
  //   - The trend chart (reads mood_score, focus_hours) always has data
  //   - The correlation graph (reads daytime_db) always has data
  //   - The v8 engine (reads daytime_db_avg, nighttime_db etc) has data
  //   - No existing DB consumers break
  // ─────────────────────────────────────────────────────────────────────────
  const handleSave = async (isForced = false) => {
    // Morning requires morningMood. Evening has no hard required fields
    // but warns if key measurements are missing.
    const criticalFields = activeTab === 'morning'
      ? [morningLux]
      : [daytimeDb, daytimeDbPeak, String(environmentalControlScore)]

    const isMissing = criticalFields.some(val => val === null || val === '' || val === undefined)
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
        user_id: user.id,
        date:    today,

        // ── LEGACY FIELDS (graph + existing consumers — do not remove) ──────
        // mood_score feeds fetchHistory() → CorrelationGraph mood line.
        // tags, note are the original DB column names for morning data.
        // daytime_db feeds the existing dB correlation line in the graph.
        // bedtime_db, bedtime_lux, sleep_readiness, readiness_score,
        // evening_mood_score are existing columns — must always be written.
        mood_score:          morningMood,
        tags:                morningTags,
        note:                morningNote,
        daytime_db:          daytimeDb     ? parseInt(daytimeDb)     : null,
        bedtime_db:          bedtimeDb     ? parseInt(bedtimeDb)     : null,
        bedtime_lux:         bedtimeLux    ? parseInt(bedtimeLux)    : null,
        sleep_readiness:     sleepReadiness,
        readiness_score:     sleepReadiness,
        evening_mood_score:  eveningMood,
        lux_score:           deriveLuxScore(morningLux, eveningLux),
        db_score:            deriveDbScore(daytimeDb, nighttimeDb),

        // ── V8 MORNING FIELDS ───────────────────────────────────────────────
        morning_mood:    morningMood,
        morning_tags:    morningTags,
        morning_note:    morningNote,
        morning_tension: tensionScore,
        sleep_wakes:     wakeScore,
        morning_lux:     morningLux    ? parseInt(morningLux)    : null,
        // nighttime_db: bedroom ambient measured at morning log time (v8).
        // Written here for the engine; the bedroom sound UI writes bedtime_db
        // (the legacy column) separately above for the graph/legacy consumers.
        nighttime_db:    nighttimeDb   ? parseInt(nighttimeDb)   : null,
        cycle_phase:     cyclePhase    ?? null,

        // ── V8 EVENING FIELDS ───────────────────────────────────────────────
        evening_lux:     eveningLux    ? parseInt(eveningLux)    : null,
        evening_tags:    eveningTags,
        evening_note:    eveningNote,
        social_demand:   socialDemand  ?? null,
        // daytime_db_avg maps from the same input as daytime_db.
        // The engine reads daytime_db_avg; the graph reads daytime_db.
        // Both get the same value until the graph is updated to the v8 column.
        daytime_db_avg:  daytimeDb     ? parseInt(daytimeDb)     : null,
        daytime_db_peak: daytimeDbPeak ? parseInt(daytimeDbPeak) : null,
        noise_character: noiseCharacter ?? null,

        // ── V8 PROPRIETARY SIGNALS ──────────────────────────────────────────
        // focus_hours: the single focus state — feeds the trend chart AND
        // the v8 engine. focusHours is set directly by the evening slider.
        focus_hours:                  focusHours,
        environmental_control_score:  environmentalControlScore,
        task_init_drag:               taskInitDrag  ?? null,
        spatial_reset:                spatialReset,
      }

      const { error } = await supabase
        .from('daily_logs')
        .upsert(payload, { onConflict: 'user_id, date' })

      if (error) throw error

      setStatus('success')
      fetchHistory()
      fetchTodayLog()

      // BSFI calculation
      try {
        const res = await fetch('/api/calculate-bsfi', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ ...payload, session: activeTab }),
        })
        const data = await res.json()

        if (data.success && data.bsfiResult) {
          const entry: BsfiState = {
            total_score:         data.bsfiResult.bsfi_total,
            dominant_domain:     data.bsfiResult.dominant_domain,
            load_attribution:    data.bsfiResult.load_attribution ?? 'environmental',
            biological_load:     data.bsfiResult.biological_load  ?? false,
            integration_pattern: data.profileContext?.integration_pattern ?? null,
            sensory_pattern:     data.profileContext?.sensory_pattern     ?? null,
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

  const currentTags    = activeTab === 'morning' ? morningTags    : eveningTags
  const currentNote    = activeTab === 'morning' ? morningNote    : eveningNote
  const setCurrentNote = activeTab === 'morning' ? setMorningNote : setEveningNote
  const currentOptions = activeTab === 'morning' ? morningTagOptions : eveningTagOptions

  const canSave = activeTab === 'morning'
    ? morningMood !== null && status !== 'saving'
    : status !== 'saving'

  const morningInsight = getMorningFeedback({ morningMood, tensionScore, wakeScore, socialDemand })
  const eveningInsight = getEveningFeedback({ focusScore: focusHours, eveningMood, socialDemand })
  const macroSynthesis = getMacroSynthesis({ chartLogs })

  // =============================================================================
  // RENDER
  // =============================================================================
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
          <div className="glass-panel p-8 rounded-3xl mb-16 relative overflow-hidden border border-[#c9ccbb]/10">

            {/* MORNING / EVENING TAB */}
            <div className="flex justify-center mb-8">
              <div className="bg-[#000]/30 p-1 rounded-full flex gap-1 border border-[#c9ccbb]/10">
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

            {/* ── MORNING TAB ──────────────────────────────────────────────── */}
            {activeTab === 'morning' && (
              <>
                {/* MOOD CARDS */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 flex items-center justify-center text-[#b5a642]">
                    <Heart size={20} />
                  </div>
                  <h2 className="text-2xl font-serif text-[#c9ccbb]">How You Woke Up</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                  {moods.map((mood) => (
                    <button
                      key={mood.val}
                      onClick={() => setMorningMood(mood.val)}
                      className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-28 group relative overflow-hidden ${
                        morningMood === mood.val
                          ? `${mood.color} shadow-lg scale-105`
                          : 'bg-[#000]/20 border-[#c9ccbb]/10 text-[#c9ccbb]/60 hover:bg-[#c9ccbb]/5'
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

                {/* MORNING BIO-METRICS */}
                <div className="mb-8 p-6 bg-[#b5a642]/5 rounded-2xl border border-[#b5a642]/10 animate-fade-in">
                  <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-6 block flex items-center gap-2">
                    <Activity size={12} /> How Your Body Woke Up
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    {/* TENSION */}
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
                    {/* SLEEP INTERRUPTIONS */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                          <Moon size={14} className="text-[#b5a642]" /> Sleep Interruptions
                        </label>
                        <div className="flex gap-3">
                          <button onClick={() => setWakeScore(Math.max(0, wakeScore - 1))} className="text-[#c9ccbb] hover:text-[#b5a642]">−</button>
                          <span className="text-[#b5a642] font-mono text-xs">{wakeScore}</span>
                          <button onClick={() => setWakeScore(Math.min(8, wakeScore + 1))} className="text-[#c9ccbb] hover:text-[#b5a642]">+</button>
                        </div>
                      </div>
                      <p className="text-[#c9ccbb]/80 text-[10px] mb-3">How many times you woke up during the night.</p>
                    </div>
                  </div>

                  {/* MORNING INSIGHT ACCORDION */}
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
                              <div className="w-full h-px bg-[#b5a642]/70" />
                              {(() => {
                                const sleepCopy = getSleepMorningCopy({
                                  sleep_wakes:     wakeScore,
                                  mood_score:      morningMood,
                                  morning_tension: tensionScore,
                                  social_demand:   socialDemand,
                                })
                                return sleepCopy.environmental_note ? (
                                  <div className="px-4 pt-4 pb-2">
                                    <p className="text-[#c9ccbb]/80 text-[10px] leading-relaxed">
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
                                  <div className="w-full h-px bg-[#b5a642]/70 mb-4" />
                                  <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                    <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Why this is happening:</strong>
                                    {morningInsight.reframe}
                                  </p>
                                </div>
                              ) : (
                                <div className="relative px-4 pb-4">
                                  <div className="w-full h-px bg-[#b5a642]/70 mb-4" />
                                  <div className="filter blur-[3px] opacity-30 select-none pointer-events-none text-xs leading-relaxed text-[#c9ccbb]/80">
                                    <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Why this is happening:</strong>
                                    {morningInsight.reframe}
                                  </div>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
                                    <Lock size={14} className="text-[#b5a642]" />
                                    <span className="text-[9px] font-bold text-[#c9ccbb]/80 uppercase tracking-widest text-center">Understand the why through the lens of NeuroDesign</span>
                                    <Link href="/upgrade">
                                      <button className="px-5 py-1.5 bg-[#b5a642] text-[#1b270e] text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-white transition-all">
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

                {/* MORNING ENVIRONMENTAL READINGS */}
                <div className="mb-8 p-6 bg-[#000]/20 rounded-2xl border border-[#c9ccbb]/5 animate-fade-in">
                  <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-4 block flex items-center gap-2">
                    <Activity size={12} /> Your Home Environment Today
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* MORNING LUX */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest">
                          <Sun size={14} className="text-[#b5a642]/80" /> Morning Light Level
                        </div>
                        <button
                          onClick={() => { setActiveMeterTarget('morningLux'); setIsLightMeterOpen(true) }}
                          className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-[#b5a642] transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                        >
                          <Activity size={12} /> Measure
                        </button>
                      </div>
                      <input
                        type="number" min="0" max="100000"
                        placeholder="e.g. 250 (Dim) or 2500 (Bright)"
                        value={morningLux}
                        onChange={(e) => setMorningLux(e.target.value)}
                        className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                      />
                    </div>
                    {/* DAYTIME DB — average; also feeds legacy daytime_db column */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest">
                          <Volume2 size={14} className="text-[#b5a642]/80" /> Daytime Sound Level
                        </div>
                        <button
                          onClick={() => { setActiveMeterTarget('daytimeDb'); setIsAcousticMeterOpen(true) }}
                          className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-[#b5a642] transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                        >
                          <Activity size={12} /> Measure
                        </button>
                      </div>
                      <input
                        type="number" min="0" max="140"
                        placeholder="e.g. 45 (Kitchen) or 70 (Busy room)"
                        value={daytimeDb}
                        onChange={(e) => setDaytimeDb(e.target.value)}
                        className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── EVENING TAB ──────────────────────────────────────────────── */}
            {activeTab === 'evening' && (
              <>
                {/* EVENING BIO-METRICS */}
                <div className="mb-8 p-6 bg-[#b5a642]/5 rounded-2xl border border-[#b5a642]/10 animate-fade-in">
                  <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-6 block flex items-center gap-2">
                    <Brain size={12} /> How Did Your Day Go?
                  </label>

                  {/* ROW 1: FOCUS + SOCIAL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    {/* FOCUSED WORK HOURS — feeds focus_hours column for trend chart */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                          <Brain size={14} className="text-[#b5a642]" /> Focused Work (Hours)
                        </label>
                        <span className="text-[#b5a642] font-mono text-xs">{focusHours}h</span>
                      </div>
                      <p className="text-[#c9ccbb]/80 text-[10px] mb-3">Hours where you were focused and uninterrupted.</p>
                      <input
                        type="range" min="0" max="12" step="1"
                        value={focusHours}
                        onChange={(e) => setFocusHours(parseInt(e.target.value))}
                        className="w-full accent-[#b5a642] h-1 bg-[#000]/50 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* SOCIAL DEMAND */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb] mb-2">
                        <Users size={14} className="text-[#b5a642]" /> Social Demand Today
                      </label>
                      <p className="text-[#c9ccbb]/80 text-[10px] mb-3">
                        How emotionally or cognitively taxing was your social engagement today?
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
                            onClick={() => setSocialDemand(socialDemand === opt.value ? null : opt.value)}
                            className={`py-2.5 px-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all text-center ${
                              socialDemand === opt.value
                                ? 'border-[#b5a642]/60 bg-[#b5a642]/15 text-[#b5a642]'
                                : 'border-[#c9ccbb]/10 text-[#c9ccbb]/80 hover:border-[#b5a642]/30 hover:text-[#c9ccbb]/80'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ROW 2: TASK DRAG + ENVIRONMENTAL AGENCY */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 mb-6 border-t border-[#b5a642]/10">
                    {/* TASK INITIATION DRAG */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb] mb-2">
                        <Fingerprint size={14} className="text-[#b5a642]" /> Task Initiation Drag
                      </label>
                      <p className="text-[#c9ccbb]/80 text-[10px] mb-3">
                        How much friction did you feel when starting new tasks today?
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {TASK_DRAG_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setTaskInitDrag(taskInitDrag === opt.value ? null : opt.value)}
                            className={`py-2.5 px-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all text-center ${
                              taskInitDrag === opt.value
                                ? 'border-[#b5a642]/60 bg-[#b5a642]/15 text-[#b5a642]'
                                : 'border-[#c9ccbb]/10 text-[#c9ccbb]/80 hover:border-[#b5a642]/30 hover:text-[#c9ccbb]/80'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ENVIRONMENTAL AGENCY */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                          <Zap size={14} className="text-[#b5a642]" /> Environmental Agency
                        </label>
                        <span className="text-[#b5a642] font-mono text-xs">{environmentalControlScore}/10</span>
                      </div>
                      <p className="text-[#c9ccbb]/80 text-[10px] mb-3">
                        How much control did you feel like you had over your environment today?
                      </p>
                      <input
                        type="range" min="0" max="10" step="1"
                        value={environmentalControlScore}
                        onChange={(e) => setEnvironmentalControlScore(parseInt(e.target.value))}
                        className="w-full accent-[#b5a642] h-1 bg-[#000]/50 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* ROW 3: SPATIAL RESET */}
                  <div className="pt-6 border-t border-[#b5a642]/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-[#b5a642]/15 flex items-center justify-center text-[#b5a642] shrink-0">
                        <MapPin size={15} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#c9ccbb] block">Spatial Reset</label>
                        <span className="text-[#c9ccbb]/80 text-[10px]">Did you have to move things around (rearrange your space/ reset) in order to feel regulated?</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setSpatialReset(true)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                          spatialReset === true
                            ? 'border-[#b5a642] bg-[#b5a642]/20 text-[#b5a642]'
                            : 'border-[#c9ccbb]/10 text-[#c9ccbb]/80 hover:border-[#b5a642]/30'
                        }`}
                      >
                        Yes, I reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpatialReset(false)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                          spatialReset === false
                            ? 'border-[#b5a642] bg-[#b5a642]/20 text-[#b5a642]'
                            : 'border-[#c9ccbb]/10 text-[#c9ccbb]/80 hover:border-[#b5a642]/30'
                        }`}
                      >
                        No reset
                      </button>
                    </div>
                  </div>

                  {/* EVENING INSIGHT ACCORDION */}
                  {focusHours > 0 && (
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
                                      <button className="px-5 py-1.5 bg-[#b5a642] text-[#1b270e] text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-[#b5a642]/90 transition-all">
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

                {/* EVENING ACOUSTIC + NOISE CHARACTER */}
                {/* daytime_db_peak and noise_character are evening-only signals. */}
                {/* daytimeDb (avg) is also captured here for the evening record. */}
                <div className="mb-8 p-6 bg-[#000]/20 rounded-2xl border border-[#c9ccbb]/5 animate-fade-in">
                  <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-4 block flex items-center gap-2">
                    <Volume2 size={12} /> Acoustic Environment Today
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* DAYTIME DB AVG */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest">
                          <Volume2 size={14} className="text-[#b5a642]/80" /> Average Sound Level
                        </div>
                        <button
                          onClick={() => { setActiveMeterTarget('daytimeDb'); setIsAcousticMeterOpen(true) }}
                          className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-[#b5a642] transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                        >
                          <Activity size={12} /> Measure
                        </button>
                      </div>
                      <p className="text-[#c9ccbb]/80 text-[10px] mb-3">Typical background sound level across your day.</p>
                      <input
                        type="number" min="0" max="140"
                        placeholder="e.g. 45 (Quiet) or 65 (Active)"
                        value={daytimeDb}
                        onChange={(e) => setDaytimeDb(e.target.value)}
                        className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                      />
                    </div>
                    {/* DAYTIME DB PEAK */}
                    <div>
                      <div className="flex items-center gap-2 text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest mb-2">
                        <Activity size={14} className="text-[#b5a642]/80" /> Peak dB Hit Today
                      </div>
                      <p className="text-[#c9ccbb]/80 text-[10px] mb-3">What is the loudest single event you were exposed to today?.</p>
                      <input
                        type="number" min="0" max="140"
                        placeholder="e.g. 85 (drill, shout)"
                        value={daytimeDbPeak}
                        onChange={(e) => setDaytimeDbPeak(e.target.value)}
                        className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                      />
                    </div>
                  </div>
                  {/* NOISE CHARACTER */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb] mb-2">
                      <Waves size={14} className="text-[#b5a642]" /> Noise Character
                    </label>
                    <p className="text-[#c9ccbb]/80 text-[10px] mb-3">
                      The quality of noise matters as much as the volume. Unpredictable noise is more dysregulating than continuous noise at the same level.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {NOISE_CHARACTER_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setNoiseCharacter(noiseCharacter === opt.value ? null : opt.value)}
                          className={`py-2.5 px-2 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all text-center ${
                            noiseCharacter === opt.value
                              ? 'border-[#b5a642]/60 bg-[#b5a642]/15 text-[#b5a642]'
                              : 'border-[#c9ccbb]/10 text-[#c9ccbb]/80 hover:border-[#b5a642]/30 hover:text-[#c9ccbb]/90'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* EVENING WIND-DOWN PROMPT */}
                <button
                  onClick={() => toggleTag('low_horizon')}
                  className={`w-full mb-8 p-5 rounded-2xl border text-left transition-all duration-300 group relative overflow-hidden animate-fade-in ${
                    eveningTags.includes('low_horizon')
                      ? 'bg-[#b5a642]/15 border-[#b5a642]/60 shadow-lg shadow-[#b5a642]/10'
                      : 'bg-[#000]/20 border-[#c9ccbb]/10 hover:border-[#b5a642]/30 hover:bg-[#b5a642]/5'
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
                      eveningTags.includes('low_horizon') ? 'border-[#b5a642] bg-[#b5a642]' : 'border-[#c9ccbb]/20 group-hover:border-[#b5a642]/40'
                    }`}>
                      {eveningTags.includes('low_horizon') && <CheckCircle size={12} className="text-[#1b270e]" />}
                    </div>
                  </div>
                </button>
              </>
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
                      : 'bg-[#000]/20 border-[#c9ccbb]/10 text-[#c9ccbb]/80 hover:text-[#c9ccbb]'
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
                className="w-full h-24 bg-[#000]/20 border border-[#c9ccbb]/10 rounded-xl p-4 text-[#c9ccbb] text-sm placeholder:text-[#c9ccbb]/80 focus:outline-none focus:border-[#b5a642]/50 resize-none font-sans"
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
                    <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest block">Sleep Conditions</span>
                    <span className="text-[#c9ccbb]/80 text-[10px]">These contribute to your overnight recovery score, which is your most weighted domain.</span>
                  </div>
                </div>

                {/* SLEEP READINESS */}
                <div className="mb-6 p-5 bg-[#000]/20 rounded-2xl border border-[#c9ccbb]/5">
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
                      <div className="p-4 rounded-xl bg-[#b5a642]/5 border border-[#b5a642]/80">
                        <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-1">{state.headline}</p>
                        <p className="text-[#c9ccbb]/80 text-[10px] leading-relaxed mb-2">{state.body}</p>
                        <p className="text-[#c9ccbb]/80 text-[10px] leading-relaxed italic">{state.environment_action}</p>
                      </div>
                    )
                  })()}
                </div>

                {/* CYCLE PHASE */}
                <div className="mb-6 p-5 bg-[#000]/20 rounded-2xl border border-[#c9ccbb]/5">
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-xs font-bold text-[#b5a642]">CYCLE PHASE</label>
                    <span className="text-[#c9ccbb]/40 text-[10px] uppercase tracking-widest font-bold">· Optional</span>
                  </div>
                  <p className="text-[#c9ccbb]/60 text-[10px] leading-relaxed mb-4">
                    If relevant, logging your cycle phase helps the engine distinguish physiological load from environmental load in your score.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'menstrual',  label: 'Menstrual',  note: 'Days 1–5'   },
                      { value: 'follicular', label: 'Follicular', note: 'Days 6–13'  },
                      { value: 'ovulatory',  label: 'Ovulatory',  note: 'Days 13–15' },
                      { value: 'luteal',     label: 'Luteal',     note: 'Days 16–28' },
                    ] as const).map(phase => (
                      <button
                        key={phase.value}
                        type="button"
                        onClick={() => setCyclePhase(cyclePhase === phase.value ? null : phase.value)}
                        className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                          cyclePhase === phase.value
                            ? 'border-[#b5a642]/70 bg-[#b5a642]/10 text-[#b5a642]'
                            : 'border-[#c9ccbb]/10 text-[#c9ccbb]/70 hover:border-[#b5a642]/60 hover:text-[#c9ccbb]/80'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest block mb-0.5">{phase.label}</span>
                        <span className={`text-[9px] ${cyclePhase === phase.value ? 'text-[#b5a642]/70' : 'text-[#c9ccbb]/70'}`}>{phase.note}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* BEDROOM READINGS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-[#000]/20 rounded-2xl border border-[#c9ccbb]/5 relative overflow-hidden group hover:border-[#b5a642]/20 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#b5a642]/5 rounded-full blur-2xl group-hover:bg-[#b5a642]/10 transition-all" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest">
                        <Volume2 size={13} className="text-[#b5a642]/80" /> Bedroom Sound
                      </div>
                      <button
                        onClick={() => { setActiveMeterTarget('bedtimeDb'); setIsAcousticMeterOpen(true) }}
                        className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-[#b5a642] transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                      >
                        <Activity size={11} /> Measure
                      </button>
                    </div>
                    <p className="text-[#c9ccbb]/80 text-[10px] mb-3">Target: below 35 dB for sleep onset.</p>
                    <input
                      type="number" min="0" max="140"
                      placeholder="e.g. 30 (Quiet) or 48 (Audible)"
                      value={bedtimeDb}
                      onChange={(e) => {
                        setBedtimeDb(e.target.value)
                        // Also update nighttimeDb — this is what the v8 morning
                        // engine reads as the bedroom ambient on waking.
                        setNighttimeDb(e.target.value)
                      }}
                      className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                    />
                  </div>

                  <div className="p-5 bg-[#000]/20 rounded-2xl border border-[#c9ccbb]/5 relative overflow-hidden group hover:border-[#b5a642]/20 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#b5a642]/5 rounded-full blur-2xl group-hover:bg-[#b5a642]/10 transition-all" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest">
                        <Moon size={13} className="text-[#b5a642]/80" /> Bedroom Light
                      </div>
                      <button
                        onClick={() => { setActiveMeterTarget('bedtimeLux'); setIsLightMeterOpen(true) }}
                        className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-[#b5a642] transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
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
                      className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SAVE CONTROLS */}
            <div className="flex flex-col gap-4 pt-6 border-t border-[#c9ccbb]/10">
              <AnimatePresence>
                {showAccuracyWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex justify-between items-center p-4 bg-[#b5a642]/20 border border-[#b5a642]/70 rounded-xl"
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
                      ? 'bg-[#b5a642]/80 text-[#1b270e] hover:bg-[#b5a642]'
                      : 'bg-[#c9ccbb]/10 text-[#c9ccbb]/80 cursor-not-allowed'
                  }`}
                >
                  {status === 'saving' ? <><Loader2 size={14} className="animate-spin" /> Saving</> : 'Save Entry'}
                </button>
              </div>
            </div>
          </div>

          {/* BSFI SESSION CARDS */}
          <AnimatePresence mode="wait">

            {activeTab === 'morning' && morningBsfi && (
              <motion.div
                key="morning-bsfi"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Sparkles size={12} className="text-[#b5a642]/60" />
                  <span className="text-[#b5a642]/80 text-[10px] font-bold uppercase tracking-widest">
                    Today's Bio-Spatial Rhythm
                  </span>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-6 rounded-3xl border border-[#b5a642]/20 relative overflow-hidden bg-gradient-to-br from-[#b5a642]/8 to-transparent"
                >
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#b5a642]/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10">
                    <span className="text-[#b5a642]/80 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-4">
                      <Sunrise size={11} /> Morning · What last night produced
                    </span>
                    <h3 className="text-lg font-serif text-[#c9ccbb] mb-2">
                      {getBsfiLabel(morningBsfi.total_score, 'morning').label}
                    </h3>
                    {(() => {
                      const attribution = getAttributionCopy(morningBsfi.load_attribution ?? 'environmental', 'morning')
                      return (
                        <>
                          <p className="text-[#c9ccbb]/70 text-[10px] leading-relaxed mb-3 italic">
                            {attribution.source_note}
                          </p>
                          {morningBsfi.load_attribution === 'environmental' &&
                            shouldShowPrimarySource(morningBsfi.total_score, 'morning') &&
                            (() => {
                              const safeDomain = sanitiseDomain(morningBsfi.dominant_domain)
                              return safeDomain ? (
                                <div className="mb-4">
                                  <span className="text-[#c9ccbb]/80 text-[10px] block mb-1 uppercase tracking-widest font-bold">Primary source</span>
                                  <span className="text-[#b5a642] bg-[#000]/30 px-2.5 py-1 rounded text-[10px] font-bold inline-block">
                                    {getDomainDisplay(safeDomain).label}
                                  </span>
                                </div>
                              ) : null
                            })()
                          }
                        </>
                      )
                    })()}
                    {(() => {
                      const ctx         = getBSFIContext(morningBsfi.total_score, 'morning')
                      const attribution = getAttributionCopy(morningBsfi.load_attribution ?? 'environmental', 'morning')
                      return (
                        <div className="mt-4 pt-4 border-t border-[#b5a642]/10">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5a642] mb-2">What this means</p>
                          <p className="text-[#c9ccbb]/80 text-[10px] leading-relaxed mb-2">{ctx.reframe}</p>
                          <p className="text-[#c9ccbb]/80 text-[10px] leading-relaxed mb-3">{attribution.reframe}</p>
                          {attribution.direction && (
                            <p className="text-[#c9ccbb]/80 text-[10px] leading-relaxed italic">{attribution.direction}</p>
                          )}
                        </div>
                      )
                    })()}
                    <button
                      onClick={() => setShowMorningScore(!showMorningScore)}
                      className="mt-4 flex items-center gap-1.5 text-[#c9ccbb]/70 hover:text-[#b5a642]/80 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      <ChevronDown size={11} className={`transition-transform duration-300 ${showMorningScore ? 'rotate-180' : ''}`} />
                      {showMorningScore ? 'Hide score' : 'See your score'}
                    </button>
                    <AnimatePresence>
                      {showMorningScore && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 flex items-center gap-5">
                            <div className={`w-20 h-20 rounded-full border-4 ${getBsfiLabel(morningBsfi.total_score, 'morning').border} flex flex-col items-center justify-center bg-[#1b270e] shrink-0 shadow-lg shadow-[#b5a642]/10`}>
                              <span className={`text-2xl font-serif ${getBsfiLabel(morningBsfi.total_score, 'morning').color}`}>{morningBsfi.total_score}</span>
                              <span className="text-[9px] text-[#c9ccbb]/80 font-bold uppercase tracking-widest">BSFI</span>
                            </div>
                            <p className="text-[#c9ccbb]/70 text-xs leading-relaxed">
                              Your Bio-Spatial Friction Index for this morning. Lower is better.
                              This score reflects how much environmental load your nervous system absorbed overnight.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'evening' && eveningBsfi && (
              <motion.div
                key="evening-bsfi"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Sparkles size={12} className="text-[#b5a642]/60" />
                  <span className="text-[#b5a642]/80 text-[10px] font-bold uppercase tracking-widest">
                    Today's Bio-Spatial Rhythm
                  </span>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-6 rounded-3xl border border-[#b5a642]/20 relative overflow-hidden bg-gradient-to-br from-[#b5a642]/8 to-transparent"
                >
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#b5a642]/8 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10">
                    <span className="text-[#b5a642]/80 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-4">
                      <Moon size={11} /> Evening · What will be processed tonight
                    </span>
                    <h3 className="text-lg font-serif text-[#c9ccbb] mb-2">
                      {getBsfiLabel(eveningBsfi.total_score, 'evening').label}
                    </h3>
                    {(() => {
                      const attribution = getAttributionCopy(eveningBsfi.load_attribution ?? 'environmental', 'evening')
                      return (
                        <>
                          <p className="text-[#c9ccbb]/70 text-[10px] leading-relaxed mb-3 italic">
                            {attribution.source_note}
                          </p>
                          {eveningBsfi.load_attribution === 'environmental' &&
                            shouldShowPrimarySource(eveningBsfi.total_score, 'evening') &&
                            (() => {
                              const safeDomain = sanitiseDomain(eveningBsfi.dominant_domain)
                              return safeDomain ? (
                                <div className="mb-4">
                                  <span className="text-[#c9ccbb]/80 text-[10px] block mb-1 uppercase tracking-widest font-bold">Primary source</span>
                                  <span className="text-[#b5a642] bg-[#000]/30 px-2.5 py-1 rounded text-[10px] font-bold inline-block">
                                    {getDomainDisplay(safeDomain).label}
                                  </span>
                                </div>
                              ) : null
                            })()
                          }
                        </>
                      )
                    })()}
                    {(() => {
                      const ctx         = getBSFIContext(eveningBsfi.total_score, 'evening')
                      const attribution = getAttributionCopy(eveningBsfi.load_attribution ?? 'environmental', 'evening')
                      return (
                        <div className="mt-4 pt-4 border-t border-[#b5a642]/10">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5a642] mb-2">What this means</p>
                          <p className="text-[#c9ccbb]/80 text-[10px] leading-relaxed mb-2">{ctx.reframe}</p>
                          <p className="text-[#c9ccbb]/80 text-[10px] leading-relaxed mb-3">{attribution.reframe}</p>
                          {attribution.direction && (
                            <p className="text-[#c9ccbb]/70 text-[10px] leading-relaxed italic">{attribution.direction}</p>
                          )}
                        </div>
                      )
                    })()}
                    <button
                      onClick={() => setShowEveningScore(!showEveningScore)}
                      className="mt-4 flex items-center gap-1.5 text-[#c9ccbb]/70 hover:text-[#b5a642]/80 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      <ChevronDown size={11} className={`transition-transform duration-300 ${showEveningScore ? 'rotate-180' : ''}`} />
                      {showEveningScore ? 'Hide score' : 'See your score'}
                    </button>
                    <AnimatePresence>
                      {showEveningScore && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 flex items-center gap-5">
                            <div className={`w-20 h-20 rounded-full border-4 ${getBsfiLabel(eveningBsfi.total_score, 'evening').border} flex flex-col items-center justify-center bg-[#1b270e] shrink-0 shadow-lg shadow-[#b5a642]/10`}>
                              <span className={`text-2xl font-serif ${getBsfiLabel(eveningBsfi.total_score, 'evening').color}`}>{eveningBsfi.total_score}</span>
                              <span className="text-[9px] text-[#c9ccbb]/80 font-bold uppercase tracking-widest">BSFI</span>
                            </div>
                            <p className="text-[#c9ccbb]/70 text-xs leading-relaxed">
                              Your Bio-Spatial Friction Index for this evening. Lower is better.
                              This score reflects the environmental load your nervous system will carry into tonight's sleep.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* 14-DAY PATTERN PANEL */}
          <div className={`glass-panel p-6 rounded-3xl mb-8 border relative overflow-hidden transition-all ${
            synthesisState === 'recalibrating'
              ? 'bg-gradient-to-r from-[#b5a642]/5 to-transparent border-[#b5a642]/15'
              : synthesisState === 'building' || hasAccess
                ? 'bg-gradient-to-r from-[#b5a642]/10 to-transparent border-[#b5a642]/20'
                : 'bg-[#b5a642]/10 border-[#b5a642]/40 shadow-lg shadow-[#b5a642]/5'
          }`}>
            <div
              className={`flex items-center justify-between w-full relative z-10 ${hasAccess && macroSynthesis.ready && synthesisState === 'ready' ? 'cursor-pointer group' : ''}`}
              onClick={async () => {
                if (!hasAccess || !macroSynthesis.ready) return
                const wasExpanded = isSynthesisExpanded
                setIsSynthesisExpanded(!isSynthesisExpanded)
                if (wasExpanded) {
                  await fetch('/api/acknowledge-synthesis', { method: 'POST' })
                  fetchHistory()
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#b5a642]/20 rounded-full text-[#b5a642] shrink-0">
                  {macroSynthesis.ready && !hasAccess && synthesisState === 'ready'
                    ? <Lock size={20} />
                    : <Fingerprint size={20} />
                  }
                </div>
                <div>
                  <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-1 block">
                    {synthesisState === 'recalibrating'
                      ? 'Pattern Recalibrating'
                      : synthesisState === 'ready'
                        ? 'Your 14-Day Pattern · Based on your last 14 days of logs'
                        : 'Building Your Picture'
                    }
                  </span>
                  <h4 className="text-xl font-serif text-[#c9ccbb]">
                    {synthesisState === 'recalibrating'
                      ? 'Your Next Pattern Is Being Synthesised'
                      : macroSynthesis.title
                    }
                  </h4>
                </div>
              </div>
              {hasAccess && macroSynthesis.ready && synthesisState === 'ready' && (
                <div className="text-[#c9ccbb]/80 group-hover:text-[#b5a642] transition-colors ml-4 shrink-0">
                  {isSynthesisExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              )}
            </div>

            {synthesisState === 'recalibrating' ? (
              <div className="mt-4 pt-4 border-t border-[#b5a642]/10 w-full relative z-10">
                <p className="text-sm text-[#c9ccbb]/80 leading-relaxed max-w-2xl mb-4">
                  Your next synthesis will be ready once {logsUntilReady} more {logsUntilReady === 1 ? 'day' : 'days'} of logs have been recorded.
                </p>
                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed max-w-2xl italic">
                  Each new cycle reads your environment with fresh context. Continue logging consistently.
                </p>
                <div className="w-full max-w-md h-1 bg-[#000]/50 rounded-full mt-5 overflow-hidden">
                  <div className="h-full bg-[#b5a642]/60 transition-all duration-1000" style={{ width: `${(logsSinceAck / 14) * 100}%` }} />
                </div>
              </div>
            ) : synthesisState === 'building' ? (
              <div className="mt-4 pt-4 border-t border-[#c9ccbb]/10 w-full relative z-10">
                <p className="text-sm text-[#c9ccbb]/80 leading-relaxed max-w-2xl">{macroSynthesis.paragraphs[0]}</p>
                <div className="w-full max-w-md h-1 bg-[#000]/50 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-[#b5a642] transition-all duration-1000" style={{ width: `${(chartLogs.length / 14) * 100}%` }} />
                </div>
              </div>
            ) : hasAccess ? (
              <AnimatePresence>
                {isSynthesisExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}
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
                  14 days of data collected. Your home's synthesis is ready. Unlock now to see what that means for you.
                </p>
                <Link href="/upgrade" className="shrink-0 w-full md:w-auto">
                  <button className="w-full md:w-auto px-8 py-3 bg-[#b5a642] text-[#1b270e] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#b5a642]/60 transition-all shadow-lg shadow-[#b5a642]/20">
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
                <div className="flex items-center gap-2 text-[#b5a642]/80 text-xs font-bold uppercase tracking-widest mb-1">
                  <TrendingUp size={14} /> Your Daily Pattern
                </div>
                <h3 className="text-xl font-serif text-[#c9ccbb]">Mood, Tension & Focus Over Time</h3>
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

      {/* MODALS */}
      <AnimatePresence>
        {isManualOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000]/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto hide-scrollbar bg-[#1b270e] border border-[#b5a642]/30 rounded-3xl shadow-2xl relative p-8 md:p-12"
            >
              <button
                onClick={() => setIsManualOpen(false)}
                className="absolute top-6 right-6 text-[#c9ccbb]/50 hover:text-[#b5a642] z-10 transition-colors bg-[#000]/20 p-2 rounded-full"
              >
                <X size={20} />
              </button>
              <h2 className="text-3xl font-serif text-[#c9ccbb] mb-8 border-b border-[#c9ccbb]/10 pb-6">Why We Log</h2>
              <div className="space-y-8 text-[#c9ccbb]/80 text-sm leading-relaxed font-light">
                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">The Purpose of Logging</h3>
                  <p>This isn't about optimising yourself. It's about understanding the subtle dialogue between your nervous system and your environment. One day tells you very little. When you record consistently, patterns begin to appear, showing which parts of your home restore you and which quietly ask your body to compensate.</p>
                </section>
                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">How Your Body Woke Up (Morning)</h3>
                  <p>What your body experienced during the night is reflected in the morning entry. Jaw tension, tight shoulders or frequent waking are signals, not personal shortcomings. They often point to conditions relating to light, temperature, sound, or internal states that prevented your nervous system from fully settling.</p>
                </section>
                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">How Your Day Went (Evening)</h3>
                  <p>The evening entry records how much effort your day required. A demanding day puts a real strain on the nervous system. If the environment doesn't shift to match that demand, the body continues to carry it into the night.</p>
                </section>
                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">Social Demand</h3>
                  <p>This field captures the cognitive and emotional cost of your social engagement, not the volume of it. Interactions that are evaluatively pressured or require sustained emotional labour activate the autonomic nervous system in the same way that environmental stressors do.</p>
                </section>
                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">Home Friction Score</h3>
                  <p>This score reflects how much effort your environment required from you today. Lower scores suggest your home was able to accommodate the demands placed on your body. Higher scores indicate friction — small environmental pressures that accumulate over time.</p>
                </section>
                <section>
                  <h3 className="text-lg font-serif text-[#b5a642] mb-2">The 14-Day Pattern</h3>
                  <p>After two weeks of entries, a clearer picture emerges. Patterns reveal what is coming from the environment and what may be part of normal internal cycles. Not everything you feel originates in your home. The 14-day view helps distinguish what truly does.</p>
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
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1b270e] border border-[#b5a642]/30 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <button onClick={() => setIsAcousticMeterOpen(false)} className="absolute top-4 right-4 text-[#c9ccbb]/80 hover:text-[#b5a642] z-10">✕</button>
              <NoiseSensorModal
                onClose={() => setIsAcousticMeterOpen(false)}
                onSave={(db) => {
                  if (activeMeterTarget === 'daytimeDb') setDaytimeDb(db.toString())
                  if (activeMeterTarget === 'bedtimeDb') {
                    setBedtimeDb(db.toString())
                    setNighttimeDb(db.toString())
                  }
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
