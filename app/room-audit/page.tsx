'use client'
import Sidebar from '../components/Sidebar'
import { useState, useRef, useEffect } from 'react'
import {
  Camera, Loader2, ScanEye, Brain,
  Lightbulb, Zap, Info, AlertCircle, HelpCircle,
  X, Volume2, ChevronDown, ExternalLink, Sparkles,
  Eye, ArrowRight
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import RoomAuditExplainer from '@/app/components/RoomAuditExplainer'

// =============================================================================
// DOMAIN METADATA — accordion detail layer
// =============================================================================
const DOMAIN_META: Record<string, { label: string; description: string; color: string }> = {
  'Amygdala Regulation': {
    label:       'Amygdala Regulation',
    description: 'How the visual environment — contrast, colour load, unpredictability — affects your threat-detection system.',
    color:       '#e8a87c'
  },
  'Prefrontal Buffer': {
    label:       'Prefrontal Buffer',
    description: 'How much competing visual information is draining your ability to think clearly and stay focused.',
    color:       '#b5a642'
  },
  'Vagal Coherence': {
    label:       'Vagal Coherence',
    description: 'How well the space supports rest and restoration — biophilic cues, tactile anchors, spatial rhythm.',
    color:       '#7ec89a'
  },
  'Circadian Alignment': {
    label:       'Circadian Alignment',
    description: 'How well the light quality supports your natural energy and sleep cycle.',
    color:       '#7eb5e8'
  },
  'Acoustic Safety': {
    label:       'Acoustic Safety',
    description: 'How much unpredictable sound the space exposes your nervous system to.',
    color:       '#c9ccbb'
  },
  'Neuroendocrine Balance': {
    label:       'Neuroendocrine Balance',
    description: 'The combined ongoing stress load this environment places on your system.',
    color:       '#b57ec8'
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

const BAND_LABELS = {
  high: 'Working well',
  mid:  'Some load present',
  low:  'Needs attention'
}

// =============================================================================
// ACCORDION COMPONENT
// =============================================================================
function Accordion({
  label,
  children,
  icon
}: {
  label:    string
  children: React.ReactNode
  icon?:    React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#c9ccbb]/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#c9ccbb]/5 transition-colors"
      >
        <span className="flex items-center gap-2 text-[#c9ccbb]/50 text-[10px] font-bold uppercase tracking-widest">
          {icon}
          {label}
        </span>
        <ChevronDown
          size={14}
          className={`text-[#c9ccbb]/30 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-4 pb-4 pt-1 border-t border-[#c9ccbb]/8">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// PRESCRIPTION CARD
// Structured prescription with rationale + FFE item accordion
// =============================================================================
function PrescriptionCard({
  prescription,
  index
}: {
  prescription: any
  index:        number
}) {
  const [showFFE, setShowFFE]       = useState(false)
  const [showScience, setShowScience] = useState(false)

  const categoryLabel = prescription.category === 'structural' ? 'Structural change' : 'Quick win'
  const categoryColor = prescription.category === 'structural'
    ? 'text-[#7eb5e8] border-[#7eb5e8]/20 bg-[#7eb5e8]/5'
    : 'text-[#7ec89a] border-[#7ec89a]/20 bg-[#7ec89a]/5'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-[#000]/20 rounded-2xl border border-[#c9ccbb]/8 overflow-hidden"
    >
      {/* PRESCRIPTION HEADER */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#b5a642]/15 border border-[#b5a642]/30 flex items-center justify-center shrink-0">
              <span className="text-[#b5a642] text-[10px] font-bold">{index + 1}</span>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${categoryColor}`}>
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* PRESCRIPTION TEXT — plain language, always visible */}
        <p className="text-[#c9ccbb] text-sm leading-relaxed mb-3">
          {prescription.text}
        </p>

        {/* RATIONALE PRIMARY — why this for this profile, always visible */}
        {prescription.rationale_primary && (
          <p className="text-[#c9ccbb]/60 text-xs leading-relaxed italic border-l-2 border-[#b5a642]/30 pl-3">
            {prescription.rationale_primary}
          </p>
        )}
      </div>

      {/* ACCORDION ACTIONS */}
      <div className="border-t border-[#c9ccbb]/8">

        {/* FFE ITEM — Show me what this looks like */}
        {prescription.ffe_item && (
          <div className="border-b border-[#c9ccbb]/8">
            <button
              onClick={() => setShowFFE(!showFFE)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#b5a642]/5 transition-colors"
            >
              <span className="flex items-center gap-2 text-[#b5a642]/70 text-[10px] font-bold uppercase tracking-widest">
                <Sparkles size={11} className="text-[#b5a642]" />
                Show me what this looks like
              </span>
              <ChevronDown
                size={13}
                className={`text-[#b5a642]/40 transition-transform duration-300 ${showFFE ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {showFFE && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="px-5 pb-5 pt-2 space-y-3">
                    {/* Item name */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[#c9ccbb] text-sm font-bold mb-1">
                          {prescription.ffe_item.name}
                        </p>
                        <p className="text-[#c9ccbb]/70 text-xs leading-relaxed">
                          {prescription.ffe_item.description}
                        </p>
                      </div>
                    </div>

                    {/* Spec notes — practical guidance */}
                    {prescription.ffe_item.spec_notes && (
                      <div className="p-3 bg-[#b5a642]/5 rounded-xl border border-[#b5a642]/15">
                        <p className="text-[#b5a642]/80 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                          What to look for
                        </p>
                        <p className="text-[#c9ccbb]/70 text-xs leading-relaxed">
                          {prescription.ffe_item.spec_notes}
                        </p>
                      </div>
                    )}

                    {/* Contraindication note if present */}
                    {prescription.ffe_item.contraindicated_for && (
                      <div className="p-3 bg-[#e87c7c]/5 rounded-xl border border-[#e87c7c]/15">
                        <p className="text-[#e87c7c]/80 text-[10px] font-bold uppercase tracking-widest mb-1">
                          Note
                        </p>
                        <p className="text-[#c9ccbb]/60 text-xs leading-relaxed">
                          {prescription.ffe_item.contraindicated_for}
                        </p>
                      </div>
                    )}

                    {/* Buy link */}
                    {prescription.ffe_item.source_url &&
                     prescription.ffe_item.source_url !== 'https://your-supplier-link.com' && (
                      <Link
                        href={prescription.ffe_item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-4 py-3 bg-[#b5a642]/10 hover:bg-[#b5a642]/20 border border-[#b5a642]/25 rounded-xl transition-all group"
                      >
                        <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest">
                          Find this item
                        </span>
                        <ExternalLink size={13} className="text-[#b5a642] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* RATIONALE ACCORDION — the science behind it */}
        {prescription.rationale_accordion && (
          <button
            onClick={() => setShowScience(!showScience)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#c9ccbb]/5 transition-colors"
          >
            <span className="flex items-center gap-2 text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest">
              <Eye size={11} />
              Why this works
            </span>
            <ChevronDown
              size={13}
              className={`text-[#c9ccbb]/30 transition-transform duration-300 ${showScience ? 'rotate-180' : ''}`}
            />
          </button>
        )}
        <AnimatePresence>
          {showScience && prescription.rationale_accordion && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="px-5 pb-4 pt-1 border-t border-[#c9ccbb]/8">
                <p className="text-[#c9ccbb]/50 text-xs leading-relaxed">
                  {prescription.rationale_accordion}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// =============================================================================
// DOMAIN SCORE BAR — used inside accordion detail layer
// =============================================================================
function DomainScoreBar({
  domainKey,
  score,
  costLabel
}: {
  domainKey: string
  score:     number
  costLabel?: string
}) {
  const meta = DOMAIN_META[domainKey]
  const band = getScoreBand(score)
  return (
    <div>
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex-1 mr-4">
          <span className="text-[#c9ccbb]/90 text-xs font-bold block">{meta?.label || domainKey}</span>
          {costLabel
            ? <span className="text-[#c9ccbb]/50 text-[10px] leading-relaxed">{costLabel}</span>
            : <span className="text-[#c9ccbb]/40 text-[10px]">{meta?.description}</span>
          }
        </div>
        <div className="text-right shrink-0">
          <span className="text-[#b5a642] text-xs font-bold">{score}/100</span>
          <span className="text-[#c9ccbb]/30 text-[9px] block">{BAND_LABELS[band]}</span>
        </div>
      </div>
      <div className="w-full h-1 bg-[#000]/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className={`h-full bg-gradient-to-r ${BAND_COLORS[band]} rounded-full`}
        />
      </div>
    </div>
  )
}

const rooms = ['Living Room', 'Bedroom', 'Home Office', 'Kitchen', 'Entryway']
const orchestrationStages = [
  "Reading the room — spatial geometry and object density...",
  "Identifying biophilic and tactile surface conditions...",
  "Calculating environmental load across six neural systems...",
  "Translating findings for your specific nervous system..."
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
  const [isManualOpen, setIsManualOpen]   = useState(false)
  const [showExplainer, setShowExplainer] = useState(false)

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
        method:  'POST',
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
  // RESULTS PANEL — helper to determine if prescriptions are structured objects
  // ---------------------------------------------------------------------------
  const prescriptions = result?.prescriptions || []
  const isStructured  = prescriptions.length > 0 && typeof prescriptions[0] === 'object'

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------
  return (
    <>
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div
        className="md:ml-64 min-h-screen p-6 md:p-12 transition-all duration-500"
        style={{
          filter:        showExplainer ? 'blur(4px) brightness(0.55)' : 'none',
          transform:     showExplainer ? 'scale(1.01)' : 'scale(1)',
          pointerEvents: showExplainer ? 'none' : 'auto',
        }}
      >
        <div className="max-w-4xl mx-auto">

          {/* PAGE HEADER */}
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2 flex items-center gap-4">
                Environmental Audit
                <button
                  onClick={() => setShowExplainer(true)}
                  className="text-[#b5a642]/60 hover:text-[#b5a642] transition-colors p-2 rounded-full hover:bg-[#b5a642]/10"
                >
                  <HelpCircle size={22} />
                </button>
              </h1>
              <p className="text-[#c9ccbb]/80 text-sm">NeuroDesign Analysis Engine — Six Neural System Evaluation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ================================================================
                UPLOAD & INPUT PANEL — unchanged from original
            ================================================================ */}
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

            {/* ================================================================
                RESULTS PANEL — rebuilt for Steps 1, 2, 3 response structure
            ================================================================ */}
            <div className="relative min-h-[560px]">

              {/* LOADING STATE */}
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

              {/* SUCCESS STATE */}
              {status === 'success' && result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel rounded-3xl border border-[#b5a642]/30 bg-[#1b270e] shadow-2xl shadow-[#b5a642]/5 overflow-hidden"
                >
                  <div className="p-8 space-y-7">

                    {/* --------------------------------------------------------
                        PRIMARY LAYER 1 — INTERPRETATION
                        Leads. No scores. Human language only.
                    -------------------------------------------------------- */}
                    {result.interpretation && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <p className="text-[#c9ccbb] text-base leading-relaxed">
                          {result.interpretation}
                        </p>
                      </motion.div>
                    )}

                    {/* --------------------------------------------------------
                        PRIMARY LAYER 2 — COST NARRATIVE
                        What this space costs this nervous system — plain language
                    -------------------------------------------------------- */}
                    {result.cost_narrative && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="p-4 bg-[#b5a642]/8 rounded-2xl border border-[#b5a642]/15"
                      >
                        <p className="text-[#b5a642]/90 text-sm leading-relaxed">
                          {result.cost_narrative}
                        </p>
                      </motion.div>
                    )}

                    {/* --------------------------------------------------------
                        PRIMARY LAYER 3 — TRIGGERS
                        Environmental friction points — plain language
                    -------------------------------------------------------- */}
                    {result.triggers?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h4 className="text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                          <AlertCircle size={11} /> What this space is doing
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.triggers.map((trigger: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-2 bg-[#000]/30 border border-[#c9ccbb]/10 text-[#c9ccbb]/70 text-xs rounded-xl leading-relaxed"
                            >
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* --------------------------------------------------------
                        PRIMARY LAYER 4 — PRESCRIPTIONS
                        Structured objects with rationale + FFE items
                    -------------------------------------------------------- */}
                    {prescriptions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <h4 className="text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Lightbulb size={11} /> What to change
                        </h4>
                        <div className="space-y-3">
                          {prescriptions.map((rx: any, i: number) =>
                            isStructured ? (
                              <PrescriptionCard key={i} prescription={rx} index={i} />
                            ) : (
                              // Fallback for legacy plain-string prescriptions
                              <div key={i} className="flex gap-4 text-sm text-[#c9ccbb]/90 p-4 bg-[#000]/30 rounded-xl border border-[#c9ccbb]/5">
                                <ArrowRight size={15} className="text-[#b5a642] shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{rx}</span>
                              </div>
                            )
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* --------------------------------------------------------
                        PRIMARY LAYER 5 — VISION
                        What this space becomes — leads emotionally, comes last
                    -------------------------------------------------------- */}
                    {result.vision && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-5 bg-[#000]/20 rounded-2xl border border-[#c9ccbb]/8 relative overflow-hidden"
                      >
                        <p className="text-[#b5a642]/70 text-[10px] font-bold uppercase tracking-widest mb-2">
                          What becomes possible
                        </p>
                        <p className="text-[#c9ccbb]/80 text-sm leading-relaxed italic">
                          {result.vision}
                        </p>
                        {result.projected_narrative && (
                          <p className="text-[#c9ccbb]/50 text-xs leading-relaxed mt-3 pt-3 border-t border-[#c9ccbb]/8">
                            {result.projected_narrative}
                          </p>
                        )}
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#b5a642]/5 rounded-full blur-3xl pointer-events-none" />
                      </motion.div>
                    )}

                    {/* --------------------------------------------------------
                        ACCORDION LAYER — detail for those who want it
                    -------------------------------------------------------- */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-2 pt-2 border-t border-[#c9ccbb]/8"
                    >
                      <p className="text-[#c9ccbb]/25 text-[9px] uppercase tracking-widest text-center pb-1">
                        For the detail-oriented
                      </p>

                      {/* PROFILE-WEIGHTED DOMAIN SCORES */}
                      {result.detail?.weighted_domain_scores && (
                        <Accordion label="Your environmental cost — by system">
                          <div className="space-y-4 pt-2">
                            {Object.entries(result.detail.weighted_domain_scores).map(([key, val]: [string, any]) => (
                              <DomainScoreBar
                                key={key}
                                domainKey={key}
                                score={val}
                                costLabel={result.detail.domain_cost_labels?.[key]}
                              />
                            ))}
                            {/* Score summary */}
                            <div className="pt-3 border-t border-[#c9ccbb]/8 flex justify-between items-center">
                              <div>
                                <p className="text-[#c9ccbb]/40 text-[9px] uppercase tracking-widest">Environmental Cost Score</p>
                                <p className="text-[#c9ccbb]/60 text-[10px] mt-0.5">Profile-adjusted composite</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[#b5a642] text-2xl font-serif">
                                  {result.detail.environmental_cost_score}
                                </span>
                                <span className="text-[#c9ccbb]/40 text-xs">/100</span>
                                {result.detail.improvement_delta > 0 && (
                                  <p className="text-[#7ec89a] text-[10px] mt-0.5">
                                    +{result.detail.improvement_delta} after changes
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Accordion>
                      )}

                      {/* OBJECTIVE DOMAIN SCORES */}
                      {result.detail?.objective_domain_scores && (
                        <Accordion label="Objective room scores — independent of profile">
                          <div className="space-y-4 pt-2">
                            {Object.entries(result.detail.objective_domain_scores).map(([key, val]: [string, any]) => (
                              <DomainScoreBar key={key} domainKey={key} score={val} />
                            ))}
                            <div className="pt-3 border-t border-[#c9ccbb]/8 flex justify-between items-center">
                              <div>
                                <p className="text-[#c9ccbb]/40 text-[9px] uppercase tracking-widest">Alignment Index</p>
                                <p className="text-[#c9ccbb]/50 text-[10px] mt-0.5">Room quality, independent of occupant</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[#c9ccbb]/60 text-2xl font-serif">
                                  {result.detail.objective_alignment_index}
                                </span>
                                <span className="text-[#c9ccbb]/30 text-xs">/100</span>
                              </div>
                            </div>
                          </div>
                        </Accordion>
                      )}

                      {/* OBSERVATION DETAIL */}
                      {result.detail?.observations && (
                        <Accordion label="What the engine observed">
                          <div className="space-y-2 pt-2">
                            {Object.entries(result.detail.observations)
                              .filter(([, v]) => v !== null && v !== undefined)
                              .map(([key, val]: [string, any]) => (
                                <div key={key} className="flex justify-between items-center py-1.5 border-b border-[#c9ccbb]/5 last:border-0">
                                  <span className="text-[#c9ccbb]/40 text-[10px] capitalize">
                                    {key.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-[#c9ccbb]/60 text-[10px] font-bold capitalize">
                                    {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val).replace(/_/g, ' ')}
                                  </span>
                                </div>
                              ))
                            }
                            {result.detail.confidence_note && (
                              <p className="text-[#c9ccbb]/30 text-[10px] italic pt-2">
                                {result.detail.confidence_note}
                              </p>
                            )}
                          </div>
                        </Accordion>
                      )}
                    </motion.div>

                    {/* HOW THE ENGINE WORKS LINK */}
                    <button
                      onClick={() => setIsManualOpen(true)}
                      className="w-full pt-4 border-t border-[#c9ccbb]/8 text-[#c9ccbb]/25 hover:text-[#b5a642] text-[10px] font-bold uppercase tracking-widest transition-colors text-center"
                    >
                      How the analysis engine works →
                    </button>

                  </div>
                </motion.div>
              )}

              {/* IDLE STATE */}
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
    </div>

    {/* -------------------------------------------------------------------- */}
    {/* MODALS — outside blur div                                            */}
    {/* -------------------------------------------------------------------- */}
    <AnimatePresence>

      {showExplainer && (
        <RoomAuditExplainer onClose={() => { if (isBlueprint) setShowExplainer(false) }} />
      )}

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
                <p>The NeuroDesign Analysis Engine does not evaluate your room for aesthetics or style. It reads the spatial environment to determine how much work your nervous system has to do to exist within it — and translates that into six measurable systems.</p>
              </section>
              <section>
                <h3 className="text-base font-serif text-[#b5a642] mb-3">The Six Systems</h3>
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
                <h3 className="text-base font-serif text-[#b5a642] mb-2">Environmental Cost Score</h3>
                <p>Not just how the room scores — but what it costs your specific nervous system to be in it. The same room has a different cost for a Sensor than it does for an Anchor. This score reflects that difference. Higher is better — it means lower cost to regulate.</p>
              </section>
              <section>
                <h3 className="text-base font-serif text-[#b5a642] mb-2">Light Level Input (Lux)</h3>
                <p>Measured with a light meter or phone sensor app. Improves the accuracy of the Circadian Alignment reading by giving the engine a real luminance measurement rather than an estimate from the image.</p>
              </section>
              <section>
                <h3 className="text-base font-serif text-[#b5a642] mb-2">Surface Type Input</h3>
                <p>Select the dominant surface material. Hard surfaces increase sound bounce and unpredictable noise. Soft surfaces absorb and buffer. Use this when the image does not clearly show floor and wall materials.</p>
              </section>
              <section>
                <h3 className="text-base font-serif text-[#b5a642] mb-2">The Science</h3>
                <p>Research in Attention Restoration Theory shows that carefully designed access to natural elements produces measurable improvements in directed attention — approximately 20% in controlled studies. The engine weights Vagal Coherence to reflect this. Low biophilic coherence in your results is a functional finding, not an aesthetic preference.</p>
              </section>
            </div>
          </motion.div>
        </div>
      )}

    </AnimatePresence>
    </>
  )
}
