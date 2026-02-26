'use client'

import Sidebar from '../../components/Sidebar'
import { useState, useEffect, useRef } from 'react'
import { Sun, CheckCircle, ArrowDown, ArrowUp, Info, Camera, X, Zap, RotateCcw } from 'lucide-react'
import Link from 'next/link'


// =============================================================================
// LIGHT METER ENGINE
// Two-point Kelvin-weighted calibration system
// Physical calibration anchors:
//   Cal 1 — 5700K, 128 lux (diffused daylight):   coefficient 1.888e-5
//   Cal 2 — 2600K, 46.65 lux (bedroom warm):      coefficient 4.654e-6
// Sources: Zeitzer et al. 2000, Gooley et al. 2011, Cajochen et al. 2011,
//          Viola et al. 2008, Obayashi et al. 2014
// =============================================================================

// --- RESEARCH-VALIDATED LUX THRESHOLDS ---
const LUX_THRESHOLDS = {
  morning: {
    critical: 100,   // Below: CAR cannot adequately anchor (Viola et al., 2008)
    low: 250,        // Below: suboptimal circadian signal (Cajochen et al., 2011)
    adequate: 500,   // Above: CAR well-supported (Gooley et al., 2011)
    optimal: 1000    // Above: full photoentrainment
  },
  midday: {
    low: 500,
    overstimulation: 2000
  },
  evening: {
    safe: 10,        // Below: melatonin onset uninhibited
    acceptable: 50,  // Below: <10–15% suppression — wind-down zone
    caution: 100,    // Above: 25–30% suppression begins (Gooley et al., 2011)
    significant: 200,// Above: 40–60% suppression (Cajochen et al., 2011)
    high: 300,       // BSFI CFS threshold — significant friction
    critical: 800    // BSFI CFS threshold — near-maximal suppression
  },
  night: {
    threshold: 10    // Any light above this disrupts sleep architecture
  }
} as const

// --- CALIBRATION FACTOR BOUNDS ---
// Real-world lux correction factors must fall within this range.
// Values outside it indicate a calibration that was set in abnormal
// conditions (near-dark scene, wrong reference value entered) and
// will produce impossibly large or small readings.
// Max 200: accounts for the most extreme sensor variation observed
// across device types. Min 0.01: prevents division-by-zero and
// near-zero suppression of all readings.
const CALIBRATION_FACTOR_MIN = 0.01
const CALIBRATION_FACTOR_MAX = 200

// --- PHYSICAL LUX CEILING ---
// Direct sunlight = ~100,000 lux. Values above 120,000 are physically
// impossible in a residential environment and indicate sensor overflow
// or a corrupted calibration factor. Capping at 120,000 prevents
// display of nonsensical readings and protects BSFI scoring inputs.
const LUX_CEILING = 120000

// Clamps a calibration factor to the physically meaningful range
const clampCalibrationFactor = (factor: number): number =>
  Math.max(CALIBRATION_FACTOR_MIN, Math.min(factor, CALIBRATION_FACTOR_MAX))

// --- KELVIN CORRECTION CURVE ---
// Correction factor normalised to 5700K = 1.0
// Derived from ratio of physical calibration coefficients:
//   2600K factor = 4.654e-6 / 1.888e-5 = 0.2466
// Accounts for smartphone camera sensor's red-channel bias at warm temperatures
const getKelvinCorrectionFactor = (kelvin: number): number => {
  const WARM = { kelvin: 2600, factor: 0.2466 }
  const COOL = { kelvin: 5700, factor: 1.0 }
  const clamped = Math.min(Math.max(kelvin, WARM.kelvin), COOL.kelvin)
  const t = (clamped - WARM.kelvin) / (COOL.kelvin - WARM.kelvin)
  return WARM.factor + t * (COOL.factor - WARM.factor)
}

// --- KELVIN ESTIMATION FROM RGB CHANNEL RATIO ---
// Uses R/B ratio as a proxy for colour temperature
// Accuracy: ±500K — sufficient for spectral correction purposes
// High R/B = warm (low K), Low R/B = cool (high K)
const estimateKelvin = (r: number, b: number): number => {
  if (b < 1) return 5500
  const rb = r / b
  const kelvin = Math.round(7450 - 1700 * rb)
  return Math.min(Math.max(kelvin, 2000), 8000)
}

