'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ReactNode } from 'react'

interface ActionCardProps {
  title: string
  desc: string
  icon: ReactNode // CHANGED
  href: string
  delay: number
  dark?: boolean
}

export default function ActionCard({ title, desc, icon, href, delay, dark = false }: ActionCardProps) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay }}
        className={`group relative p-8 rounded-[2rem] h-full transition-all duration-300 hover:shadow-xl ${
          dark ? 'bg-[#1b270e] text-[#c9ccbb]' : 'bg-[#c9ccbb] text-[#1b270e]'
        }`}
      >
        <div className="mb-6 opacity-80">
          {/* CHANGED: Render directly */}
          {icon}
        </div>
        <h3 className="text-2xl font-serif mb-2">{title}</h3>
        <p className={`text-sm mb-8 leading-relaxed ${dark ? 'opacity-60' : 'opacity-70'}`}>
          {desc}
        </p>
        
        <div className="absolute bottom-8 right-8 p-3 rounded-full border border-current opacity-30 group-hover:opacity-100 transition-opacity">
          <ArrowRight size={20} />
        </div>
      </motion.div>
    </Link>
  )
}
