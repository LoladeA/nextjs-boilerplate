'use client'

import Link from 'next/link'
import { Check, X, ShieldCheck, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function UpgradePage() {
  const benefits = [
    {
      title: "Full Access to Sensory Coaching",
      desc: "Unlock all 28+ NeuroDesign protocols, somatic guides and Sensory Coaching modules."
    },
    {
      title: "Advanced Light Meter",
      desc: "Measure Lux, Kelvin, and Flicker risk with professional accuracy."
    },
    {
      title: "Daily Light Integral",
      desc: "Track cumulative light exposure for circadian alignment."
    },
    {
      title: "Visual Noise Heatmaps",
      desc: "Upload photos to identify and remove cognitive load triggers."
    }
  ]

  return (
    <div className="min-h-screen bg-[#1b270e] relative overflow-hidden flex flex-col font-sans">
      
      {/* BACKGROUND EFFECTS (Subtle Luxury Glows) */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-[#b5a642] rounded-full mix-blend-overlay filter blur-[120px] opacity-20 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#c9ccbb] rounded-full mix-blend-overlay filter blur-[100px] opacity-10" />

      {/* HEADER: CLOSE BUTTON */}
      <div className="relative z-10 p-6 flex justify-end">
        <Link href="/dashboard" className="p-2 bg-[#000]/20 rounded-full text-[#c9ccbb] hover:bg-[#c9ccbb]/20 transition-all">
          <X size={24} />
        </Link>
      </div>

      {/* HERO SECTION */}
      <div className="flex-grow flex flex-col justify-end p-8 pb-12 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-2 flex items-center gap-2 text-[#b5a642] font-bold tracking-widest uppercase text-xs">
            <Sparkles size={14} />
            <span>Premium Membership</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-4 leading-tight">
            Design for <br/>
            <span className="text-[#b5a642]">Nervous System</span> <br/>
            Health.
          </h1>
          <p className="text-[#c9ccbb]/60 mb-8 text-lg">
            Move from awareness to regulation. Unlock the tools to measure, track, and optimize your environment.
          </p>
        </motion.div>

        {/* BENEFITS LIST */}
        <div className="space-y-6 mb-10">
          {benefits.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="flex gap-4"
            >
              <div className="mt-1 min-w-[24px] h-6 rounded-full bg-[#b5a642] flex items-center justify-center text-[#1b270e]">
                <Check size={14} strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-[#c9ccbb] font-bold text-base">{item.title}</h3>
                <p className="text-[#c9ccbb]/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* PRICING & CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#c9ccbb]/5 border border-[#c9ccbb]/10 p-6 rounded-2xl backdrop-blur-md"
        >
          <div className="text-center mb-6">
            <span className="text-3xl font-serif text-[#c9ccbb] font-bold">€19.99</span>
            <span className="text-[#c9ccbb]/60 text-sm"> / month</span>
            <p className="text-[#b5a642] text-xs uppercase tracking-widest mt-2">Cancel Anytime • 7-Day Free Trial</p>
          </div>

          {/* THE STRIPE LINK BUTTON */}
          {/* REPLACE '#' WITH YOUR ACTUAL STRIPE PAYMENT LINK LATER */}
          <a 
            href="#" 
            className="block w-full py-4 bg-[#b5a642] hover:bg-[#d4c55e] text-[#1b270e] font-bold text-center rounded-xl transition-all shadow-[0_0_20px_rgba(181,166,66,0.3)] hover:shadow-[0_0_30px_rgba(181,166,66,0.5)] hover:scale-[1.02]"
          >
            Start Free Trial
          </a>
          
          <div className="mt-4 flex justify-center items-center gap-2 text-[#c9ccbb]/30 text-[10px] uppercase tracking-widest">
            <ShieldCheck size={12} />
            <span>Secure Payment via Stripe</span>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
