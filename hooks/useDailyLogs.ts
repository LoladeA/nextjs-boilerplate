import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// 1. We define exactly what a Daily Log looks like to enforce strict TypeScript safety.
export interface DailyLogState {
  morningMood: number | null;
  morningTags: string[];
  morningNote: string;
  morningLux: string;
  daytimeDb: string;
  tensionScore: number;
  wakeScore: number;
  eveningMood: number | null;
  eveningTags: string[];
  eveningNote: string;
  eveningLux: string;
  nighttimeDb: string;
  focusScore: number;
}

const initialState: DailyLogState = {
  morningMood: null, morningTags: [], morningNote: '',
  morningLux: '', daytimeDb: '', tensionScore: 0, wakeScore: 0,
  eveningMood: null, eveningTags: [], eveningNote: '',
  eveningLux: '', nighttimeDb: '', focusScore: 0
}

export function useDailyLogs() {
  const supabase = createClientComponentClient()
  
  // 2. We group 16 separate UI states into ONE single object. Massive performance win.
  const [formData, setFormData] = useState<DailyLogState>(initialState)
  
  // 3. System States
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [showAccuracyWarning, setShowAccuracyWarning] = useState(false)
  const [bsfiData, setBsfiData] = useState<{ total_score: number, dominant_domain: string, is_internal_driver: boolean } | null>(null)
  const [chartLogs, setChartLogs] = useState<any[]>([])
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    checkAccess()
    fetchTodayLog()
    fetchHistory()
  }, [])

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    // For V1, checking against your admin email. 
    // In the future, this checks their Stripe/Subscription status.
    if (user?.email === 'christchilde@gmail.com') {
      setHasAccess(true)
    }
  }

  // A helper function to update any single field in our form cleanly
  const updateField = <K extends keyof DailyLogState>(field: K, value: DailyLogState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleTag = (tab: 'morning' | 'evening', id: string) => {
    if (tab === 'morning') {
        updateField('morningTags', formData.morningTags.includes(id) 
            ? formData.morningTags.filter(x => x !== id) 
            : [...formData.morningTags, id])
    } else {
        updateField('eveningTags', formData.eveningTags.includes(id) 
            ? formData.eveningTags.filter(x => x !== id) 
            : [...formData.eveningTags, id])
    }
  }

  const fetchTodayLog = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const todayStr = new Date().toLocaleDateString('en-CA') 
    const startOfToday = new Date().setHours(0, 0, 0, 0)
    const endOfToday = new Date().setHours(23, 59, 59, 999)

    const { data: logData } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayStr)
      .single()
      
    const { data: existingBsfi } = await supabase
      .from('bsfi_results')
      .select('*')
      .eq('user_id', user.id)
      .order('calculated_for_date', { ascending: false })
      .limit(1)
      .maybeSingle() 
      
    if (existingBsfi) {
      setBsfiData({
        total_score: existingBsfi.total_score,
        dominant_domain: existingBsfi.dominant_domain,
        is_internal_driver: existingBsfi.domain_scores?.is_internal_driver || false
      })
    }

    const { data: scanData } = await supabase
      .from('meter_scans')
      .select('metric_type, value, created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(startOfToday).toISOString())
      .lte('created_at', new Date(endOfToday).toISOString())

    let autoMorningLux = '', autoEveningLux = '', autoDaytimeDb = '', autoNighttimeDb = ''

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
      setFormData({
        morningMood: logData.mood_score,
        morningTags: logData.tags || [],
        morningNote: logData.note || '',
        morningLux: logData.morning_lux !== null ? logData.morning_lux.toString() : autoMorningLux,
        eveningLux: logData.evening_lux !== null ? logData.evening_lux.toString() : autoEveningLux,
        daytimeDb: logData.daytime_db !== null ? logData.daytime_db.toString() : autoDaytimeDb,
        nighttimeDb: logData.nighttime_db !== null ? logData.nighttime_db.toString() : autoNighttimeDb,
        focusScore: logData.focus_hours !== null ? logData.focus_hours : 0,
        tensionScore: logData.morning_tension !== null ? logData.morning_tension : 0,
        wakeScore: logData.sleep_wakes !== null ? logData.sleep_wakes : 0,
        eveningMood: logData.evening_mood_score,
        eveningTags: logData.evening_tags || [],
        eveningNote: logData.evening_note || ''
      })
    } else {
      updateField('morningLux', autoMorningLux)
      updateField('eveningLux', autoEveningLux)
      updateField('daytimeDb', autoDaytimeDb)
      updateField('nighttimeDb', autoNighttimeDb)
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

  const handleSave = async (activeTab: 'morning' | 'evening', isForced = false) => {
    const criticalFields = activeTab === 'morning' 
      ? [ { value: formData.morningLux, label: 'Morning Light' }, { value: formData.daytimeDb, label: 'Daytime Noise' } ]
      : [ { value: formData.eveningLux, label: 'Evening Light' }, { value: formData.nighttimeDb, label: 'Nighttime Noise' } ];

    const missing = criticalFields.filter(f => f.value === null || f.value === undefined || String(f.value).trim() === '');

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
            mood_score: formData.morningMood,
            tags: formData.morningTags,
            note: formData.morningNote,
            morning_lux: formData.morningLux ? parseInt(formData.morningLux) : null,
            evening_lux: formData.eveningLux ? parseInt(formData.eveningLux) : null,
            daytime_db: formData.daytimeDb ? parseInt(formData.daytimeDb) : null,
            nighttime_db: formData.nighttimeDb ? parseInt(formData.nighttimeDb) : null,
            focus_hours: formData.focusScore,
            morning_tension: formData.tensionScore,
            sleep_wakes: formData.wakeScore,
            evening_mood_score: formData.eveningMood,
            evening_tags: formData.eveningTags,
            evening_note: formData.eveningNote
        }

        const { error } = await supabase.from('daily_logs').upsert(payload, { onConflict: 'user_id, date' })
        if (error) throw error

        setChartLogs(prev => {
            const newLogs = [...prev];
            if (newLogs.length > 0) {
                newLogs[newLogs.length - 1] = {
                    ...newLogs[newLogs.length - 1],
                    focus: formData.focusScore,
                    tension: formData.tensionScore,
                    wakes: formData.wakeScore
                };
            }
            return newLogs;
        });

        setStatus('success')
        setTimeout(() => setStatus('idle'), 2000)
        setTimeout(() => { fetchHistory() }, 500)

        try {
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
        } catch (engineError) {
            console.error("BSFI calculation pending or failed, fallback engaged.")
        }

    } catch (err: any) {
        console.error("Save Error:", err)
        setStatus('error')
        setErrorMessage(err.message || "Failed to save")
    }
  }

  // 4. Expose exactly what the UI needs, and nothing more.
  return {
    formData,
    updateField,
    toggleTag,
    status,
    errorMessage,
    showAccuracyWarning,
    setShowAccuracyWarning,
    bsfiData,
    chartLogs,
    hasAccess,
    handleSave
  }
}
