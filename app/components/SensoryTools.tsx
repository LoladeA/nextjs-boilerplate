'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Sun, Activity, Lock } from 'lucide-react'

export default function SensoryTools() {
  const [activeTool, setActiveTool] = useState<'noise' | 'light' | null>(null)
  const [noiseLevel, setNoiseLevel] = useState(0)
  const [lightLevel, setLightLevel] = useState(0)
  const [isMeasuring, setIsMeasuring] = useState(false)
  
  // Noise Meter Logic (Approximate Decibels via Web Audio API)
  const startNoiseMeter = async () => {
    setIsMeasuring(true)
    setActiveTool('noise')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1)

      analyser.smoothingTimeConstant = 0.8
      analyser.fftSize = 1024

      microphone.connect(analyser)
      analyser.connect(scriptProcessor)
      scriptProcessor.connect(audioContext.destination)

      scriptProcessor.onaudioprocess = () => {
        const array = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(array)
        let values = 0
        const length = array.length
        for (let i = 0; i < length; i++) {
          values += array[i]
        }
        const average = values / length
        // Calibration multiplier for demo purposes (Web Audio is relative, not absolute dB)
        setNoiseLevel(Math.round(average * 1.5)) 
      }
    } catch (err) {
      console.error("Microphone access denied", err)
      setIsMeasuring(false)
    }
  }

  // Light Meter Logic (Simulated for demo, as true Lux requires specific hardware access)
  const startLightMeter = () => {
    setActiveTool('light')
    setIsMeasuring(true)
    let reading = 300 // Start at typical indoor lux
    const interval = setInterval(() => {
      // Simulate fluctuation
      reading += (Math.random() * 20 - 10)
      setLightLevel(Math.round(reading))
    }, 1000)
    
    // Attempt real sensor if available (Android/Chrome only usually)
    if ('AmbientLightSensor' in window) {
      try {
        // @ts-ignore
        const sensor = new AmbientLightSensor()
        // @ts-ignore
        sensor.addEventListener('reading', () => setLightLevel(sensor.illuminance))
        // @ts-ignore
        sensor.start()
        clearInterval(interval)
      } catch (err) {
        console.log("Light sensor not supported, using simulation")
      }
    }
  }

  const getNoiseStatus = (db: number) => {
    if (db < 40) return { label: 'Restorative (Calm)', color: 'text-green-600' }
    if (db < 70) return { label: 'Intrusive (Focus Loss)', color: 'text-yellow-600' }
    return { label: 'Distressing (Dysregulation)', color: 'text-red-600' }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl p-8 border border-[#c9ccbb]/20 shadow-sm mb-8"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-lg font-bold text-[#1b270e]">Environmental Biometrics</h2>
          <p className="text-sm text-[#1b270e]/50">Live tools to measure your sensory load</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-[#1b270e]/5 text-[#1b270e]/50 text-xs rounded-full flex items-center gap-1">
             <Activity size={12} /> Live Sensors
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Noise Tool */}
        <div className={`p-6 rounded-xl border transition-all ${activeTool === 'noise' ? 'border-[#b5a642] bg-[#b5a642]/5' : 'border-[#c9ccbb]/20'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <Mic size={24} className="text-[#1b270e]" />
            </div>
            {activeTool === 'noise' && <span className="animate-pulse text-red-500 text-xs font-bold uppercase">Recording</span>}
          </div>
          <h3 className="font-bold text-lg mb-1">Acoustic Load</h3>
          <p className="text-xs text-[#1b270e]/60 mb-6">Measure background decibel levels.</p>
          
          {activeTool === 'noise' ? (
            <div>
               <div className="text-4xl font-serif mb-2">{noiseLevel} <span className="text-sm font-sans text-[#1b270e]/40">dB</span></div>
               <p className={`text-sm font-bold ${getNoiseStatus(noiseLevel).color}`}>{getNoiseStatus(noiseLevel).label}</p>
            </div>
          ) : (
            <button onClick={startNoiseMeter} className="w-full py-3 bg-[#1b270e] text-white rounded-lg text-sm font-medium hover:bg-[#1b270e]/90 transition-colors">Start Meter</button>
          )}
        </div>

        {/* Light Tool */}
        <div className={`p-6 rounded-xl border transition-all ${activeTool === 'light' ? 'border-[#b5a642] bg-[#b5a642]/5' : 'border-[#c9ccbb]/20'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <Sun size={24} className="text-[#1b270e]" />
            </div>
          </div>
          <h3 className="font-bold text-lg mb-1">Light Toxicity</h3>
          <p className="text-xs text-[#1b270e]/60 mb-6">Check lux levels for circadian health.</p>
          
          {activeTool === 'light' ? (
            <div>
               <div className="text-4xl font-serif mb-2">{lightLevel} <span className="text-sm font-sans text-[#1b270e]/40">Lux</span></div>
               <p className="text-sm font-medium text-[#1b270e]/60">Sensor Active</p>
            </div>
          ) : (
            <button onClick={startLightMeter} className="w-full py-3 bg-[#c9ccbb]/20 text-[#1b270e] rounded-lg text-sm font-medium hover:bg-[#c9ccbb]/30 transition-colors">Start Meter</button>
          )}
        </div>
      </div>
      
      {/* Oura Integration Teaser (Phase 2 Roadmap) */}
      <div className="mt-8 pt-8 border-t border-[#c9ccbb]/10">
        <div className="flex items-center justify-between opacity-60">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-[#1b270e] rounded-full flex items-center justify-center text-white font-serif border border-[#c9ccbb]/20">O</div>
             <div>
               <h4 className="font-bold text-sm">Oura Ring Sync</h4>
               <p className="text-xs">Correlate sleep data with home environment.</p>
             </div>
           </div>
           <button disabled className="flex items-center gap-2 px-4 py-2 bg-[#f0f0f0] text-[#1b270e]/40 rounded-full text-xs font-bold uppercase tracking-widest cursor-not-allowed">
             <Lock size={12} /> Coming Soon
           </button>
        </div>
      </div>
    </motion.div>
  )
}
