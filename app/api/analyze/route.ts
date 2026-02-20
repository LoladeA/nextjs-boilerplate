import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // --------------------------------------------------
    // 1️⃣ AUTH VALIDATION
    // --------------------------------------------------
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // --------------------------------------------------
    // 2️⃣ SUBSCRIPTION VALIDATION
    // --------------------------------------------------
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', user.id)
      .single()

    if (
      subError ||
      !subscription ||
      subscription.plan !== 'premium' ||
      subscription.status !== 'active' ||
      new Date(subscription.current_period_end) < new Date()
    ) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      )
    }

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

    if (countError) {
      return NextResponse.json(
        { error: 'Usage check failed' },
        { status: 500 }
      )
    }

    if ((count ?? 0) >= 2) {
      return NextResponse.json(
        { error: 'Monthly scan limit reached (2 per month)' },
        { status: 429 }
      )
    }

    // --------------------------------------------------
    // 4️⃣ PRIORITY ROOM ENFORCEMENT (1 PER MONTH)
    // --------------------------------------------------
    const body = await req.json()
    const { roomName, measuredLux } = body

    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('priority_room, priority_month')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Profile lookup failed' },
        { status: 500 }
      )
    }

    if (!profile.priority_month || profile.priority_month !== currentMonth) {
      // First scan this month → lock priority room
      await supabase
        .from('users')
        .update({
          priority_room: roomName,
          priority_month: currentMonth
        })
        .eq('id', user.id)
    } else {
      if (profile.priority_room !== roomName) {
        return NextResponse.json(
          { error: `Only priority room "${profile.priority_room}" allowed this month` },
          { status: 403 }
        )
      }
    }

    // --------------------------------------------------
    // 5️⃣ TRUE INTELLIGENCE ENGINE (Google Vision + OpenAI)
    // --------------------------------------------------
    
    // A. FETCH PIXEL DATA FROM GOOGLE VISION
    const googleVisionRes = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { source: { imageUri: imageUrl } },
            features: [
              { type: 'OBJECT_LOCALIZATION', maxResults: 50 },
              { type: 'IMAGE_PROPERTIES', maxResults: 10 }
            ]
          }]
        })
    });
    
    if (!googleVisionRes.ok) throw new Error('Vision API failed');
    const visionData = await googleVisionRes.json();
    const annotations = visionData.responses[0];

    // B. PROPRIETARY MATH (V2 Engine)
    const objectsDetected = annotations.localizedObjectAnnotations?.length || 0;
    const colors = annotations.imagePropertiesAnnotation?.dominantColors?.colors || [];
    
    // Calculate Entropy (0 to 10 scale based on object density)
    // Formula: (Objects / 25 Max Baseline) * 10
    let calculatedEntropy = ((objectsDetected / 25) * 10).toFixed(1);
    if (parseFloat(calculatedEntropy) > 10) calculatedEntropy = '10.0';
    
    // Calculate Biophilic Rating based on detected green/earth hues
    const hasEarthTones = colors.some((c: any) => 
        (c.color.green > 100 && c.color.red < 150 && c.color.blue < 150) || // Greens
        (c.color.red > 100 && c.color.green > 80 && c.color.blue < 80)      // Browns/Earth
    );
    const biophilicRating = hasEarthTones ? 'MODERATE' : 'LOW';

    // Estimate Kelvin from dominant color if lux isn't provided
    let estimatedKelvin = measuredLux ? (measuredLux > 300 ? 4000 : 2700) : 3500;
    if (!measuredLux && colors.length > 0) {
        const primaryColor = colors[0].color;
        if (primaryColor.blue > primaryColor.red && primaryColor.blue > 150) estimatedKelvin = 4500; // Cool
        if (primaryColor.red > primaryColor.blue && primaryColor.red > 150) estimatedKelvin = 2700;  // Warm
    }

    // C. LLM TRANSLATION (Clinical Narrative)
    const enginePayload = `
    ROOM TYPE: ${roomName}
    VISUAL ENTROPY: ${calculatedEntropy}/10
    BIOPHILIC PRESENCE: ${biophilicRating}
    ESTIMATED KELVIN: ${estimatedKelvin}K
    `;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Analyze this deterministic room data and provide a JSON response with exactly two keys: 'insight' (a 2-sentence clinical insight) and 'prescriptions' (an array of 3 specific, actionable design interventions).\n\n${enginePayload}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3, 
    });

    const llmResponse = JSON.parse(completion.choices[0].message.content || '{}');

    // --------------------------------------------------
    // 6️⃣ WRITE AUDIT RECORD
    // --------------------------------------------------
    await supabase.from('room_audits').insert({
      user_id: user.id,
      room_name: roomName,
      arousal_score: parseFloat(calculatedEntropy),
      light_score: measuredLux ?? null,
      insight: llmResponse.insight,
      prescriptions: llmResponse.prescriptions
    })

    // --------------------------------------------------
    // 7️⃣ RETURN PREMIUM RESPONSE
    // --------------------------------------------------
    return NextResponse.json({
      success: true,
      data: {
        entropy_score: calculatedEntropy,
        lighting_kelvin: estimatedKelvin,
        biophilic_rating: biophilicRating,
        insight: llmResponse.insight,
        prescriptions: llmResponse.prescriptions
      }
    })
  } catch (error) {
    console.error('Analysis Engine Error:', error);
    return NextResponse.json(
      { error: 'Analysis Failed' },
      { status: 500 }
    )
  }
}
