'use client'

import Sidebar from '../../components/Sidebar'
import { useState, useEffect, useRef } from 'react'
import { Mic, Activity, Volume2, Info, X } from 'lucide-react'
import Link from 'next/link'

export default function NoiseMeterTool() {
  const [isListening, setIsListening] = useState(false)
  const [db, setDb] = useState<number>(0)
  const [history, setHistory] = useState<number[]>(new Array(50).fill(0))
  const [error, setError] = useState('')
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationRef = useRef<number | null>(null)

  // CLEANUP ON UNMOUNT
  useEffect(() => {
    return () => stopListening()
  }, [])

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream)
      
      sourceRef.current.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      
      setIsListening(true)
      setError('')
      analyzeLoop()
    } catch (err) {
      setError('Microphone access denied. Cannot measure noise levels.')
    }
  }

  const stopListening = () => {
    if (audioContextRef.current) audioContextRef.current.close()
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    setIsListening(false)
    setDb(0)
  }

  const analyzeLoop = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Calculate RMS (Root Mean Square) for volume
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i]
    }
    const rms = Math.sqrt(sum / dataArray.length)
    
    // Convert to rough dB approximation (calibrated for standard mic input)
    // RMS of 0-255 mapped to roughly 30-100dB range
    const estimatedDb = Math.max(30, Math.round(20 * Math.log10(rms || 1) + 30))

    setDb(prev => {
        // Smooth changes
        const diff = estimatedDb - prev
        return Math.round(prev + diff * 0.1)
    })
    
    // Update graph history
    setHistory(prev => [...prev.slice(1), estimatedDb])

    animationRef.current = requestAnimationFrame(analyzeLoop)
  }

  const getStatus = (val: number) => {
      if (val < 40) return { label: 'Restorative', color: 'text-emerald-400', desc: 'Ideal for deep focus and sleep.' }
      if (val < 60) return { label: 'Moderate', color: 'text-[#b5a642]', desc: 'Normal conversation level.' }
      if (val < 75) return { label: 'Distracting', color: 'text-orange-400', desc: 'Cognitive load increasing.' }
      return { label: 'Stress Inducing', color: 'text-red-400', desc: 'Triggers cortisol spike. Reduce source.' }
  }

  const status = getStatus(db)

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12 flex flex-col justify-center items-center">
        
        <div className="max-w-xl w-full">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b5a642]/10 text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-4">
                <Activity size={14} /> Acoustic Health
                </div>
                <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Noise Monitor</h1>
                <p className="text-[#c9ccbb]/60">Check auditory load on your nervous system.</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 bg-[#000]/20 relative overflow-hidden">
                
                {/* METER DISPLAY */}
                <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
                    {/* Dynamic Circles */}
                    <div className={`absolute inset-0 rounded-full border border-[#c9ccbb]/10 transition-all duration-300 ${isListening ? 'scale-100 opacity-100' : 'scale-75 opacity-20'}`} />
                    <div className={`absolute inset-0 rounded-full border border-[#b5a642]/30 transition-all duration-100`} 
                         style={{ transform: `scale(${1 + (db - 30)/100})`, opacity: isListening ? 0.5 : 0 }} />
                    
                    <div className="text-center relative z-10">
                         {isListening ? (
                             <>
                                <div className="text-6xl font-serif text-[#c9ccbb] tabular-nums">{db}</div>
                                <div className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mt-1">dB (Approx)</div>
                             </>
                         ) : (
                             <div className="text-[#c9ccbb]/30 flex flex-col items-center">
                                 <Mic size={32} className="mb-2" />
                                 <span className="text-xs uppercase">Tap Start</span>
                             </div>
                         )}
                    </div>
                </div>

                {/* GRAPH */}
                <div className="h-24 flex items-end justify-between gap-1 mb-8 opacity-50 px-8">
                    {history.map((val, i) => (
                        <div key={i} className="w-full bg-[#b5a642]" 
                             style={{ 
                                 height: `${Math.max(5, (val - 20))}%`, 
                                 opacity: i / 50 
                             }} 
                        />
                    ))}
                </div>

                {/* STATUS */}
                {isListening && (
                    <div className="text-center mb-8 animate-fade-in-up">
                        <h3 className={`text-xl font-serif mb-1 ${status.color}`}>{status.label}</h3>
                        <p className="text-[#c9ccbb]/60 text-sm">{status.desc}</p>
                    </div>
                )}

                {/* CONTROLS */}
                <div className="flex justify-center">
                    {!isListening ? (
                        <button onClick={startListening} className="px-8 py-3 bg-[#b5a642] text-[#1b270e] font-bold uppercase tracking-widest rounded-xl hover:bg-[#d4c55e] flex items-center gap-2">
                             <Mic size={18} /> Start Monitoring
                        </button>
                    ) : (
                        <button onClick={stopListening} className="px-8 py-3 bg-[#c9ccbb]/10 text-[#c9ccbb] font-bold uppercase tracking-widest rounded-xl hover:bg-red-500/20 hover:text-red-400 flex items-center gap-2">
                             <X size={18} /> Stop
                        </button>
                    )}
                </div>

                {error && <p className="text-red-400 text-xs text-center mt-4">{error}</p>}
                
            </div>

            <div className="text-center mt-8">
                <Link href="/dashboard" className="text-[#c9ccbb]/40 text-xs hover:text-[#b5a642] transition-colors">← Back to Toolkit</Link>
            </div>
        </div>
      </div>
    </div>
  )
}
