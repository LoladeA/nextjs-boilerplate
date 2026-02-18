import { SensoryProfile as EngineProfile } from '@/app/utils/scoring-engine';

// The Brand Archetypes used in the Dashboard
export type DashboardProfile = 'anchor' | 'seeker' | 'sensor';

export function mapEngineToDashboard(engineProfile: EngineProfile): DashboardProfile {
  const { threshold, regulation, pattern } = engineProfile;

  // 1. THE SENSOR (Hypersensitive)
  // Low Threshold = Notice things quickly.
  // Includes 'Sensitive' (Passive) and 'Avoider' (Active).
  if (threshold === 'low') {
    return 'sensor';
  }

  // 2. THE SEEKER (Hyposensitive)
  // High Threshold + Active Regulation = Craves input.
  if (pattern === 'seeker') {
    return 'seeker';
  }

  // 3. THE ANCHOR (Bystander / Stable)
  // High Threshold + Passive Regulation = Low Registration.
  // This profile tolerates a lot of chaos without getting overwhelmed.
  // In your brand context, this stability acts as an "Anchor".
  if (pattern === 'low_registration') {
    return 'anchor';
  }

  // Fallback
  return 'anchor';
}
