// app/daily-logs/constants.tsx
//
// Static configuration data for the daily logs / progress page.
// Contains JSX so this file must use the .tsx extension.
// No state. No side effects. Safe to import anywhere.

import { Wind, Sun, Volume2, CheckCircle, Heart } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// MOOD CARDS
//
// Colours and opacities are intentional brand decisions. Do not modify.
// The unselected state uses bone/grey intentionally — it is the inactive
// state and should recede. Only the selected state uses full gold palette.
// ─────────────────────────────────────────────────────────────────────────────
export const moods = [
  { val: 1, label: 'Burned Out',   desc: 'Running on empty',    color: 'bg-[#b5a642]/10 border-[#b5a642]/25 text-[#b5a642]/50' },
  { val: 2, label: 'Tense / Edgy', desc: 'Buzzing with stress', color: 'bg-[#b5a642]/12 border-[#b5a642]/30 text-[#b5a642]/60' },
  { val: 3, label: 'Neutral',      desc: 'Holding steady',      color: 'bg-[#c9ccbb]/10 border-[#c9ccbb]/30 text-[#c9ccbb]/70' },
  { val: 4, label: 'Grounded',     desc: 'Breathing deeper',    color: 'bg-[#b5a642]/18 border-[#b5a642]/50 text-[#b5a642]/80' },
  { val: 5, label: 'In Flow',      desc: 'Effortless movement', color: 'bg-[#b5a642]/20 border-[#b5a642]/60 text-[#b5a642]'    },
]

// ─────────────────────────────────────────────────────────────────────────────
// MORNING ACTION TAGS
// ─────────────────────────────────────────────────────────────────────────────
export const morningTagOptions = [
  { id: 'ventilation',  label: 'Opened Windows / Aired The Home',    icon: <Wind size={14} />        },
  { id: 'sunlight',     label: 'Got Early Morning Sunlight',          icon: <Sun size={14} />         },
  { id: 'noise_buffer', label: 'Reduced Intrusive Noise',             icon: <Volume2 size={14} />     },
  { id: 'declutter',    label: 'Cleared / Decluttered One Area',      icon: <CheckCircle size={14} /> },
]

// ─────────────────────────────────────────────────────────────────────────────
// EVENING ACTION TAGS
// ─────────────────────────────────────────────────────────────────────────────
export const eveningTagOptions = [
  { id: 'entropy_reset',     label: 'Decluttered The First Surface I See In The Morning', icon: <CheckCircle size={14} /> },
  { id: 'acoustic_seal',     label: 'Reduced or Softened Noise For The Night',            icon: <Volume2 size={14} />     },
  { id: 'tactile_enclosure', label: 'Using Gentle Weight & Soft Textures for Sleep',      icon: <Heart size={14} />       },
]
