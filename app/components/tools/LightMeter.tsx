'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Zap, RefreshCw, Camera } from 'lucide-react'

interface LightMeterProps {
  onClose: () => void
  onSave: (lux: number) => void
}

export default function LightMeter({ onClose, onSave }: LightMeterProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [lux, setLux] = useState<number>(0)
  const [isScanning, setIsScanning] = useState(true)
  const [error, setError] = useState('')

  // 1. START CAMERA
  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } // Use back camera if available
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        setError('Camera access denied. We need the camera to measure reflected light.')
        setIsScanning(false)
      }
    }

    if (isScanning) startCamera()

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop())
    }
  }, [isScanning])

  // 2. ANALYZE BRIGHTNESS LOOP
  useEffect(() => {
    if (!isScanning || error) return

    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          // Draw current video frame to canvas
          canvas.width = 100 // Low res is fine for brightness
          canvas.height = 100
          ctx.drawImage(video, 0, 0, 100, 100)

          // Get pixel data
          const frame = ctx.getImageData(0, 0, 100, 100)
          const data = frame.data
          let totalBrightness = 0

          // Calculate average Luma (perceived brightness)
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            // Standard Luma formula (Rec. 709)
            const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
            totalBrightness += luma
          }

          const avgLuma = totalBrightness / (data.length / 4)
          
          // MAP LUMA TO APPROXIMATE LUX (Calibration estimation)
          // This is a rough logarithmic mapping for web
          const estimatedLux = Math.round(Math.pow(avgLuma / 255, 2.2) * 1000)
          
          setLux(Math.max(10, estimatedLux)) // Min 10 lux to avoid 0
        }
      }
    }, 500) // Update every 500ms

    return () => clearInterval(interval)
  }, [isScanning, error])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b270e]/95 backdrop-blur-sm p-6">
      <div className="w-full max-w-md bg-[#1b270e] border border-[#c9ccbb]/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-[#000]/20 rounded-full text-[#c9ccbb] hover:bg-[#b5a642]/20 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-serif text-[#c9ccbb] mb-2 flex items-center gap-2">
          <Zap size={24} className="text-[#b5a642]" /> Light Estimator
        </h2>
        <p className="text-[#c9ccbb]/50 text-xs mb-8">
          Using camera sensor to measure ambient reflected light. Point at your workspace.
        </p>

        {/* VISUALIZER */}
        <div className="relative w-full aspect-square bg-[#000] rounded-full mx-auto mb-8 border-4 border-[#c9ccbb]/10 overflow-hidden flex items-center justify-center">
            {/* Hidden Video Feed (We analyze this but show a clean UI) */}
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-30" />
            <canvas ref={canvasRef} className="hidden" />

            {/* The Number */}
            <div className="relative z-10 text-center">
                {error ? (
                    <div className="text-red-400 text-xs max-w-[150px]">{error}</div>
                ) : (
                    <>
                        <div className="text-6xl font-serif text-[#c9ccbb] tabular-nums tracking-tighter">
                            {lux}
                        </div>
                        <div className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mt-2">
                            Lux (Est.)
                        </div>
                    </>
                )}
            </div>
            
            {/* Dynamic Ring Glow based on brightness */}
            <div 
                className="absolute inset-0 rounded-full border-[10px] border-[#b5a642] transition-all duration-500"
                style={{ opacity: Math.min(lux / 800, 1) }} // Brightens as lux increases
            />
        </div>

        {/* GUIDANCE */}
        <div className="bg-[#b5a642]/5 rounded-xl p-4 mb-6 border border-[#b5a642]/10 text-center">
            <p className="text-[#c9ccbb]/80 text-sm">
                {lux < 50 ? "Too dim for focus work." : 
                 lux < 300 ? "Relaxing / Evening levels." : 
                 "Good for alertness & focus."}
            </p>
        </div>

        {/* ACTIONS */}
        <button 
          onClick={() => onSave(lux)}
          disabled={!!error}
          className="w-full py-4 bg-[#b5a642] text-[#1b270e] font-bold uppercase tracking-widest rounded-xl hover:bg-[#c4b54e] transition-all flex items-center justify-center gap-2"
        >
          <Camera size={18} /> Save Measurement
        </button>

      </div>
    </div>
  )
}
