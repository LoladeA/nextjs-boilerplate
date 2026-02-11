import { PROTOCOLS, Protocol } from '../data/protocols'

type TimeOfDay = 'morning' | 'afternoon' | 'evening'
type StressLevel = 'low' | 'medium' | 'high'

/**
 * THE SENSORY LOAD BALANCING ALGORITHM
 * Input: Time (Biological Clock) + Stress (Current State)
 * Output: The correct Protocol (Prescription)
 */
export function determineProtocol(time: TimeOfDay, stress: StressLevel): Protocol {
  
  // --- EVENING LOGIC (The most critical window) ---
  if (time === 'evening') {
    // If stress is HIGH, we need the "Emergency Brake" (Shelter)
    if (stress === 'high') {
      return PROTOCOLS['evening-shelter']
    }
    // Otherwise, standard wind-down
    return PROTOCOLS['evening-taper']
  }

  // --- MORNING LOGIC ---
  if (time === 'morning') {
    // If stress is HIGH, don't blast them with light yet. Calm them down first.
    if (stress === 'high') {
      return PROTOCOLS['morning-calm']
    }
    // If low/medium stress, wake them up!
    return PROTOCOLS['morning-activation']
  }

  // --- AFTERNOON LOGIC ---
  // High stress in the afternoon requires a reset.
  if (stress === 'high') {
    return PROTOCOLS['evening-shelter'] // Early restorative break
  }
  
  return PROTOCOLS['evening-taper'] // Default gentle mode
}

/**
 * HELPER: Automates the "Stress" input based on the User's Assessment Score.
 * * Thresholds:
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
 * HELPER: Get current time of day automatically
 */
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  return 'evening'
}
