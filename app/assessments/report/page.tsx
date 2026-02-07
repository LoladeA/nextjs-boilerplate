import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Activity, Brain, ShieldAlert, Zap, Download, CheckCircle, Moon } from 'lucide-react'
import { calculateNeuroLoad } from '@/app/utils/scoring-engine'
import Sidebar from '../../components/Sidebar'
import PriorityList from './PriorityList' // <--- IMPORT THE NEW COMPONENT

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

  // --- SAFETY CHECK: PREVENTS CRASHES ---
  const engineResult = calculateNeuroLoad(safeResponses)
  
  // If indices are missing, use 0 as fallback
  const indices = engineResult.indices || { cii: 0, ali: 0, pli: 0, stl: 0, rci: 0 }
  const totalLoad = engineResult.totalLoad || 0
  const systemState = engineResult.systemState || "Resonant System"

  const domains = [
    {
      id: 'cii',
      name: 'Circadian Rhythm',
      score: indices.cii,
      max: 25,
      description: 'Alignment with biological day/night rhythm.',
      status: indices.cii <= 10 ? 'Regulated' : indices.cii <= 15 ? 'Misaligned' : indices.cii <= 20 ? 'Dysregulated' : 'Circadian Shift',
      priority: indices.cii > 15 ? 'High' : indices.cii > 10 ? 'Medium' : 'Low',
      icon: <Zap size={24} className={indices.cii > 15 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'ali',
      name: 'Autonomic Load',
      score: indices.ali,
      max: 20,
      description: 'Nervous system vigilance and stress axis activation.',
      status: indices.ali <= 7 ? 'Stable' : indices.ali <= 11 ? 'Activated' : indices.ali <= 16 ? 'Overloaded' : 'High Vigilance',
      priority: indices.ali > 11 ? 'High' : indices.ali > 7 ? 'Medium' : 'Low',
      icon: <Activity size={24} className={indices.ali > 11 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'pli',
      name: 'Predictive Legibility',
      score: indices.pli,
      max: 25,
      description: 'Spatial clarity and cognitive effort.',
      status: indices.pli <= 10 ? 'Legible' : indices.pli <= 15 ? 'Frictional' : indices.pli <= 20 ? 'Fragmented' : 'Cognitive Overload',
      priority: indices.pli > 15 ? 'High' : indices.pli > 10 ? 'Medium' : 'Low',
      icon: <Brain size={24} className={indices.pli > 15 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'stl',
      name: 'Sensory Load',
      score: indices.stl,
      max: 25,
      description: 'Cumulative impact of noise, clutter, and texture.',
      status: indices.stl <= 10 ? 'Low Load' : indices.stl <= 15 ? 'Moderate' : indices.stl <= 20 ? 'High Load' : 'Sensory Overload',
      priority: indices.stl > 15 ? 'High' : indices.stl > 10 ? 'Medium' : 'Low',
      icon: <ShieldAlert size={24} className={indices.stl > 15 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'rci',
      name: 'Recovery Support',
      score: indices.rci,
      max: 25,
      description: 'Ability of the home to support parasympathetic restoration.',
      status: indices.rci <= 10 ? 'Restorative' : indices.rci <= 15 ? 'Recovery Supported' : indices.rci <= 20 ? 'Recovery Limited' : 'Recovery Not Yet Available',
      priority: indices.rci > 15 ? 'High' : indices.rci > 10 ? 'Medium' : 'Low',
      icon: <CheckCircle size={24} className={indices.rci > 15 ? "text-red-400" : "text-[#b5a642]"} />
    }
  ]

  const criticalIssues = domains.filter(d => d.priority === 'High')

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans">
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
              <p className="text-[#c9ccbb]/60">How your home environment is currently interacting with your nervous system.</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 border border-[#c9ccbb]/20 rounded-lg text-[#c9ccbb] hover:bg-[#c9ccbb]/10 text-sm transition-all">
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
                   <div className="text-3xl font-bold text-[#c9ccbb]">{totalLoad}<span className="text-base text-[#c9ccbb]/40 font-normal">/120</span></div>
                   <div className="text-xs text-[#c9ccbb]/50 uppercase tracking-widest mt-1">NeuroLoad Score™</div>
                 </div>
                 <div>
                   <div className="text-3xl font-bold text-[#c9ccbb]">{criticalIssues.length}</div>
                   <div className="text-xs text-[#c9ccbb]/50 uppercase tracking-widest mt-1">Areas Needing Support</div>
                 </div>
                 <div>
                   <div className="text-3xl font-bold text-[#c9ccbb]">{domains.find(d=>d.id === 'rci')?.status}</div>
                   <div className="text-xs text-[#c9ccbb]/50 uppercase tracking-widest mt-1">Recovery Status</div>
                 </div>
               </div>
             </div>
             
             {/* Background glow */}
             <div className="absolute right-0 top-0 w-64 h-64 bg-[#b5a642] rounded-full filter blur-[100px] opacity-10 pointer-events-none" />
          </div>

          {/* --- NEW SECTION: PRIORITY FOCUS AREAS (ACCORDION) --- */}
          {criticalIssues.length > 0 && (
             <div className="mb-16">
                {/* We pass the critical domains to the new component */}
                <PriorityList areas={criticalIssues} />
             </div>
          )}

          {/* INDICES BREAKDOWN */}
          <div className="mb-16">
            <h3 className="text-2xl font-serif text-[#c9ccbb] mb-8">Indices Breakdown</h3>
            <div className="grid gap-6">
              {domains.map((domain) => (
                <div key={domain.id} className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row gap-6 items-start">
                  <div className="p-4 bg-[#1b270e] rounded-full border border-[#c9ccbb]/10 shrink-0">
                    {domain.icon}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl text-[#c9ccbb] font-serif">{domain.name} ({(domain.id).toUpperCase()})</h4>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        domain.priority === 'High' ? 'bg-red-400/10 text-red-400' : 
                        domain.priority === 'Medium' ? 'bg-orange-400/10 text-orange-400' : 
                        'bg-[#b5a642]/10 text-[#b5a642]'
                      }`}>
                        {domain.status}
                      </span>
                    </div>
                    <p className="text-[#c9ccbb]/60 text-sm mb-4">{domain.description}</p>
                    
                    <div className="w-full h-2 bg-[#c9ccbb]/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          domain.priority === 'High' ? 'bg-red-400' : 
                          domain.priority === 'Medium' ? 'bg-orange-400' : 'bg-[#b5a642]'
                        }`} 
                        style={{ width: `${(domain.score / domain.max) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-[#c9ccbb]/30 uppercase tracking-widest">
                      <span>Regulated</span>
                      <span>Dysregulated</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
