import { SensoryProfile } from '@/app/data/protocols';

// The input types from your questionnaire
type NeuroLens = 'HSP' | 'ADHD' | 'Autism' | 'Dyslexia' | 'SPD' | 'None' | string;

export function getPrecisionProfile(lens: NeuroLens, direction: string): SensoryProfile {
  // Normalize inputs to lowercase for safe comparison
  const safeLens = (lens || 'None').toLowerCase();
  const safeDir = (direction || 'Neutral').toLowerCase();

  // 1. MECHANISM CHECK: Trust what they say they NEED over who they are.
  // If an ADHD person says they need "shielding", trust that (they are likely in burnout).
  if (safeDir.includes('shielding')) return 'sensor';
  if (safeDir.includes('stimulation')) return 'seeker';
  
  // 2. IDENTITY CHECK: Fallback to the default biology of their profile.
  if (safeLens.includes('hsp')) return 'sensor';
  if (safeLens.includes('autism')) return 'sensor';
  if (safeLens.includes('spd')) return 'sensor';
  
  // ADHD is typically a Seeker (needs stimulation to focus)
  if (safeLens.includes('adhd')) return 'seeker';
  
 // 3. THE ANCHOR: The grounded, flexible nervous system (formerly "Standard")
  return 'anchor';
}
