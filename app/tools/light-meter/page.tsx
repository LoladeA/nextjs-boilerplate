'use client'

import Sidebar from '../../components/Sidebar'
import { useState, useEffect, useRef } from 'react'
import { Sun, CheckCircle, ArrowDown, ArrowUp, Info, Camera, X, Zap } from 'lucide-react'
import Link from 'next/link'

// --- INTERNAL COMPONENT: CAMERA MODAL WITH CALIBRATION ---
function LightSensorModal({ onClose, onSave }: { onClose: () => void, onSave: (lux: number) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [lux, setLux] = useState<number>(0)
  const [rawReading, setRawReading] = useState<number>(0)
  const [calibration, setCalibration] = useState<number>(1) // Default multiplier
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [error, setError] = useState('')
  const [source, setSource] = useState<'camera' | 'sensor'>('camera')

  // 1. LOAD SAVED CALIBRATION
  useEffect(() => {
    const saved = localStorage.getItem('lux_calibration')
    if (saved) setCalibration(parseFloat(saved))
  }, [])

  // 2. TRY NATIVE SENSOR (Android/Chrome)
  useEffect(() => {
    if ('AmbientLightSensor' in window) {
      try {
        // @ts-ignore - TS often doesn't know about this experimental API yet
        const sensor = new AmbientLightSensor()
        sensor.onreading = () => {
          setSource('sensor')
          setLux(sensor.illuminance)
        }
        sensor.onerror = (event: any) => {
          console.log(event.error.name, event.error.message)
        }
        sensor.start()
        return () => sensor.stop()
      } catch (err) {
        // Fallback to camera if sensor fails or permissions denied
      }
    }
  }, [])

  // 3. START CAMERA (Fallback)
  useEffect(() => {
    if (source === 'sensor') return // Don't use camera if we have a real sensor

    let stream: MediaStream | null = null
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            // @ts-ignore
            advanced: [{ exposureMode: 'continuous' }] 
          } 
        })
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (err) {
        setError('Camera access denied.')
      }
    }
    startCamera()
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [source])

  // 4. ANALYZE LOOP (Camera Only)
  useEffect(() => {
    if (error || source === 'sensor') return
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })
        if (ctx && videoRef.current.readyState === 4) {
          ctx.drawImage(videoRef.current, 0, 0, 100, 100)
          const frame = ctx.getImageData(0, 0, 100, 100)
          let total = 0
          for (let i = 0; i < frame.data.length; i += 4) {
            // Perceived brightness formula (Rec. 709)
            total += 0.2126 * frame.data[i] + 0.7152 * frame.data[i + 1] + 0.0722 * frame.data[i + 2]
          }
          
          // Calculate average brightness (0-255)
          const avgBrightness = total / (frame.data.length / 4)
          
          // Logarithmic mapping to approximate Lux response
          // We assume "avg 128" (middle grey) is roughly 300-500 lux in a lit room
          const estimatedRaw = Math.pow(avgBrightness / 100, 3) * 150
          
          setRawReading(estimatedRaw)
          setLux(Math.round(estimatedRaw * calibration))
        }
      }
    }, 500)
    return () => clearInterval(interval)
  }, [error, source, calibration])

  const handleCalibrate = (realValue: number) => {
    if (rawReading > 0) {
      const newFactor = realValue / rawReading
      setCalibration(newFactor)
      localStorage.setItem('lux_calibration', newFactor.toString())
      setIsCalibrating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b270e]/95 backdrop-blur-sm p-6 animate-fade-in">
      <div className="w-full max-w-md bg-[#1b270e] border border-[#c9ccbb]/20 rounded-3xl p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-[#000]/20 rounded-full text-[#c9ccbb] hover:text-[#b5a642]"><X size={20} /></button>
        
        <h2 className="text-2xl font-serif text-[#c9ccbb] mb-2 flex items-center gap-2">
          {source === 'sensor' ? <Zap size={24} className="text-[#b5a642]" /> : <Camera size={24} className="text-[#b5a642]" />}
          {source === 'sensor' ? 'Hardware Sensor' : 'Light Estimator'}
        </h2>
        <p className="text-[#c9ccbb]/70 text-xs mb-8">
          {source === 'sensor' ? 'Using device hardware.' : 'Analysing environment brightness.'}
        </p>

        {/* VISUALIZER */}
        <div className="relative w-48 h-48 bg-[#000] rounded-full mx-auto mb-8 border-4 border-[#c9ccbb]/10 overflow-hidden flex items-center justify-center">
            {source === 'camera' && (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <canvas ref={canvasRef} width="100" height="100" className="hidden" />
              </>
            )}
            
            <div className="relative z-10 text-center">
                {error ? <span className="text-red-400 text-xs">{error}</span> : (
                    <>
                        <div className="text-5xl font-serif text-[#c9ccbb] tabular-nums">{lux}</div>
                        <div className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mt-1">Lux</div>
                    </>
                )}
            </div>
            {/* Dynamic Ring */}
            <div className="absolute inset-0 rounded-full border-[6px] border-[#b5a642] transition-opacity duration-500" style={{ opacity: Math.min(lux / 1000, 1) }} />
        </div>

        {/* CALIBRATION UI (Only needed for Camera mode) */}
        {source === 'camera' && !error && (
          <div className="mb-6">
            {!isCalibrating ? (
              <button onClick={() => setIsCalibrating(true)} className="text-xs text-[#c9ccbb]/50 underline hover:text-[#b5a642] w-full text-center">
                Reading looks wrong? Calibrate
              </button>
            ) : (
              <div className="bg-[#c9ccbb]/5 p-4 rounded-xl animate-fade-in-up">
                <p className="text-xs text-[#c9ccbb]/80 mb-2">Fine-tune with an external reference meter:</p>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="e.g. 500"
                    className="w-full bg-[#000]/30 border border-[#c9ccbb]/20 rounded-lg px-3 text-[#c9ccbb] text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCalibrate(parseInt(e.currentTarget.value))
                    }}
                  />
                  <button 
                    onClick={(e) => {
                      // @ts-ignore
                      handleCalibrate(parseInt(e.currentTarget.previousSibling.value))
                    }}
                    className="px-4 py-2 bg-[#b5a642] text-[#1b270e] font-bold text-xs rounded-lg uppercase tracking-wider"
                  >
                    Set
                  </button>
                </div>
                <button onClick={() => setIsCalibrating(false)} className="text-[10px] text-red-400 mt-2 hover:underline">Cancel</button>
              </div>
            )}
          </div>
        )}

        <button onClick={() => onSave(lux)} disabled={!!error} className="w-full py-4 bg-[#b5a642] text-[#1b270e] font-bold uppercase tracking-widest rounded-xl hover:bg-[#c4b54e] flex items-center justify-center gap-2">
            <CheckCircle size={18} /> Save Measurement
        </button>
      </div>
    </div>
  )
}

