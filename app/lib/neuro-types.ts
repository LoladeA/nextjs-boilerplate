// 1. Define the "Core" Protocol Structure
// This ensures every branch (Seeker, Sensor, Standard) gets the same level of detail.
export type ProtocolVariant = {
  protocolName: string;       // e.g., "The Spotlight Effect"
  primaryAdjustment: string;  // The specific physical action
  refinement: string[];       // 2-3 specific bullet points
  whyItWorks: string;         // The specific neuroscience mechanism for THIS profile
  integrationCue: string;     // How they know it's working
};

// 2. Define the Branching Logic
export type AdaptiveProtocols = {
  // 🟢 Neuro-Normative / Balanced Profile
  // For users who need standard optimization.
  standard: ProtocolVariant;

  // 🟠 The Seeker (ADHD / Hypo-Aroused)
  // Needs: Visual cues, stimulation, friction, object permanence.
  seeker: ProtocolVariant;

  // 🔵 The Sensor (HSP / Autism / Hyper-Aroused)
  // Needs: Reduced contrast, silence, perimeter safety, containment.
  sensor: ProtocolVariant;
};

// 3. The Main Exported Interface
export type NeuroAdaptiveInsight = {
  id: number;
  category: string;
  title: string;
  
  // THE CONTEXT (The "Why")
  insight: {
    scienceFact: string;
    whyItMatters: string;
  };

  // THE SOLUTIONS (The "How" - Now Free for All)
  // This replaces the old "paid" tier.
  protocols: AdaptiveProtocols;
};
