import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomName } = body;

    // SIMULATED NEURO-DESIGN INTELLIGENCE
    // This mimics what the Computer Vision AI will eventually return.
    
    // 1. Calculate a "Visual Entropy" score (Mocked logic)
    // Random float between 6.0 and 9.0 (High entropy for demo purposes)
    const entropyScore = (Math.random() * (9.0 - 6.0) + 6.0).toFixed(1);

    // 2. Determine Prescriptions based on Room Type
    let prescriptions = [];
    let insight = "";

    if (roomName === 'Bedroom') {
      insight = "This space currently signals 'vigilance' rather than 'rest' due to high visual complexity near the sleep horizon.";
      prescriptions = [
        "Reduce visual texture on bedside surfaces.",
        "Shift lighting temp to <2700K (Amber).",
        "Cover reflective screens to reduce 'gaze pull'."
      ];
    } else if (roomName === 'Home Office') {
      insight = "Cognitive load is elevated. The visual field contains too many 'open loops' (clutter) competing for attention.";
      prescriptions = [
        "Clear the primary visual cone (desk surface).",
        "Introduce a biophilic anchor (plant) in the left periphery.",
        "Align monitor to reduce glare contrast."
      ];
    } else {
      // Default / Living Room
      insight = "The room lacks a clear 'safe harbor'. The eye is forced to scan continuously without a resting point.";
      prescriptions = [
        "Create a singular focal point to anchor the gaze.",
        "Lower the lighting horizon (floor lamps only).",
        "Use 'containment' (rugs/blankets) to define the zone."
      ];
    }

    // 3. Return the Structured Data
    return NextResponse.json({
      success: true,
      data: {
        entropy_score: entropyScore,
        lighting_kelvin: 3500, // Too cool for evening
        biophilic_rating: "LOW",
        insight: insight,
        prescriptions: prescriptions
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Analysis Failed' }, { status: 500 });
  }
}
