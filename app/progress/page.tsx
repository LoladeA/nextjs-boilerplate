import Sidebar from '../components/Sidebar'
import { TrendingUp, Calendar, Activity } from 'lucide-react'

export default function Progress() {
  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Longitudinal Tracking</h1>
        <p className="text-[#c9ccbb]/60 mb-12">
          Monitor your nervous system's response to environmental changes over time.
        </p>

        {/* EMPTY STATE / COMING SOON */}
        <div className="glass-panel p-12 md:p-24 rounded-3xl border border-[#b5a642]/20 flex flex-col items-center text-center">
          
          <div className="w-20 h-20 bg-[#b5a642]/10 rounded-full flex items-center justify-center text-[#b5a642] mb-8 animate-pulse">
            <TrendingUp size={40} />
          </div>

          <h2 className="text-3xl font-serif text-[#c9ccbb] mb-4">Data Accumulation In Progress</h2>
          <p className="text-[#c9ccbb]/60 max-w-lg mb-8 leading-relaxed">
            Your longitudinal tracking module is currently initialising. As you complete more assessments and log weekly well-being stats, this dashboard will populate with trend lines, recovery metrics, and correlation analysis.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl text-left">
            <div className="p-6 bg-[#000]/20 rounded-xl border border-[#c9ccbb]/5">
              <Calendar className="text-[#b5a642] mb-3" size={24} />
              <h4 className="text-[#c9ccbb] font-bold text-sm mb-1">Timeline View</h4>
              <p className="text-[#c9ccbb]/40 text-xs">Track score changes month-by-month.</p>
            </div>
            <div className="p-6 bg-[#000]/20 rounded-xl border border-[#c9ccbb]/5">
              <Activity className="text-[#b5a642] mb-3" size={24} />
              <h4 className="text-[#c9ccbb] font-bold text-sm mb-1">Correlation</h4>
              <p className="text-[#c9ccbb]/40 text-xs">See how room changes impact recovery, sleep & focus.</p>
            </div>
            <div className="p-6 bg-[#000]/20 rounded-xl border border-[#c9ccbb]/5">
              <TrendingUp className="text-[#b5a642] mb-3" size={24} />
              <h4 className="text-[#c9ccbb] font-bold text-sm mb-1">Real-Time Recovery Rate</h4>
              <p className="text-[#c9ccbb]/40 text-xs">Measure improvements in home restoration.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
