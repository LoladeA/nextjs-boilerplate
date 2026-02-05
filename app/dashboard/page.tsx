import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Brain, FileText, TrendingUp, Heart, Camera, Sparkles, Plus, Activity, AlertTriangle } from 'lucide-react' 

import MetricCard from '../components/MetricCard'
import ActionCard from '../components/ActionCard'
import SensoryTools from '../components/SensoryTools'
import SensoryRadar from '../components/SensoryRadar'
import NeuroFlashcard from '../components/NeuroFlashcard'
import { calculateNeuroLoad } from '../utils/scoring-engine' 
import Sidebar from '../components/Sidebar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member'
  
  const { data: responses } = await supabase
    .from('user_responses')
    .select('*')
    .eq('user_id', user.id)

  const safeResponses = responses || []

  // --- NEW USER CHECK ---
  if (safeResponses.length === 0) {
    redirect('/assessments/step0')
  }
  
  // --- USE THE NEW ENGINE ---
  const { totalLoad, systemState, radarData } = calculateNeuroLoad(safeResponses)
  
  // Calculate specific scores for Flashcard Triggers
  const getVal = (id: string) => safeResponses.find(r => r.question_key === id)?.answer?.response || 0
  const circadianLoad = Number(getVal('q5')) + Number(getVal('q6')) + Number(getVal('q7')) + Number(getVal('q8')) + Number(getVal('q9'))

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      
      {/* 1. THE SIDEBAR */}
      <Sidebar />

      {/* 2. MAIN CONTENT WRAPPER (Pushed right by sidebar on desktop) */}
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
      
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <div className="relative w-64 h-16 mb-2">
              <Image src="/logo.PNG" alt="Sensory Intelligence" fill className="object-contain object-left" priority />
            </div>
            <p className="text-[#c9ccbb]/60 font-light capitalize">
              Welcome back, {displayName}. System Status: <span className="text-[#b5a642] font-bold">{systemState}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/assessments/report" className="flex items-center gap-2 px-6 py-3 glass-panel hover:bg-[#c9ccbb]/10 text-[#c9ccbb] rounded-lg text-sm font-medium transition-all">
              <FileText size={16} className="text-[#b5a642]" />
              View Report
            </Link>
            <Link href="/assessments/step0" className="flex items-center gap-2 px-6 py-3 bg-[#c9ccbb] text-[#1b270e] hover:bg-[#e3e6d5] rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[#000]/20">
              <Plus size={16} />
              Retake Assessment
            </Link>
          </div>
        </div>

        {/* ROW 1: METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            title="NeuroLoad" 
            value={totalLoad.toString()} 
            subtext="Cumulative Strain (Low is Good)"
            icon={<Brain size={24} />} 
            delay={0.1}
          />
          <MetricCard 
            title="Nervous System State" 
            value={systemState.split(' ')[0]} 
            subtext={systemState.split(' ').slice(1).join(' ')}
            icon={<Activity size={24} />} 
            delay={0.2}
          />
          <MetricCard 
            title="Recovery Capacity" 
            value={`${radarData[4].A}%`} 
            subtext="Restoration Potential"
            icon={<TrendingUp size={24} />} 
            delay={0.3}
          />
          <MetricCard 
            title="Sensory Load" 
            value={radarData[3].A < 50 ? "High" : "Stable"} 
            subtext="Current Threat Load"
            icon={<AlertTriangle size={24} />} 
            delay={0.4}
          />
        </div>

        {/* ROW 2: INTELLIGENCE LAYER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 glass-panel p-8 rounded-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-serif text-[#c9ccbb] text-xl mb-1">Your Sensory Profile</h3>
                <p className="text-sm text-[#c9ccbb]/50">Circadian • Autonomic • Predictive • Sensory • Recovery</p>
              </div>
              <Link href="/assessments/report" className="text-xs text-[#b5a642] uppercase tracking-widest hover:text-[#c9ccbb] transition-colors">
                Analyse Details →
              </Link>
            </div>
            <div className="h-[300px] w-full">
              <SensoryRadar data={radarData} />
            </div>
          </div>

          <div className="h-full">
            <NeuroFlashcard 
              isPremium={false} 
              scores={{
                light: circadianLoad > 15 ? 40 : 80,
                visual: radarData[2].A, 
                acoustic: radarData[3].A 
              }}
            />
          </div>
        </div>

        {/* ROW 3 & 4 (Tools & Actions) */}
        <SensoryTools />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <ActionCard title="Log Well-being" desc="Track your mood & focus." icon={<Heart size={32} />} href="/wellbeing" delay={0.5} />
          <ActionCard title="Document Space" desc="Upload photos to track changes." icon={<Camera size={32} />} href="/photos" delay={0.6} />
          <ActionCard title="Sensory Coaching" desc="Learn to shape your environment to support your nervous system." icon={<Sparkles size={32} />} href="/coaching" delay={0.7} />
        </div>

      </div>
    </div>
  )
}
