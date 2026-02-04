'use client'

import { Sun, Moon, Eye, Zap, Activity } from 'lucide-react'

// This component accepts the raw score and determines which science module to show
export default function LightingAnalysis({ scores }: { scores: any }) {
  
  // We set thresholds for when to trigger the warnings
  const showCircadian = scores.circadian < 60
  const showCortisol = scores.cortisol < 60
  const showGeometry = scores.geometry < 60

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Sun className="text-[#b5a642]" size={32} />
        <h2 className="text-2xl font-serif text-[#c9ccbb]">Photobiology & Circadian Health</h2>
      </div>

      {/* 1. CIRCADIAN MISALIGNMENT MODULE */}
      <div className={`glass-panel p-8 rounded-2xl border-l-4 ${showCircadian ? 'border-red-400' : 'border-[#b5a642]'}`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl text-[#c9ccbb] font-medium">1. Circadian Alignment</h3>
          <span className="text-xs uppercase tracking-widest text-[#c9ccbb]/60">
            {showCircadian ? 'High Priority' : 'Optimized'}
          </span>
        </div>
        
        <p className="text-[#c9ccbb]/80 mb-6 leading-relaxed">
          <strong>The Neuroscience:</strong> Light is the primary cue for your suprachiasmatic nucleus (body clock). 
          {showCircadian 
            ? " Your current environment suggests misaligned lighting, which suppresses melatonin and fragments sleep."
            : " Your exposure patterns currently support healthy cortisol rhythms and sleep onset."}
        </p>

        {showCircadian && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#1b270e]/30 p-4 rounded-xl">
            <div className="flex gap-3">
              <Sun size={20} className="text-[#b5a642] mt-1" />
              <div>
                <span className="block text-[#c9ccbb] font-bold text-sm">Morning Boost</span>
                <span className="text-[#c9ccbb]/60 text-sm">Target 4500–6500K light (blue-enriched) before 10 AM to signal "daytime" to the brain.</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Moon size={20} className="text-[#b5a642] mt-1" />
              <div>
                <span className="block text-[#c9ccbb] font-bold text-sm">Evening Wind-Down</span>
                <span className="text-[#c9ccbb]/60 text-sm">Switch to {`<3000K`} warm, dim lighting 2 hours before bed to support melatonin.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. CORTISOL TRIGGER MODULE */}
      {showCortisol && (
        <div className="glass-panel p-8 rounded-2xl border-l-4 border-orange-400">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-orange-400" size={24} />
            <h3 className="text-xl text-[#c9ccbb] font-medium">2. Cortisol Triggering</h3>
          </div>
          <p className="text-[#c9ccbb]/80 mb-6 leading-relaxed">
            <strong>The Issue:</strong> Short-wavelength (blue) light stimulates the HPA axis. Your assessment flags exposure to bright/blue light at sensitive times, likely spiking cortisol when you need rest.
          </p>
          <div className="bg-[#1b270e]/30 p-4 rounded-xl">
             <h4 className="text-[#b5a642] text-sm font-bold uppercase mb-2">Prescription</h4>
             <ul className="text-sm text-[#c9ccbb]/70 space-y-2 list-disc pl-4">
               <li><strong>Spectrum Sensitivity:</strong> Avoid high-intensity blue light 2–3 hours before sleep.</li>
               <li><strong>Wavelength Adjustment:</strong> Use "phase-appropriate" warm profiles in the evening to reduce stress axis activation.</li>
             </ul>
          </div>
        </div>
      )}

      {/* 3. LIGHT GEOMETRY MODULE */}
      <div className="glass-panel p-8 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Eye className="text-[#c9ccbb]" size={24} />
          <h3 className="text-xl text-[#c9ccbb] font-medium">3. Visual Comfort & Geometry</h3>
        </div>
        <p className="text-[#c9ccbb]/80 mb-6 leading-relaxed">
           Harsh overheads or glare cause visual strain and low-grade stress signaling.
           {showGeometry 
             ? " Your space indicates a reliance on direct/overhead sources." 
             : " Your layered lighting approach supports nervous system regulation."}
        </p>
        
        {showGeometry && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="p-4 rounded-lg bg-[#c9ccbb]/5 border border-[#c9ccbb]/10">
               <span className="block text-[#b5a642] font-bold text-lg mb-1">Layering</span>
               <span className="text-xs text-[#c9ccbb]/60">Mix indirect ambient light with focused task lighting.</span>
             </div>
             <div className="p-4 rounded-lg bg-[#c9ccbb]/5 border border-[#c9ccbb]/10">
               <span className="block text-[#b5a642] font-bold text-lg mb-1">Diffusion</span>
               <span className="text-xs text-[#c9ccbb]/60">Use shades or bounce light off walls to soften harsh contrasts.</span>
             </div>
             <div className="p-4 rounded-lg bg-[#c9ccbb]/5 border border-[#c9ccbb]/10">
               <span className="block text-[#b5a642] font-bold text-lg mb-1">Flicker</span>
               <span className="text-xs text-[#c9ccbb]/60">Ensure LEDs are high-quality to prevent subliminal stress.</span>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
