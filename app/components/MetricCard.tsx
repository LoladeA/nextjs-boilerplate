'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  subtext: string
  icon: ReactNode
  delay: number
}

export default function MetricCard({ title, value, subtext, icon, delay }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      // THE GLASS TRANSFORMATION
      className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:bg-[#c9ccbb]/10 transition-colors duration-500"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-serif text-[#c9ccbb] text-lg opacity-80">{title}</h3>
        <div className="p-2 bg-[#c9ccbb]/10 rounded-full text-[#b5a642]">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-[#c9ccbb]">{value}</p>
        <p className="text-xs uppercase tracking-wider text-[#c9ccbb]/50">{subtext}</p>
      </div>
      
      {/* Subtle Glow Effect on Hover */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#b5a642]/20 blur-3xl rounded-full group-hover:bg-[#b5a642]/30 transition-all duration-700" />
    </motion.div>
  )
}
