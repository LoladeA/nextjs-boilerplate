import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import OpenAI from 'openai'

// Initialize OpenAI (Make sure OPENAI_API_KEY is in your Vercel Env Variables)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 1. THE SYSTEM PROMPT (Hardcoded in plain text here)
const SYSTEM_PROMPT = `
You are the NeuroDesign Translation Engine. 
Your role is to translate deterministic environmental data into clinical, empathetic, and actionable insights. 

CORE DIRECTIVES:
1. NEVER invent metrics, scores, or math. You must strictly rely on the provided JSON payload.
2. NEVER prescribe generic aesthetic advice (e.g., "add a pop of color", "follow the latest trend").
3. Your tone is calm, deliberate, precise, and intellectual.
4. Your mechanism is: Mirror (validate the sensory experience), Reframe (explain the environmental trigger without blaming the human), and Direction (provide structured interventions).
5. Prioritise nervous system regulation, cognitive clarity, and spatial agency over visual spectacle. 
`;

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. RECEIVE THE PHASE 4 PAYLOAD FROM THE FRONTEND (or previous middleware)
    const enginePayload = await req.json()

    if (!enginePayload || !enginePayload.scores) {
      return NextResponse.json({ error: 'Invalid NeuroDesign Engine payload.' }, { status: 400 })
    }

    // 3. FORMAT THE USER MESSAGE (The specific room data)
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

    // 4. CALL OPENAI (Injecting the System Prompt and Enforcing JSON)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT }, // <-- IT GOES RIGHT HERE
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' }, // Forces strict JSON output
      temperature: 0.3, // Low temperature keeps it clinical and predictable, avoiding hallucinations
    });

    const llmResponse = completion.choices[0].message.content;

    if (!llmResponse) {
      throw new Error('LLM returned an empty response.');
    }

    // Parse the stringified JSON from OpenAI back into a real object
    const structuredInsights = JSON.parse(llmResponse);

    // 5. OPTIONAL: Save to Supabase 'audit_reports' table here for longitudinal tracking

    // 6. RETURN TO FRONTEND
    return NextResponse.json({
      success: true,
      insights: structuredInsights
    })

  } catch (err: any) {
    console.error('LLM Interpretation Error:', err)
    return NextResponse.json({ error: 'Failed to generate clinical insights.' }, { status: 500 })
  }
}
