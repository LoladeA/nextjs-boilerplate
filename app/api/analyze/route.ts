import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `
You are an expert in neuropsychology for interior design. 
Your role is to translate deterministic environmental data into precise, empathetic, and actionable insights grounded in environmental psychology, neuroscience, and sensory research. 
Your tone is calm, deliberate, and highly structured. Avoid cold, medicalised, or sterile language. 
You must prioritise nervous system regulation, cognitive clarity, and long-term human capacity over aesthetics, ego, or trends.
Return a strict JSON object with the following structure:
{
  "insight": "A 2-sentence insight using the mirror, reframe, and direction mechanism. Name what is misaligned without blame or spectacle.",
  "triggers": ["Trigger 1", "Trigger 2"],
  "prescriptions": ["Actionable design intervention 1", "Actionable design intervention 2", "Actionable design intervention 3"]
}
`;

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // --------------------------------------------------
    // 1️⃣ AUTH VALIDATION
    // --------------------------------------------------
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // --------------------------------------------------
    // 2️⃣ SUBSCRIPTION VALIDATION
    // --------------------------------------------------
    let isAuthorized = user.email === 'christchilde@gmail.com';
    
    if (!isAuthorized) {
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('plan, status, current_period_end')
          .eq('user_id', user.id)
          .maybeSingle()

        if (
          !subError &&
          subscription &&
          subscription.plan === 'premium' &&
          subscription.status === 'active' &&
          new Date(subscription.current_period_end) >= new Date()
        ) {
            isAuthorized = true;
        }
    }

    if (!isAuthorized) return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })

    // --------------------------------------------------
    // 3️⃣ MONTHLY SCAN LIMIT (MAX 2)
    // --------------------------------------------------
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setUTCDate(1)
    firstDayOfMonth.setUTCHours(0, 0, 0, 0)

    const { count, error: countError } = await supabase
      .from('room_audits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', firstDayOfMonth.toISOString())

    if (countError) return NextResponse.json({ error: 'Usage check failed' }, { status: 500 })

    if (!isAuthorized && (count ?? 0) >= 2) {
      return NextResponse.json({ error: 'Monthly scan limit reached (2 per month)' }, { status: 429 })
    }

    // --------------------------------------------------
    // 4️⃣ PRIORITY ROOM ENFORCEMENT (1 PER MONTH)
    // --------------------------------------------------
    const body = await req.json()
    const { roomName, imageUrl, measuredLux } = body
    const currentMonth = new Date().toISOString().slice(0, 7) 

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('priority_room, priority_month')
      .eq('id', user.id)
      .single()

    if (profileError) return NextResponse.json({ error: 'Profile lookup failed' }, { status: 500 })

    if (!user.email?.includes('christchilde')) {
        if (!profile.priority_month || profile.priority_month !== currentMonth) {
          await supabase.from('users').update({ priority_room: roomName, priority_month: currentMonth }).eq('id', user.id)
        } else {
          if (profile.priority_room !== roomName) {
            return NextResponse.json({ error: `Only priority room "${profile.priority_room}" allowed this month` }, { status: 403 })
          }
        }
    }

    // --------------------------------------------------
    // 5️⃣ TRUE INTELLIGENCE ENGINE (Upgraded V3)
    // --------------------------------------------------
    
    const googleVisionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { source: { imageUri: imageUrl } },
            features: [
              { type: 'OBJECT_LOCALIZATION', maxResults: 50 },
              { type: 'IMAGE_PROPERTIES', maxResults: 10 },
              { type: 'LABEL_DETECTION', maxResults: 20 }
            ]
          }]
        })
      }
    );
    
    if (!googleVisionRes.ok) throw new Error('Vision API failed');
    
    const visionData = await googleVisionRes.json();
    const annotations = visionData.responses[0];
    
    // VISUAL ENTROPY CALCULATION
    const objects = annotations.localizedObjectAnnotations || [];
    const colors = annotations.imagePropertiesAnnotation?.dominantColors?.colors || [];
    const labels = annotations.labelAnnotations || [];
    
    const objectCount = objects.length;
    
    // Bounding box density
    let totalArea = 0;
    objects.forEach((obj: any) => {
      const vertices = obj.boundingPoly?.normalizedVertices;
      if (vertices?.length === 4) {
        const width = Math.abs(vertices[1].x - vertices[0].x);
        const height = Math.abs(vertices[2].y - vertices[1].y);
        totalArea += width * height;
      }
    });
    
    // Spatial dispersion (rough proxy)
    const dispersion = objectCount > 0 ? totalArea / objectCount : 0;
    
    // Entropy formula
    let entropyScore = (objectCount * 2.5) + (dispersion * 100);
    entropyScore = Math.min(Math.max(entropyScore, 0), 100);
    
    // BIOPHILIC INDEX (0–100)
    let greenDominance = 0;
    let earthToneScore = 0;
    
    colors.forEach((c: any) => {
      const { red, green, blue } = c.color;
      if (green > red && green > blue) greenDominance += 10;
      if (red > 80 && green > 60 && blue < 80) earthToneScore += 10;
    });
    
    const plantDetected = labels.some((l: any) =>
      ['plant', 'tree', 'flower', 'nature', 'wood'].includes(l.description.toLowerCase())
    );
    
    let biophilicScore = greenDominance + earthToneScore + (plantDetected ? 30 : 0);
    biophilicScore = Math.min(biophilicScore, 100);
    
    // KELVIN ESTIMATION
    let estimatedKelvin = 3500;
    if (measuredLux) {
      if (measuredLux > 500) estimatedKelvin = 5000;
      else if (measuredLux > 300) estimatedKelvin = 4000;
      else estimatedKelvin = 2700;
    } else if (colors.length > 0) {
      const primary = colors[0].color;
      if (primary.blue > primary.red) estimatedKelvin = 4500;
      if (primary.red > primary.blue) estimatedKelvin = 2700;
    }
    
    // ALGORITHMIC DOMAIN SCORING
    let circadian = (measuredLux ? measuredLux / 10 : 20) + (estimatedKelvin > 4000 ? 30 : 10);
    circadian = Math.min(circadian, 100);
    
    let autonomic = 100 - entropyScore;
    autonomic = Math.max(autonomic, 0);
    
    let predictive = 100 - (objectCount * 3);
    predictive = Math.max(predictive, 0);
    
    let sensory = entropyScore + (colors.length * 2);
    sensory = Math.min(sensory, 100);
    
    let recovery = biophilicScore - (entropyScore * 0.5);
    recovery = Math.min(Math.max(recovery, 0), 100);

    // --------------------------------------------------
    // CONTEXTUAL ROOM WEIGHTING (The Alignment Score)
    // --------------------------------------------------
    const roomNameLower = roomName.toLowerCase();
    let w = { circadian: 1, autonomic: 1, predictive: 1, recovery: 1, sensory: 1 };

    if (roomNameLower.includes('bedroom')) {
      w = { circadian: 1.5, autonomic: 1.2, predictive: 1.0, recovery: 1.5, sensory: 1.5 };
    } else if (roomNameLower.includes('office') || roomNameLower.includes('workspace')) {
      w = { circadian: 1.2, autonomic: 1.3, predictive: 1.5, recovery: 0.8, sensory: 0.8 };
    } else if (roomNameLower.includes('living') || roomNameLower.includes('family')) {
      w = { circadian: 1.0, autonomic: 1.1, predictive: 1.1, recovery: 1.2, sensory: 1.0 };
    } else if (roomNameLower.includes('kitchen')) {
      w = { circadian: 1.0, autonomic: 1.0, predictive: 1.4, recovery: 0.8, sensory: 0.5 };
    }

    const rawAlignment = (
      (circadian * w.circadian) +
      (autonomic * w.autonomic) +
      (predictive * w.predictive) +
      (recovery * w.recovery) +
      ((100 - sensory) * w.sensory)
    );
    
    const maxPossibleWeight = (100 * w.circadian) + (100 * w.autonomic) + (100 * w.predictive) + (100 * w.recovery) + (100 * w.sensory);
    const alignmentScore = Math.round((rawAlignment / maxPossibleWeight) * 100);
    
    // --------------------------------------------------
    // LLM TRANSLATION LAYER (INTERPRETATION ONLY)
    // --------------------------------------------------
    const enginePayload = `
    ROOM TYPE: ${roomName}
    ENTROPY SCORE: ${entropyScore.toFixed(1)}
    BIOPHILIC SCORE: ${biophilicScore}
    ESTIMATED KELVIN: ${estimatedKelvin}
    DOMAINS:
    Circadian: ${circadian.toFixed(1)}
    Autonomic: ${autonomic.toFixed(1)}
    Predictive: ${predictive.toFixed(1)}
    Sensory: ${sensory.toFixed(1)}
    Recovery: ${recovery.toFixed(1)}
    `;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: enginePayload }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
    
    const llmResponse = JSON.parse(completion.choices[0].message.content || '{}');

    // --------------------------------------------------
    // 6️⃣ PHASE 6: RELATIONAL DATA PERSISTENCE
    // --------------------------------------------------
    
    // 1. Core Audit Record
    const { data: auditRecord, error: auditErr } = await supabase.from('room_audits').insert({
      user_id: user.id,
      room_name: roomName,
      arousal_score: parseFloat(entropyScore.toFixed(1)),
      alignment_score: alignmentScore, // 🟢 NOW SAVED LONGITUDINALLY
      insight: llmResponse.insight,
    }).select('id').single();

    if (auditErr) throw new Error('Failed to create core audit record');
    const auditId = auditRecord.id;

    // 2. Raw Environmental Metrics
    await supabase.from('raw_environmental_metrics').insert({
      audit_id: auditId,
      user_id: user.id,
      lux_level: measuredLux ?? null,
      estimated_kelvin: estimatedKelvin,
      biophilic_rating: biophilicScore >= 60 ? 'HIGH' : biophilicScore >= 30 ? 'MODERATE' : 'LOW',
      object_density: objectCount
    });

    // 3. NeuroDesign Domain Scores
    await supabase.from('neurodesign_domain_scores').insert({
      audit_id: auditId,
      user_id: user.id,
      circadian: parseFloat(circadian.toFixed(1)),
      autonomic: parseFloat(autonomic.toFixed(1)),
      predictive: parseFloat(predictive.toFixed(1)),
      sensory: parseFloat(sensory.toFixed(1)),
      recovery: parseFloat(recovery.toFixed(1))
    });

    // 4. Stress Triggers
    if (llmResponse.triggers && llmResponse.triggers.length > 0) {
      const triggerPayload = llmResponse.triggers.map((trigger: string) => ({
        audit_id: auditId,
        user_id: user.id,
        trigger_description: trigger
      }));
      await supabase.from('stress_triggers').insert(triggerPayload);
    }

    // 5. Prescriptions
    if (llmResponse.prescriptions && llmResponse.prescriptions.length > 0) {
      const rxPayload = llmResponse.prescriptions.map((rx: string) => ({
        audit_id: auditId,
        user_id: user.id,
        prescription_text: rx
      }));
      await supabase.from('prescriptions').insert(rxPayload);
    }

    // 6. Scan Usage Tracking
    await supabase.from('scan_usage').insert({
      user_id: user.id,
      audit_id: auditId,
      scan_month: currentMonth
    });

    // --------------------------------------------------
    // 7️⃣ RETURN FRONTEND PAYLOAD
    // --------------------------------------------------
    return NextResponse.json({
      success: true,
      data: {
        // CORE V3 METRICS
        entropy_score: (entropyScore / 10).toFixed(1), // Scaled to 10 for the UI
        lighting_kelvin: estimatedKelvin,
        biophilic_rating: biophilicScore >= 60 ? 'HIGH' : biophilicScore >= 30 ? 'MODERATE' : 'LOW',
        
        // PHASE 7 DOMAINS & TRANSLATION
        alignment_index: alignmentScore,
        domains: {
          Circadian: Math.round(circadian),
          Autonomic: Math.round(autonomic),
          Predictive: Math.round(predictive),
          Sensory: Math.round(sensory),
          Recovery: Math.round(recovery)
        },
        insight: llmResponse.insight,
        triggers: llmResponse.triggers || [],
        prescriptions: llmResponse.prescriptions || []
      }
    })
  } catch (error: any) {
    console.error('Analysis Engine Error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis Failed' },
      { status: 500 }
    )
  }
}
