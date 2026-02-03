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

  const { data: responses } = await supabase
    .from('user_responses')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true })

  const safeResponses = responses || []
  const completedAssessments = safeResponses.filter(r => r.assessment_step === 4).length
  const latestTaxEntry = safeResponses.filter(r => r.question_key === 'energy_tax').pop()
  const latestTax = Number(latestTaxEntry?.answer?.response ?? 50)
  const wellbeingScore = 100 - latestTax

  return (
    // UPDATED: Main background is now set by global CSS, just adding padding
    <div className="min-h-screen p-6 md:p-12 font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 font-serif text-[#c9ccbb]">Sanctuary Status</h1>
          <p className="text-[#c9ccbb]/60 font-light">Welcome back, Lolade. Track your sensory regulation.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/coaching" className="flex items-center gap-2 px-6 py-3 glass-panel hover:bg-[#c9ccbb]/10 text-[#c9ccbb] rounded-lg text-sm font-medium transition-all">
            <Sparkles size={16} className="text-[#b5a642]" />
            Sensory Coaching
          </Link>
          <Link href="/assessments/step0" className="flex items-center gap-2 px-6 py-3 bg-[#c9ccbb] text-[#1b270e] hover:bg-[#e3e6d5] rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[#000]/20">
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
          icon={<Brain size={24} />} 
          delay={0.1}
        />
        <MetricCard 
          title="Assessments" 
          value={completedAssessments} 
          subtext="Total completed"
          icon={<FileText size={24} />} 
          delay={0.2}
        />
        <MetricCard 
          title="Recommendations" 
          value="12" 
          subtext="Pending actions"
          icon={<TrendingUp size={24} />} 
          delay={0.3}
        />
        <MetricCard 
          title="Well-being" 
          value={`${(wellbeingScore / 10).toFixed(0)}/10`} 
          subtext="Latest mood score"
          icon={<Heart size={24} />} 
          delay={0.4}
        />
      </div>

      {/* MIDDLE ROW: CHART & BREAKDOWN */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        {/* Placeholder for Chart - We will Glass-ify this in Phase 3 */}
        <div className="glass-panel p-8 rounded-2xl">
          <h3 className="font-serif text-[#c9ccbb] text-lg mb-2">Well-being Trends</h3>
          <p className="text-sm text-[#c9ccbb]/50 mb-6">Your mood, stress, and focus scores over time</p>
          <TrendChart data={safeResponses} />
        </div>
        
        {/* Placeholder for LatestAssessment - We need to update this component next */}
        <LatestAssessment data={safeResponses} />
      </div>

      {/* NEW: BIOMETRICS ROW */}
      <SensoryTools />

      {/* BOTTOM ROW: ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard 
          title="Take Assessment" 
          desc="Complete a new sensory intelligence questionnaire" 
          icon={<Brain size={32} />} 
          href="/assessments/step0"
          delay={0.5}
        />
        <ActionCard 
          title="Log Well-being" 
          desc="Track your mood, stress, and focus levels" 
          icon={<Heart size={32} />} 
          href="/wellbeing" 
          delay={0.6}
        />
        <ActionCard 
          title="Upload Photos" 
          desc="Document your space and track visual changes" 
          icon={<Camera size={32} />} 
          href="/photos" 
          delay={0.7}
        />
      </div>
    </div>
  )
}
