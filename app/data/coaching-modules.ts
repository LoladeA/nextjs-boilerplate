export type Lesson = {
  id: string
  title: string
  duration: string // e.g. "4 min read"
  type: 'article' | 'audio' | 'exercise'
  isLocked: boolean
  content: string // We can support Markdown or HTML strings here
}

export type Module = {
  id: string
  title: string
  subtitle: string
  weekLabel: string
  image: string // CSS color or Image path
  isLocked: boolean
  lessons: Lesson[]
}

export const coachingModules: Module[] = [
  {
    id: 'w0-orientation',
    weekLabel: "Week 0",
    title: "Sensory Orientation",
    subtitle: "Understanding your biological baseline.",
    image: "from-[#1b270e] to-[#2a3818]", // Gradient classes
    isLocked: false, // FREE MODULE
    lessons: [
      {
        id: 'w0-l1',
        title: "A Map, Not a Diagnosis",
        duration: "3 min read",
        type: 'article',
        isLocked: false,
        content: `The results of your Sensory Intelligence Assessment are now visible...` // Paste full text here later
      },
      {
        id: 'w0-l2',
        title: "Embodied Cognition",
        duration: "5 min read",
        type: 'article',
        isLocked: false,
        content: `Modern neuroscience recognises a concept known as 'Embodied and Situated Cognition' ...`
      }
    ]
  },
  {
    id: 'w1-conversation',
    weekLabel: "Week 1",
    title: "The Silent Conversation",
    subtitle: "Cognitive load & environmental vigilance.",
    image: "from-[#2a3818] to-[#3a4a20]", 
    isLocked: true, // PAID START
    lessons: [
      {
        id: 'w1-l1',
        title: "The Always-On Monitor",
        duration: "4 min read",
        type: 'article',
        isLocked: true,
        content: `Even when you think you are relaxing, your brain is working...`
      },
      {
        id: 'w1-p1',
        title: "Practice: The Sigh Test",
        duration: "10 min active",
        type: 'exercise',
        isLocked: true,
        content: `Walk through your home and notice your body...`
      }
    ]
  },
  {
    id: 'w2-light',
    weekLabel: "Week 2",
    title: "Light as Signal",
    subtitle: "Circadian rhythms and cortisol control.",
    image: "from-[#3a4a20] to-[#b5a642]", 
    isLocked: true,
    lessons: [
      { id: 'w2-l1', title: "Light Tells Time", duration: "5 min read", type: 'article', isLocked: true, content: "..." },
      { id: 'w2-l2', title: "The Glare Tax", duration: "4 min read", type: 'article', isLocked: true, content: "..." }
    ]
  }
  // ... Add Weeks 3-8 following this pattern
]
