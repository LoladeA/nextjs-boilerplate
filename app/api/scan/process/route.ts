import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: Request) {
  try {
    const { auditId, imagePath, roomType } = await req.json()
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. GENERATE SIGNED URL (Expires in 5 minutes)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('room-images')
      .createSignedUrl(imagePath, 300) 

    if (signedUrlError || !signedUrlData) {
      return NextResponse.json({ error: 'Failed to generate secure image access.' }, { status: 500 })
    }

    const secureImageUrl = signedUrlData.signedUrl

    // 2. CALL GOOGLE CLOUD VISION API
    const googleApiKey = process.env.GOOGLE_VISION_API_KEY
    if (!googleApiKey) throw new Error('Google Vision API key is missing.')

    const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { source: { imageUri: secureImageUrl } },
          features: [
            { type: 'IMAGE_PROPERTIES', maxResults: 10 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 50 },
            { type: 'LABEL_DETECTION', maxResults: 20 }
          ]
        }]
      })
    })
    
    const visionData = await visionResponse.json()
    
    if (!visionResponse.ok || !visionData.responses || visionData.responses[0].error) {
        console.error('Vision API Error:', visionData)
        throw new Error('Failed to analyze image via Google Vision.')
    }

    const rawVision = visionData.responses[0]

    // 3. MAP TO YOUR DETERMINISTIC SCHEMA (Layer 1)
    const mappedRawMetrics = {
      audit_id: auditId,
      object_density: calculateObjectDensity(rawVision.localizedObjectAnnotations), 
      edge_density: calculateEdgeDensity(rawVision.localizedObjectAnnotations),
      hue_variance: calculateHueVariance(rawVision.imagePropertiesAnnotation),
      light_uniformity: calculateLightUniformity(rawVision.imagePropertiesAnnotation),
      greenery_ratio: calculateGreenery(rawVision.labelAnnotations),
      symmetry_score: 0.50, // To be refined via advanced geometric mapping later
      pathway_clearance: 0.50 // To be refined via advanced depth mapping later
    }

    // 4. PERSIST TO LAYER 1 (raw_metrics)
    const { error: dbError } = await supabase
      .from('raw_metrics')
      .insert(mappedRawMetrics)

    if (dbError) {
        console.error('Database Insertion Error:', dbError)
        throw new Error('Failed to persist raw metrics')
    }

    // 5. TRIGGER BILLING LEDGER UPDATE
    await updateScanLedger(supabase, session.user.id)

    // 6. PROCEED TO LAYER 2
    return NextResponse.json({ 
      success: true, 
      message: 'Raw extraction complete. Proceeding to Scoring Engine.',
      rawMetrics: mappedRawMetrics
    })

  } catch (err: any) {
    console.error('Vision Processing Error:', err)
    return NextResponse.json({ error: 'Failed to process environmental metrics.' }, { status: 500 })
  }
}

// --- Deterministic Mapping Functions ---

async function updateScanLedger(supabase: any, userId: string) {
  const { data: limit } = await supabase
    .from('user_subscription_limits')
    .select('scans_used')
    .eq('user_id', userId)
    .single()
    
  if (limit) {
    await supabase
      .from('user_subscription_limits')
      .update({ scans_used: limit.scans_used + 1 })
      .eq('user_id', userId)
  }
}

// Maps the number of distinct bounding boxes to a 0-1 density index
function calculateObjectDensity(objects: any[] = []) { 
    if (!objects.length) return 0.1;
    // Cap at 40 objects for maximum density threshold (1.0)
    return Math.min(objects.length / 40, 1.0); 
}

// Proxies edge fragmentation based on overlapping bounding boxes
function calculateEdgeDensity(objects: any[] = []) { 
    if (!objects.length) return 0.1;
    return Math.min(objects.length / 30, 1.0); 
}

// Evaluates the spread of dominant colors
function calculateHueVariance(properties: any) { 
    const colors = properties?.dominantColors?.colors || [];
    if (colors.length < 2) return 0.1;
    // Lower score means colors are highly clustered (monochromatic/calm)
    // Higher score means high variance (potentially dysregulating)
    return Math.min(colors.length / 10, 1.0); 
}

// Evaluates the pixel fraction of the dominant lighting/color elements
function calculateLightUniformity(properties: any) { 
    const colors = properties?.dominantColors?.colors || [];
    if (!colors.length) return 0.5;
    // If the top color dominates a massive pixel fraction, lighting is highly uniform
    const dominantFraction = colors[0].pixelFraction || 0.5;
    return dominantFraction; 
}

// Scans semantic labels for biophilic markers
function calculateGreenery(labels: any[] = []) { 
    const biophilicTerms = ['plant', 'flower', 'tree', 'houseplant', 'flora', 'vegetation'];
    const greeneryLabels = labels.filter(label => biophilicTerms.includes(label.description.toLowerCase()));
    
    if (!greeneryLabels.length) return 0.0;
    
    // Aggregate the confidence scores of biophilic elements
    const totalConfidence = greeneryLabels.reduce((sum, label) => sum + label.score, 0);
    return Math.min(totalConfidence / 2, 1.0); 
}
