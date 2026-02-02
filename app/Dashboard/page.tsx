import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SensoryRadar from '../components/SensoryRadar'
import TrendChart from '../components/TrendChart'
import MetricCard from '../components/MetricCard'

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch the latest assessment responses
  const { data: responses } = await supabase
    .from('user_responses')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true })

  // Helper to find specific answer values
  const getValue = (key: string) => {
    // Find the most recent entry for this key
    const entry = responses?.filter(r => r.question_key === key).pop()
    return entry?.answer?.response || 'N/A'
  }

  return (
    <div className="min-h-screen bg-[#1b270e] text-[#c9ccbb] p-6 md:p-12">
      <header className="flex justify-between items-end mb-12 border-b border-[#c9ccbb]/10 pb-6">
        <div>
          <h1 className="text-4xl font-serif text-[#b5a642] mb-2">Sanctuary Status</h1>
          <p className="opacity-60 font-light">Welcome back, {session.user.email}</p>
        </div>
        <Link href="/assessments/step0" className="px-6 py-3 bg-[#c9ccbb]/10 hover:bg-[#b5a642] hover:text-[#1b270e] rounded-full text-sm transition-all uppercase tracking-widest">
          New Scan
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Row 1: Key Metrics */}
        <MetricCard 
          title="Current Regulation" 
          value={getValue('physiological_state')} 
          subtext="Baseline Nervous System State"
        />
        <MetricCard 
          title="Energy Tax" 
          value={`${getValue('energy_tax')}%`} 
          subtext="Capacity lost to environment"
        />
         <MetricCard 
          title="Neuro-Lens" 
          value={getValue('neurological_lens')} 
          subtext="Sensory Processing Profile"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: The Radar (Sensory Profile) */}
        <div className="bg-[#c9ccbb]/5 rounded-[2rem] p-8 border border-[#c9ccbb]/10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-serif">Sensory Thresholds</h2>
            <span className="text-xs uppercase opacity-40">Step 2 Data</span>
          </div>
          <SensoryRadar data={responses || []} />
          <p className="mt-6 text-sm opacity-50 font-light leading-relaxed">
            This shape represents your sensory "load." Spikes indicate areas where your environment is actively eroding your capacity.
          </p>
        </div>

        {/* Chart 2: The Trend (Energy Tax over time) */}
        <div className="bg-[#c9ccbb]/5 rounded-[2rem] p-8 border border-[#c9ccbb]/10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-serif">Regulation History</h2>
            <span className="text-xs uppercase opacity-40">Energy Tax Trend</span>
          </div>
          <TrendChart data={responses || []} />
          <p className="mt-6 text-sm opacity-50 font-light leading-relaxed">
            Tracking the reduction of "Energy Tax" as you implement design interventions. A downward trend indicates restored capacity.
          </p>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <Link href="/signout" className="text-xs uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity">
          Sign Out
        </Link>
      </div>
    </div>
  )
}
