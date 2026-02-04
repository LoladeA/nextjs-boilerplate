import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Brain, FileText, TrendingUp, Heart, Camera, Sparkles, Plus, Activity } from 'lucide-react' 

// Components
import MetricCard from '../components/MetricCard'
import ActionCard from '../components/ActionCard'
import SensoryTools from '../components/SensoryTools'
import SensoryRadar from '../components/SensoryRadar'
import NeuroFlashcard from '../components/NeuroFlashcard'

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // --- DYNAMIC NAME LOGIC ---
  // We try to get the full name; if not set, we take the part of the email before the '@'
  const user = session.user
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member'
  
  // Fetch real data
  const { data: responses } = await supabase
    .from('user_responses')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true })

  const safeResponses = responses || []
  const completedAssessments = safeResponses.filter(r => r.assessment_step === 4).length
  
  // Calculate specific scores for the Radar Chart
  const getScore = (key: string) => {
    const entry = safeResponses.find(r => r.question_key === key)
    return entry ? Number(entry.answer.response) : 80 
  }

  const radarData = [
    { subject: 'Visual', A: getScore('visual_clutter'), fullMark: 100 },
    { subject: 'Acoustic', A: getScore('acoustic_irritation'), fullMark: 100 },
    { subject: 'Light', A: getScore('lighting_quality'), fullMark: 100 },
    { subject: 'Nature', A: 40, fullMark: 100 },
    { subject: 'Space', A: 65, fullMark: 100 },
  ]

  // Calculate overall wellbeing
  const latestTaxEntry = safeResponses.filter(r => r.question_key === 'energy_tax').pop()
  const latestTax = Number(latestTaxEntry?.answer?.response ?? 50)
  const wellbeingScore = 100 - latestTax

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          {/* LOGO */}
          <div className="relative w-64 h-16 mb-2">
            <Image 
              src="/logo.PNG" 
              alt="Sensory Intelligence" 
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          {/* DYNAMIC GREETING */}
          <p className="text-[#c9ccbb]/60 font-light capitalize">
            Welcome back, {displayName}. Track your sensory regulation.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/assessments/report" className="flex items-center gap-2 px-6 py-3 glass-panel hover:bg-[#c9ccbb]/10 text-[#c9ccbb] rounded-lg text-sm font-medium transition-all">
            <FileText size={16} className="text-[#b5a642]" />
            View Full Report
          </Link>
          <Link href="/assessments/step0" className="flex items-center gap-2 px-6 py-3 bg-[#c9ccbb] text-[#1b270e] hover:bg-[#e3e6d5] rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[#000]/20">
            <Plus size={16} />
            New Assessment
          </Link>
        </div>
      </div>

      {/* ROW 1: METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Overall Regulation" 
          value={`${wellbeingScore.toFixed(0)}%`} 
          subtext="Nervous System Capacity"
          icon={<Brain size={24} />} 
          delay={0.1}
        />
        <MetricCard 
          title="Assessments" 
          value={completedAssessments} 
          subtext="Total Scans"
          icon={<Activity size={24} />} 
          delay={0.2}
        />
        <MetricCard 
          title="Recommendations" 
          value="12" 
          subtext="Pending Actions"
          icon={<TrendingUp size={24} />} 
          delay={0.3}
        />
        <MetricCard 
          title="Mood Trend" 
          value="Stable" 
          subtext="Last 7 Days"
          icon={<Heart size={24} />} 
          delay={0.4}
        />
      </div>

      {/* ROW 2: INTELLIGENCE LAYER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 glass-panel p-8 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-serif text-[#c9ccbb] text-xl mb-1">Environmental Profile</h3>
              <p className="text-sm text-[#c9ccbb]/50">Your sensory load across 5 key metrics.</p>
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
              light: getScore('lighting_quality'),
              visual: getScore('visual_clutter'),
              acoustic: getScore('acoustic_irritation')
            }}
          />
        </div>
      </div>

      {/* ROW 3: BIOMETRIC TOOLS */}
      <SensoryTools />

      {/* ROW 4: QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <ActionCard 
          title="Log Well-being" 
          desc="Track your mood, stress, and focus levels." 
          icon={<Heart size={32} />} 
          href="/wellbeing" 
          delay={0.5}
        />
        <ActionCard 
          title="Document Space" 
          desc="Upload photos to track visual changes." 
          icon={<Camera size={32} />} 
          href="/photos" 
          delay={0.6}
        />
        <ActionCard 
          title="Sensory Coaching" 
          desc="Get personalized nervous system guidance." 
          icon={<Sparkles size={32} />} 
          href="/coaching" 
          delay={0.7}
        />
      </div>
    </div>
  )
}
