export const calculateNeuroLoad = (responses: any[]) => {
  const getVal = (id: string) => {
    const r = responses.find((r: any) => r.question_key === id)
    return r ? Number(r.answer.response) : 0
  }

  // Reverse Score Logic: 1->5, 5->1
  const getReverseVal = (id: string) => {
    const val = getVal(id)
    if (val === 0) return 0
    return 6 - val
  }

  // Calculate Raw Scores (Summation)
  const rawCII = getVal('q5') + getVal('q6') + getVal('q7') + getVal('q8') + getVal('q9')
  const rawALI = getVal('q12') + getVal('q13') + getVal('q14') + getVal('q15')
  const rawPLI = getVal('q16') + getVal('q17') + getVal('q18') + getVal('q19') + getVal('q20')
  const rawSTL = getVal('q21') + getVal('q22') + getVal('q23') + getVal('q24') + getVal('q25')
  const rawRCI = getVal('q26') + getVal('q27') + getVal('q28') + getVal('q29') + getReverseVal('q30')

  const totalLoad = rawCII + rawALI + rawPLI + rawSTL + rawRCI

  // Determine System State (Based on your thresholds)
  let systemState = "Regulated System"
  if (totalLoad > 45) systemState = "Adaptive Load"
  if (totalLoad > 70) systemState = "Chronic Overload"
  if (totalLoad > 95) systemState = "Nervous System Threat"

  // Format for Radar Chart (Normalized to 100 for visual consistency)
  // Note: High score in your model = High Load (Bad). 
  // Radar charts usually show "Assets" (Big shape = Good).
  // We will invert the visual for the chart so Big Shape = High Health.
  // Max score for 5 items is 25.
  const normalize = (score: number, max: number) => Math.round(((max - score) / max) * 100) || 50 // Default 50

  const radarData = [
    { subject: 'Circadian', A: normalize(rawCII, 25), fullMark: 100 },
    { subject: 'Autonomic', A: normalize(rawALI, 20), fullMark: 100 },
    { subject: 'Predictive', A: normalize(rawPLI, 25), fullMark: 100 },
    { subject: 'Sensory', A: normalize(rawSTL, 25), fullMark: 100 },
    { subject: 'Recovery', A: normalize(rawRCI, 25), fullMark: 100 },
  ]

  return { totalLoad, systemState, radarData }
}
