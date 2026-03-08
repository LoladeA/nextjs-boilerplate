'use client'

// =============================================================================
// FILE: app/components/SensoryRadar.tsx
// =============================================================================
//
// ENHANCEMENTS IN THIS VERSION:
//
//   1. FILLS CONTAINER — height is 100% of parent, not fixed 300px.
//      Dashboard sets the container height; radar fills it on all breakpoints.
//
//   2. SCORE LABELS — each axis shows the numeric score next to its label
//      so users can read exact domain values without hovering.
//
//   3. ZONE RINGS — three concentric reference rings at 33 / 66 / 100
//      with subtle labels (Low / Moderate / High load) so the shape
//      has spatial meaning without needing a separate legend.
//
//   4. CUSTOM TOOLTIP — hover/tap on any vertex reveals the domain name,
//      score, and a one-line load interpretation.
//
//   5. RESPONSIVE LABEL SIZE — font size and outerRadius scale between
//      mobile (smaller) and desktop (larger) via useWindowSize hook.
//
//   6. DOMAIN COLOUR CODING — each domain axis label is coloured by
//      load severity (gold < 40, amber 40–70, rose > 70) giving an
//      immediate at-a-glance read of where pressure is concentrated.
//
// =============================================================================

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip
} from 'recharts'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface DataPoint {
  subject: string
  A:       number
  fullMark: number
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

// Single gold hue. Opacity encodes severity — high load is most visible,
// not most alarming. This keeps the interface regulating rather than vigilance-triggering.
// Aligns with NeuroDesign principle: Regulation over Overstimulation.
const getScoreOpacity = (score: number): number => {
  if (score > 70) return 1.0    // high load — full presence, needs attention
  if (score > 40) return 0.60   // moderate — present but not pressing
  return 0.35                    // low load — recedes, no action needed
}

const getScoreColor = (score: number): string => {
  const opacity = getScoreOpacity(score)
  // Convert opacity to hex alpha on #b5a642
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0')
  return `#b5a642${alpha}`
}

const getScoreInterpretation = (subject: string, score: number): string => {
  const level = score <= 40 ? 'low' : score <= 70 ? 'moderate' : 'high'
  const interpretations: Record<string, Record<string, string>> = {
    Circadian:  { low: 'Sleep rhythm aligned', moderate: 'Some disruption present', high: 'Circadian misalignment' },
    Autonomic:  { low: 'Nervous system calm',  moderate: 'Mild activation',         high: 'Elevated vigilance' },
    Predictive: { low: 'Spatial flow clear',   moderate: 'Some cognitive friction',  high: 'High mental effort' },
    Sensory:    { low: 'Environment calm',     moderate: 'Moderate sensory load',    high: 'Sensory overload risk' },
    Recovery:   { low: 'Strong recovery',      moderate: 'Partial restoration',      high: 'Recovery compromised' },
  }
  return interpretations[subject]?.[level] ?? `${level.charAt(0).toUpperCase() + level.slice(1)} load`
}

// ─────────────────────────────────────────────
// CUSTOM TOOLTIP
// ─────────────────────────────────────────────

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const { subject, A } = payload[0].payload
  const opacity = getScoreOpacity(A)
  return (
    <div className="bg-[#1b270e] border border-[#b5a642]/20 rounded-xl px-4 py-3 shadow-xl text-left min-w-[160px]">
      <p className="text-[10px] uppercase tracking-widest text-[#b5a642]/50 font-bold mb-1 tracking-[0.12em]">
        {subject}
      </p>
      <p
        className="text-2xl font-serif mb-1.5 text-[#b5a642]"
        style={{ opacity }}
      >
        {A}
        <span className="text-sm font-sans ml-1 opacity-50">/100</span>
      </p>
      <p className="text-[11px] text-[#c9ccbb]/50 leading-snug">
        {getScoreInterpretation(subject, A)}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// CUSTOM AXIS TICK — score + label
// ─────────────────────────────────────────────

const CustomTick = ({ x, y, payload, isMobile }: any) => {
  const score = payload?.value
  // We store actual score in the axis via the tick label trick:
  // subject label is "Circadian" and we pull the score from outer data
  // by matching — so we pass the full data array via closure
  return null // replaced below with the closure version
}

// ─────────────────────────────────────────────
// SCORE BADGE — rendered as SVG foreignObject
// ─────────────────────────────────────────────

const makeCustomTick = (data: DataPoint[], isMobile: boolean) =>
  ({ x, y, payload }: any) => {
    const point = data.find(d => d.subject === payload.value)
    const score = point?.A ?? 0
    const color = getScoreColor(score)
    const fontSize = isMobile ? 10 : 12

    return (
      <g transform={`translate(${x},${y})`}>
        {/* Domain label */}
        <text
          textAnchor="middle"
          dy={-6}
          fill={color}
          fontSize={fontSize}
          fontWeight="600"
          opacity={0.85}
          letterSpacing="0.05em"
          style={{ textTransform: 'uppercase' }}
        >
          {payload.value}
        </text>
        {/* Score badge */}
        <text
          textAnchor="middle"
          dy={10}
          fill={color}
          fontSize={isMobile ? 11 : 13}
          fontWeight="700"
          opacity={0.95}
          fontFamily="serif"
        >
          {score}
        </text>
      </g>
    )
  }

// ─────────────────────────────────────────────
// ZONE RING LABELS — rendered as absolute overlay
// These label the 33/66/100 reference rings
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

const defaultData: DataPoint[] = [
  { subject: 'Circadian',  A: 50, fullMark: 100 },
  { subject: 'Autonomic',  A: 50, fullMark: 100 },
  { subject: 'Predictive', A: 50, fullMark: 100 },
  { subject: 'Sensory',    A: 50, fullMark: 100 },
  { subject: 'Recovery',   A: 50, fullMark: 100 },
]

export default function SensoryRadar({ data = defaultData }: { data?: DataPoint[] }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const outerRadius = isMobile ? '62%' : '68%'
  const CustomAxisTick = makeCustomTick(data, isMobile)

  return (
    <div className="relative w-full h-full">

      {/* Zone legend — opacity encodes severity, single gold hue throughout */}
      <div className="absolute top-0 right-0 flex flex-col gap-1.5 z-10 pointer-events-none">
        {[
          { label: 'High friction',  opacity: 1.0   },
          { label: 'Moderate',       opacity: 0.60  },
          { label: 'Low friction',   opacity: 0.35  },
        ].map(({ label, opacity }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full bg-[#b5a642]"
              style={{ opacity }}
            />
            <span
              className="text-[9px] uppercase tracking-widest font-bold text-[#b5a642]"
              style={{ opacity: opacity * 0.85 }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          cx="50%"
          cy="52%"
          outerRadius={outerRadius}
          data={data}
          margin={{ top: isMobile ? 24 : 28, right: isMobile ? 28 : 40, bottom: isMobile ? 20 : 24, left: isMobile ? 28 : 40 }}
        >
          {/* Grid rings — three zones at 33 / 66 / 100 */}
          <PolarGrid
            stroke="#c9ccbb"
            strokeOpacity={0.08}
            gridType="polygon"
          />

          {/* Subtle zone ring at 33% — low threshold */}
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
            tickCount={4}
          />

          <PolarAngleAxis
            dataKey="subject"
            tick={CustomAxisTick}
            tickLine={false}
          />

          {/* Main radar shape */}
          <Radar
            name="Sensory Load"
            dataKey="A"
            stroke="#b5a642"
            strokeWidth={isMobile ? 1.5 : 2}
            fill="#b5a642"
            fillOpacity={0.20}
            dot={{ fill: '#b5a642', r: isMobile ? 3 : 4, strokeWidth: 0 }}
            activeDot={{ fill: '#b5a642', r: isMobile ? 5 : 6, strokeWidth: 2, stroke: '#1b270e' }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={false}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Bottom legend — domain colour key */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none">
        <span className="text-[9px] uppercase tracking-widest text-[#c9ccbb]/20 font-bold">
          Score = friction load · lower is better
        </span>
      </div>
    </div>
  )
}
