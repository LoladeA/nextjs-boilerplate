'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2, ScanEye, CheckCircle, Brain, Lightbulb, Zap } from 'lucide-react'

interface RoomAuditDashboardProps {
  hasAccess: boolean
  rooms: string[]
  onRunAnalysis: (file: File, room: string, lux?: number) => Promise<void>
  result?: any
  loading?: boolean
}

export default function RoomAuditDashboard({ hasAccess, rooms, onRunAnalysis, result, loading }: RoomAuditDashboardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedRoom, setSelectedRoom] = useState(rooms[0])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [manualLux, setManualLux] = useState<string>('')

  // -------------------------------
  // HANDLE FILE SELECTION
  // -------------------------------
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  // -------------------------------
  // RUN ANALYSIS
  // -------------------------------
  const handleRunAnalysis = () => {
    if (!file) return
    const luxValue = manualLux ? parseInt(manualLux) : undefined
    onRunAnalysis(file, selectedRoom, luxValue)
  }

  // -------------------------------
  // LAYOUT
  // -------------------------------
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* ------------------- UPLOAD PANEL ------------------- */}
      <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 bg-[#000]/20 relative overflow-hidden">
        
        {!hasAccess && (
          <div className="absolute inset-0 z-50 backdrop-blur-md bg-[#1b270e]/60 flex flex-col items-center justify-center text-center p-8">
            <ScanEye size={32} className="text-[#b5a642] mb-4" />
            <h3 className="text-xl font-serif text-[#c9ccbb] mb-2">Your Home Is About to Level Up</h3>
            <p className="text-[#c9ccbb]/60 mb-4">Become a foundation member and see in real time what is, and isn't working in your eoom and make realtime changes your nervous system will thank you for.</p>
          </div>
        )}

        {/* ROOM SELECTION */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-[#000]/40 rounded-full p-1 border border-[#c9ccbb]/10">
            {rooms.map(room => (
              <button
                key={room}
                onClick={() => setSelectedRoom(room)}
                disabled={!hasAccess}
                className={`px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${selectedRoom === room ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/40'}`}
              >
                {room}
              </button>
            ))}
          </div>
        </div>

        {/* FILE UPLOAD */}
        <div onClick={() => hasAccess && fileInputRef.current?.click()}
             className={`w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative cursor-pointer
             ${previewUrl ? 'border-[#b5a642] bg-black' : 'border-[#c9ccbb]/20 hover:border-[#b5a642]/50'}`}>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" disabled={!hasAccess} />
          {previewUrl ? <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" /> : (
            <div className="flex flex-col items-center gap-4 text-[#c9ccbb]/40">
              <Camera size={32} />
              <span className="text-xs font-bold uppercase tracking-widest">Tap to Capture</span>
            </div>
          )}
        </div>

        {/* MANUAL LUX INPUT */}
        <div className="mt-6">
          <label className="flex items-center gap-2 text-[#c9ccbb]/60 text-[10px] font-bold uppercase tracking-widest mb-2">
            <Zap size={12} className="text-[#b5a642]" /> Add Light Meter Reading
          </label>
          <input
            type="number"
            value={manualLux}
            onChange={e => setManualLux(e.target.value)}
            placeholder="e.g. 350"
            disabled={!hasAccess}
            className="w-full bg-[#1b270e] border border-[#c9ccbb]/20 rounded-xl px-4 py-3 text-[#c9ccbb] text-sm focus:outline-none focus:border-[#b5a642]"
          />
        </div>

        {/* RUN BUTTON */}
        <div className="mt-6 flex justify-center">
          <button
            disabled={!file || !hasAccess || loading}
            onClick={handleRunAnalysis}
            className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 ${!file ? 'bg-[#c9ccbb]/10 text-[#c9ccbb]/20' : 'bg-[#b5a642] text-[#1b270e] hover:bg-[#d4c55e]'}`}
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Analyzing</> : <>Run Diagnosis <Brain size={14} /></>}
          </button>
        </div>
      </div>

      {/* ------------------- RESULTS PANEL ------------------- */}
      <div className="relative">
        {result ? (
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
                <span className="text-2xl font-serif text-[#c9ccbb]">{result.entropy_score}</span>
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
  )
}
