'use client'

import Sidebar from '../components/Sidebar'
import { useState, useRef, useEffect } from 'react'
import { Camera, Loader2, ScanEye, CheckCircle, Lock, Brain, Lightbulb, Zap, Info, Activity, AlertCircle, ShieldCheck } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function RoomAudit() {
  const supabase = createClientComponentClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  const [selectedRoom, setSelectedRoom] = useState('Living Room')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [manualLux, setManualLux] = useState<string>('')
  
  // 🟢 PHASE 7: EXPLICIT FLOW STATES
  const [status, setStatus] = useState<'idle' | 'validating' | 'processing' | 'success'>('idle')
  const [result, setResult] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // 🟢 ORCHESTRATION UI
  const [loadingText, setLoadingText] = useState("Validating Room Protocol...")
  const orchestrationStages = [
    "Extracting spatial geometry...",
    "Mapping visual entropy...",
    "Calculating sensory load...",
    "Translating clinical insights..."
  ]

  const rooms = ['Living Room', 'Bedroom', 'Home Office', 'Kitchen', 'Entryway']

  useEffect(() => {
    async function validateAccess() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          setHasAccess(false); setLoading(false); return;
        }

        if (user.email === 'christchilde@gmail.com') {
          setHasAccess(true); setLoading(false); return;
        }

        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('plan, status, current_period_end')
          .eq('user_id', user.id)
          .single()

        if (
          !subError && subscription && subscription.plan === 'premium' &&
          subscription.status === 'active' && new Date(subscription.current_period_end) >= new Date()
        ) {
          setHasAccess(true)
        } else {
          setHasAccess(false)
        }
        setLoading(false)
      } catch (err) {
        console.error('Premium validation failed', err)
        setHasAccess(false); setLoading(false)
      }
    }
    validateAccess()
  }, [supabase])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasAccess) return
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setResult(null)
      setStatus('idle')
      setErrorMsg(null)
    }
  }

  const handleRunAnalysis = async () => {
    if (!file || !hasAccess) return
    
    // STEP 8.1: /scan/start -> Validation Phase
    setStatus('validating')
    setErrorMsg(null)
    setLoadingText("Validating Priority Room Allocation...")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const fileName = `${user.id}/${Date.now()}_${selectedRoom.replace(' ', '_')}.jpg`
      const { error: uploadError } = await supabase.storage.from('room-photos').upload(fileName, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('room-photos').getPublicUrl(fileName)

      // STEP 8.2: /scan/process -> Orchestration Phase
      setStatus('processing')
      let stageIndex = 0
      setLoadingText(orchestrationStages[0])
      
      const stageInterval = setInterval(() => {
        stageIndex++
        if (stageIndex < orchestrationStages.length) {
          setLoadingText(orchestrationStages[stageIndex])
        }
      }, 2500)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: selectedRoom, imageUrl: publicUrl, measuredLux: manualLux ? parseInt(manualLux) : null })
      })
      
      clearInterval(stageInterval) // Stop the text rotation
      
      const analysis = await response.json()
      
      // Catches Priority Room Lockouts gracefully
      if (!analysis.success) throw new Error(analysis.error || 'Analysis failed')

      // STEP 8.3: Success Dashboard
      setResult(analysis.data)
      setStatus('success')
      
    } catch (err: any) {
      console.error('Analysis Error:', err)
      setErrorMsg(err.message)
      setStatus('idle')
    }
  }

  if (loading) return <div className="min-h-screen bg-[#1b270e] flex items-center justify-center"><Loader2 className="animate-spin text-[#b5a642]" /></div>

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#1b270e] font-sans flex flex-col items-center justify-center text-center p-12">
        <Lock size={48} className="text-[#b5a642] mb-4" />
        <h2 className="text-xl font-serif text-[#c9ccbb] mb-2">Your Home Is About To Level Up</h2>
        <p className="text-[#c9ccbb]/60 mb-6 max-w-sm">
          Become a foundation member and see in real time what is working in your room, what isn't, and make realtime changes your nervous system will thank you for.
        </p>
        <Link href="/upgrade" className="px-8 py-3 bg-[#b5a642] text-[#1b270e] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#d4c55e]">
          Upgrade to Premium
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        <div className="max-w-4xl mx-auto">

          <div className="mb-12 text-center">
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-4">Environmental Audit</h1>
            <p className="text-[#c9ccbb]/60 max-w-lg mx-auto">NeuroDesign Analysis Engine</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ---------------- UPLOAD & VALIDATION PANEL ---------------- */}
            <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 bg-[#000]/20 relative overflow-hidden h-fit flex flex-col">
              
              <div className="mb-6 p-4 bg-[#b5a642]/10 border border-[#b5a642]/20 rounded-xl flex items-start gap-3">
                <Info size={16} className="text-[#b5a642] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest block mb-1">Audit Protocol</span>
                  <p className="text-[#c9ccbb]/70 text-xs leading-relaxed">
                    To ensure longitudinal accuracy, you are allocated <strong>2 scans per month</strong>. These must be applied to <strong>1 Priority Room</strong>.
                  </p>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="inline-flex bg-[#000]/40 rounded-full p-1 border border-[#c9ccbb]/10 flex-wrap justify-center gap-1">
                  {rooms.map(room => (
                    <button
                      key={room}
                      onClick={() => setSelectedRoom(room)}
                      disabled={status === 'validating' || status === 'processing'}
                      className={`px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedRoom === room ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/40 hover:text-[#c9ccbb]'}`}
                    >
                      {room}
                    </button>
                  ))}
                </div>
              </div>

              <div onClick={() => (status === 'idle' || status === 'success') && fileInputRef.current?.click()}
                   className={`w-full flex-1 min-h-[250px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative transition-all
                   ${status === 'processing' || status === 'validating' ? 'border-[#b5a642]/50 opacity-50 cursor-not-allowed' : previewUrl ? 'border-[#b5a642] bg-black cursor-pointer' : 'border-[#c9ccbb]/20 hover:border-[#b5a642]/50 cursor-pointer'}`}>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                {previewUrl ? <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 rounded-2xl" /> : (
                  <div className="flex flex-col items-center gap-4 text-[#c9ccbb]/40">
                    <Camera size={32} />
                    <span className="text-xs font-bold uppercase tracking-widest">Tap to Capture</span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="flex items-center gap-2 text-[#c9ccbb]/60 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <Zap size={12} className="text-[#b5a642]" /> Add Light Meter Reading (Optional)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={manualLux}
                    onChange={e => setManualLux(e.target.value)}
                    placeholder="e.g. 350"
                    disabled={status === 'validating' || status === 'processing'}
                    className="w-full bg-[#1b270e] border border-[#c9ccbb]/20 rounded-xl px-4 py-3 text-[#c9ccbb] text-sm focus:outline-none focus:border-[#b5a642]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9ccbb]/30 text-[10px] font-bold">LUX</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center">
                <button
                  disabled={!file || status === 'validating' || status === 'processing'}
                  onClick={handleRunAnalysis}
                  className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${!file ? 'bg-[#c9ccbb]/10 text-[#c9ccbb]/20' : 'bg-[#b5a642] text-[#1b270e] hover:bg-white shadow-[#b5a642]/20'}`}
                >
                  {status === 'validating' ? <><ShieldCheck size={16} className="animate-pulse" /> Authorising</> : 
                   status === 'processing' ? <><Loader2 size={16} className="animate-spin" /> Processing</> : 
                   <>Run Diagnosis <Brain size={16} /></>}
                </button>
                
                {errorMsg && (
                  <div className="mt-4 text-red-400 text-xs font-medium bg-red-900/20 px-4 py-3 rounded-xl border border-red-900/50 w-full text-center">
                    {errorMsg}
                  </div>
                )}
              </div>
            </div>

            {/* ---------------- ORCHESTRATION & DASHBOARD PANEL ---------------- */}
            <div className="relative h-full min-h-[500px]">
              {status === 'validating' || status === 'processing' ? (
                <div className="h-full border-2 border-dashed border-[#b5a642]/30 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-[#b5a642]/5 transition-all">
                   <div className="relative mb-8">
                     <div className="absolute inset-0 border-4 border-[#b5a642]/20 rounded-full animate-ping"></div>
                     <div className="w-16 h-16 bg-[#b5a642]/20 rounded-full flex items-center justify-center border border-[#b5a642]/50 relative z-10">
                       <ScanEye size={24} className="text-[#b5a642]" />
                     </div>
                   </div>
                   <p className="text-[#b5a642] text-xs uppercase font-bold tracking-widest animate-pulse">{loadingText}</p>
                </div>
              ) : status === 'success' && result ? (
                <div className="glass-panel p-8 rounded-3xl border border-[#b5a642]/40 bg-[#1b270e] h-full shadow-2xl shadow-[#b5a642]/5 animate-fade-in-up">
                  
                  {/* ALIGNMENT INDEX HERO */}
                  <div className="text-center mb-8 p-8 bg-gradient-to-b from-[#b5a642]/10 to-transparent rounded-2xl border border-[#b5a642]/20 relative overflow-hidden">
                    <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest block mb-2">NeuroDesign Alignment Score</span>
                    <div className="text-7xl font-serif text-[#c9ccbb] drop-shadow-md">{result.alignment_index}<span className="text-3xl text-[#c9ccbb]/30">/100</span></div>
                  </div>

                  {/* OBJECTIVE METRICS */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-[#000]/30 rounded-xl border border-[#c9ccbb]/10 flex flex-col justify-between">
                      <span className="text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest block mb-1">Visual Entropy</span>
                      <span className="text-2xl font-serif text-[#c9ccbb]">{result.entropy_score} <span className="text-sm font-sans text-[#c9ccbb]/30">/ 10</span></span>
                    </div>
                    <div className="p-4 bg-[#000]/30 rounded-xl border border-[#c9ccbb]/10 flex flex-col justify-between">
                      <span className="text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest block mb-1">Biophilic Index</span>
                      <span className="text-xl font-serif text-[#c9ccbb] mt-1">{result.biophilic_rating}</span>
                    </div>
                  </div>

                  
                  
                  {/* THE 5 DOMAINS */}
                  <div className="mb-10 p-6 bg-[#000]/20 rounded-2xl border border-[#c9ccbb]/5">
                     <h4 className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                       <Activity size={14} /> Somatic Domains
                     </h4>
                     <div className="space-y-5">
                       {Object.entries(result.domains).map(([key, val]: [string, any]) => (
                          <div key={key}>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#c9ccbb]/80 mb-2">
                              <span>{key}</span>
                              <span className="text-[#b5a642]">{val}/100</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#1b270e] border border-[#c9ccbb]/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#b5a642]/50 to-[#b5a642] rounded-full transition-all duration-1000 ease-out" style={{ width: `${val}%` }} />
                            </div>
                          </div>
                       ))}
                     </div>
                  </div>

                  {/* STRESS TRIGGERS */}
                  {result.triggers && result.triggers.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-red-400/90 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertCircle size={14} /> Identified Friction Points
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.triggers.map((trigger: string, i: number) => (
                          <span key={i} className="px-3 py-2 bg-red-950/30 border border-red-900/40 text-red-300/90 text-xs rounded-lg leading-relaxed">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CLINICAL INSIGHT */}
                  <div className="mb-10">
                    <h4 className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Brain size={14} /> Diagnostic Translation
                    </h4>
                    <div className="p-5 bg-[#b5a642]/5 rounded-xl border border-[#b5a642]/10">
                      <p className="text-[#c9ccbb] text-sm leading-relaxed italic">
                        "{result.insight}"
                      </p>
                    </div>
                  </div>

                  {/* PRESCRIPTIONS */}
                  <div>
                    <h4 className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Lightbulb size={14} /> Structural Directives
                    </h4>
                    <ul className="space-y-4">
                      {result.prescriptions?.map((item: string, i: number) => (
                        <li key={i} className="flex gap-4 text-sm text-[#c9ccbb]/90 p-4 bg-[#000]/30 rounded-xl border border-[#c9ccbb]/5">
                          <CheckCircle size={18} className="text-[#b5a642] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              ) : (
                <div className="h-full border-2 border-dashed border-[#c9ccbb]/5 rounded-3xl flex flex-col items-center justify-center p-12 text-center opacity-50 bg-[#000]/10">
                  <ScanEye size={48} className="text-[#c9ccbb]/20 mb-4" />
                  <p className="text-[#c9ccbb]/40 text-sm uppercase tracking-widest">Awaiting Scan Data...</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
