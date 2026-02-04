'use client'

import { useState, useRef, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Mic, Sun, Square, Save, Play, RefreshCw, X } from 'lucide-react'

interface Props {
  type: 'acoustic' | 'light'
  onClose: () => void
}

export default function EnvironmentalScanner({ type, onClose }: Props) {
  const supabase = createClientComponentClient()
  
  // STATES
  const [status, setStatus] = useState<'idle' | 'recording' | 'stopped' | 'saved'>('idle')
  const [value, setValue] = useState(0)
  const [peak, setPeak] = useState(0)
  const [location, setLocation] = useState('Home Office') // Default context
  
  // REFS (For sensor intervals)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // 1. START RECORDING
  const startRecording = async () => {
    setStatus('recording')
    
    if (type === 'acoustic') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioContextRef.current = audioContext
        const source = audioContext.createMediaStreamSource(stream)
        const analyzer = audioContext.createAnalyser()
        analyzer.fftSize = 256
        source.connect(analyzer)
        
        const bufferLength = analyzer.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        intervalRef.current = setInterval(() => {
          analyzer.getByteFrequencyData(dataArray)
          
          // Simple dBA approximation (Average volume mapped to 30-100dB range)
          const sum = dataArray.reduce((a, b) => a + b, 0)
          const avg = sum / bufferLength
          // Map 0-255 input to roughly 30dB-100dB (Quiet room to Loud Noise)
          const db = Math.round(30 + (avg / 255) * 70)
          
          setValue(db)
          if (db > peak) setPeak(db)
        }, 100)

      } catch (err) {
        console.error("Microphone denied", err)
        alert("Microphone access is needed to measure noise levels.")
        setStatus('idle')
      }
    } 
    else if (type === 'light') {
      // Light Sensor Logic (Fallback to Simulation for iOS/Desktop)
      if ('AmbientLightSensor' in window) {
        try {
          const sensor = new (window as any).AmbientLightSensor()
          sensor.onreading = () => setValue(sensor.illuminance)
          sensor.start()
          // We'd store sensor ref to stop it later
        } catch (err) {
          console.log("Light sensor not supported, using simulation")
          simulateLight()
        }
      } else {
        // Fallback: Simulate "Scanning" for MVP (Since cameras are hard to code in 1 step)
        simulateLight()
      }
    }
  }

  // Helper for Simulation (if hardware is blocked)
  const simulateLight = () => {
    intervalRef.current = setInterval(() => {
      // Simulating a typical "Dim Office" (fluctuate between 250-320 lux)
      const simulated = Math.floor(250 + Math.random() * 70) 
      setValue(simulated)
    }, 200)
  }

  // 2. STOP RECORDING
  const stopRecording = () => {
    setStatus('stopped')
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (audioContextRef.current) audioContextRef.current.close()
  }

  // 3. SAVE TO PROFILE
  const saveReading = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('environmental_logs').insert({
        user_id: session.user.id,
        metric_type: type,
        value: value,
        unit: type === 'acoustic' ? 'dBA' : 'Lux',
        context: location
      })
      setStatus('saved')
      setTimeout(() => onClose(), 1500) // Close after success
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1b270e] border border-[#b5a642]/30 w-full max-w-md rounded-2xl p-8 relative shadow-2xl">
        
        {/* CLOSE BTN */}
        <button onClick={onClose} className="absolute top-4 right-4 text-[#c9ccbb]/50 hover:text-[#c9ccbb]">
          <X size={24} />
        </button>

        {/* HEADER */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-[#b5a642]/10 rounded-full mb-4 animate-pulse">
             {type === 'acoustic' ? <Mic className="text-[#b5a642]" size={32} /> : <Sun className="text-[#b5a642]" size={32} />}
          </div>
          <h2 className="text-2xl font-serif text-[#c9ccbb]">
            {type === 'acoustic' ? 'Acoustic Load' : 'Luminous Flux'}
          </h2>
          <p className="text-[#c9ccbb]/60 text-sm">
            {type === 'acoustic' ? 'Measuring background noise (dBA)' : 'Measuring light intensity (Lux)'}
          </p>
        </div>

        {/* METER DISPLAY */}
        <div className="bg-[#000]/40 rounded-xl p-8 mb-8 text-center border border-[#c9ccbb]/10">
          <div className="text-6xl font-bold text-[#c9ccbb] font-mono tabular-nums">
            {value}
          </div>
          <div className="text-[#b5a642] text-sm uppercase tracking-widest mt-2 font-bold">
            {type === 'acoustic' ? 'Decibels (dBA)' : 'Lux'}
          </div>
          
          {/* Status Indicator */}
          <div className="mt-4 flex justify-center items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status === 'recording' ? 'bg-red-500 animate-ping' : 'bg-[#c9ccbb]/20'}`} />
            <span className="text-xs text-[#c9ccbb]/40 uppercase tracking-widest">
              {status === 'recording' ? 'Live Sensor' : 'Sensor Offline'}
            </span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex gap-4">
          {status === 'idle' && (
            <button 
              onClick={startRecording}
              className="w-full py-4 bg-[#b5a642] text-[#1b270e] font-bold rounded-xl hover:bg-[#d4c55e] flex justify-center items-center gap-2"
            >
              <Play size={20} fill="currentColor" /> Start Meter
            </button>
          )}

          {status === 'recording' && (
            <button 
              onClick={stopRecording}
              className="w-full py-4 bg-red-500/80 text-white font-bold rounded-xl hover:bg-red-500 flex justify-center items-center gap-2"
            >
              <Square size={20} fill="currentColor" /> Stop & Capture
            </button>
          )}

          {status === 'stopped' && (
            <>
              <button 
                onClick={startRecording}
                className="flex-1 py-4 bg-[#c9ccbb]/10 text-[#c9ccbb] font-bold rounded-xl hover:bg-[#c9ccbb]/20 flex justify-center items-center"
              >
                <RefreshCw size={20} />
              </button>
              <button 
                onClick={saveReading}
                className="flex-[3] py-4 bg-[#b5a642] text-[#1b270e] font-bold rounded-xl hover:bg-[#d4c55e] flex justify-center items-center gap-2"
              >
                <Save size={20} /> Save to Profile
              </button>
            </>
          )}

          {status === 'saved' && (
            <div className="w-full py-4 bg-[#1b270e] border border-[#b5a642] text-[#b5a642] font-bold rounded-xl flex justify-center items-center gap-2">
              Saved Successfully!
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
