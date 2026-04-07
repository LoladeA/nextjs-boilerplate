'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, Lock, Zap, Brain, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { neuroInsights } from '../data/neuro-insights'

// ---------------------------------------------------------------------------
// NeuroFlashcard
//
// Front (free for all users):
//   Science Fact + Why This Matters
//
// Back (Core tier and above):
//   Full protocol — Primary Adjustment, Refinement, Why It Works,
//   Integration Cue
//
// Access is resolved entirely by the `isPremium` prop passed from
// DashboardUI, which reads from /api/subscription-status. There is no
// internal auth check here — the component trusts the prop and renders
// accordingly. God mode is handled upstream in DashboardUI.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// DOMAIN CARD POOLS
//
// Every card is assigned to exactly one pool. Assignment is based on the
// primary nervous system pathway the card addresses, not the category label.
//
// LIGHT   — circadian timing, melanopsin, cortisol awakening, blue-light
//           suppression, lux thresholds, dawn simulation, seasonal light
// VISUAL  — visual load, glare, patterns, colour saturation, spatial volume,
//           biophilic visual input, mirror placement, focal point, flicker
// ACOUSTIC — reverberation, masking, low-frequency, prosodic clarity,
//            acoustic privacy, vagal acoustic response, BPM entrainment
// GENERAL — all remaining categories: thermal, tactile, proprioception,
//           olfactory, behavioural architecture, polyvagal, neurodivergent,
//           interoception, hormonal cycles, attention restoration, grief,
//           spatial identity, life transitions, kitchen, smart technology
// ---------------------------------------------------------------------------

const LIGHT_IDS = new Set([
  5,   // Circadian Misalignment
  28,  // Overhead Lighting and Evening Cortisol
  29,  // Blue Light and Melatonin Suppression
  30,  // Indoor Darkness and Cognitive Lethargy
  33,  // The Dusk Simulation and Neural Settling
  35,  // Light Pollution and Sleep Architecture
  36,  // Light Intensity and The Morning Cortisol Launch
  75,  // The Melanopsin Threshold
  76,  // Evening Kelvin Collapse
  77,  // The Contrast Protocol
  78,  // Glare and Cortisol
  104, // Facial Lighting and the Social Engagement System
  116, // Autistic Lighting Sensitivity
  140, // Cortisol Dysregulation and the Morning Environment
  148, // Chronotype and the Architecture of the Morning
  150, // Peak Performance Windows and Room Assignment
  151, // The Evening Wind-Down Circuit
  152, // Social Jet Lag and the Domestic Schedule
  154, // The Bedroom as a Circadian Signal Device
  155, // Seasonal Affective Architecture and Light
  156, // Winter Colour Temperature and Interior Warmth
  158, // Autumn Transition and Sensory Calibration
  159, // Spring Reactivation and Sensory Expansion
  172, // Kitchen Light and Appetite Regulation
])

const VISUAL_IDS = new Set([
  1,   // Cognitive Fog and Visual Load
  2,   // Open Loops and Unfinished Tasks
  4,   // Heightened Sensory Sensitivity
  9,   // Prefrontal Tax and Glare
  13,  // High-Frequency Patterns
  15,  // Vertical Fatigue
  17,  // Self-Surveillance and Mirror Placement
  22,  // The Dead Corner
  24,  // Vertical Oppression
  25,  // Fractal Fluency
  26,  // Bilateral Symmetry
  31,  // High-Contrast Glare and Eye Fatigue
  32,  // Invisible Flicker and Neurological Irritation
  34,  // Specular Glare and Visual Cortex Load
  47,  // The Visual Cue and the Salience Network
  51,  // Postural Feedback and The Serotonin Connection
  52,  // Evaluation Apprehension and The Fishbowl Effect
  53,  // Self-Objectification and The Scrutiny Spike
  70,  // Vertical Space and Perceived Confinement
  71,  // Depth Perception and Reflected Light
  73,  // The Scale Principle
  74,  // The Linguistic Load
  83,  // The Three-Second Rule
  84,  // Focal Point Architecture
  85,  // Pattern Complexity and Recovery
  86,  // Horizontal Clearance
  87,  // The Ulrich Window
  88,  // Plant Density and Cortisol
  94,  // Saturation and Arousal
  95,  // The Ceiling Plane
  96,  // Chromatic Coherence
  126, // Fascination and the Effortless Gaze
  128, // Extent and the Scope of Rest
  130, // The Garden and Nearby Nature
  162, // The Biophilic Seasonal Anchor
  182, // Ambient Display and Passive Information Load
])

