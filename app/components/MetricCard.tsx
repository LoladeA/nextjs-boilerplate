'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  subtext: string
  icon: ReactNode // CHANGED: Now accepts a rendered element, not a component
  delay: number
}

export default function MetricCard({ title, value, subtext, icon, delay }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-[#c9ccbb] p-6 rounded-2xl shadow-sm border border-[#1b270e]/5 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-serif text-[#1b270e] text-lg">{title}</h3>
        <div className="p-2 bg-[#1b270e]/5 rounded-full text-[#1b270e]">
          {/* CHANGED: We now just render the icon directly */}
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-[#1b270e]">{value}</p>
        <p className="text-xs uppercase tracking-wider text-[#1b270e]/60">{subtext}</p>
      </div>
    </motion.div>
  )
}
