import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `
You are the NeuroDesign Translation Engine. 
Your role is to translate deterministic environmental data into clinical, empathetic, and actionable insights. 

CORE DIRECTIVES:
1. NEVER invent metrics, scores, or math. You must strictly rely on the provided JSON payload.
2. NEVER prescribe generic aesthetic advice (e.g., "add a pop of color", "follow the latest trend").
3. Your tone is calm, deliberate, precise, and intellectual.
4. Your mechanism is: Mirror (validate the sensory experience), Reframe (explain the environmental trigger without blaming the human), and Direction (provide structured interventions).
5. Prioritize nervous system regulation, cognitive clarity, and spatial agency over visual spectacle. 
`;

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enginePayload, rawMetrics } = await req.json()

    if (!enginePayload || !enginePayload.scores) {
      return NextResponse.json({ error: 'Invalid NeuroDesign Engine payload.' }, { status: 400 })
    }

    const userMessage = `
    Translate this NeuroDesign Engine payload into the required JSON schema:

    ROOM TYPE: ${enginePayload.room_type}
    
    SCORES:
    - Cognitive Load: ${enginePayload.scores.cognitive_load}/100
    - Chromatic Regulation: ${enginePayload.scores.chromatic_regulation}/100
    - Circadian Alignment: ${enginePayload.scores.circadian_alignment}/100
    - Biophilic Coherence: ${enginePayload.scores.biophilic_coherence}/100
    - Spatial Safety: ${enginePayload.scores.spatial_safety}/100
    - Master Alignment Index: ${enginePayload.scores.neurodesign_alignment_index}/100

    IDENTIFIED STRESS TRIGGERS:
    ${enginePayload.stress_triggers.length > 0 ? enginePayload.stress_triggers.map((t: string) => `- ${t}`).join('\n') : '- None detected'}
    `;

    // 1. CALL OPENAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, 
    });

    const llmResponse = completion.choices[0].message.content;
    if (!llmResponse) throw new Error('LLM returned an empty response.');

    const structuredInsights = JSON.parse(llmResponse);

    // 2. DATA PERSISTENCE (PHASE 6)
    const { data: auditRecord, error: auditError } = await supabase
      .from('room_audits')
      .insert({
        user_id: session.user.id,
        room_type: enginePayload.room_type,
        engine_version: enginePayload.engine_version || '2.0.0'
      })
      .select('id')
      .single();

    if (auditError || !auditRecord) throw new Error('Failed to create master audit record.');

    const currentAuditId = auditRecord.id;

    // Execute all relational database insertions in parallel
    await Promise.all([
      supabase.from('raw_environmental_metrics').insert({
        audit_id: currentAuditId,
        ...rawMetrics 
      }),
      supabase.from('neurodesign_domain_scores').insert({
        audit_id: currentAuditId,
        ...enginePayload.scores,
        master_index: enginePayload.scores.neurodesign_alignment_index
      }),
      supabase.from('stress_triggers').insert(
        enginePayload.stress_triggers.map((trigger: string) => ({
          audit_id: currentAuditId,
          trigger_text: trigger
        }))
      ),
      supabase.from('prescriptions').insert({
        audit_id: currentAuditId,
        insight_summary: structuredInsights.insight_summary,
        primary_risk_explanation: structuredInsights.primary_risk_explanation,
        regulation_pathway: structuredInsights.regulation_pathway,
        immediate_interventions: structuredInsights.immediate_interventions,
        structural_interventions: structuredInsights.structural_interventions
      }),
      supabase.from('scan_usage_history').insert({
        user_id: session.user.id,
        audit_id: currentAuditId,
        action: 'diagnostic_scan_completed'
      })
    ]);

    // 3. RETURN FINAL PAYLOAD TO FRONTEND
    return NextResponse.json({
      success: true,
      audit_id: currentAuditId,
      scores: enginePayload.scores,
      insights: structuredInsights
    })

  } catch (err: any) {
    console.error('LLM Interpretation & Persistence Error:', err)
    return NextResponse.json({ error: 'Failed to generate and store clinical insights.' }, { status: 500 })
  }
}
