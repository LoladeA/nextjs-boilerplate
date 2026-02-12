'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  BookOpen, 
  BarChart2, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Map // New Icon
} from 'lucide-react'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface SidebarProps {
  onOpenGuide?: () => void; // The new prop for the Modal
}

export default function Sidebar({ onOpenGuide }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isOpen, setIsOpen] = useState(false) // Preserving Mobile toggle

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // The Full Navigation Map
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Assessment', href: '/assessments/report', icon: <FileText size={20} /> },
    { name: 'Coaching', href: '/coaching', icon: <Sparkles size={20} /> },
    { name: 'Insights', href: '/insights', icon: <BookOpen size={20} /> },
    { name: 'Progress', href: '/progress', icon: <BarChart2 size={20} /> },
    { name: 'Settings', href: '/settings', icon: <Settings size={20} /> },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* MOBILE HAMBURGER BUTTON (Preserved) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-[#1b270e] border border-[#b5a642]/30 text-[#b5a642] rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* SIDEBAR CONTAINER */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#141d0b] border-r border-[#c9ccbb]/10 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="flex flex-col h-full p-6">
          
          {/* LOGO AREA (Preserved) */}
          <div className="mb-10 pl-2">
            <span className="text-xl font-serif text-[#c9ccbb]">Sentient<span className="text-[#b5a642]">Home</span></span>
          </div>

          {/* NAV LINKS */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)} // Close sidebar on click (mobile)
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive(item.href) 
                      ? 'bg-[#b5a642] text-[#1b270e] font-bold shadow-[0_0_15px_rgba(181,166,66,0.2)]' 
                      : 'text-[#c9ccbb]/60 hover:text-[#c9ccbb] hover:bg-[#c9ccbb]/5'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm tracking-wide">{item.name}</span>
                </Link>
            ))}

            {/* --- NEW FEATURE: CALIBRATION MAP --- */}
            {onOpenGuide && (
              <>
                <div className="h-px bg-[#c9ccbb]/10 my-4 mx-2"></div>
                <button 
                  onClick={() => {
                    onOpenGuide()
                    setIsOpen(false) // Close sidebar on click (mobile)
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-[#c9ccbb]/80 hover:text-[#b5a642] hover:bg-[#b5a642]/5 rounded-xl transition-all w-full text-left"
                >
                  <Map size={20} />
                  <span className="text-sm tracking-wide font-medium">Calibration Map</span>
                </button>
              </>
            )}
          </nav>

          {/* USER / LOGOUT (Preserved) */}
          <div className="pt-6 border-t border-[#c9ccbb]/10">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-[#c9ccbb]/80 hover:text-red-400 transition-colors"
            >
              <LogOut size={20} />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>

        </div>
      </div>
      
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
