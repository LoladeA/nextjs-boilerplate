'use client'

import { useState } from 'react'
import { determineProtocol } from '../lib/sensory-logic'
import { Clock, ExternalLink } from 'lucide-react'

export default function DebugSensoryLogic() {
  // Logic State
  const [debugStress, setDebugStress] = useState<'low'|'medium'|'high'>('low')
  const [debugTime, setDebugTime] = useState<'morning'|'afternoon'|'evening'>('morning')
  
  // The Brain Output
  const activeProtocol = determineProtocol(debugTime, debugStress)

  return (
    // CONTAINER: Gold Dashed Border + Subtle Gold Background
    <div className="mb-12 p-8 border border-dashed border-[#b5a642]/40 rounded-3xl bg-[#b5a642]/5">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h3 className="text-[#b5a642] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                🧠 Logic Engine Verification
            </h3>
            
            {/* CONTROLS */}
            <div className="flex gap-4">
                <select 
                    value={debugTime} 
                    onChange={(e) => setDebugTime(e.target.value as any)}
                    className="bg-[#1b270e] text-[#c9ccbb] py-2 px-4 rounded-lg border border-[#b5a642]/30 text-sm focus:border-[#b5a642] outline-none transition-colors"
                >
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                </select>

                <select 
                    value={debugStress} 
                    onChange={(e) => setDebugStress(e.target.value as any)}
                    className="bg-[#1b270e] text-[#c9ccbb] py-2 px-4 rounded-lg border border-[#b5a642]/30 text-sm focus:border-[#b5a642] outline-none transition-colors"
                >
                    <option value="low">Low Stress</option>
                    <option value="high">High Stress</option>
                </select>
            </div>
        </div>

        {/* ACTIVE PROTOCOL CARD */}
        {/* RESTORED: Gold Border + Gold Shadow for Depth/Lift */}
        <div className="bg-[#1b270e] p-8 rounded-2xl border border-[#b5a642]/30 shadow-2xl shadow-[#b5a642]/10">
            
            {/* Protocol Header */}
            <div className="mb-6 border-b border-[#b5a642]/20 pb-6">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-[#c9ccbb] font-serif text-3xl">{activeProtocol.name}</h2>
                    {/* Tag: Gold Border & Text */}
                    <span className="text-[#b5a642] border border-[#b5a642]/50 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#b5a642]/5">
                        {activeProtocol.id}
                    </span>
                </div>
                <p className="text-[#b5a642] text-sm font-medium mb-4 uppercase tracking-wider">
                    {activeProtocol.tagline}
                </p>
                {/* BODY COPY: Bone at 80% Opacity (Legible) */}
                <p className="text-[#c9ccbb]/80 text-base leading-relaxed max-w-3xl">
                    {activeProtocol.description}
                </p>
            </div>
            
            {/* Protocol Steps */}
            <div className="grid grid-cols-1 gap-4">
                {activeProtocol.steps.map((step, i) => (
                    // STEP CARD: Subtle Gold Border + Hover Effect
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#c9ccbb]/5 border border-[#b5a642]/20 hover:border-[#b5a642]/60 transition-colors">
                        {/* Step Number */}
                        <div className="shrink-0 w-8 h-8 rounded-full bg-[#b5a642]/10 text-[#b5a642] flex items-center justify-center font-serif font-bold border border-[#b5a642]/20">
                            {i + 1}
                        </div>
                        
                        {/* Step Content */}
                        <div className="space-y-2 w-full">
                            <div className="flex justify-between items-start">
                                <h4 className="text-[#c9ccbb] font-bold text-sm uppercase tracking-wide">
                                    {step.label}
                                </h4>
                                <div className="flex gap-3">
                                    {step.duration && (
                                        <span className="flex items-center gap-1 text-[10px] text-[#b5a642] uppercase font-bold bg-[#b5a642]/10 px-2 py-1 rounded border border-[#b5a642]/20">
                                            <Clock size={10} /> {step.duration}
                                        </span>
                                    )}
                                    {step.toolLink && (
                                        <span className="flex items-center gap-1 text-[10px] text-[#c9ccbb]/70 uppercase font-bold border border-[#c9ccbb]/20 px-2 py-1 rounded">
                                            <ExternalLink size={10} /> Tool
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {/* BODY COPY: Bone at 80% Opacity */}
                            <p className="text-[#c9ccbb]/80 text-sm leading-relaxed">
                                {step.instruction}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}