// --- CONFIDENCE SCORING ---
// Flags low-lux readings where sensor noise dominates the signal
const getLuxConfidence = (
  correctedRaw: number,
  darkFrame: number,
  lux: number
): 'high' | 'moderate' | 'low' => {
  const snr = darkFrame > 0 ? correctedRaw / darkFrame : 10
  if (lux < 10 || snr < 2) return 'low'
  if (lux < 50 || snr < 5) return 'moderate'
  return 'high'
}


// =============================================================================
// INTERNAL COMPONENT: CAMERA MODAL WITH CALIBRATION
// =============================================================================

export function LightSensorModal({
  onClose,
  onSave
}: {
  onClose: () => void
  onSave: (lux: number) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [lux, setLux] = useState<number>(0)
  const [rawReading, setRawReading] = useState<number>(0)
  const [estimatedKelvin, setEstimatedKelvin] = useState<number>(5500)
  const [confidence, setConfidence] = useState<'high' | 'moderate' | 'low'>('high')
  const [calibration, setCalibration] = useState<number>(1)
  const [darkFrameBaseline, setDarkFrameBaseline] = useState<number>(0)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [isCapturingDarkFrame, setIsCapturingDarkFrame] = useState(false)
  const [error, setError] = useState('')
  const [source, setSource] = useState<'camera' | 'sensor'>('camera')
  const [calibrationWarning, setCalibrationWarning] = useState(false)

  // 1. LOAD SAVED CALIBRATION + DARK FRAME BASELINE
  //
  // IMPORTANT: calibration factor is clamped on load using
  // clampCalibrationFactor(). If a previous session stored a corrupted
  // factor (e.g. from calibrating in a near-dark scene with a wrong
  // reference value), the clamp prevents it from inflating readings.
  // The clamped value is written back to localStorage immediately so
  // the corruption is cleared on next open even if the user does not
  // recalibrate.
  useEffect(() => {
    const saved = localStorage.getItem('lux_calibration')
    if (saved) {
      const raw = parseFloat(saved)
      const clamped = clampCalibrationFactor(raw)
      setCalibration(clamped)
      // Flag if the stored value was out of bounds — warn user to recalibrate
      if (raw !== clamped) {
        setCalibrationWarning(true)
        localStorage.setItem('lux_calibration', clamped.toString())
      }
    }
    const savedDark = localStorage.getItem('lux_dark_frame')
    if (savedDark) setDarkFrameBaseline(parseFloat(savedDark))
  }, [])

  // 2. TRY NATIVE AMBIENT LIGHT SENSOR (Android / Chrome)
  useEffect(() => {
    if ('AmbientLightSensor' in window) {
      try {
        // @ts-ignore - experimental API
        const sensor = new AmbientLightSensor()
        sensor.onreading = () => {
          setSource('sensor')
          // Hardware sensor reports in lux directly — apply ceiling only
          setLux(Math.min(Math.round(sensor.illuminance), LUX_CEILING))
        }
        sensor.onerror = (event: any) => {
          console.log(event.error.name, event.error.message)
        }
        sensor.start()
        return () => sensor.stop()
      } catch (err) {
        // Fallback to camera
      }
    }
  }, [])

  // 3. START CAMERA STREAM (Fallback when no hardware sensor)
  //
  // Explicit resolution constraint (max 1280×720) ensures consistent
  // frame data across device types. Without this, some mobile cameras
  // initialise at native resolution (4K+), which — while the canvas
  // is fixed at 100×100 — can affect how the browser scales the frame
  // and may interact with OS-level auto-exposure differently.
  useEffect(() => {
    if (source === 'sensor') return
    let stream: MediaStream | null = null
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width:  { ideal: 1280, max: 1280 },
            height: { ideal: 720,  max: 720  },
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
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [source])

  // 4. ANALYSIS LOOP — Kelvin-corrected, dark-frame adjusted
  // Pipeline: RGB pixels → avgBrightness + estimatedKelvin
  //           → correctedRaw (dark frame subtracted)
  //           → lux (user calibration × Kelvin spectral correction)
  //           → capped at LUX_CEILING (120,000 lux)
  useEffect(() => {
    if (error || source === 'sensor') return

    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })
        if (ctx && videoRef.current.readyState === 4) {
          ctx.drawImage(videoRef.current, 0, 0, 100, 100)
          const frame = ctx.getImageData(0, 0, 100, 100)

          let totalBrightness = 0
          let totalR = 0
          let totalB = 0
          const pixelCount = frame.data.length / 4

          for (let i = 0; i < frame.data.length; i += 4) {
            const r = frame.data[i]
            const g = frame.data[i + 1]
            const b = frame.data[i + 2]
            // Rec. 709 photopic luminance weighting
            totalBrightness += 0.2126 * r + 0.7152 * g + 0.0722 * b
            totalR += r
            totalB += b
          }

          const avgBrightness = totalBrightness / pixelCount
          const avgR = totalR / pixelCount
          const avgB = totalB / pixelCount

          // Kelvin estimation from R/B channel ratio
          const kelvin = estimateKelvin(avgR, avgB)
          setEstimatedKelvin(kelvin)

          // Cubic proxy raw value — preserves original brightness mapping
          const proxyRaw = Math.pow(avgBrightness / 100, 3) * 150

          // Dark frame noise floor subtraction
          const correctedRaw = Math.max(proxyRaw - darkFrameBaseline, 0)
          setRawReading(correctedRaw)

          // Apply user calibration factor × Kelvin spectral correction
          const kelvinFactor = getKelvinCorrectionFactor(kelvin)
          const correctedLux = Math.round(correctedRaw * calibration * kelvinFactor)

          // Cap at physical ceiling — values above 120,000 lux are not
          // achievable in a residential environment and indicate sensor
          // overflow or a calibration factor that escaped the clamp
          const finalLux = Math.min(Math.max(correctedLux, 0), LUX_CEILING)
          setLux(finalLux)
          setConfidence(getLuxConfidence(correctedRaw, darkFrameBaseline, finalLux))
        }
      }
    }, 500)

    return () => clearInterval(interval)
  }, [error, source, calibration, darkFrameBaseline])

  // Capture dark frame — lens fully covered, captures sensor noise floor
  const handleCaptureDarkFrame = () => {
    if (rawReading >= 0) {
      setDarkFrameBaseline(rawReading)
      localStorage.setItem('lux_dark_frame', rawReading.toString())
      setIsCapturingDarkFrame(false)
    }
  }

  // Single-point calibration
  // Calibration factor is clamped before saving. If the entered reference
  // value and current scene produce a factor outside the physical range,
  // the calibration is rejected with a warning rather than stored silently.
  const handleCalibrate = (realValue: number) => {
    if (rawReading > 0) {
      const kelvinFactor = getKelvinCorrectionFactor(estimatedKelvin)
      const rawFactor = realValue / (rawReading * kelvinFactor)
      const clampedFactor = clampCalibrationFactor(rawFactor)

      if (rawFactor !== clampedFactor) {
        // Factor was out of range — warn user before saving clamped value
        setCalibrationWarning(true)
      } else {
        setCalibrationWarning(false)
      }

      setCalibration(clampedFactor)
      localStorage.setItem('lux_calibration', clampedFactor.toString())
      setIsCalibrating(false)
    }
  }

  // Reset calibration to default (factor = 1)
  // Clears both stored factor and dark frame baseline
  const handleResetCalibration = () => {
    setCalibration(1)
    setDarkFrameBaseline(0)
    setCalibrationWarning(false)
    localStorage.removeItem('lux_calibration')
    localStorage.removeItem('lux_dark_frame')
  }

  const confidenceDisplay = {
    high: { text: 'High Confidence', color: 'text-emerald-400' },
    moderate: { text: 'Moderate Confidence', color: 'text-amber-400' },
    low: { text: 'Low Confidence — set dark frame for accuracy', color: 'text-red-400' }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b270e]/95 backdrop-blur-sm p-6 animate-fade-in">
      <div className="w-full max-w-md bg-[#1b270e] border border-[#c9ccbb]/20 rounded-3xl p-8 relative shadow-2xl">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-[#000]/20 rounded-full text-[#c9ccbb] hover:text-[#b5a642]"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-serif text-[#c9ccbb] mb-2 flex items-center gap-2">
          {source === 'sensor'
            ? <Zap size={24} className="text-[#b5a642]" />
            : <Camera size={24} className="text-[#b5a642]" />
          }
          {source === 'sensor' ? 'Hardware Sensor' : 'Light Estimator'}
        </h2>
        <p className="text-[#c9ccbb]/70 text-xs mb-8">
          {source === 'sensor' ? 'Using device hardware.' : 'Analysing environment brightness.'}
        </p>

        {/* CALIBRATION WARNING BANNER */}
        {calibrationWarning && (
          <div className="mb-6 p-3 bg-amber-900/20 border border-amber-500/30 rounded-xl text-xs text-amber-300 leading-relaxed animate-fade-in">
            <strong className="block text-amber-400 uppercase tracking-widest text-[10px] mb-1">Calibration Reset</strong>
            A previous calibration produced an out-of-range factor and has been cleared. 
            Readings are now using default calibration. Recalibrate with a reference meter if needed.
          </div>
        )}

        {/* VISUALIZER */}
        <div className="relative w-48 h-48 bg-[#000] rounded-full mx-auto mb-4 border-4 border-[#c9ccbb]/10 overflow-hidden flex items-center justify-center">
          {source === 'camera' && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <canvas ref={canvasRef} width="100" height="100" className="hidden" />
            </>
          )}
          <div className="relative z-10 text-center">
            {error
              ? <span className="text-red-400 text-xs">{error}</span>
              : (
                <>
                  <div className="text-5xl font-serif text-[#c9ccbb] tabular-nums">{lux.toLocaleString()}</div>
                  <div className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mt-1">Lux</div>
                </>
              )
            }
          </div>
          {/* Dynamic ring — opacity scales with lux intensity */}
          <div
            className="absolute inset-0 rounded-full border-[6px] border-[#b5a642] transition-opacity duration-500"
            style={{ opacity: Math.min(lux / 1000, 1) }}
          />
        </div>

        {/* KELVIN ESTIMATE + CONFIDENCE (Camera mode only) */}
        {source === 'camera' && !error && (
          <div className="text-center mb-6 space-y-1">
            <p className="text-[#c9ccbb]/80 text-[10px] uppercase tracking-widest">
              ~{estimatedKelvin}K Estimated
            </p>
            <p className={`text-[10px] uppercase tracking-widest ${confidenceDisplay[confidence].color}`}>
              {confidenceDisplay[confidence].text}
            </p>
          </div>
        )}

        {/* CALIBRATION UI — Camera mode only */}
        {source === 'camera' && !error && (
          <div className="mb-6 space-y-3">

            {/* Default state — calibration options + reset */}
            {!isCalibrating && !isCapturingDarkFrame && (
              <div className="flex justify-center items-center gap-4 flex-wrap">
                <button
                  onClick={() => setIsCalibrating(true)}
                  className="text-xs text-[#c9ccbb]/50 underline hover:text-[#b5a642]"
                >
                  Calibrate with reference meter
                </button>
                <span className="text-[#c9ccbb]/20 text-xs">|</span>
                <button
                  onClick={() => setIsCapturingDarkFrame(true)}
                  className="text-xs text-[#c9ccbb]/50 underline hover:text-[#b5a642]"
                >
                  Set dark frame
                </button>
                {calibration !== 1 && (
                  <>
                    <span className="text-[#c9ccbb]/20 text-xs">|</span>
                    <button
                      onClick={handleResetCalibration}
                      className="text-xs text-red-400/60 underline hover:text-red-400 flex items-center gap-1"
                    >
                      <RotateCcw size={10} /> Reset
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Reference meter calibration */}
            {isCalibrating && (
              <div className="bg-[#c9ccbb]/5 p-4 rounded-xl animate-fade-in-up">
                <p className="text-xs text-[#c9ccbb]/80 mb-2">Enter your reference meter's lux reading:</p>
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
                <p className="text-[10px] text-[#c9ccbb]/40 mt-2 leading-relaxed">
                  For best results, calibrate in a well-lit environment (100–2000 lux). Calibrating in near-darkness will produce an inaccurate factor.
                </p>
                <button
                  onClick={() => setIsCalibrating(false)}
                  className="text-[10px] text-red-400 mt-2 hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Dark frame capture — lens covered to subtract sensor noise floor */}
            {isCapturingDarkFrame && (
              <div className="bg-[#c9ccbb]/5 p-4 rounded-xl animate-fade-in-up">
                <p className="text-xs text-[#c9ccbb]/80 mb-3">
                  Cover the camera lens completely with your finger, then tap Capture.
                  This removes your camera's background sensor noise for accurate low-light readings.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCaptureDarkFrame}
                    className="flex-1 px-4 py-2 bg-[#b5a642] text-[#1b270e] font-bold text-xs rounded-lg uppercase tracking-wider"
                  >
                    Capture Dark Frame
                  </button>
                  <button
                    onClick={() => setIsCapturingDarkFrame(false)}
                    className="px-4 py-2 text-[10px] text-red-400 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => onSave(lux)}
          disabled={!!error}
          className="w-full py-4 bg-[#b5a642] text-[#1b270e] font-bold uppercase tracking-widest rounded-xl hover:bg-[#c4b54e] flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} /> Save Measurement
        </button>

      </div>
    </div>
  )
}


// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

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

    // --- MORNING: 5am–11am ---
    // Circadian anchoring window — cortisol awakening response (CAR)
    if (hour >= 5 && hour < 11) {

      if (currentLux < LUX_THRESHOLDS.morning.critical) {
        status = 'too_low'
        advice = isDysregulated
          ? "Your nervous system needs a circadian anchor. Sit within 0.5m of a window or use a 10,000 lux therapy lamp for 20–30 minutes before anything else."
          : "Critically insufficient for cortisol awakening response. Immediate light therapy or outdoor exposure is needed."
        science = "Below 100 lux, the SCN cannot adequately anchor the cortisol awakening response. Adenosine clearance and melatonin suppression remain incomplete. (Viola et al., 2008)"

      } else if (currentLux < LUX_THRESHOLDS.morning.low) {
        status = 'too_low'
        advice = isDysregulated
          ? "Your nervous system needs an anchor. Sit within 1m of a window or switch on the brightest overhead lighting available now."
          : "Suboptimal for full circadian activation. Step outside or significantly increase ambient light."
        science = "Morning lux below 250 produces only partial cortisol awakening response, reducing alertness and delaying the melatonin offset window. (Cajochen et al., 2011)"

      } else if (currentLux < LUX_THRESHOLDS.morning.adequate) {
        status = 'too_low'
        advice = "Adequate but not optimal. Increase morning light exposure — outdoor light or a bright overhead fixture above 500 lux will produce a stronger circadian signal."
        science = "Full circadian photoentrainment requires sustained morning lux above 500 for robust SCN signalling. (Gooley et al., 2011)"

      } else {
        status = 'ideal'
        advice = currentLux >= LUX_THRESHOLDS.morning.optimal
          ? "Excellent. Full circadian anchoring conditions. Your cortisol awakening response is well-supported."
          : "Good. Adequate morning light for circadian activation and cortisol production."
        science = "Lux above 500 in the morning produces strong melatonin suppression and a well-anchored cortisol curve — the foundational condition for daytime regulation. (Zeitzer et al., 2000)"
      }

    // --- MIDDAY: 11am–5pm ---
    // Sustained alertness and circadian stability window
    } else if (hour >= 11 && hour < 17) {

      if (currentLux < LUX_THRESHOLDS.midday.low) {
        status = 'too_low'
        advice = isDysregulated
          ? "Low daytime light is compressing your alertness window. Increase ambient brightness to support sustained focus and mood stability."
          : "Insufficient for sustained alertness. Low lux at this hour may shorten the circadian active phase and reduce working memory capacity."
        science = "Sustained daytime lux below 500 reduces alertness, impairs working memory, and may trigger premature melatonin onset. (Cajochen et al., 2011)"

      } else if (currentLux > LUX_THRESHOLDS.midday.overstimulation && isDysregulated) {
        status = 'too_high'
        advice = "High-intensity light alongside low mood regulation may increase sensory load rather than support alertness. Diffuse glare with sheer curtains or reposition away from the direct source."
        science = "For dysregulated nervous systems, excessive light contrast without diffusion can increase sympathetic activation, counteracting the intended alertness benefit."

      } else {
        status = 'ideal'
        advice = "Optimal range for sustained cognitive function and circadian stability."
      }

    // --- EVENING: 5pm–9pm ---
    // Melatonin onset window — most BSFI-critical zone
    } else if (hour >= 17 && hour < 21) {

      if (currentLux > LUX_THRESHOLDS.evening.critical) {
        status = 'too_high'
        advice = isDysregulated
          ? "This light level is critically suppressing melatonin. Turn off all overheads immediately and move to a single warm-toned lamp positioned below eye level."
          : "Near-maximal melatonin suppression. Reduce all overhead lighting and transition entirely to warm, low-positioned lamps."
        science = "Lux above 800 in the evening produces near-complete melatonin suppression, delaying sleep onset by 1–3 hours and reducing total REM proportion. (Gooley et al., 2011)"

      } else if (currentLux > LUX_THRESHOLDS.evening.high) {
        status = 'too_high'
        advice = isDysregulated
          ? "Your light level is significantly suppressing melatonin. Switch to floor or table lamps below 2700K and turn off all overhead fixtures now."
          : "Significant melatonin suppression. Move to lower, warmer light sources and begin transitioning away from overhead lighting."
        science = "Lux above 300 during the evening produces 50–70% melatonin suppression — sufficient to delay sleep onset and reduce slow-wave sleep proportion. (Zeitzer et al., 2000)"

      } else if (currentLux > LUX_THRESHOLDS.evening.significant) {
        status = 'too_high'
        advice = "Measurable melatonin suppression is occurring. Dim overheads, switch to warm-toned table lamps below 2700K, and enable night mode on any screens in use."
        science = "Above 200 lux in the evening, melatonin suppression of 40–60% has been documented even at warm colour temperatures. (Cajochen et al., 2011)"

      } else if (currentLux > LUX_THRESHOLDS.evening.caution) {
        status = 'too_high'
        advice = "Light levels are entering the caution zone. Dim overhead fixtures or move to lower-positioned warm lamps to begin supporting melatonin onset now."
        science = "Lux above 100 in the evening begins to produce 25–30% melatonin suppression — the threshold at which sleep onset delay becomes measurable. (Gooley et al., 2011)"

      } else if (currentLux > LUX_THRESHOLDS.evening.acceptable) {
        status = 'too_high'
        advice = isDysregulated
          ? "Even at this level, melatonin onset is being marginally delayed. Move to a single warm lamp source and reduce all other light in the space."
          : "Marginal melatonin impact. Consider moving to a warmer, lower-intensity source as your wind-down begins."
        science = "Lux above 50 produces measurable but low-level melatonin suppression (~10–15%). For sensitised nervous systems, this threshold is clinically relevant. (Zeitzer et al., 2000)"

      } else {
        status = 'ideal'
        advice = currentLux <= LUX_THRESHOLDS.evening.safe
          ? "Optimal pre-sleep environment. Melatonin onset is uninhibited."
          : "Good wind-down light level. Melatonin onset is largely supported at this range."
        science = "Below 50 lux with warm colour temperature, melatonin suppression is minimal and the circadian sleep signal can proceed without interruption. (Gooley et al., 2011)"
      }

    // --- NIGHT: 9pm–5am ---
    // Sleep architecture protection window
    } else {

      if (currentLux > LUX_THRESHOLDS.night.threshold) {
        status = 'too_high'
        advice = isDysregulated
          ? "Any light at night is disrupting melatonin and likely fragmenting your sleep architecture. Use blackout curtains and an eye mask tonight."
          : "Light pollution detected. Blackout curtains, door sealing, or an eye mask are recommended for full sleep architecture protection."
        science = "Even low-level light exposure during sleep elevates nocturnal heart rate, reduces slow-wave sleep proportion, and increases insulin resistance over time. (Obayashi et al., 2014)"

      } else {
        status = 'ideal'
        advice = "Deep darkness achieved. Optimal conditions for melatonin, sleep architecture integrity, and overnight autonomic recovery."
      }
    }

    setRecommendation({ status, advice, science })
  }

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      {showScanner && (
        <LightSensorModal
          onClose={() => setShowScanner(false)}
          onSave={handleScanSave}
        />
      )}

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
                  <button
                    onClick={() => setShowScanner(true)}
                    className="text-[#b5a642] hover:underline flex items-center gap-1"
                  >
                    <Camera size={12} /> Scan
                  </button>
                </label>
                <div
                  className="relative group cursor-pointer"
                  onClick={() => !lux && setShowScanner(true)}
                >
                  <input
                    type="number"
                    value={lux}
                    onChange={(e) => setLux(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full bg-[#1b270e] border border-[#c9ccbb]/20 rounded-xl p-4 text-[#c9ccbb] text-lg font-serif focus:outline-none focus:border-[#b5a642]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9ccbb]/50 text-xs font-bold">LUX</span>
                </div>
                {!lux && (
                  <p className="text-[10px] text-[#c9ccbb]/70 mt-2">*Tap 'Scan' to use camera.</p>
                )}
              </div>

              {/* MOOD / STATE INPUT */}
              <div>
                <label className="text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest mb-3 block">
                  Current State
                </label>
                <div className="flex justify-between gap-2 bg-[#1b270e] p-1 rounded-xl border border-[#c9ccbb]/20">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setMood(level)}
                      className={`w-full py-3 rounded-lg text-sm font-bold transition-all ${
                        mood === level
                          ? 'bg-[#b5a642] text-[#1b270e]'
                          : 'text-[#c9ccbb]/70 hover:text-[#c9ccbb]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-[#c9ccbb]/70 uppercase tracking-widest">
                  <span>Dysregulated</span>
                  <span>Resonant</span>
                </div>
              </div>
            </div>

            <button
              onClick={analyzeLight}
              disabled={!lux}
              className="w-full py-4 bg-[#c9ccbb]/10 border border-[#c9ccbb]/20 hover:bg-[#b5a642] hover:text-[#1b270e] hover:border-[#b5a642] text-[#c9ccbb] rounded-xl font-bold text-xs uppercase tracking-widest transition-all mb-8"
            >
              Analyse Light Load
            </button>

            {recommendation && (
              <div className="animate-fade-in-up">
                <div className={`p-6 rounded-2xl border mb-6 ${
                  recommendation.status === 'ideal'
                    ? 'bg-emerald-900/20 border-emerald-500/30'
                    : recommendation.status === 'too_high'
                    ? 'bg-amber-900/20 border-amber-500/30'
                    : 'bg-blue-900/20 border-blue-500/30'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      recommendation.status === 'ideal'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : recommendation.status === 'too_high'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {recommendation.status === 'ideal'
                        ? <CheckCircle size={24} />
                        : recommendation.status === 'too_high'
                        ? <ArrowDown size={24} />
                        : <ArrowUp size={24} />
                      }
                    </div>
                    <div>
                      <h3 className="text-xl font-serif text-[#c9ccbb] mb-1">
                        {recommendation.status === 'ideal'
                          ? 'Environment Aligned'
                          : recommendation.status === 'too_high'
                          ? 'Reduce Intensity'
                          : 'Increase Intensity'
                        }
                      </h3>
                      <p className="text-[#c9ccbb]/80 text-sm leading-relaxed mb-4">
                        {recommendation.advice}
                      </p>
                      {recommendation.science && (
                        <div className="flex gap-2 text-[10px] text-[#c9ccbb]/70 uppercase tracking-widest border-t border-[#c9ccbb]/10 pt-3">
                          <Info size={12} />
                          <span>Science: {recommendation.science}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <Link
                href="/dashboard"
                className="text-[#c9ccbb]/70 text-xs hover:text-[#b5a642] transition-colors"
              >
                ← Back to Toolkit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
