import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Brain, FileText, TrendingUp, Heart, Camera, Sparkles, Plus } from 'lucide-react' 

// Components
import MetricCard from '../components/MetricCard'
import LatestAssessment from '../components/LatestAssessment'
import ActionCard from '../components/ActionCard'
import SensoryTools from '../components/SensoryTools'
import TrendChart from '../components/TrendChart'

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch data with error handling
  const { data: responses } = await supabase
    .from('user_responses')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true })

  // SAFEGUARD: If responses is null (first time user), treat it as empty array
  const safeResponses = responses || []

  // Calculate Metrics safely
  // 1. Completed Assessments
  const completedAssessments = safeResponses.filter(r => r.assessment_step === 4).length

  // 2. Wellbeing Score (Default to 50 if no data)
  const latestTaxEntry = safeResponses.filter(r => r.question_key === 'energy_tax').pop()
  // Use '??' to handle if the response property itself is missing
  const latestTax = Number(latestTaxEntry?.answer?.response ?? 50)
  const wellbeingScore = 100 - latestTax

  return (
    <div className="min-h-screen bg-[#f8f9f5] text-[#1b270e] p-6 md:p-12 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 font-serif">Sanctuary Status</h1>
          <p className="text-[#1b270e]/60">Welcome back! Track your sensory intelligence and regulation.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/coaching" className="flex items-center gap-2 px-6 py-3 bg-[#c9ccbb]/20 hover:bg-[#c9ccbb]/30 text-[#1b270e] rounded-lg text-sm font-medium transition-colors">
            <Sparkles size={16} />
            Sensory Coaching
          </Link>
          <Link href="/assessments/step0" className="flex items-center gap-2 px-6 py-3 bg-[#1b270e] text-white hover:bg-[#1b270e]/90 rounded-lg text-sm font-medium transition-colors shadow-lg">
            <Plus size={16} />
            New Assessment
          </Link>
        </div>
      </div>

      {/* TOP ROW: METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Overall Score" 
          value={wellbeingScore.toFixed(1)} 
          subtext="From your latest assessment"
          icon={Brain}
          delay={0.1}
        />
        <MetricCard 
          title="Assessments" 
          value={completedAssessments} 
          subtext="Total completed"
          icon={FileText}
          delay={0.2}
        />
        <MetricCard 
          title="Recommendations" 
          value="12" // Placeholder 
          subtext="Pending actions"
          icon={TrendingUp}
          delay={0.3}
        />
        <MetricCard 
          title="Well-being" 
          value={`${(wellbeingScore / 10).toFixed(0)}/10`} 
          subtext="Latest mood score"
          icon={Heart}
          delay={0.4}
        />
      </div>

      {/* MIDDLE ROW: CHART & BREAKDOWN */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        
        {/* Trend Chart Panel */}
        <div className="bg-white p-8 rounded-2xl border border-[#c9ccbb]/20 shadow-sm">
          <h3 className="font-bold text-lg mb-2 text-[#1b270e]">Well-being Trends</h3>
          <p className="text-sm text-[#1b270e]/50 mb-6">Your mood, stress, and focus scores over time</p>
          <TrendChart data={safeResponses} />
        </div>

        {/* Latest Assessment Breakdown */}
        <LatestAssessment data={safeResponses} />
      </div>

      {/* NEW: BIOMETRICS ROW */}
      <SensoryTools />

      {/* BOTTOM ROW: ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard 
          title="Take Assessment" 
          desc="Complete a new sensory intelligence questionnaire" 
          icon={Brain} 
          href="/assessments/step0"
          delay={0.5}
        />
        <ActionCard 
          title="Log Well-being" 
          desc="Track your mood, stress, and focus levels" 
          icon={Heart} 
          href="/assessments/step0" 
          delay={0.6}
        />
        <ActionCard 
          title="Upload Photos" 
          desc="Document your space and track visual changes" 
          icon={Camera} 
          href="/photos" 
          delay={0.7}
          dark={true} 
        />
      </div>
    </div>
  )
}
