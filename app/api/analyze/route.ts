import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomName, measuredLux } = body;

    // SIMULATED NEURO-DESIGN INTELLIGENCE
    // 1. Calculate a "Visual Entropy" score (Mocked logic)
    // Random float between 6.0 and 9.0 (High entropy for demo purposes)
    const entropyScore = (Math.random() * (9.0 - 6.0) + 6.0).toFixed(1);

    // 2. Determine Prescriptions based on Room Type & Sensory Data
    let prescriptions = [];
    let insight = "";
    
    // --- BASE LOGIC (Room Function) ---
    if (roomName === 'Bedroom') {
      insight = "This space currently signals 'vigilance' rather than 'rest' due to high visual complexity near the sleep horizon.";
      prescriptions = [
        "Reduce visual complexity (clutter) on bedside surfaces.",
        "Cover reflective screens to reduce 'gaze pull'."
      ];
      
      // LIGHTING OVERRIDE: Bedrooms need darkness
      if (measuredLux !== null) {
          if (measuredLux > 50) {
              prescriptions.push(`Current lighting (${measuredLux} lx) is suppressing melatonin release. Switch to amber lamps or candlelight in a heat safe container (<20 lx).`);
              insight += " Detected light levels are biologically antagonistic to sleep onset.";
          } else {
              prescriptions.push("Light levels are optimal for evening wind-down.");
          }
      } else {
          prescriptions.push("Shift lighting temp to <2700K (Amber).");
      }

    } else if (roomName === 'Home Office') {
      insight = "Cognitive load is elevated. The visual field contains too many 'open loops' (clutter) competing for attention.";
      prescriptions = [
        "Clear the primary visual cone (desk surface).",
        "Introduce a biophilic anchor (plant) in the left periphery."
      ];

      // LIGHTING OVERRIDE: Offices need brightness
      if (measuredLux !== null) {
          if (measuredLux < 400) {
              prescriptions.push(`Current lighting (${measuredLux} lx) is too low for cortisol maintenance. Boost to >500 lx.`);
              insight += " Low illuminance is likely causing midday fatigue.";
          } else {
              prescriptions.push("Light levels are sufficient for sustained focus.");
          }
      } else {
           prescriptions.push("Align monitor or reposition to reduce glare contrast.");
      }

    } else {
      // Default / Living Room
      insight = "The room lacks a clear 'safe harbor'. The eye is forced to scan continuously without a resting point.";
      prescriptions = [
        "Create a singular focal point to anchor the gaze.",
        "Use 'containment' (rugs/blankets) to define the zone."
      ];

      // LIGHTING OVERRIDE: Living rooms need flexibility
      if (measuredLux !== null && measuredLux > 100) {
           prescriptions.push("Ensure overheads can be dimmed to <50 lx for evening social connection.");
      } else {
           prescriptions.push("Lower the lighting horizon (table and floor lamps only).");
      }
    }

    // 3. Return the Structured Data
    return NextResponse.json({
      success: true,
      data: {
        entropy_score: entropyScore,
        // If we have real data, use it to estimate Kelvin (cool if bright, warm if dim)
        lighting_kelvin: measuredLux ? (measuredLux > 300 ? 4000 : 2700) : 3500,
        biophilic_rating: "LOW",
        insight: insight,
        prescriptions: prescriptions
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Analysis Failed' }, { status: 500 });
  }
}
