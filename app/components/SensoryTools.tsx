'use client'

import { Sun, Mic, Wind, Activity } from 'lucide-react'
import Link from 'next/link'

export default function SensoryTools() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      
      {/* 1. LIGHT METER - LINKS TO THE TOOL */}
      <Link href="/tools/light-meter" className="block group">
        <div className="p-6 rounded-2xl bg-[#1b270e] border border-[#c9ccbb]/10 hover:border-[#b5a642]/50 transition-all h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
            <Sun size={48} />
          </div>
          <div className="text-[#b5a642] mb-3">
            <Sun size={24} />
          </div>
          <h4 className="text-[#c9ccbb] font-serif text-lg mb-1 group-hover:text-[#b5a642] transition-colors">Light Meter</h4>
          <p className="text-[#c9ccbb]/50 text-xs">Check Lux levels</p>
        </div>
      </Link>

      {/* 2. NOISE LEVEL (Placeholder) */}
      <div className="p-6 rounded-2xl bg-[#1b270e] border border-[#c9ccbb]/10 opacity-50 cursor-not-allowed h-full">
        <div className="text-[#b5a642] mb-3">
          <Mic size={24} />
        </div>
        <h4 className="text-[#c9ccbb] font-serif text-lg mb-1">Noise Level</h4>
        <p className="text-[#c9ccbb]/50 text-xs">Monitor dBA load</p>
      </div>

      {/* 3. AIR QUALITY (Placeholder) */}
      <div className="p-6 rounded-2xl bg-[#1b270e] border border-[#c9ccbb]/10 opacity-50 cursor-not-allowed h-full">
        <div className="text-[#b5a642] mb-3">
          <Wind size={24} />
        </div>
        <h4 className="text-[#c9ccbb] font-serif text-lg mb-1">Air Quality</h4>
        <p className="text-[#c9ccbb]/50 text-xs">Connect Sensor</p>
      </div>

      {/* 4. HRV SYNC (Placeholder) */}
      <div className="p-6 rounded-2xl bg-[#1b270e] border border-[#c9ccbb]/10 opacity-50 cursor-not-allowed h-full">
        <div className="text-[#c9ccbb] mb-3">
          <Activity size={24} />
        </div>
        <h4 className="text-[#c9ccbb] font-serif text-lg mb-1">HRV Sync</h4>
        <p className="text-[#c9ccbb]/50 text-xs">Coming Soon</p>
      </div>

    </div>
  )
}
