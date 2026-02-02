'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface ActionCardProps {
  title: string
  desc: string
  icon: LucideIcon
  href: string
  delay?: number
  dark?: boolean
}

export default function ActionCard({ title, desc, icon: Icon, href, delay = 0, dark = false }: ActionCardProps) {
  return (
    <Link href={href} className="block h-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -5 }}
        className={`h-full p-8 rounded-2xl border flex flex-col justify-between transition-all min-h-[200px] ${
          dark 
            ? 'bg-[#1b270e] border-[#1b270e] text-[#c9ccbb]' 
            : 'bg-white border-[#c9ccbb]/20 text-[#1b270e] shadow-sm hover:shadow-md'
        }`}
      >
        <Icon size={32} className={`mb-6 ${dark ? 'text-[#b5a642]' : 'text-[#1b270e]'}`} />
        <div>
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <p className={`text-sm ${dark ? 'opacity-60' : 'text-[#1b270e]/60'}`}>{desc}</p>
        </div>
      </motion.div>
    </Link>
  )
}
