// lib/check-week-access.ts
// =============================================================================
// WEEK ACCESS GATING — The Sentient Home
// =============================================================================
//
// Shared utility called by every week page to determine whether the
// authenticated user is authorised to view that content.
//
// GATING RULES:
//   1. User must be authenticated
//   2. User must have Blueprint tier subscription
//   3. User's current_module must be >= the requested module_number
//   4. If current_module === requested module_number,
//      user's current_week must be >= the requested week_number
//
// GOD MODE:
//   christchilde@gmail.com bypasses all checks.
//
// USAGE (in any week page):
//
//   const access = await checkWeekAccess(supabase, user, moduleNumber, weekNumber)
//   if (!access.authorised) {
//     // render the locked state with access.reason
//   }
//
// =============================================================================

import { SupabaseClient } from '@supabase/supabase-js'

export type AccessDeniedReason =
  | 'not_authenticated'
  | 'not_blueprint'
  | 'module_locked'
  | 'week_locked'

export interface WeekAccessResult {
  authorised:     boolean
  reason?:        AccessDeniedReason
  current_module: number
  current_week:   number
}

export async function checkWeekAccess(
  supabase:      SupabaseClient,
  userEmail:     string,
  userId:        string,
  moduleNumber:  number,
  weekNumber:    number
): Promise<WeekAccessResult> {

  // God mode — unrestricted access
  if (userEmail === 'christchilde@gmail.com') {
    return { authorised: true, current_module: moduleNumber, current_week: weekNumber }
  }

  // Fetch subscription tier and progress in parallel
  const [profileRes, statusRes] = await Promise.all([
    supabase
      .from('users')
      .select('current_module, current_week')
      .eq('id', userId)
      .single(),
    fetch('/api/subscription-status')
  ])

  const currentModule = profileRes.data?.current_module ?? 1
  const currentWeek   = profileRes.data?.current_week   ?? 1
  const { tier }      = await statusRes.json()

  // Must be Blueprint
  if (tier !== 'blueprint') {
    return {
      authorised:     false,
      reason:         'not_blueprint',
      current_module: currentModule,
      current_week:   currentWeek,
    }
  }

  // Module not yet reached
  if (moduleNumber > currentModule) {
    return {
      authorised:     false,
      reason:         'module_locked',
      current_module: currentModule,
      current_week:   currentWeek,
    }
  }

  // Correct module but week not yet reached
  if (moduleNumber === currentModule && weekNumber > currentWeek) {
    return {
      authorised:     false,
      reason:         'week_locked',
      current_module: currentModule,
      current_week:   currentWeek,
    }
  }

  return {
    authorised:     true,
    current_module: currentModule,
    current_week:   currentWeek,
  }
}
