// IMPORT: Notice we now import 'RITUALS' and 'Ritual' to match your new data file
import { RITUALS, Ritual, TimeOfDay, StressLevel } from '../data/protocols'

/**
 * HELPER: Get current time of day automatically
 */
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon' // 12 PM - 5 PM
  return 'evening'
}

/**
 * HELPER: Automates the "Stress" input based on the User's Assessment Score.
 * 0-35  = Low Load (Resilient)
 * 36-65 = Medium Load (Strained)
 * 66+   = High Load (Dysregulated)
 */
export function mapScoreToStress(score: number): StressLevel {
  if (score <= 35) return 'low'
  if (score <= 65) return 'medium'
  return 'high'
}

/**
 * THE SENSORY LOAD BALANCING ALGORITHM
 * Input: Time + Stress
 * Output: The correct Ritual (Prescription)
 */
export function determineProtocol(time: TimeOfDay, stress: StressLevel): Ritual {
  
  // --- MORNING LOGIC ---
  if (time === 'morning') {
    // High Stress -> Needs Calm (First Light Rhythm: Optical Expansion)
    if (stress === 'high') return RITUALS['morning-calm']
    
    // Low/Med Stress -> Needs Activation (First Light Rhythm: Photon Anchor)
    return RITUALS['morning-activation']
  }

  // --- AFTERNOON LOGIC (NEW) ---
  // We now have specific content for this, so we don't need to fallback to evening!
  if (time === 'afternoon') {
    // High Stress -> Needs Reset (The Second Wind: NSDR)
    if (stress === 'high') return RITUALS['afternoon-reset']
    
    // Low/Med Stress -> Needs Focus (The Second Wind: Ultradian Sprint)
    return RITUALS['afternoon-focus']
  }

  // --- EVENING LOGIC ---
  // High Stress -> Needs Shelter (The Descent: Deep Pressure)
  if (stress === 'high') return RITUALS['evening-shelter']
  
  // Normal -> Needs Taper (The Descent: Kelvin Drop)
  return RITUALS['evening-taper']
}
