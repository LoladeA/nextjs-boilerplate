import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Activity, Brain, ShieldAlert, Zap, Download, CheckCircle } from 'lucide-react'
import { calculateNeuroLoad } from '@/app/utils/scoring-engine'
import Sidebar from '../../components/Sidebar'
import PriorityList from './PriorityList'
import HumanScorecard from '../../components/HumanScorecard'

export const dynamic = 'force-dynamic'

export default async function AssessmentReport() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: { session } } = await supabase.auth.getSession()
  const { data: responses } = await supabase
    .from('user_responses')
    .select('*')
    .eq('user_id', session?.user.id)

  const safeResponses = responses || []
  const engineResult: any = calculateNeuroLoad(safeResponses)
  
  const rawIndices = engineResult.rawIndices || { cii: 0, ali: 0, pli: 0, stl: 0, rci: 0 }
  const percentIndices = engineResult.percentIndices || { cii: 0, ali: 0, pli: 0, stl: 0, rci: 0 }
  const totalLoad = engineResult.finalNeuroLoad || 0
  const systemState = engineResult.systemState || "Resonant System"

  const domains = [
    {
      id: 'cii',
      name: 'Circadian Rhythm',
      score: rawIndices.cii,
      max: 25,
      description: 'Alignment with biological day/night rhythm.',
      status: rawIndices.cii <= 10 ? 'Regulated' : rawIndices.cii <= 15 ? 'Misaligned' : rawIndices.cii <= 20 ? 'Dysregulated' : 'Circadian Shift',
      priority: rawIndices.cii > 15 ? 'High' : rawIndices.cii > 10 ? 'Medium' : 'Low',
      icon: <Zap size={24} className={rawIndices.cii > 15 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'ali',
      name: 'Autonomic Load',
      score: rawIndices.ali,
      max: 20,
      description: 'Nervous system vigilance and stress axis activation.',
      status: rawIndices.ali <= 7 ? 'Stable' : rawIndices.ali <= 11 ? 'Activated' : rawIndices.ali <= 16 ? 'Overloaded' : 'High Vigilance',
      priority: rawIndices.ali > 11 ? 'High' : rawIndices.ali > 7 ? 'Medium' : 'Low',
      icon: <Activity size={24} className={rawIndices.ali > 11 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'pli',
      name: 'Predictive Legibility',
      score: rawIndices.pli,
      max: 25,
      description: 'Spatial clarity and cognitive effort.',
      status: rawIndices.pli <= 10 ? 'Legible' : rawIndices.pli <= 15 ? 'Frictional' : rawIndices.pli <= 20 ? 'Fragmented' : 'Cognitive Overload',
      priority: rawIndices.pli > 15 ? 'High' : rawIndices.pli > 10 ? 'Medium' : 'Low',
      icon: <Brain size={24} className={rawIndices.pli > 15 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'stl',
      name: 'Sensory Load',
      score: rawIndices.stl,
      max: 25,
      description: 'Cumulative impact of noise, clutter, and texture.',
      status: rawIndices.stl <= 10 ? 'Low Load' : rawIndices.stl <= 15 ? 'Moderate' : rawIndices.stl <= 20 ? 'High Load' : 'Sensory Overload',
      priority: rawIndices.stl > 15 ? 'High' : rawIndices.stl > 10 ? 'Medium' : 'Low',
      icon: <ShieldAlert size={24} className={rawIndices.stl > 15 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'rci',
      name: 'Recovery Potential',
      score: rawIndices.rci,
      max: 25,
      description: 'Capacity of the home to support parasympathetic restoration.',
      // 🟢 Unified Precision Logic
      status: rawIndices.rci < 10 ? 'High Potential' : rawIndices.rci <= 15 ? 'Moderate Potential' : 'Low Potential',
      priority: rawIndices.rci > 15 ? 'High' : rawIndices.rci > 10 ? 'Medium' : 'Low',
      icon: <CheckCircle size={24} className={rawIndices.rci > 15 ? "text-red-400" : "text-[#b5a642]"} />
    }
  ]

  const criticalIssues = domains.filter(d => d.priority === 'High')

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        <Link href="/dashboard" className="flex items-center text-[#c9ccbb]/60 hover:text-[#b5a642] mb-8 transition-colors w-fit">
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Your NeuroLoad Overview</h1>
              <p className="text-[#c9ccbb]/70">How your home environment is currently interacting with your nervous system.</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 border border-[#c9ccbb]/70 rounded-lg text-[#c9ccbb] hover:bg-[#c9ccbb]/70 text-sm transition-all">
               <Download size={16} /> Download Detailed Report
            </button>
          </div>

          {/* EXECUTIVE SUMMARY */}
          <div className="glass-panel p-8 md:p-12 rounded-3xl mb-12 border-l-8 border-[#b5a642] relative overflow-hidden">
             <div className="relative z-10">
               <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2 block">Current Nervous System State</span>
               <h2 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-6">{systemState}</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#c9ccbb]/10">
                 <div>
                   <div className="text-3xl font-bold text-[#c9ccbb]">{totalLoad}<span className="text-base text-[#c9ccbb]/80 font-normal">/100</span></div>
                   <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">NeuroLoad Score™</div>
                 </div>
                 <div>
                   <div className="text-3xl font-bold text-[#c9ccbb]">{criticalIssues.length}</div>
                   <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">Areas Needing Support</div>
                 </div>
                 <div>
                   <div className="text-3xl font-bold text-[#c9ccbb]">{domains.find(d=>d.id === 'rci')?.status}</div>
                   <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">Recovery Status</div>
                 </div>
               </div>
             </div>
             <div className="absolute right-0 top-0 w-64 h-64 bg-[#b5a642] rounded-full filter blur-[100px] opacity-10 pointer-events-none" />
          </div>

          {/* PRIORITY FOCUS AREAS */}
          {criticalIssues.length > 0 && (
             <div className="mb-16">
               <h3 className="text-2xl font-serif text-[#c9ccbb] mb-8">Your Priority Actions</h3>
               <PriorityList areas={criticalIssues} />
             </div>
          )}

          {/* DETAILED ANALYSIS */}
          <div className="mb-16">
             <h3 className="text-2xl font-serif text-[#c9ccbb] mb-8">Detailed Analysis</h3>
             <HumanScorecard scores={{
                circadian: percentIndices.cii,
                autonomic: percentIndices.ali,
                legibility: percentIndices.pli,
                sensory: percentIndices.stl
             }} />
          </div>

        </div>
      </div>
    </div>
  )
}
