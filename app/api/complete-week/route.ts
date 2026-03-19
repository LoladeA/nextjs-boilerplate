// app/api/complete-week/route.ts
// =============================================================================
// COMPLETE WEEK — The Sentient Home
// =============================================================================
//
// Called by quiz pages on successful submission to advance the user's
// progress through the coaching curriculum.
//
// REQUEST BODY:
//   { module_number: number, week_number: number }
//
// LOGIC:
//   1. Verify the user is authenticated
//   2. Fetch current progress from users table
//   3. Confirm the week being completed is the user's current week
//      (prevents replaying old quizzes to re-trigger advancement)
//   4. If week is the final week of the module → advance to next module,
//      reset current_week to 1
//   5. If week is not the final week → increment current_week
//   6. If this is the final week of the final module → mark curriculum complete
//
// RESPONSE:
//   {
//     success: true,
//     advanced_to_module: number,    // new current_module
//     advanced_to_week:   number,    // new current_week
//     module_complete:    boolean,   // true if the module was finished
//     curriculum_complete: boolean,  // true if all 9 modules are done
//   }
//
// =============================================================================

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { isFinalWeek, getNextModule, MODULES } from '@/lib/module-registry'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase    = createRouteHandlerClient({ cookies: () => cookieStore })

    // ── Auth ──────────────────────────────────────────────────────────────
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // ── Parse body ────────────────────────────────────────────────────────
    const { module_number, week_number } = await request.json()

    if (!module_number || !week_number) {
      return NextResponse.json(
        { error: 'module_number and week_number are required' },
        { status: 400 }
      )
    }

    // ── Fetch current progress ────────────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('current_module, current_week')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Could not fetch user progress' },
        { status: 400 }
      )
    }

    const currentModule = profile.current_module ?? 1
    const currentWeek   = profile.current_week   ?? 1

    // ── Guard: only advance from the current position ─────────────────────
    // Replaying a completed week quiz does not re-advance progress.
    // God mode bypasses this check.
    const isGodMode = user.email === 'christchilde@gmail.com'

    if (!isGodMode) {
      if (module_number !== currentModule || week_number !== currentWeek) {
        return NextResponse.json({
          success:             true,
          advanced_to_module:  currentModule,
          advanced_to_week:    currentWeek,
          module_complete:     false,
          curriculum_complete: false,
          note:                'Already completed — progress unchanged.'
        })
      }
    }

    // ── Determine next position ───────────────────────────────────────────
    const moduleComplete     = isFinalWeek(module_number, week_number)
    const nextModule         = moduleComplete ? getNextModule(module_number) : module_number
    const nextWeek           = moduleComplete ? 1 : week_number + 1
    const curriculumComplete = moduleComplete && nextModule === null

    // ── Update progress ───────────────────────────────────────────────────
    const updatePayload: Record<string, any> = {
      current_module: curriculumComplete ? module_number : (nextModule ?? module_number),
      current_week:   curriculumComplete ? week_number   : nextWeek,
    }

    if (curriculumComplete) {
      updatePayload.curriculum_completed_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', user.id)

    if (updateError) {
      console.error('Progress update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success:             true,
      advanced_to_module:  updatePayload.current_module,
      advanced_to_week:    updatePayload.current_week,
      module_complete:     moduleComplete,
      curriculum_complete: curriculumComplete,
    })

  } catch (err) {
    console.error('Complete week error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
