// app/daily-logs/constants.tsx
//
// Static configuration data for the daily logs / progress page.
// Contains JSX so this file must use the .tsx extension.
// No state. No side effects. Safe to import anywhere.
//
// MORNING TAG ADDITIONS (v2):
//   cold_exposure    — vagal activation via diving reflex. Brief, self-terminating,
//                      parasympathetic rebound universal across sensory profiles.
//   screen_free_am   — protects the cortisol awakening response (CAR) window.
//                      Removing evaluative stimuli before CAR completes is
//                      sensory-type independent — CAR physiology is identical
//                      across profiles.
//   hydration_first  — water before caffeine. Reduces baseline sympathetic
//                      activation before any stimulant load is introduced.
//                      The simplest universal morning intervention.
//
//   movement_am intentionally excluded — appropriate intensity and type varies
//   significantly between sensor and seeker profiles. Belongs in rituals copy
//   where it can be calibrated per sensory type.
//
// EVENING TAG CHANGE:
//   screens_closed → 'Turn On Red Light Filter On Screens'
//   Label reframed as an actionable instruction rather than a prohibition.
//   Icon changed from EyeOff (avoidance) to Sunset (warm spectrum — the
//   actual mechanism being supported).
//
// ─────────────────────────────────────────────────────────────────────────────

import { Wind, Sun, Volume2, CheckCircle, Heart, Droplet, GlassWater, Sunset, EyeOff } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// MOOD CARDS
//
// Colours and opacities are intentional brand decisions. Do not modify.
// The unselected state uses bone/grey intentionally — it is the inactive
// state and should recede. Only the selected state uses full gold palette.
// ─────────────────────────────────────────────────────────────────────────────
export const moods = [
  { val: 1, label: 'Exhausted',    desc: 'Running on empty',    color: 'bg-[#b5a642]/10 border-[#b5a642]/25 text-[#b5a642]/50' },
  { val: 2, label: 'Tense / Edgy', desc: 'Buzzing with stress', color: 'bg-[#b5a642]/12 border-[#b5a642]/30 text-[#b5a642]/60' },
  { val: 3, label: 'Neutral',      desc: 'Holding steady',      color: 'bg-[#c9ccbb]/10 border-[#c9ccbb]/30 text-[#c9ccbb]/70' },
  { val: 4, label: 'Calm',         desc: 'Breathing deeper',    color: 'bg-[#b5a642]/18 border-[#b5a642]/50 text-[#b5a642]/80' },
  { val: 5, label: 'Well Rested',  desc: 'Effortless movement', color: 'bg-[#b5a642]/20 border-[#b5a642]/60 text-[#b5a642]'    },
]

// ─────────────────────────────────────────────────────────────────────────────
// MORNING ACTION TAGS
//
// These are environmental and somatic nudges — not scored yet.
// They appear as a checklist in the morning logging panel.
//
// ORDER: Environmental interventions first (ventilation, sunlight, noise),
// then somatic/behavioural micro-actions (cold, screen-free, hydration),
// then spatial (declutter).
// ─────────────────────────────────────────────────────────────────────────────
export const morningTagOptions = [
  { id: 'ventilation',     label: 'Opened Windows / Aired The Home',       icon: <Wind size={14} />        },
  { id: 'sunlight',        label: 'Got Early Morning Sunlight',             icon: <Sun size={14} />         },
  { id: 'noise_buffer',    label: 'Reduced Intrusive Noise',                icon: <Volume2 size={14} />     },
  { id: 'cold_exposure',   label: 'Cold Water on Face or Cold Shower',      icon: <Droplet size={14} />     },
  { id: 'screen_free_am',  label: 'No Screens in First 30 Minutes',         icon: <EyeOff size={14} />      },
  { id: 'hydration_first', label: 'Water Before Caffeine',                  icon: <GlassWater size={14} />  },
  { id: 'declutter',       label: 'Cleared / Decluttered One Area',         icon: <CheckCircle size={14} /> },
]

// ─────────────────────────────────────────────────────────────────────────────
// EVENING ACTION TAGS
//
// These are environmental and somatic nudges — not scored yet.
// They appear as a checklist in the evening logging panel.
// ─────────────────────────────────────────────────────────────────────────────
export const eveningTagOptions = [
  { id: 'entropy_reset',     label: 'Decluttered The First Surface I See In The Morning', icon: <CheckCircle size={14} /> },
  { id: 'acoustic_seal',     label: 'Reduced or Softened Noise For The Night',            icon: <Volume2 size={14} />     },
  { id: 'tactile_enclosure', label: 'Using Gentle Weight & Soft Textures for Sleep',      icon: <Heart size={14} />       },
  { id: 'screens_closed',    label: 'Turned On Red Light Filter On Screens',              icon: <Sunset size={14} />      },
]