// --- MAIN PAGE COMPONENT ---
export default function LightMeterTool() {
  const [lux, setLux] = useState<string>('')
  const [mood, setMood] = useState<number>(3)
  const [time, setTime] = useState<Date | null>(null)
  const [recommendation, setRecommendation] = useState<any>(null)
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => { setTime(new Date()) }, [])

  const handleScanSave = (val: number) => {
    setLux(val.toString())
    setShowScanner(false)
  }

  const analyzeLight = () => {
    if (!lux || !time) return
    const currentLux = parseInt(lux)
    const hour = time.getHours()
    const isDysregulated = mood <= 2 
    
    let status: 'ideal' | 'too_high' | 'too_low' = 'ideal'
    let advice = ''
    let science = ''

    // LOGIC ENGINE
    if (hour >= 5 && hour < 11) { // Morning
      if (currentLux < 1000) {
        status = 'too_low'
        advice = isDysregulated ? "Your nervous system needs an anchor. Sit within 1m of a window." : "Insufficient for wakefulness. Step outside."
        science = "Morning photons trigger the SCN to clear adenosine."
      } else advice = "Excellent. Supports cortisol production."
    } else if (hour >= 11 && hour < 17) { // Midday
      if (currentLux < 500) {
        status = 'too_low'
        advice = "Low light levels may cause drowsiness. Increase ambient brightness."
      } else if (currentLux > 2000 && isDysregulated) {
        status = 'too_high'
        advice = "High intensity may overstimulate. Diffuse glare with sheer curtains or blinds."
      } else advice = "Optimal range for focus."
    } else if (hour >= 17 && hour < 21) { // Evening
      if (currentLux > 50) {
        status = 'too_high'
        advice = isDysregulated ? "Your current light levels is actively blocking melatonin release. Turn off overheads." : "Too bright. Switch to floor and table lamps (<2700K)."
        science = "Lux > 50 suppresses melatonin by up to 50%."
      } else advice = "Perfect 'twilight' level."
    } else { // Night
      if (currentLux > 10) {
        status = 'too_high'
        advice = "Light pollution detected. Wear an eye mask or use blackout curtains."
      } else advice = "Deep darkness achieved."
    }
    setRecommendation({ status, advice, science })
  }

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      {showScanner && <LightSensorModal onClose={() => setShowScanner(false)} onSave={handleScanSave} />}
      
      <div className="md:ml-64 min-h-screen p-6 md:p-12 flex flex-col justify-center items-center">
        <div className="max-w-2xl w-full">
          
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b5a642]/10 text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-4">
              <Sun size={14} /> Circadian Alignment Tool
            </div>
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Light Logic™ Meter</h1>
            <p className="text-[#c9ccbb]/70">Measure, don't guess. Align your home environment with your biology.</p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 bg-[#000]/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              
              {/* LUX INPUT + SCAN BUTTON */}
              <div>
                <label className="text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest mb-3 flex justify-between">
                    <span>Current Lux</span>
                    <button onClick={() => setShowScanner(true)} className="text-[#b5a642] hover:underline flex items-center gap-1">
                        <Camera size={12} /> Scan
                    </button>
                </label>
                <div className="relative group cursor-pointer" onClick={() => !lux && setShowScanner(true)}>
                  <input type="number" value={lux} onChange={(e) => setLux(e.target.value)} placeholder="e.g. 350"
                    className="w-full bg-[#1b270e] border border-[#c9ccbb]/20 rounded-xl p-4 text-[#c9ccbb] text-lg font-serif focus:outline-none focus:border-[#b5a642]" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9ccbb]/50 text-xs font-bold">LUX</span>
                </div>
                {!lux && <p className="text-[10px] text-[#c9ccbb]/70 mt-2">*Tap 'Scan' to use camera.</p>}
              </div>

              {/* MOOD INPUT */}
              <div>
                <label className="text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest mb-3 block">Current State</label>
                <div className="flex justify-between gap-2 bg-[#1b270e] p-1 rounded-xl border border-[#c9ccbb]/20">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button key={level} onClick={() => setMood(level)}
                      className={`w-full py-3 rounded-lg text-sm font-bold transition-all ${mood === level ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/70 hover:text-[#c9ccbb]'}`}>
                      {level}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-[#c9ccbb]/70 uppercase tracking-widest"><span>Dysregulated</span><span>Resonant</span></div>
              </div>
            </div>

            <button onClick={analyzeLight} disabled={!lux}
              className="w-full py-4 bg-[#c9ccbb]/10 border border-[#c9ccbb]/20 hover:bg-[#b5a642] hover:text-[#1b270e] hover:border-[#b5a642] text-[#c9ccbb] rounded-xl font-bold text-xs uppercase tracking-widest transition-all mb-8">
              Analyse Light Load
            </button>

            {recommendation && (
              <div className="animate-fade-in-up">
                <div className={`p-6 rounded-2xl border mb-6 ${recommendation.status === 'ideal' ? 'bg-emerald-900/20 border-emerald-500/30' : recommendation.status === 'too_high' ? 'bg-amber-900/20 border-amber-500/30' : 'bg-blue-900/20 border-blue-500/30'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${recommendation.status === 'ideal' ? 'bg-emerald-500/20 text-emerald-400' : recommendation.status === 'too_high' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {recommendation.status === 'ideal' ? <CheckCircle size={24} /> : recommendation.status === 'too_high' ? <ArrowDown size={24} /> : <ArrowUp size={24} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-serif text-[#c9ccbb] mb-1">{recommendation.status === 'ideal' ? 'Environment Aligned' : recommendation.status === 'too_high' ? 'Reduce Intensity' : 'Increase Intensity'}</h3>
                      <p className="text-[#c9ccbb]/80 text-sm leading-relaxed mb-4">{recommendation.advice}</p>
                      {recommendation.science && <div className="flex gap-2 text-[10px] text-[#c9ccbb]/70 uppercase tracking-widest border-t border-[#c9ccbb]/10 pt-3"><Info size={12} /><span>Science: {recommendation.science}</span></div>}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center">
                <Link href="/dashboard" className="text-[#c9ccbb]/70 text-xs hover:text-[#b5a642] transition-colors">← Back to Toolkit</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
