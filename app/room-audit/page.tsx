'use client'
import Sidebar from '../components/Sidebar'
import { useState, useRef, useEffect } from 'react'
import {
  Camera, Loader2, ScanEye, CheckCircle, Lock, Brain,
  Lightbulb, Zap, Info, Activity, AlertCircle, HelpCircle,
  X, Volume2
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import RoomAuditExplainer from '@/app/components/RoomAuditExplainer'

// =============================================================================
// DOMAIN METADATA
// =============================================================================
const DOMAIN_META: Record<string, { label: string; description: string; color: string }> = {
  'Amygdala Regulation': {
    label: 'Amygdala Regulation',
    description: 'Threat detection, contrast, and sensory unpredictability.',
    color: '#e8a87c'
  },
  'Prefrontal Buffer': {
    label: 'Prefrontal Buffer',
    description: 'Competing stimuli and executive attention demand.',
    color: '#b5a642'
  },
  'Vagal Coherence': {
    label: 'Vagal Coherence',
    description: 'Biophilic cues, tactile anchors, and parasympathetic activation.',
    color: '#7ec89a'
  },
  'Circadian Alignment': {
    label: 'Circadian Alignment',
    description: 'Spectral quality, luminance, and melatonin support.',
    color: '#7eb5e8'
  },
  'Acoustic Safety': {
    label: 'Acoustic Safety',
    description: 'Surface composition and unpredictable noise buffering.',
    color: '#c9ccbb'
  },
  'Neuroendocrine Balance': {
    label: 'Neuroendocrine Balance',
    description: 'Composite cortisol and sustained stress load.',
    color: '#b57ec8'
  }
}

function getScoreBand(score: number): 'high' | 'mid' | 'low' {
  if (score >= 65) return 'high'
  if (score >= 40) return 'mid'
  return 'low'
}

const BAND_COLORS = {
  high: 'from-[#7ec89a]/80 to-[#7ec89a]',
  mid:  'from-[#b5a642]/80 to-[#b5a642]',
  low:  'from-[#e87c7c]/80 to-[#e87c7c]'
}

const rooms = ['Living Room', 'Bedroom', 'Home Office', 'Kitchen', 'Entryway']
const orchestrationStages = [
  "Mapping spatial geometry and object density...",
  "Extracting biophilic and tactile surface markers...",
  "Calculating neural domain load across six systems...",
  "Translating findings into neurodesign directives..."
]

export default function RoomAudit() {
  const supabase = createClientComponentClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ---------------------------------------------------------------------------
  // ACCESS CONTROL
  // ---------------------------------------------------------------------------
  const [loading, setLoading]         = useState(true)
  const [isBlueprint, setIsBlueprint] = useState(false)

  // Scan state
  const [selectedRoom, setSelectedRoom]       = useState('Living Room')
  const [previewUrl, setPreviewUrl]           = useState<string | null>(null)
  const [file, setFile]                       = useState<File | null>(null)
  const [manualLux, setManualLux]             = useState<string>('')
  const [acousticContext, setAcousticContext] = useState<'hard' | 'mixed' | 'soft' | ''>('')

  // Flow state
  const [status, setStatus]           = useState<'idle' | 'uploading' | 'processing' | 'success'>('idle')
  const [result, setResult]           = useState<any>(null)
  const [errorMsg, setErrorMsg]       = useState<string | null>(null)
  const [loadingText, setLoadingText] = useState(orchestrationStages[0])

  // Modal state
  const [isManualOpen, setIsManualOpen]     = useState(false)  // detailed technical manual
  const [showExplainer, setShowExplainer]   = useState(false)  // orientation explainer (? icon)

  // ---------------------------------------------------------------------------
  // ACCESS VALIDATION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const validateAccess = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) { setIsBlueprint(false); setLoading(false); return }

        if (user.email === 'christchilde@gmail.com') { setIsBlueprint(true); setLoading(false); return }

        const res = await fetch('/api/subscription-status')
        if (res.ok) {
          const data = await res.json()
          const blueprintAccess = data.tier === 'blueprint'
          setIsBlueprint(blueprintAccess)
          if (!blueprintAccess) setShowExplainer(true)
        }
      } catch {
        setIsBlueprint(false)
        setShowExplainer(true)
      } finally {
        setLoading(false)
      }
    }
    validateAccess()
  }, [supabase])

  // Auto-open explainer for non-Blueprint users — must live before any conditional returns
  useEffect(() => {
    if (!loading && !isBlueprint) setShowExplainer(true)
  }, [loading, isBlueprint])

  // ---------------------------------------------------------------------------
  // FILE SELECTION
  // ---------------------------------------------------------------------------
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isBlueprint) return
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setResult(null)
    setStatus('idle')
    setErrorMsg(null)
  }

  // ---------------------------------------------------------------------------
  // ANALYSIS PIPELINE
  // ---------------------------------------------------------------------------
  const handleRunAnalysis = async () => {
    if (!file || !isBlueprint) return
    setStatus('uploading')
    setErrorMsg(null)
    setLoadingText("Uploading room image securely...")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Session expired. Please log in again.')

      const fileName = `${user.id}/${Date.now()}_${selectedRoom.replace(/\s+/g, '_')}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('room_audits')
        .upload(fileName, file)
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

      const { data: { publicUrl } } = supabase.storage
        .from('room_audits')
        .getPublicUrl(fileName)

      setStatus('processing')
      let stageIndex = 0
      setLoadingText(orchestrationStages[0])
      const stageInterval = setInterval(() => {
        stageIndex = Math.min(stageIndex + 1, orchestrationStages.length - 1)
        setLoadingText(orchestrationStages[stageIndex])
      }, 3500)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName:        selectedRoom,
          imageUrl:        publicUrl,
          measuredLux:     manualLux ? parseInt(manualLux) : null,
          acousticContext: acousticContext || null
        })
      })

      clearInterval(stageInterval)
      const analysis = await response.json()
      if (!analysis.success) throw new Error(analysis.error || 'Analysis failed.')
      setResult(analysis.data)
      setStatus('success')
    } catch (err: any) {
      console.error('[RoomAudit] Error:', err.message)
      setErrorMsg(err.message)
      setStatus('idle')
    }
  }

  // ---------------------------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------------------------
  if (loading) return (
    <div className="min-h-screen bg-[#1b270e] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#b5a642]" size={32} />
    </div>
  )

  const isAnalysing = status === 'uploading' || status === 'processing'

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------
  return (
    <>
    {/* PAGE — blurred and non-interactive when explainer is open */}
    <div
      className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e] transition-all duration-500"
      style={{
        filter:        showExplainer ? 'blur(4px) brightness(0.55)' : 'none',
        transform:     showExplainer ? 'scale(1.01)' : 'scale(1)',
        pointerEvents: showExplainer ? 'none' : 'auto',
      }}
    >
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        <div className="max-w-4xl mx-auto">

          {/* PAGE HEADER */}
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2 flex items-center gap-4">
                Environmental Audit
                {/* ? icon — opens RoomAuditExplainer orientation modal */}
                <button
                  onClick={() => setShowExplainer(true)}
                  className="text-[#b5a642]/60 hover:text-[#b5a642] transition-colors p-2 rounded-full hover:bg-[#b5a642]/10"
                >
                  <HelpCircle size={22} />
                </button>
              </h1>
              <p className="text-[#c9ccbb]/80 text-sm">NeuroDesign Analysis Engine: Six Neural System Evaluation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* UPLOAD & INPUT PANEL */}
            <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 bg-[#000]/20 flex flex-col gap-6">
              <div className="p-4 bg-[#b5a642]/10 border border-[#b5a642]/20 rounded-xl flex items-start gap-3">
                <Info size={15} className="text-[#b5a642] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest block mb-1">Audit Protocol</span>
                  <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                    2 scans per month, allocated to <strong>1 Priority Room</strong> for longitudinal baseline accuracy.
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="inline-flex bg-[#000]/40 rounded-full p-1 border border-[#c9ccbb]/10 flex-wrap justify-center gap-1">
                  {rooms.map(room => (
                    <button
                      key={room}
                      onClick={() => setSelectedRoom(room)}
                      disabled={isAnalysing}
                      className={`px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                        selectedRoom === room
                          ? 'bg-[#b5a642] text-[#1b270e]'
                          : 'text-[#c9ccbb]/80 hover:text-[#c9ccbb]'
                      }`}
                    >
                      {room}
                    </button>
                  ))}
                </div>
              </div>

              <div
                onClick={() => !isAnalysing && fileInputRef.current?.click()}
                className={`w-full min-h-[220px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative transition-all
                  ${isAnalysing ? 'border-[#b5a642]/30 opacity-50 cursor-not-allowed'
                    : previewUrl ? 'border-[#b5a642] cursor-pointer'
                    : 'border-[#c9ccbb]/20 hover:border-[#b5a642]/50 cursor-pointer'}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                  disabled={isAnalysing}
                />
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 rounded-2xl"
                    alt="Room preview"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[#c9ccbb]/80">
                    <Camera size={28} />
                    <span className="text-xs font-bold uppercase tracking-widest">Tap to Upload Room Photo</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-[#c9ccbb]/80 text-[10px] font-bold uppercase tracking-widest mb-2">
                    <Zap size={11} className="text-[#b5a642]" /> Light Level (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={manualLux}
                      onChange={e => setManualLux(e.target.value)}
                      placeholder="e.g. 350"
                      disabled={isAnalysing}
                      className="w-full bg-[#1b270e] border border-[#c9ccbb]/20 rounded-xl px-4 py-3 text-[#c9ccbb] text-sm focus:outline-none focus:border-[#b5a642] transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c9ccbb]/30 text-[10px] font-bold">LUX</span>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[#c9ccbb]/80 text-[10px] font-bold uppercase tracking-widest mb-2">
                    <Volume2 size={11} className="text-[#b5a642]" /> Surface Type (Optional)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['hard', 'mixed', 'soft'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        disabled={isAnalysing}
                        onClick={() => setAcousticContext(acousticContext === type ? '' : type)}
                        className={`py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all capitalize ${
                          acousticContext === type
                            ? 'border-[#b5a642]/60 bg-[#b5a642]/10 text-[#b5a642]'
                            : 'border-[#c9ccbb]/10 text-[#c9ccbb]/80 hover:border-[#c9ccbb]/25'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <p className="text-[#c9ccbb]/80 text-[9px] mt-1.5 leading-relaxed">
                    Dominant surface material. Helps calibrate acoustic safety when surfaces are not visible.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <button
                  disabled={!file || isAnalysing}
                  onClick={handleRunAnalysis}
                  className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                    !file
                      ? 'bg-[#c9ccbb]/10 text-[#c9ccbb]/20 cursor-not-allowed'
                      : isAnalysing
                      ? 'bg-[#b5a642]/60 text-[#1b270e] cursor-wait'
                      : 'bg-[#b5a642] text-[#1b270e] hover:bg-[#d4c55e] shadow-[#b5a642]/20'
                  }`}
                >
                  {status === 'uploading' ? <><Loader2 size={15} className="animate-spin" /> Uploading</>
                  : status === 'processing' ? <><Loader2 size={15} className="animate-spin" /> Analysing</>
                  : <><Brain size={15} /> Run Neural Audit</>}
                </button>
                {errorMsg && (
                  <div className="w-full text-red-400 text-xs bg-red-900/20 px-4 py-3 rounded-xl border border-red-900/40 text-center leading-relaxed">
                    {errorMsg}
                  </div>
                )}
              </div>
            </div>

            {/* RESULTS PANEL */}
            <div className="relative min-h-[560px]">
              {isAnalysing && (
                <div className="h-full border-2 border-dashed border-[#b5a642]/30 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-[#b5a642]/5">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 border-4 border-[#b5a642]/20 rounded-full animate-ping" />
                    <div className="w-16 h-16 bg-[#b5a642]/20 rounded-full flex items-center justify-center border border-[#b5a642]/40 relative z-10">
                      <ScanEye size={24} className="text-[#b5a642]" />
                    </div>
                  </div>
                  <p className="text-[#b5a642] text-xs uppercase font-bold tracking-widest animate-pulse max-w-[240px] leading-relaxed">
                    {loadingText}
                  </p>
                </div>
              )}

              {status === 'success' && result && (
                <div className="glass-panel p-8 rounded-3xl border border-[#b5a642]/30 bg-[#1b270e] shadow-2xl shadow-[#b5a642]/5 space-y-8">
                  <div className="text-center p-8 bg-gradient-to-b from-[#b5a642]/10 to-transparent rounded-2xl border border-[#b5a642]/15 relative overflow-hidden">
                    <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest block mb-2">
                      NeuroDesign Alignment Score
                    </span>
                    <div className="text-7xl font-serif text-[#c9ccbb] drop-shadow-md">
                      {result.alignment_index}
                      <span className="text-2xl text-[#c9ccbb]/80">/100</span>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#b5a642]/8 rounded-full blur-3xl pointer-events-none" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-[#000]/30 rounded-xl border border-[#c9ccbb]/8 text-center">
                      <span className="text-[#c9ccbb]/80 text-[9px] font-bold uppercase tracking-widest block mb-1">Visual Entropy</span>
                      <span className="text-2xl font-serif text-[#c9ccbb]">{result.entropy_score}</span>
                      <span className="text-[#c9ccbb]/80 text-[10px]"> /10</span>
                    </div>
                    <div className="p-4 bg-[#000]/30 rounded-xl border border-[#c9ccbb]/8 text-center">
                      <span className="text-[#c9ccbb]/80 text-[9px] font-bold uppercase tracking-widest block mb-1">Colour Temp</span>
                      <span className="text-lg font-serif text-[#c9ccbb]">{result.lighting_kelvin}K</span>
                    </div>
                    <div className="p-4 bg-[#000]/30 rounded-xl border border-[#c9ccbb]/8 text-center">
                      <span className="text-[#c9ccbb]/80 text-[9px] font-bold uppercase tracking-widest block mb-1">Biophilic</span>
                      <span className="text-lg font-serif text-[#c9ccbb]">{result.biophilic_rating}</span>
                    </div>
                  </div>

                  <div className="p-6 bg-[#000]/20 rounded-2xl border border-[#c9ccbb]/5 space-y-5">
                    <h4 className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Activity size={13} /> Six Neural System Scores
                    </h4>
                    {Object.entries(result.domains).map(([key, val]: [string, any]) => {
                      const meta = DOMAIN_META[key]
                      const band = getScoreBand(val)
                      return (
                        <div key={key}>
                          <div className="flex justify-between items-end mb-1.5">
                            <div>
                              <span className="text-[#c9ccbb]/90 text-xs font-bold block">{meta?.label || key}</span>
                              <span className="text-[#c9ccbb]/70 text-[10px]">{meta?.description}</span>
                            </div>
                            <span className="text-[#b5a642] text-xs font-bold ml-4 flex-shrink-0">{val}/100</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#000]/30 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${BAND_COLORS[band]} rounded-full transition-all duration-1000 ease-out`}
                              style={{ width: `${val}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {result.triggers?.length > 0 && (
                    <div>
                      <h4 className="text-red-400/90 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertCircle size={13} /> Identified Friction Points
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.triggers.map((trigger: string, i: number) => (
                          <span key={i} className="px-3 py-2 bg-red-950/30 border border-red-900/30 text-red-300/90 text-xs rounded-xl leading-relaxed">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Brain size={13} /> Neurodesign Interpretation
                    </h4>
                    <div className="p-5 bg-[#b5a642]/5 rounded-xl border border-[#b5a642]/10">
                      <p className="text-[#c9ccbb] text-sm leading-relaxed italic">"{result.insight}"</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Lightbulb size={13} /> Recommendations
                    </h4>
                    <ul className="space-y-3">
                      {result.prescriptions?.map((item: string, i: number) => (
                        <li key={i} className="flex gap-4 text-sm text-[#c9ccbb]/90 p-4 bg-[#000]/30 rounded-xl border border-[#c9ccbb]/5">
                          <CheckCircle size={16} className="text-[#b5a642] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* DETAILED MANUAL LINK — sits naturally after results */}
                  <button
                    onClick={() => setIsManualOpen(true)}
                    className="w-full pt-4 border-t border-[#c9ccbb]/8 text-[#c9ccbb]/40 hover:text-[#b5a642] text-[10px] font-bold uppercase tracking-widest transition-colors text-center"
                  >
                    How the analysis engine works →
                  </button>
                </div>
              )}

              {status === 'idle' && (
                <div className="h-full border-2 border-dashed border-[#c9ccbb]/5 rounded-3xl flex flex-col items-center justify-center p-12 text-center opacity-50 bg-[#000]/10">
                  <ScanEye size={40} className="text-[#c9ccbb]/20 mb-4" />
                  <p className="text-[#c9ccbb]/80 text-sm uppercase tracking-widest">Awaiting Scan Input</p>
                  <p className="text-[#c9ccbb]/80 text-xs mt-2">Upload a photo of your priority room to begin.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>{/* end page blur div */}

      {/* -------------------------------------------------------------------- */}
      {/* MODALS — outside blur div so pointer-events always work              */}
      {/* -------------------------------------------------------------------- */}
      <AnimatePresence>

        {/* ORIENTATION EXPLAINER
            For Blueprint users: triggered by ? icon or results footer link.
            For non-Blueprint users: auto-opens on mount with page blurred behind it.
            onClose for non-Blueprint does nothing (they cannot dismiss without upgrading)
            — the modal is their entry point, not an interruptive overlay. */}
        {showExplainer && (
          <>
            {/* Scrim — deep green tint between blurred page and modal */}
            <div className="fixed inset-0 z-[99] bg-[#1b270e]/30" />
            <RoomAuditExplainer onClose={() => { if (isBlueprint) setShowExplainer(false) }} />
          </>
        )}

        {/* DETAILED TECHNICAL MANUAL — triggered by results footer link */}
        {isManualOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000]/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#1b270e] border border-[#b5a642]/30 rounded-3xl shadow-2xl relative p-8 md:p-12"
            >
              <button
                onClick={() => setIsManualOpen(false)}
                className="absolute top-6 right-6 text-[#c9ccbb]/80 hover:text-[#b5a642] transition-colors bg-[#000]/20 p-2 rounded-full z-10"
              >
                <X size={18} />
              </button>
              <h2 className="text-3xl font-serif text-[#c9ccbb] mb-2">Room Audit Manual</h2>
              <p className="text-[#c9ccbb]/80 text-xs uppercase tracking-widest mb-8 border-b border-[#c9ccbb]/10 pb-6">
                NeuroDesign Analysis Engine
              </p>
              <div className="space-y-8 text-[#c9ccbb]/80 text-sm leading-relaxed">
                <section>
                  <h3 className="text-base font-serif text-[#b5a642] mb-2">What the Engine Measures</h3>
                  <p>The NeuroDesign Analysis Engine does not evaluate your room for aesthetics or style. It reads the spatial architecture to determine how much biological work your nervous system must perform to exist within it, and translates that into six measurable neural system loads.</p>
                </section>
                <section>
                  <h3 className="text-base font-serif text-[#b5a642] mb-3">The Six Neural Systems</h3>
                  <div className="space-y-4">
                    {Object.values(DOMAIN_META).map((meta, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: meta.color }} />
                        <div>
                          <span className="text-[#c9ccbb] font-bold text-xs block mb-0.5">{meta.label}</span>
                          <span className="text-[#c9ccbb]/80 text-xs">{meta.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 className="text-base font-serif text-[#b5a642] mb-2">NeuroDesign Alignment Score</h3>
                  <p>A holistic 0–100 rating of how well the room supports nervous system regulation across all six domains. Scores are weighted by room function — circadian alignment matters more in a bedroom; prefrontal buffering matters more in an office. A score above 70 indicates a regulating environment. Below 45 signals sustained depletion risk.</p>
                </section>
                <section>
                  <h3 className="text-base font-serif text-[#b5a642] mb-2">Light Level Input (Lux)</h3>
                  <p>Measured with a light meter or phone sensor app. Improves the accuracy of your Circadian Alignment score by replacing the engine's estimated Kelvin with calibrated luminance data.</p>
                </section>
                <section>
                  <h3 className="text-base font-serif text-[#b5a642] mb-2">Surface Type Input</h3>
                  <p>Select the dominant surface material in the room. Hard surfaces increase reverberation and unpredictable noise peaks, activating the amygdala. Soft surfaces absorb and buffer acoustic load. Use this when the image does not clearly show floor and wall materials.</p>
                </section>
                <section>
                  <h3 className="text-base font-serif text-[#b5a642] mb-2">The Science</h3>
                  <p>Carefully designed biophilic exposures produce measurable improvements in attention and memory tasks. The research (Attention Restoration Theory) reports approximately 20% improvements in directed attention after nature exposure. The engine weights Vagal Coherence to reflect this. Low biophilic coherence in your report is a clinically significant finding, not an aesthetic preference.</p>
                </section>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </>
  )
}
