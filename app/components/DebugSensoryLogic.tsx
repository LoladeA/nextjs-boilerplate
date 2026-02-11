'use client'

import { useState } from 'react'
import { determineProtocol } from '../lib/sensory-logic'

export default function DebugSensoryLogic() {
  // Logic State
  const [debugStress, setDebugStress] = useState<'low'|'medium'|'high'>('medium')
  const [debugTime, setDebugTime] = useState<'morning'|'afternoon'|'evening'>('evening')
  
  // The Brain Output
  const activeProtocol = determineProtocol(debugTime, debugStress)

  return (
    <div className="mb-12 p-6 border border-dashed border-[#b5a642]/50 rounded-xl bg-[#b5a642]/5">
        <h3 className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            🧠 Logic Engine Test <span className="text-[#c9ccbb]/40 font-normal normal-case">(Developers Only)</span>
        </h3>
        
        <div className="flex gap-4 mb-6">
            <select 
                value={debugTime} 
                onChange={(e) => setDebugTime(e.target.value as any)}
                className="bg-[#1b270e] text-[#c9ccbb] p-2 rounded border border-[#c9ccbb]/20 text-sm"
            >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
            </select>

            <select 
                value={debugStress} 
                onChange={(e) => setDebugStress(e.target.value as any)}
                className="bg-[#1b270e] text-[#c9ccbb] p-2 rounded border border-[#c9ccbb]/20 text-sm"
            >
                <option value="low">Low Stress</option>
                <option value="medium">Medium Stress</option>
                <option value="high">High Stress</option>
            </select>
        </div>

        <div className="bg-[#1b270e] p-6 rounded-lg border border-[#c9ccbb]/10">
            <div className="flex justify-between items-start mb-2">
                <div className="text-[#c9ccbb] font-serif text-2xl">{activeProtocol.name}</div>
                <div className="text-[#b5a642] text-xs font-bold uppercase tracking-widest bg-[#b5a642]/10 px-2 py-1 rounded">
                    {activeProtocol.id}
                </div>
            </div>
            <div className="text-[#c9ccbb]/60 text-sm mb-6 border-l-2 border-[#b5a642] pl-3 italic">
                "{activeProtocol.description}"
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeProtocol.steps.map((step, i) => (
                    <div key={i} className="text-xs text-[#c9ccbb] bg-[#c9ccbb]/5 p-3 rounded border border-[#c9ccbb]/10">
                        <strong className="text-[#b5a642] block mb-1 uppercase tracking-widest text-[10px]">{step.type}</strong> 
                        {step.instruction}
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}
