'use client'

import Sidebar from '../../components/Sidebar'
import { useState, useRef, useEffect } from 'react'
import { Camera, Brain, Loader2, ScanEye, CheckCircle, Lock, Lightbulb, Zap, Activity, Sun } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { interpretChromeData } from '../../utils/chromatic-analyzer'

export default function AuditRoom() {
  const supabase = createClientComponentClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // STATE
  const [loading, setLoading] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)
  
  const [selectedRoom, setSelectedRoom] = useState('Living Room')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'success'>('idle')
  
  // Analysis Results State
  const [result, setResult] = useState<any>(null)

  const rooms = ['Living Room', 'Bedroom', 'Home Office', 'Kitchen', 'Entryway']

  // CHECK SUBSCRIPTION
  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Logic placeholder for subscription check - assuming active for now
      setIsSubscribed(true) 
    }
    setLoading(false)
  }

  // HANDLE FILE SELECT
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setResult(null)
      setStatus('idle')
    }
  }

  // RUN CLIENT-SIDE ANALYSIS
  const handleAnalyze = async () => {
    if (!file || !previewUrl) return
    setStatus('analyzing')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      // 1. Upload Image (Keep history)
      const fileName = `${user.id}/${Date.now()}_${selectedRoom.replace(' ', '_')}.jpg`
      const { error: uploadError } = await supabase.storage.from('room-photos').upload(fileName, file)
      if (uploadError) console.error("Upload warning:", uploadError)

      // 2. CLIENT-SIDE ANALYSIS
      const img = new Image()
      img.src = previewUrl
      img.crossOrigin = "Anonymous"

      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const scale = 500 / img.width
        canvas.width = 500
        canvas.height = img.height * scale

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        
        // The Brain (Now returns lightScore too)
        const analysis = interpretChromeData(imageData.data)
        
        // 3. Save to DB
        const { error: dbError } = await supabase.from('room_audits').insert({
            user_id: user.id,
            room_name: selectedRoom,
            image_url: fileName, // Saving path reference
            
            // 🟢 MAPPING ALL METRICS
            arousal_score: analysis.arousalScore,
            light_score: analysis.lightScore,       // <-- Added
            circadian_tag: analysis.circadianTag,
            dominance: analysis.dominance,
            insight: analysis.insight,
            prescriptions: analysis.prescriptions   // <-- Added
        })

        if (dbError) console.error("DB Save Error:", dbError)
        
        setResult(analysis)
        setStatus('success')
      }

    } catch (error: any) {
      console.error('Analysis failed:', error)
      setStatus('idle')
    }
  }

  if (loading) return <div className="min-h-screen bg-[#1b270e] flex items-center justify-center"><Loader2 className="animate-spin text-[#b5a642]" /></div>

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar onOpenGuide={() => {}} /> 
      
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-4">Audit Room</h1>
            <p className="text-[#c9ccbb]/60 max-w-lg mx-auto">
              NeuroDesign Analysis Engine
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* UPLOAD AREA */}
            <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 bg-[#000]/20 relative overflow-hidden h-fit">
               {!isSubscribed && (
                  <div className="absolute inset-0 z-50 backdrop-blur-md bg-[#1b270e]/80 flex flex-col items-center justify-center text-center p-8">
                    <Lock size={32} className="text-[#b5a642] mb-4" />
                    <h3 className="text-xl font-serif text-[#c9ccbb] mb-4">Foundation Access Required</h3>
                    <Link href="/upgrade" className="px-6 py-3 bg-[#b5a642] text-[#1b270e] rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#d4c55e]">Unlock Access</Link>
                  </div>
               )}

               <div className="flex justify-center mb-6">
                 <div className="inline-flex bg-[#000]/40 rounded-full p-1 border border-[#c9ccbb]/10">
                   {rooms.map(room => (
                     <button key={room} onClick={() => setSelectedRoom(room)} disabled={!isSubscribed}
                       className={`px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedRoom === room ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/40'}`}>
                       {room}
                     </button>
                   ))}
                 </div>
               </div>

               <div onClick={() => isSubscribed && fileInputRef.current?.click()}
                 className={`w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden cursor-pointer transition-all
                 ${previewUrl ? 'border-[#b5a642] bg-black' : 'border-[#c9ccbb]/20 hover:border-[#b5a642]/50'}`}>
                 
                 <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" disabled={!isSubscribed} />
                 
                 {previewUrl ? (
                   <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                 ) : (
                   <div className="flex flex-col items-center gap-4 text-[#c9ccbb]/40">
                     <Camera size={32} />
                     <span className="text-xs font-bold uppercase tracking-widest">Tap to Capture</span>
                   </div>
                 )}
               </div>

               <div className="mt-6 flex justify-center">
                 <button onClick={handleAnalyze} disabled={!file || status === 'analyzing' || !isSubscribed}
                   className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all
                   ${!file ? 'bg-[#c9ccbb]/10 text-[#c9ccbb]/20' : 'bg-[#b5a642] text-[#1b270e] hover:bg-[#d4c55e]'}`}>
                   {status === 'analyzing' ? <><Loader2 size={14} className="animate-spin" /> Decoding</> : <>Run Diagnosis <Brain size={14} /></>}
                 </button>
               </div>
            </div>

            {/* RESULTS AREA */}
            <div className="relative">
                {status === 'success' && result ? (
                    <div className="glass-panel p-8 rounded-3xl border border-[#b5a642]/30 bg-[#1b270e] animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-[#b5a642] flex items-center justify-center text-[#1b270e]">
                                <ScanEye size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-serif text-[#c9ccbb]">Analysis Complete</h3>
                                <p className="text-[#c9ccbb]/50 text-xs uppercase tracking-widest">Environmental Audit</p>
                            </div>
                        </div>

                        {/* 🟢 METRICS GRID (Visual + Light) */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {/* Card 1: Visual Arousal */}
                            <div className="p-4 bg-[#000]/30 rounded-xl border border-[#c9ccbb]/10">
                                <span className="text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest block mb-1">Visual Arousal</span>
                                <span className="text-2xl font-serif text-[#c9ccbb]">{result.arousalScore}% <span className="text-sm opacity-50 block text-[10px] font-sans font-normal uppercase mt-1">Saturation Load</span></span>
                            </div>
                            
                            {/* Card 2: Light Meter */}
                            <div className="p-4 bg-[#000]/30 rounded-xl border border-[#c9ccbb]/10">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest block">Light Level</span>
                                    <Sun size={12} className="text-[#b5a642]" />
                                </div>
                                <span className="text-2xl font-serif text-[#c9ccbb]">{result.lightScore}% <span className="text-sm opacity-50 block text-[10px] font-sans font-normal uppercase mt-1">{result.circadianTag}</span></span>
                            </div>
                        </div>

                        {/* INSIGHT */}
                        <div className="mb-8">
                            <h4 className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Activity size={14} /> Diagnostic Insight
                            </h4>
                            <p className="text-[#c9ccbb]/80 text-sm leading-relaxed border-l-2 border-[#b5a642] pl-4 italic">
                                "{result.insight}"
                            </p>
                        </div>

                        {/* PRESCRIPTIONS */}
                        <div>
                            <h4 className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Lightbulb size={14} /> Recommended Action
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
                        <Zap size={48} className="text-[#c9ccbb]/20 mb-4" />
                        <h3 className="text-[#c9ccbb] font-serif text-lg mb-2">Visual Intelligence</h3>
                        <p className="text-[#c9ccbb]/40 text-sm max-w-xs leading-relaxed">
                            Upload a photo to decode the chromatic load and light levels of your room.
                        </p>
                    </div>
                )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
