'use client'

import Sidebar from '../components/Sidebar'
import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, ArrowRight, Loader2, ScanEye, CheckCircle, AlertTriangle, Lock, Sparkles } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RoomAudit() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // STATE
  const [loading, setLoading] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false) // Default to locked
  const [selectedRoom, setSelectedRoom] = useState('Living Room')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'success'>('idle')

  const rooms = ['Living Room', 'Bedroom', 'Home Office', 'Kitchen', 'Entryway']

  // 0. CHECK SUBSCRIPTION STATUS
  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check if they have an active subscription in the 'subscriptions' table
      // OR if they have a specific metadata flag. For now, let's check the table.
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .single()

      if (subscription) {
        setIsSubscribed(true)
      }
    }
    setLoading(false)
  }

  // 1. HANDLE FILE SELECTION
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  // 2. HANDLE UPLOAD & SAVE
  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setStatus('analyzing')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      const fileName = `${user.id}/${Date.now()}_${selectedRoom.replace(' ', '_')}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('room-photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('room-photos')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase
        .from('room_audits')
        .insert({
          user_id: user.id,
          room_name: selectedRoom,
          image_url: publicUrl,
          entropy_score: null, 
          lighting_kelvin: null 
        })

      if (dbError) throw dbError

      setStatus('success')
      
      setTimeout(() => {
         setPreviewUrl(null)
         setFile(null)
         setStatus('idle')
         setIsUploading(false)
         alert("Audit Captured. AI Analysis will run in the background.")
      }, 1000)

    } catch (error: any) {
      console.error('Upload failed:', error)
      alert(`Upload failed: ${error.message}`)
      setIsUploading(false)
      setStatus('idle')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1b270e] flex items-center justify-center text-[#b5a642]">
        <Loader2 size={32} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12 flex flex-col justify-center">
        
        <div className="max-w-3xl mx-auto w-full">
          
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-4">Environmental Audit</h1>
            <p className="text-[#c9ccbb]/60 max-w-lg mx-auto">
              Upload a photo of your space. Our NeuroDesign engine will analyze visual entropy, lighting temperature, and biophilic deficiencies.
            </p>
          </div>

          <div className="glass-panel p-8 md:p-12 rounded-3xl border border-[#c9ccbb]/10 bg-[#000]/20 relative overflow-hidden">
            
            {/* LOCKED STATE OVERLAY */}
            {!isSubscribed && (
              <div className="absolute inset-0 z-50 backdrop-blur-md bg-[#1b270e]/80 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-[#b5a642]/20 rounded-full flex items-center justify-center text-[#b5a642] mb-6 animate-pulse">
                  <Lock size={32} />
                </div>
                <h3 className="text-2xl font-serif text-[#c9ccbb] mb-2">Foundation Access Required</h3>
                <p className="text-[#c9ccbb]/60 max-w-md mb-8">
                  The Environmental Audit tool uses advanced computer vision to diagnose your space. This feature is available exclusively to Foundation members.
                </p>
                <Link 
                  href="/upgrade"
                  className="px-8 py-4 bg-[#b5a642] text-[#1b270e] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#d4c55e] transition-all flex items-center gap-2"
                >
                  <Sparkles size={16} /> Unlock Foundation Access
                </Link>
              </div>
            )}

            {/* ROOM SELECTOR */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex bg-[#000]/40 rounded-full p-1 border border-[#c9ccbb]/10">
                {rooms.map(room => (
                  <button
                    key={room}
                    onClick={() => setSelectedRoom(room)}
                    disabled={!isSubscribed}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                      selectedRoom === room 
                        ? 'bg-[#b5a642] text-[#1b270e]' 
                        : 'text-[#c9ccbb]/40 hover:text-[#c9ccbb]'
                    }`}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </div>

            {/* UPLOAD AREA (Will be blurred if locked) */}
            <div 
              onClick={() => isSubscribed && fileInputRef.current?.click()}
              className={`
                w-full aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center relative overflow-hidden group
                ${!isSubscribed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                ${previewUrl ? 'border-[#b5a642] bg-black' : 'border-[#c9ccbb]/20 hover:border-[#b5a642]/50 hover:bg-[#c9ccbb]/5'}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/*" 
                className="hidden" 
                disabled={!isSubscribed}
              />

              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#b5a642] flex items-center justify-center text-[#1b270e] shadow-xl">
                        <ScanEye size={24} />
                    </div>
                    <span className="text-[#c9ccbb] text-xs font-bold uppercase tracking-widest">Click to Change</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 text-[#c9ccbb]/40 group-hover:text-[#c9ccbb] transition-colors">
                  <Camera size={48} strokeWidth={1} />
                  <span className="text-xs font-bold uppercase tracking-widest">Tap to Capture {selectedRoom}</span>
                </div>
              )}
            </div>

            {/* ACTION BUTTON */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleUpload}
                disabled={!file || isUploading || !isSubscribed}
                className={`
                  px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 transition-all
                  ${!file 
                    ? 'bg-[#c9ccbb]/10 text-[#c9ccbb]/20 cursor-not-allowed' 
                    : 'bg-[#b5a642] text-[#1b270e] hover:bg-[#d4c55e] hover:scale-105 shadow-lg shadow-[#b5a642]/20'}
                `}
              >
                {status === 'analyzing' ? (
                  <>Analyzing Sensory Load <Loader2 size={16} className="animate-spin" /></>
                ) : status
