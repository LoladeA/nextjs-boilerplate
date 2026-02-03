'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ReactNode } from 'react'

interface ActionCardProps {
  title: string
  desc: string
  icon: ReactNode
  href: string
  delay: number
}

export default function ActionCard({ title, desc, icon, href, delay }: ActionCardProps) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay }}
        // GLASS + HOVER EFFECT
        className="glass-panel group relative p-8 rounded-[2rem] h-full transition-all duration-300 hover:bg-[#c9ccbb]/10 hover:translate-y-[-4px]"
      >
        <div className="mb-6 text-[#b5a642] opacity-90 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        
        <h3 className="text-2xl font-serif mb-2 text-[#c9ccbb]">{title}</h3>
        
        <p className="text-sm mb-8 leading-relaxed text-[#c9ccbb]/60 group-hover:text-[#c9ccbb]/80 transition-colors">
          {desc}
        </p>
        
        <div className="absolute bottom-8 right-8 p-3 rounded-full border border-[#c9ccbb]/20 text-[#c9ccbb] opacity-50 group-hover:opacity-100 group-hover:bg-[#c9ccbb] group-hover:text-[#1b270e] transition-all duration-300">
          <ArrowRight size={20} />
        </div>
      </motion.div>
    </Link>
  )
}
