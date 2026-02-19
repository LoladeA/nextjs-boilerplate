'use client'

import Sidebar from '../components/Sidebar'
import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, ArrowRight, Loader2, ScanEye, CheckCircle, AlertTriangle, Lock, Sparkles, Brain, Lightbulb, Zap } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

// 🟢 NEW: Added Props interface to match the Flashcard architecture
interface Props {
  isPremium?: boolean 
}

export default function RoomAudit({ isPremium = false }: Props) {
  const supabase = createClientComponentClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // STATE
  const [loading, setLoading] = useState(true)
  const [godMode, setGodMode] = useState(false) // 🟢 Replaces 'isSubscribed'
  
  const [selectedRoom, setSelectedRoom] = useState('Living Room')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'success'>('idle')
  
  const [manualLux, setManualLux] = useState<string>('') 
  const [result, setResult] = useState<any>(null)

  const rooms = ['Living Room', 'Bedroom', 'Home Office', 'Kitchen', 'Entryway']

  // 1. GOLDEN TICKET CHECK ONLY
  // No more database querying for subscriptions here.
  useEffect(() => {
    async function checkGodMode() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email === 'christchilde@gmail.com') {
        console.log("👑 Room Audit God Mode: Active")
        setGodMode(true)
      }
      setLoading(false)
    }
    checkGodMode()
  }, [supabase])

  // 🟢 DETERMINE FINAL ACCESS (Prop OR God Mode)
  const hasAccess = isPremium || godMode

  // 1. HANDLE FILE
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setResult(null) 
      setStatus('idle')
    }
  }

  // 2. UPLOAD & ANALYZE
  const handleUpload = async () => {
    if (!file) return
    setStatus('analyzing')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      // A. Upload Image
      const fileName = `${user.id}/${Date.now()}_${selectedRoom.replace(' ', '_')}.jpg`
      const { error: uploadError } = await supabase.storage.from('room-photos').upload(fileName, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('room-photos').getPublicUrl(fileName)

      // B. CALL THE INTELLIGENCE API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            roomName: selectedRoom,
            imageUrl: publicUrl,
            measuredLux: manualLux ? parseInt(manualLux) : null
        })
      })
      const analysis = await response.json()

      // C. Save to DB
      await supabase.from('room_audits').insert({
          user_id: user.id,
          room_name: selectedRoom,
          image_url: publicUrl,
          entropy_score: parseFloat(analysis.data.entropy_score),
          lighting_kelvin: analysis.data.lighting_kelvin,
          lux_reading: manualLux ? parseInt(manualLux) : null
      })

      // D. Show Results
      setResult(analysis.data)
      setStatus('success')

    } catch (error: any) {
      console.error('Upload failed:', error)
      alert(`Error: ${error.message}`)
      setStatus('idle')
    }
  }

  if (loading) return <div className="min-h-screen bg-[#1b270e] flex items-center justify-center"><Loader2 className="animate-spin text-[#b5a642]" /></div>

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
            
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-4">Environmental Audit</h1>
            <p className="text-[#c9ccbb]/60 max-w-lg mx-auto">
              NeuroDesign Analysis Engine
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT: UPLOAD AREA */}
            <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 bg-[#000]/20 relative overflow-hidden h-fit">
                
               {/* LOCKED OVERLAY - Now strictly uses hasAccess */}
               {!hasAccess && (
                  <div className="absolute inset-0 z-50 backdrop-blur-md bg-[#1b270e]/95 flex flex-col items-center justify-center text-center p-8">
                    <Lock size={32} className="text-[#b5a642] mb-4" />
                    <h3 className="text-xl font-serif text-[#c9ccbb] mb-4">This Space Is About to Level Up</h3>
                    <p className="text-[#c9ccbb]/60 text-xs mb-6 max-w-xs leading-relaxed">
                      Becoma a foundation member and see in real time what is working in your room, and what isn't.
                    </p>
                    <Link 
                      href="/upgrade" 
                      className="px-8 py-3 bg-[#b5a642] text-[#1b270e] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#d4c55e] transition-all shadow-xl shadow-[#b5a642]/10"
                    >
                      Unlock Access
                    </Link>
                  </div>
               )}

               <div className="flex justify-center mb-6">
                 <div className="inline-flex bg-[#000]/40 rounded-full p-1 border border-[#c9ccbb]/10">
                   {rooms.map(room => (
                     <button key={room} onClick={() => setSelectedRoom(room)} disabled={!hasAccess}
                       className={`px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${selectedRoom === room ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/40'}`}>
                       {room}
                     </button>
                   ))}
                 </div>
               </div>

               <div onClick={() => hasAccess && fileInputRef.current?.click()}
                 className={`w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden cursor-pointer transition-all
                 ${previewUrl ? 'border-[#b5a642] bg-black' : 'border-[#c9ccbb]/20 hover:border-[#b5a642]/50'}`}>
                 
                 <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" disabled={!hasAccess} />
                 
                 {previewUrl ? (
                   <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                 ) : (
                   <div className="flex flex-col items-center gap-4 text-[#c9ccbb]/40">
                     <Camera size={32} />
                     <span className="text-xs font-bold uppercase tracking-widest">Tap to Capture</span>
                   </div>
                 )}
               </div>

               {/* LUX INPUT */}
               <div className="mt-6">
                 <label className="flex items-center gap-2 text-[#c9ccbb]/60 text-[10px] font-bold uppercase tracking-widest mb-2">
                    <Zap size={12} className="text-[#b5a642]" /> Add Light Meter Reading (Optional)
                 </label>
                 <div className="relative">
                    <input 
                        type="number" 
                        value={manualLux}
                        onChange={(e) => setManualLux(e.target.value)}
                        placeholder="e.g. 350"
                        disabled={!hasAccess}
                        className="w-full bg-[#1b270e] border border-[#c9ccbb]/20 rounded-xl px-4 py-3 text-[#c9ccbb] text-sm focus:outline-none focus:border-[#b5a642] placeholder:text-[#c9ccbb]/20 disabled:opacity-50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9ccbb]/30 text-[10px] font-bold">LUX</span>
                 </div>
               </div>

               <div className="mt-6 flex justify-center">
                 <button onClick={handleUpload} disabled={!file || status === 'analyzing' || !hasAccess}
                   className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all
                   ${!file ? 'bg-[#c9ccbb]/10 text-[#c9ccbb]/20' : 'bg-[#b5a642] text-[#1b270e] hover:bg-[#d4c55e]'}`}>
                   {status === 'analyzing' ? <><Loader2 size={14} className="animate-spin" /> Analysing</> : <>Run Diagnosis <Brain size={14} /></>}
                 </button>
               </div>
            </div>

            {/* RIGHT: RESULTS AREA */}
            <div className="relative">
                {status === 'success' && result ? (
                    <div className="glass-panel p-8 rounded-3xl border border-[#b5a642]/30 bg-[#1b270e] animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-[#b5a642] flex items-center justify-center text-[#1b270e]">
                                <ScanEye size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-serif text-[#c9ccbb]">Analysis Complete</h3>
                                <p className="text-[#c9ccbb]/50 text-xs uppercase tracking-widest">ID: {Date.now().toString().slice(-6)}</p>
                            </div>
                        </div>

                        {/* METRICS */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-[#000]/30 rounded-xl border border-[#c9ccbb]/10">
                                <span className="text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest block mb-1">Visual Entropy</span>
                                <span className="text-2xl font-serif text-[#c9ccbb]">{result.entropy_score} <span className="text-sm opacity-50">/ 10</span></span>
                            </div>
                            <div className="p-4 bg-[#000]/30 rounded-xl border border-[#c9ccbb]/10">
                                <span className="text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest block mb-1">Biophilic Index</span>
                                <span className="text-2xl font-serif text-[#c9ccbb]">{result.biophilic_rating}</span>
                            </div>
                        </div>

                        {/* INSIGHT */}
                        <div className="mb-8">
                            <h4 className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Brain size={14} /> Diagnostic Insight
                            </h4>
                            <p className="text-[#c9ccbb]/80 text-sm leading-relaxed border-l-2 border-[#b5a642] pl-4 italic">
                                "{result.insight}"
                            </p>
                        </div>

                        {/* PRESCRIPTIONS */}
                        <div>
                            <h4 className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Lightbulb size={14} /> Recommended Actions
                            </h4>
                            <ul className="space-y-3">
                                {result.prescriptions.map((item: string, i: number) => (
                                    <li key={i} className="flex gap-3 text-sm text-[#c9ccbb]">
                                        <CheckCircle size={16} className="text-[#b5a642] shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="h-full border-2 border-dashed border-[#c9ccbb]/5 rounded-3xl flex flex-col items-center justify-center p-12 text-center opacity-50">
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
