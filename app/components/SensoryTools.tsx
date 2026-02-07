'use client'

import { useState } from 'react'
import { Sun, Mic, Wind, Activity } from 'lucide-react'
import EnvironmentalScanner from './EnvironmentalScanner' // Keeping this for Acoustic
import LightMeter from './tools/LightMeter' // Using this for Light

export default function SensoryTools() {
  const [activeTool, setActiveTool] = useState<'acoustic' | 'light' | null>(null)

  // Handler for when the new Light Meter saves data
  const handleSaveLux = (lux: number) => {
    console.log("Saving Lux:", lux)
    // In the future, we will connect this to Supabase here
    setActiveTool(null)
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* LIGHT METER (Uses New Camera Tool) */}
        <button 
          onClick={() => setActiveTool('light')}
          className="glass-panel p-6 rounded-xl text-left hover:bg-[#c9ccbb]/5 transition-all group"
        >
          <Sun className="text-[#b5a642] mb-3 group-hover:scale-110 transition-transform" size={24} />
          <h3 className="text-[#c9ccbb] font-serif text-lg">Light Meter</h3>
          <p className="text-[#c9ccbb]/40 text-xs mt-1">Check Lux levels</p>
        </button>

        {/* ACOUSTIC METER (Uses Existing Scanner) */}
        <button 
          onClick={() => setActiveTool('acoustic')}
          className="glass-panel p-6 rounded-xl text-left hover:bg-[#c9ccbb]/5 transition-all group"
        >
          <Mic className="text-[#b5a642] mb-3 group-hover:scale-110 transition-transform" size={24} />
          <h3 className="text-[#c9ccbb] font-serif text-lg">Noise Level</h3>
          <p className="text-[#c9ccbb]/40 text-xs mt-1">Monitor dBA load</p>
        </button>

        {/* PLACEHOLDERS */}
        <div className="glass-panel p-6 rounded-xl text-left opacity-60">
          <Wind className="text-[#c9ccbb] mb-3" size={24} />
          <h3 className="text-[#c9ccbb] font-serif text-lg">Air Quality</h3>
          <p className="text-[#c9ccbb]/40 text-xs mt-1">Connect Sensor</p>
        </div>
        
        <div className="glass-panel p-6 rounded-xl text-left opacity-60">
          <Activity className="text-[#c9ccbb] mb-3" size={24} />
          <h3 className="text-[#c9ccbb] font-serif text-lg">HRV Sync</h3>
          <p className="text-[#c9ccbb]/40 text-xs mt-1">Coming Soon</p>
        </div>
      </div>

      {/* CONDITIONAL RENDERING */}
      
      {/* 1. If 'light' is active, show the NEW Camera Meter */}
      {activeTool === 'light' && (
        <LightMeter 
          onClose={() => setActiveTool(null)} 
          onSave={handleSaveLux}
        />
      )}

      {/* 2. If 'acoustic' is active, show your OLD Reliable Scanner */}
      {activeTool === 'acoustic' && (
        <EnvironmentalScanner 
          type="acoustic" 
          onClose={() => setActiveTool(null)} 
        />
      )}
    </>
  )
}
