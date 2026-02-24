'use client'

import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { Heart, Wind, Sun, Volume2, CheckCircle, TrendingUp, Activity, Zap, Loader2, Moon, Sunrise, Brain, Fingerprint, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import CorrelationGraph from './CorrelationGraph'
import { LightSensorModal } from '../tools/light-meter/page'
import { NoiseSensorModal } from '../tools/noise-meter/page'

// 🟢 1. IMPORTING OUR NEW ENTERPRISE LAYERS
import { useDailyLogs } from '../../hooks/useDailyLogs'
import { getMorningFeedback, getEveningFeedback, getMacroSynthesis } from '../../lib/synthesisEngine'

export default function Progress() {
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning')

  // 🟢 2. CALLING THE DATA CONTROLLER HOOK (Abstracts 500 lines of code)
  const { 
    formData, updateField, toggleTag, 
    status, showAccuracyWarning, setShowAccuracyWarning, 
    bsfiData, chartLogs, hasAccess, handleSave 
  } = useDailyLogs()

  // UI Modals & Accordions
  const [isLightMeterOpen, setIsLightMeterOpen] = useState(false)
  const [isAcousticMeterOpen, setIsAcousticMeterOpen] = useState(false)
  const [activeMeterTarget, setActiveMeterTarget] = useState<'morningLux' | 'eveningLux' | 'daytimeDb' | 'nighttimeDb' | null>(null)
  const [isMorningOpen, setIsMorningOpen] = useState(false)
  const [isEveningOpen, setIsEveningOpen] = useState(false)
  const [isSynthesisExpanded, setIsSynthesisExpanded] = useState(false) 

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 17) setActiveTab('evening')
  }, [])

  // 🟢 3. CALLING THE IP ENGINE (Calculates insights dynamically based on the hook's data)
  const morningInsight = getMorningFeedback(formData.tensionScore, formData.wakeScore)
  const eveningInsight = getEveningFeedback(formData.focusScore)
  const macroSynthesis = getMacroSynthesis(chartLogs, bsfiData)

  // Options & Constants
  const moods = [
    { val: 1, label: 'Burned Out', desc: 'Running on empty', color: 'bg-red-500/20 border-red-500/50 text-red-400' },
    { val: 2, label: 'Tense / Edgy', desc: 'Buzzing with stress', color: 'bg-orange-500/20 border-orange-500/50 text-orange-400' },
    { val: 3, label: 'Neutral', desc: 'Surviving baseline', color: 'bg-[#c9ccbb]/70 border-[#c9ccbb]/50 text-[#c9ccbb]' },
    { val: 4, label: 'Grounded', desc: 'Breathing deeper', color: 'bg-[#b5a642]/20 border-[#b5a642]/50 text-[#b5a642]' },
    { val: 5, label: 'In Flow', desc: 'Effortless movement', color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' }
  ]
  
  const morningTagOptions = [
    { id: 'ventilation', label: 'Ventilated Home (Air Exchange)', icon: <Wind size={14} /> },
    { id: 'sunlight', label: 'Got Early Morning Sunlight', icon: <Sun size={14} /> },
    { id: 'noise_buffer', label: 'Buffered Against Intrustive Noise', icon: <Volume2 size={14} /> },
    { id: 'declutter', label: 'Cleared/ Decluttered One Priority Area', icon: <CheckCircle size={14} /> },
  ]

  const eveningTagOptions = [
    { id: 'low_horizon', label: 'Turned Off The Big Lights & Switched To Warm, Low-Level Lighting', icon: <Zap size={14} /> },
    { id: 'entropy_reset', label: 'Decluttered The First Surface I See In The Morning', icon: <CheckCircle size={14} /> },
    { id: 'acoustic_seal', label: 'Using Sound-Softening Barriers (Curtains, Doors & Mechanical Noise)', icon: <Volume2 size={14} /> },
    { id: 'tactile_enclosure', label: 'Using Gentle Weight & Soft Textures for Sleep', icon: <Heart size={14} /> },
  ]

  const getBsfiLabel = (score: number) => {
    if (score <= 20) return { label: 'Low Environmental Friction', color: 'text-emerald-400', border: 'border-emerald-500/30' }
    if (score <= 40) return { label: 'Mild Load', color: 'text-blue-400', border: 'border-blue-500/30' }
    if (score <= 60) return { label: 'Moderate Strain', color: 'text-yellow-400', border: 'border-yellow-500/30' }
    if (score <= 80) return { label: 'High Friction', color: 'text-orange-400', border: 'border-orange-500/30' }
    return { label: 'Dysregulated Pattern', color: 'text-red-400', border: 'border-red-500/30' }
  }

  // Dynamic UI Resolvers based on the active tab
  const currentMood = activeTab === 'morning' ? formData.morningMood : formData.eveningMood
  const setCurrentMood = (val: number) => updateField(activeTab === 'morning' ? 'morningMood' : 'eveningMood', val)
  const currentTags = activeTab === 'morning' ? formData.morningTags : formData.eveningTags
  const currentNote = activeTab === 'morning' ? formData.morningNote : formData.eveningNote
  const setCurrentNote = (val: string) => updateField(activeTab === 'morning' ? 'morningNote' : 'eveningNote', val)
  const currentOptions = activeTab === 'morning' ? morningTagOptions : eveningTagOptions

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-12">
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Your Daily Logs</h1>
            <p className="text-[#c9ccbb]/80">
              Log your daily state to train the nervous system and reveal long-term patterns.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl mb-16 relative overflow-hidden border border-[#c9ccbb]/10">
            
            <div className="flex justify-center mb-8">
                <div className="bg-[#000]/30 p-1 rounded-full flex gap-1 border border-[#c9ccbb]/10">
                    <button 
                        onClick={() => setActiveTab('morning')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'morning' ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/70 hover:text-[#c9ccbb]'
                        }`}
                    >
                        <Sunrise size={14} /> Morning
                    </button>
                    <button 
                        onClick={() => setActiveTab('evening')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'evening' ? 'bg-[#b5a642] text-[#1b270e]' : 'text-[#c9ccbb]/70 hover:text-[#c9ccbb]'
                        }`}
                    >
                        <Moon size={14} /> Evening
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-full bg-[#b5a642]/10 flex items-center justify-center text-[#b5a642]">
                 <Heart size={20} />
               </div>
               <h2 className="text-2xl font-serif text-[#c9ccbb]">
                   {activeTab === 'morning' ? 'Morning Baseline' : 'Evening Wind-Down'}
               </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {moods.map((mood) => (
                <button
                  key={mood.val}
                  onClick={() => setCurrentMood(mood.val)}
                  className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-28 group relative overflow-hidden ${
                    currentMood === mood.val 
                      ? `${mood.color} shadow-lg scale-105` 
                      : 'bg-[#000]/20 border-[#c9ccbb]/10 text-[#c9ccbb]/40 hover:bg-[#c9ccbb]/5'
                  }`}
                >
                  <span className="text-xl font-serif font-bold relative z-10">{mood.val}</span>
                  <div className="relative z-10">
                    <div className={`font-bold text-xs mb-1 ${currentMood === mood.val ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                      {mood.label}
                    </div>
                  </div>
                  {currentMood === mood.val && <div className="absolute inset-0 bg-white/5 blur-md" />}
                </button>
              ))}
            </div>

            {activeTab === 'morning' && (
                <div className="mb-8 p-6 bg-[#b5a642]/5 rounded-2xl border border-[#b5a642]/10 animate-fade-in">
                    <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-6 block flex items-center gap-2">
                        <Activity size={12} /> Somatic Baseline
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                                   <Activity size={14} className="text-[#b5a642]" /> Jaw/Body Tension
                                </label>
                                <span className="text-[#b5a642] font-mono text-xs">{formData.tensionScore}/10</span>
                            </div>
                            <p className="text-[#c9ccbb]/40 text-[10px] mb-3">Jaw/Shoulder tightness upon waking.</p>
                            <input 
                                type="range" min="0" max="10" step="1"
                                value={formData.tensionScore}
                                onChange={(e) => updateField('tensionScore', parseInt(e.target.value))}
                                className="w-full accent-[#b5a642] h-1 bg-[#000]/50 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                                   <Moon size={14} className="text-[#b5a642]" /> Sleep Interruptions
                                </label>
                                <div className="flex gap-3">
                                    <button onClick={() => updateField('wakeScore', Math.max(0, formData.wakeScore - 1))} className="text-[#c9ccbb] hover:text-[#b5a642]">-</button>
                                    <span className="text-[#b5a642] font-mono text-xs">{formData.wakeScore}</span>
                                    <button onClick={() => updateField('wakeScore', formData.wakeScore + 1)} className="text-[#c9ccbb] hover:text-[#b5a642]">+</button>
                                </div>
                            </div>
                            <p className="text-[#c9ccbb]/40 text-[10px] mb-3">Sleep interruptions.</p>
                        </div>
                    </div>

                    {(formData.tensionScore > 0 || formData.wakeScore > 0) && (
                        <div className="mt-6 bg-[#1b270e] border-l-2 border-[#b5a642] rounded-r-xl overflow-hidden shadow-md">
                            <button 
                                onClick={() => setIsMorningOpen(!isMorningOpen)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#b5a642]/5 transition-colors"
                            >
                                <span className="text-[#b5a642] text-[10px] uppercase font-bold tracking-widest">
                                    {morningInsight.title}
                                </span>
                                <motion.div animate={{ rotate: isMorningOpen ? 180 : 0 }}>
                                    <ChevronDown size={14} className="text-[#b5a642]" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {isMorningOpen && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }} 
                                        animate={{ height: "auto", opacity: 1 }} 
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden relative"
                                    >
                                        {hasAccess ? (
                                            <div className="p-4 pt-0 space-y-3">
                                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                    <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Reframe:</strong> 
                                                    {morningInsight.reframe}
                                                </p>
                                                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                    <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Direction:</strong> 
                                                    {morningInsight.direction}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="relative p-4 pt-0">
                                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                                <div className="filter blur-[3px] opacity-30 select-none space-y-3 pointer-events-none">
                                                    <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                        <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Reframe:</strong> 
                                                        Waking through the night is less often a sign of dysregulation than a sign of thermoregulatory shift. Your environment may not be matching its needs.
                                                    </p>
                                                    <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                        <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Direction:</strong> 
                                                        Focus on the recovery envelope: breathable organic sleepwear, a cooler ambient temperature, and complete darkness.
                                                    </p>
                                                </div>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                                                    <Lock size={16} className="text-[#b5a642] mb-2" />
                                                    <span className="text-[10px] font-bold text-[#c9ccbb] uppercase tracking-widest mb-3 text-center">Unlock Somatic Reframes</span>
                                                    <Link href="/upgrade">
                                                        <button className="px-6 py-2 bg-[#b5a642] text-[#1b270e] text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-white transition-all">
                                                            Upgrade
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'evening' && (
                <div className="mb-8 p-6 bg-[#b5a642]/5 rounded-2xl border border-[#b5a642]/10 animate-fade-in">
                    <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-6 block flex items-center gap-2">
                        <Brain size={12} /> Cognitive Output
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-[#c9ccbb]">
                                   <Brain size={14} className="text-[#b5a642]" /> Deep Work (Hrs)
                                </label>
                                <span className="text-[#b5a642] font-mono text-xs">{formData.focusScore}h</span>
                            </div>
                            <p className="text-[#c9ccbb]/40 text-[10px] mb-3">Hours of uninterrupted workflow.</p>
                            <input 
                                type="range" min="0" max="12" step="0.5"
                                value={formData.focusScore}
                                onChange={(e) => updateField('focusScore', parseFloat(e.target.value))}
                                className="w-full accent-[#b5a642] h-1 bg-[#000]/50 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    {formData.focusScore > 0 && (
                        <div className="mt-6 bg-[#1b270e] border-l-2 border-[#b5a642] rounded-r-xl overflow-hidden shadow-md">
                            <button 
                                onClick={() => setIsEveningOpen(!isEveningOpen)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#b5a642]/5 transition-colors"
                            >
                                <span className="text-[#b5a642] text-[10px] uppercase font-bold tracking-widest">
                                    {eveningInsight.title}
                                </span>
                                <motion.div animate={{ rotate: isEveningOpen ? 180 : 0 }}>
                                    <ChevronDown size={14} className="text-[#b5a642]" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {isEveningOpen && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }} 
                                        animate={{ height: "auto", opacity: 1 }} 
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden relative"
                                    >
                                        {hasAccess ? (
                                            <div className="p-4 pt-0 space-y-3">
                                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                    <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Reframe:</strong> 
                                                    {eveningInsight.reframe}
                                                </p>
                                                <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                    <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Direction:</strong> 
                                                    {eveningInsight.direction}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="relative p-4 pt-0">
                                                <div className="w-full h-px bg-[#b5a642]/10 mb-4" />
                                                <div className="filter blur-[3px] opacity-30 select-none space-y-3 pointer-events-none">
                                                    <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                        <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Reframe:</strong> 
                                                        Extended time in high-beta execution mode is a central nervous system stressor. The day was productive.
                                                    </p>
                                                    <p className="text-[#c9ccbb]/80 text-xs leading-relaxed">
                                                        <strong className="text-[#c9ccbb] font-serif tracking-wide mr-2">Direction:</strong> 
                                                        Tonight's environment must match today's demand. Transition strictly to warm, low-level lighting.
                                                    </p>
                                                </div>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                                                    <Lock size={16} className="text-[#b5a642] mb-2" />
                                                    <span className="text-[10px] font-bold text-[#c9ccbb] uppercase tracking-widest mb-3 text-center">Unlock Somatic Reframes</span>
                                                    <Link href="/upgrade">
                                                        <button className="px-6 py-2 bg-[#b5a642] text-[#1b270e] text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-white transition-all">
                                                            Upgrade
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}

            <div className="mb-8 p-6 bg-[#000]/20 rounded-2xl border border-[#c9ccbb]/5">
                <label className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-4 block flex items-center gap-2">
                    <Activity size={12} /> Environmental Exposure
                </label>
                
                {activeTab === 'morning' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
                                    <Sun size={14} className="text-orange-400" /> Morning Light (Lux)
                                </div>
                                <button 
                                    onClick={() => { setActiveMeterTarget('morningLux'); setIsLightMeterOpen(true); }}
                                    className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                                >
                                    <Activity size={12} /> Measure
                                </button>
                            </div>
                            <input 
                                type="number" 
                                placeholder="e.g. 250 (Dim) or 2500 (Bright)"
                                value={formData.morningLux}
                                onChange={(e) => updateField('morningLux', e.target.value)}
                                className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
                                    <Volume2 size={14} className="text-red-400" /> Daytime Noise (dB)
                                </div>
                                <button 
                                    onClick={() => { setActiveMeterTarget('daytimeDb'); setIsAcousticMeterOpen(true); }}
                                    className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                                >
                                    <Activity size={12} /> Measure
                                </button>
                            </div>
                            <input 
                                type="number" 
                                placeholder="e.g. 45 (Office) or 70 (Street)"
                                value={formData.daytimeDb}
                                onChange={(e) => updateField('daytimeDb', e.target.value)}
                                className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
                                    <Zap size={14} className="text-orange-400" /> Evening Light (Lux)
                                </div>
                                <button 
                                    onClick={() => { setActiveMeterTarget('eveningLux'); setIsLightMeterOpen(true); }}
                                    className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                                >
                                    <Activity size={12} /> Measure
                                </button>
                            </div>
                            <input 
                                type="number" 
                                placeholder="e.g. 100 (Warm) or 800 (Overhead)"
                                value={formData.eveningLux}
                                onChange={(e) => updateField('eveningLux', e.target.value)}
                                className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest">
                                    <Moon size={14} className="text-blue-400" /> Nighttime Noise (dB)
                                </div>
                                <button 
                                    onClick={() => { setActiveMeterTarget('nighttimeDb'); setIsAcousticMeterOpen(true); }}
                                    className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-[#b5a642]/10 px-2 py-1 rounded-md border border-[#b5a642]/20"
                                >
                                    <Activity size={12} /> Measure
                                </button>
                            </div>
                            <input 
                                type="number" 
                                placeholder="e.g. 35 (Quiet) or 55 (Loud)"
                                value={formData.nighttimeDb}
                                onChange={(e) => updateField('nighttimeDb', e.target.value)}
                                className="w-full bg-[#1b270e] border border-[#c9ccbb]/10 rounded-xl p-3 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mb-8 animate-fade-in">
              {currentOptions.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(activeTab, tag.id)}
                  className={`flex items-center gap-2 px-4 py-3 h-auto rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                    currentTags.includes(tag.id)
                      ? 'bg-[#b5a642] border-[#b5a642] text-[#1b270e]'
                      : 'bg-[#000]/20 border-[#c9ccbb]/10 text-[#c9ccbb]/50 hover:text-[#c9ccbb]'
                  }`}
                >
                  {tag.icon} 
                  <span className="whitespace-normal text-left leading-tight">{tag.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-8">
              <textarea 
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder={activeTab === 'morning' ? "Morning Observations?" : "Evening Observations?"}
                className="w-full h-24 bg-[#000]/20 border border-[#c9ccbb]/10 rounded-xl p-4 text-[#c9ccbb] text-sm placeholder:text-[#c9ccbb]/50 focus:outline-none focus:border-[#b5a642]/50 resize-none font-sans"
              />
            </div>

            <div className="flex flex-col gap-4 pt-6 border-t border-[#c9ccbb]/10">
              <AnimatePresence>
                {showAccuracyWarning && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-4 bg-[#b5a642]/10 border border-[#b5a642]/30 rounded-xl"
                  >
                    <p className="text-sm text-[#c9ccbb] leading-relaxed">
                      <strong className="text-[#b5a642] uppercase tracking-widest text-[10px] mr-2 block mb-1">Oops:</strong> 
                      Looks like you have missing sensory readings for this session. The Bio-Spatial Friction engine requires these metrics for accuracy.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end items-center gap-4">
                 <AnimatePresence>
                   {status === 'success' && (
                     <motion.span 
                       initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                       className="text-[#b5a642] text-xs font-bold uppercase tracking-widest flex items-center gap-1"
                     >
                       <CheckCircle size={14} /> Saved
                     </motion.span>
                   )}
                 </AnimatePresence>
                 
                 <button 
                   onClick={() => handleSave(activeTab, showAccuracyWarning)}
                   disabled={currentMood === null || status === 'saving'}
                   className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                     currentMood === null 
                       ? 'bg-[#c9ccbb]/10 text-[#c9ccbb]/50 cursor-not-allowed'
                       : showAccuracyWarning
                         ? 'bg-transparent border border-[#b5a642] text-[#b5a642] hover:bg-[#b5a642]/10'
                         : 'bg-[#c9ccbb] text-[#1b270e] hover:bg-white' 
                   }`}
                 >
                   {status === 'saving' ? (
                      <>Saving <Loader2 size={14} className="animate-spin" /></>
                   ) : showAccuracyWarning ? 'Save Incomplete Entry' : 'Log Entry'}
                 </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {bsfiData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="glass-panel p-6 rounded-3xl mb-8 border border-[#b5a642]/30 relative overflow-hidden bg-gradient-to-br from-[#b5a642]/10 to-transparent"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className={`w-24 h-24 rounded-full border-4 ${getBsfiLabel(bsfiData.total_score).border} flex flex-col items-center justify-center bg-[#1b270e] shrink-0 shadow-xl shadow-[#b5a642]/10`}>
                      <span className={`text-3xl font-serif ${getBsfiLabel(bsfiData.total_score).color}`}>
                        {bsfiData.total_score}
                      </span>
                      <span className="text-[10px] text-[#c9ccbb]/50 font-bold uppercase tracking-widest">BSFI</span>
                    </div>
                    <div>
                      <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-1 block">
                        Today's Bio-Spatial Friction
                      </span>
                      <h3 className="text-xl font-serif text-[#c9ccbb] mb-1">
                        {getBsfiLabel(bsfiData.total_score).label}
                      </h3>
                      {bsfiData.is_internal_driver ? (
                         <p className="text-[#c9ccbb]/80 text-xs max-w-md leading-relaxed mt-2">
                           <strong className="text-[#b5a642] uppercase tracking-widest text-[10px] block mb-1">Biological Variance Detected:</strong> 
                           Pattern suggests an internal driver. Focus on nervous system accommodation today rather than spatial optimisation.
                         </p>
                      ) : (
                         <p className="text-[#c9ccbb]/80 text-xs mt-2">
                           Dominant Friction Source: <strong className="text-white bg-[#000]/30 px-2 py-1 rounded ml-1">{bsfiData.dominant_domain}</strong>
                         </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right md:text-left self-start md:self-center">
                    <p className="text-[10px] text-[#c9ccbb]/50 uppercase tracking-widest max-w-[150px] leading-relaxed">
                      Calculated via 14-day relational synergy engine
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`glass-panel p-6 rounded-3xl mb-8 border relative overflow-hidden transition-all ${!macroSynthesis.ready || hasAccess ? 'bg-gradient-to-r from-[#b5a642]/10 to-transparent border-[#b5a642]/20' : 'bg-[#b5a642]/10 border-[#b5a642]/40 shadow-lg shadow-[#b5a642]/5'}`}>
            <div 
              className={`flex items-center justify-between w-full relative z-10 ${hasAccess && macroSynthesis.ready ? 'cursor-pointer group' : ''}`}
              onClick={() => {
                if (hasAccess && macroSynthesis.ready) setIsSynthesisExpanded(!isSynthesisExpanded)
              }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#b5a642]/20 rounded-full text-[#b5a642] shrink-0">
                  {macroSynthesis.ready && !hasAccess ? <Lock size={20} /> : <Fingerprint size={20} />}
                </div>
                <div>
                  <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-1 block">
                    {macroSynthesis.ready ? "14-Day Rhythm Synthesis" : "Calibration Status"}
                  </span>
                  <h4 className="text-xl font-serif text-[#c9ccbb]">{macroSynthesis.title}</h4>
                </div>
              </div>

              {hasAccess && macroSynthesis.ready && (
                <div className="text-[#c9ccbb]/40 group-hover:text-[#b5a642] transition-colors ml-4 shrink-0">
                  {isSynthesisExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              )}
            </div>

            {!macroSynthesis.ready ? (
               <div className="mt-4 pt-4 border-t border-[#c9ccbb]/10 w-full relative z-10">
                 <p className="text-sm text-[#c9ccbb]/80 leading-relaxed max-w-2xl">
                    {macroSynthesis.paragraphs[0]}
                 </p>
                 <div className="w-full max-w-md h-1 bg-[#000]/50 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="h-full bg-[#b5a642] transition-all duration-1000" 
                      style={{ width: `${(chartLogs.length / 14) * 100}%` }}
                    />
                 </div>
               </div>
            ) : hasAccess ? (
               <AnimatePresence>
                 {isSynthesisExpanded && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }} 
                     animate={{ height: "auto", opacity: 1 }} 
                     exit={{ height: 0, opacity: 0 }}
                     transition={{ duration: 0.3, ease: "easeInOut" }}
                     className="overflow-hidden relative z-10"
                   >
                     <div className="mt-6 space-y-4 text-[#c9ccbb]/80 text-sm leading-relaxed border-t border-[#c9ccbb]/10 pt-6">
                       {macroSynthesis.paragraphs.map((para, i) => (
                         <p key={i}>{para}</p>
                       ))}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            ) : (
               <div className="mt-6 pt-6 border-t border-[#c9ccbb]/10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full relative z-10">
                 <p className="text-sm text-[#c9ccbb]/80 leading-relaxed max-w-xl">
                   14 days of bio-spatial data successfully collected. The algorithm has identified your environmental friction patterns. Upgrade to reveal your biological rhythm signature.
                 </p>
                 <Link href="/upgrade" className="shrink-0 w-full md:w-auto">
                   <button className="w-full md:w-auto px-8 py-3 bg-[#b5a642] text-[#1b270e] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-lg shadow-[#b5a642]/20">
                     Unlock Report
                   </button>
                 </Link>
               </div>
            )}
          </div>

          <div className="animate-fade-in-up delay-100 mb-12">
              <div className="flex justify-between items-end mb-6">
                <div>
                   <div className="flex items-center gap-2 text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest mb-1">
                     <TrendingUp size={14} /> Your Bio-Spatial Rhythm
                   </div>
                   <h3 className="text-xl font-serif text-[#c9ccbb]">Nervous System Rhythm & Cognitive Capacity</h3>
                </div>
              </div>
              
              <div className="glass-panel p-4 md:p-8 rounded-3xl border border-[#c9ccbb]/10 relative overflow-hidden">
                   <div className="w-full overflow-x-auto hide-scrollbar">
                     <div className="min-w-[600px] h-[300px]">
                       <CorrelationGraph data={chartLogs} />
                     </div>
                   </div>
              </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {isLightMeterOpen && (
          <LightSensorModal 
            onClose={() => setIsLightMeterOpen(false)} 
            onSave={(lux) => {
              if (activeMeterTarget === 'morningLux') updateField('morningLux', lux.toString());
              if (activeMeterTarget === 'eveningLux') updateField('eveningLux', lux.toString());
              setIsLightMeterOpen(false);
            }} 
          />
        )}

        {isAcousticMeterOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000]/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1b270e] border border-[#b5a642]/30 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <button onClick={() => setIsAcousticMeterOpen(false)} className="absolute top-4 right-4 text-[#c9ccbb]/50 hover:text-[#b5a642] z-10">✕</button>
              
              <NoiseSensorModal 
                onClose={() => setIsAcousticMeterOpen(false)}
                onSave={(db) => {
                  if (activeMeterTarget === 'nighttimeDb') updateField('nighttimeDb', db.toString());
                  if (activeMeterTarget === 'daytimeDb') updateField('daytimeDb', db.toString());
                  setIsAcousticMeterOpen(false);
                }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
