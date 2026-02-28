'use client'

import { useParams } from 'next/navigation'
import Sidebar from '../../components/Sidebar' 
import { ArrowLeft, Clock, Share2, Linkedin, Mail, Twitter, Link as LinkIcon, Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// --- 1. THE CONTENT DATABASE ---
const articles: Record<string, any> = {
  
 "cortisol-space-connection": {
    title: "The Cortisol-Space Connection",
    category: "Neuroscience",
    readTime: "6 min read",
    date: "Feb 06, 2026",
    content: `
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        Spatial design is not neutral. The human nervous system is always looking for danger or safety in its environment. Even when we believe we are relaxed, our biology may respond differently.
        The hormone cortisol plays a central role in this process. It is released when the brain detects uncertainty, unpredictability or exposure. While short bursts of cortisol are necessary and beneficial, chronically elevated baseline levels can lead to fatigue, impaired concentration, poor sleep and mood instability.
        The structure of our homes — openness, enclosure, edges and lighting transitions — influences whether the brain relaxes or remains subtly vigilant.
        This article explores how spatial openness, enclosure and sensory predictability affect cortisol regulation, and how these insights can be applied in your own environment.
      </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">The Biology of Enclosure</h3>
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        Cortisol is released through the activation of the hypothalamic–pituitary–adrenal (HPA) axis. When the amygdala detects a potential threat, it signals the hypothalamus to trigger a hormonal response. Notably, the amygdala responds not only to danger, but also to uncertainty and a lack of control.
      </p>

      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        Large, open-plan environments with minimal visual boundaries can increase background environmental scanning. Without clear edges or protection behind the body, the brain will subconsciously monitor movement, entry points and unexpected stimuli. From an evolutionary perspective, open exposure increased the risk of predation. Humans survived by identifying locations that offered the following: visibility (prospect), physical backing (refuge), predictable entry points and stable visual fields. When these conditions are absent, the nervous system may remain in a state of low-grade vigilance, even in a modern home.
      </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">Safety Signals Across Design Traditions</h3>
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
         Long before neuroscience mapped the amygdala, traditional design systems understood spatial containment intuitively.
      </p>

      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        <strong>Ayurveda:</strong> Ayurvedic architectural principles emphasise grounding, stability, and orientation. Rooms are designed to feel anchored and proportionate.<br />
        <strong>Feng Shui:</strong> Feng Shui places a strong emphasis on having a solid wall behind seating or beds, and on controlling the flow of entry. From a neurobiological perspective, these traditions are based on the same principles. Clear edges reduce ambiguity; defined boundaries reduce scanning; and protected positioning lowers vigilance.<br />
        <strong>Why it matters:</strong> When vigilance drops, the brain reallocates energy toward creativity, memory consolidation, and emotional regulation.
      </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">Psychological Enclosure and Stress Regulation</h3>
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
         Enclosure does not require rooms to be fully closed. The brain responds to implied boundaries. Examples of psychological enclosure include a rug defining a seating area, a bookshelf creating a semi-permeable boundary, and a pendant light that lowers the visual field. The nervous system quickly processes spatial hierarchy. When a zone feels distinct and anchored, environmental scanning decreases. This supports a shift from low-level fight-or-flight to relaxed parasympathetic engagement.
      </p>

      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        <strong>The Design Strategy:</strong><br />
        <strong>Protect the Back:</strong> Never place primary seating with open circulation directly behind it. Add a console table, low shelf, or wall backing.<br />
        <strong>Define Zones:</strong> Use rugs, lighting clusters, ceiling features and furniture groupings. Clear zones reduce ambiguity.<br />
        <strong>Create Prospect + Refuge:</strong> From a protected position, you should be able to see the entrance, main windows and monitor primary movement paths without turning your head repeatedly.
      </p>

      <p class="text-[#c9ccbb]/80 leading-relaxed">
        Cortisol dynamics respond to small environmental shifts. A single bookshelf placed behind a sofa can reduce background vigilance. A defined lighting gradient can create depth that signals containment. Over time, reduced tonic stress allows for improved focus, better sleep, enhanced emotional stability and increased creative capacity.
      </p>
    `
  },

  "circadian-anchors": {
    title: "Circadian Anchors in the Home",
    category: "Light",
    readTime: "4 min read",
    date: "Jan 28, 2026",
    content: `
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        Do you know that every evening, your bedroom lighting quietly negotiates with your hormones? The wrong light level, warmth and intensity creates states in your nervous system that either tells it to stay alert, or encourages it to wind down for the night. Either choice would lead to delayed melatonin production and sleep onset, or an easy transition into sleep, and that great quality, restorative sleep that prepares us for the demands of the next day. We are going to explore how simple, repeatable lighting rituals can act as circadian anchors, providing reliable environmental cues to your nervous system to signal when it is time to wind down or get ready for the day.
      </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">Light as a Biological Signal</h3>
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
         For 300,000 years, our biology has been synchronised with the sun’s daily movement across the sky. Specialised retinal cells (ipRGCs) send direct signals to the brain’s master clock, instructing it to release cortisol to promote alertness and melatonin to encourage rest. However, modern interiors often flood rooms with the same cool, bright light from breakfast to bedtime, creating a biological misalignment that we easily recognise as feeling wired but tired.
      </p>

      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
         Real-world studies confirm the cost: adults with poor exposure to daylight during the day show delayed melatonin onset, shorter sleep and lower vitality. One crossover trial found that increasing circadian-effective daylight in homes advanced sleep onset by 22 minutes and improved sleep regularity, without altering bedtime routines.
      </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">The Power of Predictable Transitions</h3>
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        The brain loves predictability. Repeated lighting cues act as zeitgebers, or 'time-givers', that strengthen circadian amplitude. Bright morning light (ideally within 30–60 minutes of waking) spikes cortisol at the right moment, while warm, dim evening light (below 50 lux and complete darkness for sleep) creates the perfect environment for melatonin production. When you keep this up, over time the brain comes to pre-empt your sleep schedule and sleep onset becomes much easier. That is the power of neuroplasticity!
      </p>

      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        <strong>What the nervous system detects:</strong> A consistent sunset protocol, involving the switching on of amber lamps, the dimming of overhead lights and the switching off of screens, signals safety to the brain.<br />
        <strong>Associated response:</strong> Reduced sympathetic arousal, smoother melatonin onset, and deeper sleep architecture.<br />
        <strong>Why it matters:</strong> Clear temporal cues can reduce physiological confusion and support sleep quality, mood regulation and metabolic health.
      </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">The Sunset Protocol in Practice</h3>
       <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
      Create two distinct lighting states:
    </p>
    <ul class="list-disc pl-6 mb-6 text-[#c9ccbb]/80 leading-relaxed">
      <li><strong>Day Mode</strong> (up to 2–3 hours before sunset): Aim for 1,000 lux or above near a window; 250 lux is a minimum, not a target.</li>
      <li><strong>Evening Mode</strong> (sunset onward): Use only warm, low-intensity, localised lighting such as table lamps, wall sconces and candles. Avoid bright, blue-rich overhead fixtures.</li>
    </ul>
    <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
      Add one non-negotiable anchor: switching off the last overhead light becomes your body’s cue that the day is officially over. Within weeks, many people notice an earlier natural onset of sleep and clearer mornings, which is a reliable signal that your biology is responding.
    </p>
    <p class="text-[#c9ccbb]/80 leading-relaxed">
      Lighting is the most potent, cost-free instrument you have to synchronise your biology with the planet's cadence. Use it consistently and your home will stop working against your nervous system and start working with it.
    </p>
  `
},


  "silent-stressor-reverberation": {
    title: "The Silent Stressor: Reverberation",
    category: "Acoustics",
    readTime: "5 min read",
    date: "Jan 15, 2026",
    content: `
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        How reflective interiors can quietly increase cognitive effort, stress signalling and social fatigue.
      </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">Sound as Cognitive Load</h3>
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        You step into a sleek, minimalist living room with polished concrete floors, glass walls and exposed ceilings. It looks stunning. Yet, after twenty minutes of conversation, you feel a strange tiredness setting in, your thoughts are becoming muddled and you find yourself leaning forward just to hear what your partner is saying.
      </p>

      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        This subtle fatigue has a name: reverberation. It's the invisible acoustic tax that modern hard surfaces impose on your brain.
      </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">Sound Is Never Just Sound</h3>
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
         Your auditory system has evolved to detect meaningful signals within complex natural soundscapes, such as rustling leaves, distant footsteps or a child’s voice. However, in hard-surfaced interiors, sound waves bounce repeatedly, overlapping and blending together, making it difficult to distinguish individual syllables, footsteps or the clinking of glasses. This means the brain has to work harder to separate the signal from the echo. This additional cognitive load is known as listening effort, and it can be measured.
      </p>

      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        Neuroimaging shows that even moderate reverberation increases activity in the frontal lobes and the anterior cingulate cortex, which are the regions involved in mental arithmetic and emotional regulation. The nervous system interprets ongoing acoustic uncertainty as a minor environmental threat.
      </p>
      
      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">What the Nervous System Detects</h3>
    <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
      <strong>Overlapping reflections</strong> that blur speech clarity.<br />
      <strong>Prolonged listening effort</strong> that drains cognitive resources.<br />
      <strong>Associated response</strong>: elevated sympathetic activation, higher baseline cortisol, and reduced tolerance for additional stressors.
    </p>

     <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
      Over weeks and months this quiet load contributes to mental fatigue, irritability, and the vague sense that socialising at home feels more effortful than it should.
    </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">The Hidden Cost to Connection</h3>
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        Clear acoustics are essential for interpreting vocal nuances, such as the subtle rise in pitch that conveys warmth or the brief pause that signals empathy. When reverberation muddies these cues, the brain has to work harder to decode intent. Conversations become slightly more taxing, laughter less spontaneous and intimacy harder to sustain. Over time, people unconsciously withdraw from the space itself.
      </p>

         <h3 class="text-2xl font-serif text-[#b5a642] mb-4">Creating Acoustic Safety: Simple, Effective Steps</h3>
    <ul class="list-disc pl-6 mb-6 text-[#c9ccbb]/80 leading-relaxed">
      <li>Introduce soft surfaces strategically: area rugs, upholstered furniture, heavy curtains, or acoustic wall panels (disguised as art if you prefer).</li>
      <li>Break up parallel hard surfaces: add bookshelves, plants, or fabric wall hangings to diffuse noise.</li>
      <li>Choose furnishings that absorb rather than reflect: such as wool, linen, velvet, felt.</li>
      <li>Test it yourself: clap once in each room. A short, dry snap feels comfortable; a long, ringing tail means your brain is working overtime.</li>
    </ul>
    <p class="text-[#c9ccbb]/80 leading-relaxed">
      When reverberation levels drop, conversations flow more naturally and mental energy is available for connection rather than decoding. Your home will no longer quietly drain you. The space begins to feel like a true refuge--not just visually, but sonically, too.
    </p>
    <p class="text-[#c9ccbb]/80 leading-relaxed">
      Beauty and calm are not polar opposites. With a few carefully chosen acoustic features, your home can look exquisite and feel peaceful..
    </p>
  `
},


  "refuge-and-prospect": {
    title: "Refuge and Prospect",
    category: "Psychology",
    readTime: "7 min read",
    date: "Jan 10, 2026",
    content: `
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        The evolutionary reason you feel safer with your back to a wall.
      </p>

      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        <strong>Prospect</strong> is the ability to see what is approaching.<br />
        <strong>Refuge</strong> is protection from being approached or observed from behind.
      </p>

      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        Together, these conditions form a spatial pattern that the human brain has relied on for survival for hundreds of thousands of years.
      </p>

      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
      You sit down for a quiet evening in your living room. One chair faces the open doorway, with nothing behind it. You feel restless and keep glancing over your shoulder. You move to the chair against the wall, with your back protected and a clear view of the entrance, and you instantly feel a sense of relief. This instinctive sense of relief is known as the refuge-and-prospect pattern. This is a hardwired evolutionary psychology, and your nervous system still relies on it every day.
    </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">An Ancient Safety Equation</h3>
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
         For hundreds of thousands of years, survival depended on finding positions that offered two things simultaneously: Prospect (the ability to see what is coming) and refuge (protection from being seen or approached from behind). Those who chose these spots lived longer.
      </p>

      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
         In contemporary environments, the same pattern persists. When refuge is absent, such as when seated with exposed backs or with circulation behind the body, the nervous system increases environmental scanning, even if the individual feels fine.
      </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">The Neurobiology of Feeling Safe</h3>
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        Neuroimaging confirms this effect: when the back is exposed, heightened monitoring activity is evident in the amygdala and anterior cingulate cortex. However, when refuge is provided, vigilance decreases, baseline cortisol signalling drops, and the nervous system shifts towards a state of parasympathetic calm.
      </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">What the Nervous System Detects</h3>

      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        <strong>Exposed back + open circulation behind you:</strong> → constant low-level scanning.<br />
        <strong>Protected back + clear sightlines ahead:</strong> → safety confirmed, energy reallocated to rest, connection, and creativity.<br />
        <strong>Why it matters:</strong> When threat detection demands drop, attention, learning, and emotional regulation improve.
      </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">Making Refuge and Prospect Work in The Home</h3>
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        Spaces that provide both refuge and prospect are consistently described as calming, grounding, and restorative. This reflects a reduction in cognitive and physiological workload.
      </p>

      <ul class="list-disc pl-6 mb-6 text-[#c9ccbb]/80 leading-relaxed">
      <li>Never place your main sofa, bed, or desk with open space directly behind it. Add a console, low shelf, or even a tall plant for a sense of enclosure.</li>
      <li>Define zones with rugs, lighting clusters, or partial-height furniture so each seating area feels distinct and anchored.</li>
      <li>From your favourite seat, you should be able to see the main entrance and primary movement paths without constantly turning your head.</li>
      <li>In bedrooms, position the bed so you face the door while sleeping. This is the classic Command Position in Feng Shui that feels safe to your brain.</li>
    </ul>
    <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
      These adjustments cost almost nothing yet provide measurable relief to the nervous system. People consistently report deeper relaxation, fewer distractions, and a subtle but persistent sense that 'the room finally feels right'.”
    </p>
    <p class="text-[#c9ccbb]/80 leading-relaxed">
      Your home does not need to resemble a fortress. It simply needs to speak the language that your brain has understood for half a million years. 'You are safe here. You can see. You cannot be seen from behind.' Once you give the space these simple signals, it will stop draining you and start restoring you.
    </p>
  `
},


  "somatic-grounding": {
    title: "Somatic Grounding",
    category: "Texture",
    readTime: "3 min read",
    date: "Jan 05, 2026",
    content: `
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        Using tactile surfaces to manually down-regulate the nervous system.
      </p>

     <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
      Picture this: you sink into the sofa after a long and stressful day and feel something shift. You feel the soft wool throw under your palm, the cool linen cushion against your back and the gentle give of the rug beneath your bare feet. Within seconds, your shoulders relax, your breathing slows and your mind quiets. This is called somatic grounding: a direct, wordless dialogue between your skin (and touch receptors) and your nervous system.
    </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">Touch Bypasses the Thinking Brain</h3>
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        Touch is one of the fastest pathways into the nervous system. Sensory receptors in the skin send continuous feedback to the brain, informing it about safety, stability, and bodily orientation. Unlike visual or auditory input, tactile signals are processed with minimal cognitive filtering.
      </p>

      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        Texture plays a critical role in this process. Smooth, cold and uniform textures tend to signal precision and alertness. In contrast, irregular, warm or yielding surfaces provide richer sensory information, which the nervous system often interprets as grounding and supportive.
      </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">Somatic Grounding and Vagal Regulation</h3>
      <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
        Tactile input activates pressure-sensitive mechanoreceptors associated with interoception, which is the brain’s awareness of the body’s internal state. This sensory feedback is closely linked to vagal pathways involved in calming and regulation.
      </p>

      <h3 class="text-2xl font-serif text-[#b5a642] mb-4">What the Nervous System Detects</h3>
    <p class="text-[#c9ccbb]/80 leading-relaxed mb-6">
      <strong>Warm, variable pressure</strong> against palms, soles, and back → increased vagal tone and parasympathetic activation.<br />
      <strong>Rich tactile information</strong> from natural textures → enhanced interoception (the brain’s map of your internal state).<br />
      <strong>Associated response</strong>: slower heart rate, deeper breathing, reduced sympathetic arousal: a manual reset button for the nervous system.
    </p>
    
    <h3 class="text-2xl font-serif text-[#b5a642] mb-4">Turning Texture into Daily Regulation</h3>
    <ul class="list-disc pl-6 mb-6 text-[#c9ccbb]/80 leading-relaxed">
      <li>Place a thick wool or linen throw in the spot where you sit or lie most often—the one you instinctively reach for.</li>
      <li>Choose a rug or runner made from natural fibres for walking barefoot; the subtle variation underfoot helps to keep the nervous system anchored.</li>
      <li>Add a piece of untreated wooden furniture, such as a side table, bench or headboard, that invites touch.</li>
      <li>In the bedroom, use heavy linen or cotton bedding and a weighted blanket. The deep pressure provides the same calming effect as a firm hug.</li>
      <li>Notice the difference when you run your hand across a cold, synthetic surface and then a linen cushion. Your body already knows which feels like home.</li>
    </ul>
    <p class="text-[#c9ccbb]/80 leading-relaxed">
      You don't need a full renovation. Placing a single well-chosen texture where your body rests most often can provide a daily anchor for calm. Over time, these small tactile cues will train your nervous system to calm down faster, turning your home into a place that consistently supports you.
    </p>
    <p class="text-[#c9ccbb]/80 leading-relaxed">
      Your skin is the most powerful design cue, and it's already part of you. Give it surfaces that convey a sense of safety, and your nervous system will respond by bringing you peace.
    </p>
  `
}
}

// --- 2. THE PAGE COMPONENT ---
export default function ArticlePage() {
  const params = useParams()
  const [showShare, setShowShare] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  
  // Grab the slug from the URL
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const article = articles[slug]
  
  // Get Current URL for sharing
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  // Copy to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // If URL is random/wrong, show a simple "Not Found" state
  if (!article) {
    return (
      <div className="min-h-screen bg-[#1b270e] flex items-center justify-center text-[#c9ccbb]">
        <div className="text-center">
            <h1 className="text-4xl font-serif mb-4">Insight Not Found</h1>
            <Link href="/insights" className="text-[#b5a642] underline">Return to Library</Link>
        </div>
      </div>
    )
  }

  // Render the Article
  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen relative">
        
        {/* Banner Area */}
        <div className="h-64 bg-gradient-to-b from-[#b5a642]/10 to-[#1b270e] absolute top-0 w-full z-0" />

        <div className="relative z-10 p-6 md:p-12 max-w-3xl mx-auto pt-32">
            
            {/* Nav Back */}
            <Link href="/insights" className="inline-flex items-center gap-2 text-[#c9ccbb]/60 hover:text-[#b5a642] transition-colors mb-8 uppercase tracking-widest text-xs font-bold">
                <ArrowLeft size={16} /> Back to Library
            </Link>

            {/* Meta Tags */}
            <div className="flex items-center gap-4 mb-6">
                <span className="px-3 py-1 rounded-full border border-[#b5a642]/30 text-[#b5a642] text-[10px] font-bold uppercase tracking-widest bg-[#b5a642]/10">
                    {article.category}
                </span>
                <span className="flex items-center gap-2 text-[#c9ccbb]/40 text-xs font-bold uppercase tracking-widest">
                    <Clock size={14} /> {article.readTime}
                </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-12 leading-tight">
                {article.title}
            </h1>

            {/* The Article Content (Injected safely) */}
            <div className="prose prose-invert prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            {/* Footer Share */}
            <div className="mt-16 pt-8 border-t border-[#c9ccbb]/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[#c9ccbb]/40 text-xs italic">
                    Added to your library on {article.date}
                </p>
                
                {/* INTERACTIVE SHARE MENU */}
                <div className="relative">
                    {!showShare ? (
                        <button 
                            onClick={() => setShowShare(true)}
                            className="flex items-center gap-2 text-[#c9ccbb]/60 hover:text-[#b5a642] transition-colors text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-[#b5a642]/10 rounded-full"
                        >
                            <Share2 size={16} /> Share Insight
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 animate-fade-in bg-[#000]/20 rounded-full p-1 border border-[#c9ccbb]/10">
                            {/* LinkedIn */}
                            <a 
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 text-[#c9ccbb]/60 hover:text-[#0A66C2] hover:bg-[#c9ccbb]/10 rounded-full transition-colors"
                                title="Share on LinkedIn"
                            >
                                <Linkedin size={16} />
                            </a>
                            
                            {/* X / Twitter */}
                            <a 
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 text-[#c9ccbb]/60 hover:text-[#1DA1F2] hover:bg-[#c9ccbb]/10 rounded-full transition-colors"
                                title="Share on X"
                            >
                                <Twitter size={16} />
                            </a>

                            {/* Email */}
                            <a 
                                href={`mailto:?subject=${encodeURIComponent(article.title)}&body=Read this insight: ${encodeURIComponent(shareUrl)}`}
                                className="p-2 text-[#c9ccbb]/60 hover:text-[#EA4335] hover:bg-[#c9ccbb]/10 rounded-full transition-colors"
                                title="Share via Email"
                            >
                                <Mail size={16} />
                            </a>

                            {/* Copy Link */}
                            <button 
                                onClick={handleCopy}
                                className={`p-2 rounded-full transition-colors ${isCopied ? 'text-[#b5a642] bg-[#b5a642]/10' : 'text-[#c9ccbb]/60 hover:text-[#b5a642] hover:bg-[#c9ccbb]/10'}`}
                                title="Copy Link"
                            >
                                {isCopied ? <Check size={16} /> : <LinkIcon size={16} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}
