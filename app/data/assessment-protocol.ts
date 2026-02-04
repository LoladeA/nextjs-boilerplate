export const assessmentProtocol = {
  part0: {
    title: "Nervous System Snapshot",
    step: 0,
    subtitle: "Current State",
    main_question: "Baseline Regulation Check",
    description: "Before we assess the environment, we must establish the current load on your nervous system.",
    questions: [
      { id: 'q_state', text: "How does your body feel in your home environment right now?", type: 'choice', options: ['Alert', 'Calm', 'Wired', 'Flat', 'Tense'] },
      { id: 'energy_tax', text: "What percentage of your energy goes toward managing your environment vs. living in it?", type: 'slider' },
      { id: 'primary_strain', text: "Which feels most true right now?", type: 'choice', options: ['Mental overload', 'Physical tension', 'Emotional volatility', 'Sleep disruption'] },
      { id: 'neuro_lens', text: "My sensory processing is influenced by:", type: 'choice', options: ['HSP', 'ADHD', 'Autism', 'Dyslexia', 'SPD', 'None'] },
    ]
  },
  part1: {
    title: "Circadian Integrity",
    step: 1,
    subtitle: "Light → Hormones",
    main_question: "How well does your home support your natural body clock?",
    description: "This section measures whether your lighting, daily rhythms and environmental signals help or hinder your body's regulation of energy, sleep and hormonal cycles.",
    questions: [
      { id: 'q5', text: "I feel alert in the morning without needing to push myself.", type: 'scale' },
      { id: 'q6', text: "I feel naturally sleepy in the evening and fall asleep easily without forcing it.", type: 'scale' },
      { id: 'q7', text: "My energy feels rhythmical rather than flat or chaotic.", type: 'scale' },
      { id: 'q8', text: "Bright lighting in the evening makes it harder to wind down.", type: 'scale' },
      { id: 'q9', text: "Dim daylight makes me feel low or foggy.", type: 'scale' },
    ]
  },
  part2: {
    title: "Autonomic Load",
    step: 2,
    subtitle: "Stress Axis",
    main_question: "How hard is your nervous system working to stay regulated?",
    description: "This section reveals whether your home allows your body to switch off and recover, or keeps your stress system partially activated, even when you are at rest.",
    questions: [
      { id: 'q12', text: "Small sensory changes quickly make me irritable or tense.", type: 'scale' },
      { id: 'q13', text: "I feel “on edge” at home for no obvious reason.", type: 'scale' },
      { id: 'q14', text: "I struggle to fully relax, even when nothing is wrong.", type: 'scale' },
      { id: 'q15', text: "My home feels like it requires constant micro-adjustments.", type: 'scale' },
    ]
  },
  part3: {
    title: "Predictive Legibility",
    step: 3,
    subtitle: "Hierarchy & Flow",
    main_question: "How easily can your brain read and navigate your surroundings?",
    description: "This section assesses whether your environment is spatially clear and intuitive, or if it requires constant micro-decisions and mental recalibration to make sense of it.",
    questions: [
      { id: 'q16', text: "I immediately know what each space in my home is for when I enter it.", type: 'scale' },
      { id: 'q17', text: "I move through my home without hesitation or backtracking.", type: 'scale' },
      { id: 'q18', text: "There is a clear focal point in most rooms.", type: 'scale' },
      { id: 'q19', text: "I don’t feel visually pulled in multiple directions.", type: 'scale' },
      { id: 'q20', text: "My home feels intuitive rather than effortful.", type: 'scale' },
    ]
  },
  part4: {
    title: "Sensory Threat Load",
    step: 4,
    subtitle: "Sensory Gating",
    main_question: "How much sensory information is your nervous system filtering out?",
    description: "This captures the cumulative impact of light, sound, texture and visual complexity, as well as how your nervous system experiences them: whether as soothing or overwhelming.",
    questions: [
      { id: 'q21', text: "Visual clutter disrupts my focus.", type: 'scale' },
      { id: 'q22', text: "Background noise prevents full relaxation.", type: 'scale' },
      { id: 'q23', text: "Overhead lighting feels harsh or tiring.", type: 'scale' },
      { id: 'q24', text: "Certain textures change my mood negatively.", type: 'scale' },
      { id: 'q25', text: "My body tension changes between rooms.", type: 'scale' },
    ]
  },
  part5: {
    title: "Recovery Capacity",
    step: 5,
    subtitle: "Parasympathetic Restoration",
    main_question: "How effectively does your home help you to restore energy?",
    description: "This section indicates whether your space truly enables you to relax, recover and recharge, or leaves you technically off duty, but never fully restored.",
    questions: [
      { id: 'q26', text: "I avoid rooms that drain me.", type: 'scale' },
      { id: 'q27', text: "I feel less rested after time at home.", type: 'scale' },
      { id: 'q28', text: "I struggle to switch off mentally at night.", type: 'scale' },
      { id: 'q29', text: "My body feels safer outside my home than inside.", type: 'scale' },
      { id: 'q30', text: "My home helps me recover, not just function.", type: 'scale', reverse: true },
    ]
  }
}
