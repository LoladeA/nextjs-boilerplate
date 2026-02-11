import { PROTOCOLS, Protocol } from '../data/protocols'

type TimeOfDay = 'morning' | 'afternoon' | 'evening'
type StressLevel = 'low' | 'medium' | 'high'

/**
 * THE SENSORY LOAD BALANCING ALGORITHM
 * * Input: Time (Biological Clock) + Stress (Current State)
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

  // --- AFTERNOON LOGIC (Default Fallback for now) ---
  // For MVP, afternoon treats high stress like evening prep, and low stress like morning activation
  if (stress === 'high') {
    return PROTOCOLS['evening-shelter'] // Early restorative break
  }
  
  return PROTOCOLS['evening-taper'] // Default gentle mode
}

/**
 * Helper to get current time of day automatically
 */
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  return 'evening'
}