const ACOUSTIC_IDS = new Set([
  3,   // Reverberation and Listening Fatigue
  37,  // Unpredictable Noise and the Startle Response
  38,  // Low-Frequency Hums and The Chronic Load
  39,  // The Air-Gap Leak and Social Vigilance
  40,  // Auditory Bleed and The Focus Barrier
  41,  // The 30 Decibel Threshold for Restoration
  55,  // Shared Wall Awareness
  56,  // Water Sound Psychology
  57,  // The BPM Sync
  58,  // Mechanical Ventilation and Low-Frequency Fatigue
  59,  // The Quiet Hour Ritual
  66,  // The Acoustic Boundary (Social Dynamics)
  89,  // Water Sound and the Vagus Nerve
  103, // Prosodic Acoustics and the Social Engagement Room
  109, // Acoustic Safety and the Low-Frequency Threat
  138, // Oestrogen Decline and Acoustic Sensitivity
  160, // Seasonal Acoustic Shifts
  171, // Kitchen Acoustics and the Cooking State
])

// ---------------------------------------------------------------------------
// DOMAIN-SPECIFIC SCORE THRESHOLDS
//
// These reflect the distinct physiological urgency of each domain.
//
// LIGHT — critical < 30, elevated 30–49
//   Circadian disruption compounds over days. Even moderate misalignment
//   produces measurable HPA axis changes. Threshold is strict.
//
// VISUAL — critical < 30, elevated 30–54
//   Visual load is continuous but recovers within sessions. Slightly wider
//   elevated band to maintain relevance across moderate load states.
//
// ACOUSTIC — critical < 35, elevated 35–59
//   Acoustic threat signals fire faster than visual ones (startle response
//   is sub-100ms). Critical threshold is higher to reflect this immediacy.
// ---------------------------------------------------------------------------

const THRESHOLDS = {
  light:    { critical: 30, elevated: 49 },
  visual:   { critical: 30, elevated: 54 },
  acoustic: { critical: 35, elevated: 59 },
} as const

// ---------------------------------------------------------------------------
// SEEDED SELECTION UTILITIES
// ---------------------------------------------------------------------------

/** Deterministic integer hash. Produces the same value for the same seed. */
function hashSeed(seed: number): number {
  let h = seed
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h = h ^ (h >>> 16)
  return Math.abs(h)
}

/** Returns a value in [0, max) derived deterministically from seed. */
function seededIndex(seed: number, max: number): number {
  return hashSeed(seed) % max
}

