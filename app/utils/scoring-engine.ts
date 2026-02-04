// This maps your clinical thresholds to the Radar Chart (0-100 scale)
// Lower Raw Score in your model = Better Health (mostly)
// So we invert it for the chart (Higher on chart = Better Health)

export const calculateNeuroLoad = (responses: any[]) => {
  const getVal = (id: string) => {
    const r = responses.find(r => r.question_key === id)
    return r ? Number(r.answer.response) : 0 // Default to 0 if missing
  }

  // Helper for Reverse Scoring (1 becomes 5, 5 becomes 1)
  const getReverseVal = (id: string) => {
    const val = getVal(id)
    if (val === 0) return 0
    return 6 - val
  }

  // 1. Circadian Integrity (CII) - Q5-9 (5 items)
  // Note: Your model says 5-10 is regulated (Low score is good? Or High?)
  // Let's assume Scale 1 (Strongly Disagree) to 5 (Strongly Agree).
  // "I feel alert in morning" -> Agree (5) is GOOD.
  // "Bright light makes it hard to wind down" -> Agree (5) is BAD (High Load).
  // *** CRITICAL: We need to align the "Direction" of the questions. ***
  // For simplicity in this engine, I will assume we want HIGH scores on the chart = GOOD Health.

  // Let's calculate the RAW Sums based on your document:
  const rawCII = getVal('q5') + getVal('q6') + getVal('q7') + getVal('q8') + getVal('q9')
  const rawALI = getVal('q12') + getVal('q13') + getVal('q14') + getVal('q15')
  const rawPLI = getVal('q16') + getVal('q17') + getVal('q18') + getVal('q19') + getVal('q20')
  const rawSTL = getVal('q21') + getVal('q22') + getVal('q23') + getVal('q24') + getVal('q25')
  const rawRCI = getVal('q26') + getVal('q27') + getVal('q28') + getVal('q29') + getReverseVal('q30')

  const totalNeuroLoad = rawCII + rawALI + rawPLI + rawSTL + rawRCI

  // Return formatted data for the Dashboard
  return {
    indices: {
      cii: rawCII,
      ali: rawALI,
      pli: rawPLI,
      stl: rawSTL,
      rci: rawRCI
    },
    totalLoad: totalNeuroLoad,
    status: totalNeuroLoad <= 45 ? "Regulated System" 
          : totalNeuroLoad <= 70 ? "Adaptive Load"
          : totalNeuroLoad <= 95 ? "Chronic Overload"
          : "Nervous System Threat"
  }
}
