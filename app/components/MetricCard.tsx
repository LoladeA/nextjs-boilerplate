'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtext?: string
  icon?: LucideIcon
  delay?: number
}

export default function MetricCard({ title, value, subtext, icon: Icon, delay = 0 }: MetricCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white text-[#1b270e] p-6 rounded-2xl border border-[#c9ccbb]/20 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full min-h-[160px]"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-bold text-[#1b270e]">{title}</h3>
        {Icon && <Icon size={20} className="text-[#1b270e]/40" />}
      </div>
      <div>
        <div className="text-4xl font-serif font-medium mb-2">{value}</div>
        {subtext && <p className="text-xs text-[#1b270e]/40">{subtext}</p>}
      </div>
    </motion.div>
  )
}