/** Today's date expressed as an integer: YYYYMMDD. */
function getDateSeed(): number {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

type DomainKey = 'light' | 'visual' | 'acoustic'

interface ScoreState {
  domain: DomainKey | null
  level: 'critical' | 'elevated' | 'normal'
  score: number
}

/**
 * Resolves which domain (if any) should drive today's card selection,
 * and at what urgency level.
 *
 * Priority: the lowest absolute score wins when multiple domains trigger.
 */
function resolveActiveScore(scores?: {
  light: number
  visual: number
  acoustic: number
}): ScoreState {
  if (!scores) return { domain: null, level: 'normal', score: 100 }

  const candidates: ScoreState[] = [
    {
      domain: 'light',
      score: scores.light,
      level:
        scores.light < THRESHOLDS.light.critical
          ? 'critical'
          : scores.light <= THRESHOLDS.light.elevated
          ? 'elevated'
          : 'normal',
    },
    {
      domain: 'visual',
      score: scores.visual,
      level:
        scores.visual < THRESHOLDS.visual.critical
          ? 'critical'
          : scores.visual <= THRESHOLDS.visual.elevated
          ? 'elevated'
          : 'normal',
    },
    {
      domain: 'acoustic',
      score: scores.acoustic,
      level:
        scores.acoustic < THRESHOLDS.acoustic.critical
          ? 'critical'
          : scores.acoustic <= THRESHOLDS.acoustic.elevated
          ? 'elevated'
          : 'normal',
    },
  ]

  // Only consider domains that are below their normal threshold
  const active = candidates.filter(c => c.level !== 'normal')
  if (active.length === 0) return { domain: null, level: 'normal', score: 100 }

  // Lowest score wins
  return active.reduce((prev, curr) => (curr.score < prev.score ? curr : prev))
}

function getDomainPool(domain: DomainKey): number[] {
  const map: Record<DomainKey, Set<number>> = {
    light: LIGHT_IDS,
    visual: VISUAL_IDS,
    acoustic: ACOUSTIC_IDS,
  }
  return Array.from(map[domain])
}

function getGeneralPool(): number[] {
  return neuroInsights
    .filter(
      c => !LIGHT_IDS.has(c.id) && !VISUAL_IDS.has(c.id) && !ACOUSTIC_IDS.has(c.id)
    )
    .map(c => c.id)
}

/**
 * Selects the card ID for today based on date seed and score state.
 *
 * Critical domain:  always draws from that domain's pool
 * Elevated domain:
 *   - light:    3 of every 4 days (seed % 4 !== 0)
 *   - visual:   2 of every 3 days (seed % 3 !== 0)
 *   - acoustic: 2 of every 3 days (seed % 3 !== 0)
 * Normal:      draws from the combined full pool
 */
function selectDailyCardId(
  activeScore: ScoreState,
  dateSeed: number
): number {
  const allIds = neuroInsights.map(c => c.id)

  if (activeScore.domain === null || activeScore.level === 'normal') {
    return allIds[seededIndex(dateSeed, allIds.length)]
  }

  const { domain, level } = activeScore
  const domainPool = getDomainPool(domain)
  const generalPool = getGeneralPool()
  const fullPool = allIds

  if (level === 'critical') {
    return domainPool[seededIndex(dateSeed, domainPool.length)]
  }

  // Elevated — domain-specific frequency
  if (domain === 'light') {
    // 3 of 4 days from domain pool
    const showDomain = dateSeed % 4 !== 0
    const pool = showDomain ? domainPool : generalPool
    return pool[seededIndex(dateSeed, pool.length)]
  }

  // visual or acoustic elevated — 2 of 3 days from domain pool
  const showDomain = dateSeed % 3 !== 0
  const pool = showDomain ? domainPool : generalPool
  return pool[seededIndex(dateSeed, pool.length)]
}

// ---------------------------------------------------------------------------
// COMPONENT PROPS
// ---------------------------------------------------------------------------

interface Props {
  isPremium?: boolean
  scores?: {
    light: number
    visual: number
    acoustic: number
  }
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

export default function NeuroFlashcard({ isPremium = false, scores }: Props) {
  const [currentCard, setCurrentCard] = useState(neuroInsights[0])
  const [isFlipped, setIsFlipped] = useState(false)

  // On mount and whenever scores change, resolve today's card.
  // The date seed ensures the same card for the full calendar day.
  // Score changes within the same day (e.g. after logging) will re-evaluate
  // but maintain date anchoring — the domain pool may shift but the
  // position within that pool stays stable for the day.
  useEffect(() => {
    const dateSeed  = getDateSeed()
    const active    = resolveActiveScore(scores)
    const cardId    = selectDailyCardId(active, dateSeed)
    const card      = neuroInsights.find(c => c.id === cardId)
    if (card) {
      setCurrentCard(card)
      setIsFlipped(false)
    }
  }, [scores])

  // Manual refresh: true random, full pool — allows exploration on demand
  const nextCard = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFlipped(false)
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * neuroInsights.length)
      setCurrentCard(neuroInsights[randomIndex])
    }, 300)
  }

  return (
    <div className="h-full flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Brain className="text-[#b5a642]" size={20} />
          <h3 className="text-[#c9ccbb] font-serif text-lg">Neuro Somatic Insights</h3>
        </div>
        <button
          onClick={nextCard}
          className="text-[#c9ccbb]/40 hover:text-[#b5a642] transition-colors p-2 hover:bg-[#c9ccbb]/5 rounded-full"
          title="New Insight"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* THE CARD */}
      <div
        className="relative flex-grow cursor-pointer group perspective-1000 min-h-[400px]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (

            // ── FRONT — always free ──────────────────────────────────────
            <motion.div
              key="front"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-8 rounded-2xl h-full border border-[#c9ccbb]/10 flex flex-col justify-between text-left hover:bg-[#c9ccbb]/5 transition-colors relative overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-[#b5a642] bg-[#b5a642]/10 rounded-full">
                    {currentCard.category}
                  </span>
                  <Sparkles size={16} className="text-[#b5a642]/40" />
                </div>

                <h4 className="text-2xl font-serif text-[#c9ccbb] mb-6 leading-tight">
                  {currentCard.title}
                </h4>

                <div className="mb-6">
                  <span className="text-[#b5a642] text-[10px] uppercase font-bold block mb-2 opacity-70">Science Fact</span>
                  <p className="text-sm text-[#c9ccbb] leading-relaxed border-l-2 border-[#b5a642]/30 pl-4 italic">
                    &ldquo;{currentCard.free.sciencefact}&rdquo;
                  </p>
                </div>
              </div>

              <div className="mt-auto">
                <span className="text-[#b5a642] text-[10px] uppercase font-bold block mb-2 opacity-70">Why This Matters</span>
                <p className="text-sm text-[#c9ccbb]/80 leading-relaxed">
                  {currentCard.free.whyitmatters}
                </p>
                <div className="w-full mt-6 py-3 border-t border-[#c9ccbb]/10 text-center">
                  <p className="text-[#c9ccbb]/70 text-xs uppercase tracking-[0.2em]">
                    Tap to Reveal Protocol
                  </p>
                </div>
              </div>
            </motion.div>

          ) : (

            // ── BACK — Core tier and above ───────────────────────────────
            <motion.div
              key="back"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.3 }}
              className={`glass-panel p-6 rounded-2xl h-full flex flex-col text-left relative overflow-hidden ${
                isPremium
                  ? 'bg-[#b5a642]/5 border-[#b5a642]/30'
                  : 'bg-[#000]/20 border border-[#c9ccbb]/10'
              }`}
            >
              <div className="overflow-y-auto pr-2 custom-scrollbar h-full">

                {isPremium ? (

                  // ── CORE / BLUEPRINT — full protocol ────────────────────
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-[#b5a642]/20 pb-4">
                      <Zap size={16} className="text-[#b5a642]" />
                      <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest">
                        {currentCard.paid.protocol}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#c9ccbb]/70 text-[10px] uppercase font-bold block mb-2">Primary Adjustment</span>
                      <p className="text-base text-[#c9ccbb] font-serif leading-relaxed">
                        {currentCard.paid.primaryadjustment}
                      </p>
                    </div>

                    <div>
                      <span className="text-[#c9ccbb]/70 text-[10px] uppercase font-bold block mb-3">Refinement</span>
                      <ul className="space-y-3">
                        {currentCard.paid.refinement.map((step, i) => (
                          <li key={i} className="flex gap-3 text-sm text-[#c9ccbb]/70 leading-relaxed">
                            <ArrowRight size={14} className="text-[#b5a642] shrink-0 mt-1" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-[#b5a642]/5 rounded-xl border border-[#b5a642]/10 space-y-4">
                      <div>
                        <span className="text-[#b5a642] text-[10px] uppercase font-bold block mb-1">Why It Works</span>
                        <p className="text-xs text-[#c9ccbb]/70">{currentCard.paid.whyitWorks}</p>
                      </div>
                      <div>
                        <span className="text-[#b5a642] text-[10px] uppercase font-bold block mb-1">Integration Cue</span>
                        <p className="text-xs text-[#c9ccbb] italic">&ldquo;{currentCard.paid.integrationcue}&rdquo;</p>
                      </div>
                    </div>
                  </div>

                ) : (

                  // ── FREE USER — locked state ─────────────────────────────
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="p-4 rounded-full bg-[#000]/40 border border-[#c9ccbb]/10">
                      <Lock size={32} className="text-[#c9ccbb]/40" />
                    </div>
                    <div>
                      <h4 className="text-lg text-[#c9ccbb] font-serif mb-2">Members Already Feel the Difference</h4>
                      <p className="text-sm text-[#c9ccbb]/70 max-w-[200px] mx-auto">
                        Translate the <strong>{currentCard.paid.protocol}</strong> into actionable strategies.
                      </p>
                    </div>
                    <Link href="/upgrade" className="w-full max-w-[200px]">
                      <button className="w-full py-3 bg-[#c9ccbb] text-[#1b270e] text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-lg shadow-[#c9ccbb]/10">
                        Upgrade to Core
                      </button>
                    </Link>
                  </div>

                )}
              </div>
            </motion.div>

          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
