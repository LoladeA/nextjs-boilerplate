'use client'

// =============================================================================
// SETTINGS PAGE — The Sentient Home
// =============================================================================
//
// SUPABASE DEPENDENCIES — actual table structure:
//
//   TABLE: user_profiles (existing — do not recreate)
//     id             uuid  PK, FK → auth.users (id) on delete CASCADE
//     email          text  not null, unique
//     display_name   text  null
//     home_type      text  null  ← maps to household selector
//     created_at     timestamptz default now()
//     updated_at     timestamptz default now()
//     --- ADD via migration (alter table only) ---
//     wake_time      time  default '07:00'
//     sleep_target   time  default '22:30'
//     notif_log      bool  default true
//     notif_log_time time  default '08:00'
//     notif_assess   bool  default true
//     notif_digest   bool  default true
//     notif_updates  bool  default false
//
//   Migration (additions only, nothing dropped):
//     alter table public.user_profiles
//       add column if not exists wake_time      time    default '07:00',
//       add column if not exists sleep_target   time    default '22:30',
//       add column if not exists notif_log      boolean default true,
//       add column if not exists notif_log_time time    default '08:00',
//       add column if not exists notif_assess   boolean default true,
//       add column if not exists notif_digest   boolean default true,
//       add column if not exists notif_updates  boolean default false;
//
//   TABLE: assessment_responses (backs current_user_responses view)
//     Updating neuro_lens writes here where question_key = 'neuro_lens'
//     Uses user_id column (not id) — check your view definition
//
//   EDGE FUNCTION: delete-user-account
//     Requires service role. Cascades: daily_logs → assessment_responses
//     → bsfi_results → user_profiles → auth.admin.deleteUser()
//
// =============================================================================

import Sidebar from '../components/Sidebar'
import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  User, Lock, Bell, CreditCard, LogOut,
  CheckCircle, AlertCircle, ArrowUpRight,
  Brain, Home, Shield, Download, Trash2,
  Clock, ChevronDown, AlertTriangle, X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// =============================================================================
// CONSTANTS
// =============================================================================

const NEURO_LENS_OPTIONS = [
  { value: 'None',     label: 'None / Prefer not to say' },
  { value: 'HSP',      label: 'HSP — Highly Sensitive Person' },
  { value: 'ADHD',     label: 'ADHD' },
  { value: 'Autism',   label: 'Autism' },
  { value: 'Dyslexia', label: 'Dyslexia' },
  { value: 'SPD',      label: 'SPD — Sensory Processing Disorder' },
]

const NEURO_LENS_IMPACT: Record<string, string> = {
  HSP:      'Increases weighting on Sensory Load (+10%) and Recovery Capacity (+5%).',
  ADHD:     'Increases weighting on Predictive Legibility (+10%).',
  Autism:   'Increases weighting on Sensory Load (+15%).',
  Dyslexia: 'Increases weighting on Predictive Legibility (+10%).',
  SPD:      'Increases weighting on Sensory Load (+15%).',
  None:     'No adaptive weighting applied. Scores use baseline calculations.',
}

const HOUSEHOLD_OPTIONS = [
  { value: 'solo',    label: 'Solo — I live alone' },
  { value: 'couple',  label: 'Couple — two adults' },
  { value: 'family',  label: 'Family — adults with children' },
  { value: 'shared',  label: 'Shared — housemates or multi-generational' },
]

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function SectionHeader({
  icon,
  title,
  subtitle
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="text-[#b5a642]">{icon}</div>
      <div>
        <h2 className="text-xl font-serif text-[#c9ccbb]">{title}</h2>
        {subtitle && <p className="text-[#c9ccbb]/50 text-xs mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

function Toggle({
  checked,
  onChange
}: {
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${
        checked ? 'bg-[#b5a642]' : 'bg-[#c9ccbb]/10'
      }`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-[#1b270e] rounded-full transition-all ${
        checked ? 'left-7' : 'left-1'
      }`} />
    </button>
  )
}

function StatusMessage({
  message
}: {
  message: { type: 'success' | 'error'; text: string } | null
}) {
  if (!message) return null
  return (
    <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
      message.type === 'success'
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        : 'bg-red-500/10 text-red-400 border border-red-500/20'
    }`}>
      {message.type === 'success'
        ? <CheckCircle size={16} />
        : <AlertCircle size={16} />
      }
      {message.text}
    </div>
  )
}

function SaveButton({
  loading,
  disabled,
  label = 'Save Changes'
}: {
  loading: boolean
  disabled?: boolean
  label?: string
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
        loading || disabled
          ? 'bg-[#c9ccbb]/5 text-[#c9ccbb]/20 cursor-not-allowed'
          : 'bg-[#b5a642] text-[#1b270e] hover:bg-[#d4c55e]'
      }`}
    >
      {loading ? 'Saving...' : label}
    </button>
  )
}

// =============================================================================
// DELETE CONFIRMATION MODAL
// =============================================================================

function DeleteAccountModal({
  onConfirm,
  onCancel,
  loading
}: {
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  const [confirmText, setConfirmText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000]/80 backdrop-blur-sm p-6">
      <div className="w-full max-w-md bg-[#1b270e] border border-red-500/30 rounded-3xl p-8 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-[#c9ccbb]/40 hover:text-[#c9ccbb]"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-6">
          <AlertTriangle size={24} />
        </div>

        <h3 className="text-2xl font-serif text-[#c9ccbb] mb-2">Delete Account</h3>
        <p className="text-[#c9ccbb]/60 text-sm leading-relaxed mb-6">
          This permanently deletes your account, all assessment responses, daily logs, BSFI results,
          and sensory profile. This action cannot be undone.
        </p>

        <div className="bg-[#000]/30 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-[#c9ccbb]/50 text-xs uppercase tracking-widest mb-1">What will be erased</p>
          <ul className="text-[#c9ccbb]/60 text-xs space-y-1 mt-2">
            <li>• All assessment responses and sensory profile</li>
            <li>• All daily logs and lux/dB measurements</li>
            <li>• All BSFI scores and 14-day history</li>
            <li>• Account credentials and preferences</li>
          </ul>
        </div>

        <label className="block text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest mb-2">
          Type <span className="text-red-400">delete</span> to confirm
        </label>
        <input
          ref={inputRef}
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="delete"
          className="w-full bg-[#000]/30 border border-red-500/20 rounded-xl p-4 text-[#c9ccbb] focus:outline-none focus:border-red-500/50 mb-6 text-sm"
        />

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-[#c9ccbb]/60 border border-[#c9ccbb]/10 hover:border-[#c9ccbb]/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmText !== 'delete' || loading}
            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              confirmText === 'delete' && !loading
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-red-500/10 text-red-500/30 cursor-not-allowed'
            }`}
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Settings() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  // --- USER STATE ---
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // --- PROFILE STATE ---
  const [displayName, setDisplayName] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // --- SENSORY IDENTITY STATE ---
  const [neuroLens, setNeuroLens] = useState('None')
  const [originalNeuroLens, setOriginalNeuroLens] = useState('None')
  const [neuroLoading, setNeuroLoading] = useState(false)
  const [neuroMessage, setNeuroMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // --- BSFI CALIBRATION STATE ---
  const [wakeTime, setWakeTime] = useState('07:00')
  const [sleepTarget, setSleepTarget] = useState('22:30')
  const [household, setHousehold] = useState('solo')
  const [calibLoading, setCalibLoading] = useState(false)
  const [calibMessage, setCalibMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // --- NOTIFICATION STATE ---
  const [notifLog, setNotifLog] = useState(true)
  const [notifLogTime, setNotifLogTime] = useState('08:00')
  const [notifAssess, setNotifAssess] = useState(true)
  const [notifDigest, setNotifDigest] = useState(true)
  const [notifUpdates, setNotifUpdates] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifMessage, setNotifMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // --- SECURITY STATE ---
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [securityLoading, setSecurityLoading] = useState(false)
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // --- DATA STATE ---
  const [exportLoading, setExportLoading] = useState(false)
  const [wipeLoading, setWipeLoading] = useState(false)
  const [showWipeConfirm, setShowWipeConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [dataMessage, setDataMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // =============================================================================
  // INITIAL DATA FETCH
  // =============================================================================

  useEffect(() => {
    const loadAll = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      // Load profile + settings — email comes from user_profiles directly
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserEmail(profile.email || '')
        setDisplayName(profile.display_name || '')
        setWakeTime(profile.wake_time || '07:00')
        setSleepTarget(profile.sleep_target || '22:30')
        setHousehold(profile.home_type || 'solo')   // home_type = household
        setNotifLog(profile.notif_log ?? true)
        setNotifLogTime(profile.notif_log_time || '08:00')
        setNotifAssess(profile.notif_assess ?? true)
        setNotifDigest(profile.notif_digest ?? true)
        setNotifUpdates(profile.notif_updates ?? false)
      }

      // Load neuro_lens from assessment responses
      // current_user_responses view uses user_id column (not id)
      const { data: neuroData } = await supabase
        .from('current_user_responses')
        .select('answer_value')
        .eq('user_id', user.id)
        .eq('question_key', 'neuro_lens')
        .single()

      if (neuroData?.answer_value) {
        setNeuroLens(neuroData.answer_value)
        setOriginalNeuroLens(neuroData.answer_value)
      }

      setInitialLoadDone(true)
    }

    loadAll()
  }, [supabase])

  // =============================================================================
  // HELPERS
  // =============================================================================

  const upsertProfile = async (fields: Record<string, any>) => {
    if (!userId) return { error: { message: 'Not authenticated.' } }
    return await supabase
      .from('user_profiles')
      .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() })
  }

  // =============================================================================
  // HANDLERS
  // =============================================================================

  // PROFILE
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMessage(null)
    try {
      const { error } = await upsertProfile({ display_name: displayName })
      if (error) throw error
      setProfileMessage({ type: 'success', text: 'Profile updated.' })
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message })
    } finally {
      setProfileLoading(false)
    }
  }

  // NEURO LENS
  const handleSaveNeuroLens = async (e: React.FormEvent) => {
    e.preventDefault()
    setNeuroLoading(true)
    setNeuroMessage(null)
    try {
      // Update the assessment response directly so the engine reads the new value
      // on next assessment cycle load
      // assessment_responses uses user_id column (not id)
      const { error } = await supabase
        .from('assessment_responses')
        .update({ answer_value: neuroLens })
        .eq('user_id', userId)
        .eq('question_key', 'neuro_lens')

      if (error) throw error
      setOriginalNeuroLens(neuroLens)
      setNeuroMessage({
        type: 'success',
        text: 'Sensory identity updated. Engine recalibrates on your next assessment cycle.'
      })
    } catch (err: any) {
      setNeuroMessage({ type: 'error', text: err.message })
    } finally {
      setNeuroLoading(false)
    }
  }

  // BSFI CALIBRATION
  const handleSaveCalibration = async (e: React.FormEvent) => {
    e.preventDefault()
    setCalibLoading(true)
    setCalibMessage(null)
    try {
      const { error } = await upsertProfile({
        wake_time: wakeTime,
        sleep_target: sleepTarget,
        home_type: household      // stored as home_type in user_profiles
      })
      if (error) throw error
      setCalibMessage({ type: 'success', text: 'Calibration saved. BSFI scores will reflect these anchors from the next log entry.' })
    } catch (err: any) {
      setCalibMessage({ type: 'error', text: err.message })
    } finally {
      setCalibLoading(false)
    }
  }

  // NOTIFICATIONS
  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotifLoading(true)
    setNotifMessage(null)
    try {
      const { error } = await upsertProfile({
        notif_log: notifLog,
        notif_log_time: notifLogTime,
        notif_assess: notifAssess,
        notif_digest: notifDigest,
        notif_updates: notifUpdates
      })
      if (error) throw error
      setNotifMessage({ type: 'success', text: 'Notification preferences saved.' })
    } catch (err: any) {
      setNotifMessage({ type: 'error', text: err.message })
    } finally {
      setNotifLoading(false)
    }
  }

  // SECURITY
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSecurityLoading(true)
    setSecurityMessage(null)

    if (newPassword !== confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'Passwords do not match.' })
      setSecurityLoading(false)
      return
    }
    if (newPassword.length < 8) {
      setSecurityMessage({ type: 'error', text: 'Password must be at least 12 characters.' })
      setSecurityLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setSecurityMessage({ type: 'success', text: 'Password updated successfully.' })
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setSecurityMessage({ type: 'error', text: err.message })
    } finally {
      setSecurityLoading(false)
    }
  }

  // DATA EXPORT
  const handleExport = async () => {
    setExportLoading(true)
    setDataMessage(null)
    try {
      const { data: logs, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) throw error
      if (!logs || logs.length === 0) {
        setDataMessage({ type: 'error', text: 'No logs found to export.' })
        return
      }

      // Convert to CSV
      const headers = Object.keys(logs[0]).join(',')
      const rows = logs.map(row =>
        Object.values(row).map(v =>
          v === null ? '' : typeof v === 'string' && v.includes(',') ? `"${v}"` : v
        ).join(',')
      )
      const csv = [headers, ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sentient-home-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      setDataMessage({ type: 'success', text: 'Export downloaded.' })
    } catch (err: any) {
      setDataMessage({ type: 'error', text: err.message })
    } finally {
      setExportLoading(false)
    }
  }

  // LOG WIPE
  const handleWipeLogs = async () => {
    setWipeLoading(true)
    setDataMessage(null)
    try {
      const { error } = await supabase
        .from('daily_logs')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
      setShowWipeConfirm(false)
      setDataMessage({ type: 'success', text: 'All daily logs cleared. The 14-day engine window has been reset.' })
    } catch (err: any) {
      setDataMessage({ type: 'error', text: err.message })
    } finally {
      setWipeLoading(false)
    }
  }

  // ACCOUNT DELETION
  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      // Delete user data first, then the auth user via a server action or edge function
      // The edge function should handle cascading deletes respecting RLS
      const { error } = await supabase.functions.invoke('delete-user-account', {
        body: { user_id: userId }
      })
      if (error) throw error
      await supabase.auth.signOut()
      router.push('/')
    } catch (err: any) {
      setShowDeleteModal(false)
      setDataMessage({ type: 'error', text: `Deletion failed: ${err.message}. Please contact support.` })
    } finally {
      setDeleteLoading(false)
    }
  }

  // SIGN OUT
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  const neuroChanged = neuroLens !== originalNeuroLens

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleteLoading}
        />
      )}

      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* PAGE HEADER */}
          <div className="mb-2">
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Settings</h1>
            <p className="text-[#c9ccbb]/50 text-sm">
              Manage your account, calibrate the engine, and control your data.
            </p>
          </div>

          {/* ================================================================
              1. ACCOUNT & PROFILE
          ================================================================ */}
          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10">
            <SectionHeader
              icon={<User size={20} />}
              title="Account"
              subtitle="Your identity in the system"
            />

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Email — read only */}
              <div>
                <label className="block text-[#c9ccbb]/50 text-xs font-bold uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="text"
                  value={userEmail}
                  disabled
                  className="w-full bg-[#000]/10 border border-[#c9ccbb]/5 rounded-xl p-4 text-[#c9ccbb]/40 text-sm cursor-default"
                />
                <p className="text-[10px] text-[#c9ccbb]/30 mt-1.5">
                  Email changes require account re-verification. Contact support to update.
                </p>
              </div>

              {/* Display name */}
              <div>
                <label className="block text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we address you?"
                  className="w-full bg-[#000]/20 border border-[#c9ccbb]/10 rounded-xl p-4 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 transition-colors text-sm"
                />
              </div>

              <StatusMessage message={profileMessage} />
              <div className="flex justify-end">
                <SaveButton loading={profileLoading} disabled={!displayName} />
              </div>
            </form>
          </div>

          {/* ================================================================
              2. SENSORY IDENTITY
          ================================================================ */}
          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10">
            <SectionHeader
              icon={<Brain size={20} />}
              title="Sensory Identity"
              subtitle="How the engine weights your scores"
            />

            <form onSubmit={handleSaveNeuroLens} className="space-y-5">
              <div>
                <label className="block text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest mb-2">
                  Neurotype
                </label>
                <div className="relative">
                  <select
                    value={neuroLens}
                    onChange={(e) => setNeuroLens(e.target.value)}
                    className="w-full appearance-none bg-[#000]/20 border border-[#c9ccbb]/10 rounded-xl p-4 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 transition-colors text-sm pr-10"
                  >
                    {NEURO_LENS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-[#1b270e]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9ccbb]/40 pointer-events-none"
                  />
                </div>
              </div>

              {/* Engine impact — shown for any non-None selection */}
              <div className={`rounded-xl p-4 border transition-all ${
                neuroLens !== 'None'
                  ? 'bg-[#b5a642]/5 border-[#b5a642]/15'
                  : 'bg-[#c9ccbb]/3 border-[#c9ccbb]/8'
              }`}>
                <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-1">
                  Engine Calibration Effect
                </p>
                <p className="text-[#c9ccbb]/60 text-xs leading-relaxed">
                  {NEURO_LENS_IMPACT[neuroLens] || NEURO_LENS_IMPACT['None']}
                </p>
              </div>

              {/* Warning shown when value has changed */}
              {neuroChanged && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-900/10 border border-amber-500/20">
                  <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-300/80 text-xs leading-relaxed">
                    Updating this recalibrates how the engine weights your circadian and sensory scores.
                    Your current NeuroLoad report reflects your previous identity selection until the next
                    assessment cycle completes.
                  </p>
                </div>
              )}

              <StatusMessage message={neuroMessage} />
              <div className="flex justify-end">
                <SaveButton loading={neuroLoading} disabled={!neuroChanged} label="Update Identity" />
              </div>
            </form>
          </div>

          {/* ================================================================
              3. BSFI ENVIRONMENT CALIBRATION
          ================================================================ */}
          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10">
            <SectionHeader
              icon={<Home size={20} />}
              title="Environment Calibration"
              subtitle="Fixed context the assessment never captures"
            />

            <p className="text-[#c9ccbb]/50 text-xs leading-relaxed mb-6">
              These fields anchor your BSFI scores to the fixed rhythms of your life.
              A morning lux reading means something different at 5:30am versus 9am.
              Set these once and update them when your circumstances change.
            </p>

            <form onSubmit={handleSaveCalibration} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Wake Time */}
                <div>
                  <label className="block text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Clock size={11} className="text-[#b5a642]" /> Target Wake Time
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full bg-[#000]/20 border border-[#c9ccbb]/10 rounded-xl p-4 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 transition-colors text-sm"
                  />
                  <p className="text-[10px] text-[#c9ccbb]/30 mt-1.5">
                    Used to contextualise morning lux scores and cortisol window timing.
                  </p>
                </div>

                {/* Sleep Target */}
                <div>
                  <label className="block text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Clock size={11} className="text-[#b5a642]" /> Target Sleep Onset
                  </label>
                  <input
                    type="time"
                    value={sleepTarget}
                    onChange={(e) => setSleepTarget(e.target.value)}
                    className="w-full bg-[#000]/20 border border-[#c9ccbb]/10 rounded-xl p-4 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 transition-colors text-sm"
                  />
                  <p className="text-[10px] text-[#c9ccbb]/30 mt-1.5">
                    Used to score evening lux and dB readings against your melatonin window.
                  </p>
                </div>
              </div>

              {/* Household */}
              <div>
                <label className="block text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest mb-2">
                  Household Occupancy
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {HOUSEHOLD_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setHousehold(opt.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        household === opt.value
                          ? 'border-[#b5a642]/50 bg-[#b5a642]/8 text-[#c9ccbb]'
                          : 'border-[#c9ccbb]/10 text-[#c9ccbb]/50 hover:border-[#c9ccbb]/20'
                      }`}
                    >
                      <div className="text-xs font-bold mb-0.5">
                        {opt.label.split(' — ')[0]}
                      </div>
                      <div className="text-[10px] opacity-60">
                        {opt.label.split(' — ')[1]}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#c9ccbb]/30 mt-2">
                  Modulates acoustic friction baselines. A family home and a solo flat have different noise thresholds.
                </p>
              </div>

              <StatusMessage message={calibMessage} />
              <div className="flex justify-end">
                <SaveButton loading={calibLoading} label="Save Calibration" />
              </div>
            </form>
          </div>

          {/* ================================================================
              4. NOTIFICATIONS
          ================================================================ */}
          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10">
            <SectionHeader
              icon={<Bell size={20} />}
              title="Notifications"
              subtitle="When the system checks in with you"
            />

            <form onSubmit={handleSaveNotifications} className="space-y-2">

              {/* Daily Log Reminder */}
              <div className="p-4 rounded-xl hover:bg-[#c9ccbb]/3 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[#c9ccbb] text-sm font-bold">Daily Log Reminder</div>
                    <div className="text-[#c9ccbb]/50 text-xs">A prompt to record your environment each morning.</div>
                  </div>
                  <Toggle checked={notifLog} onChange={() => setNotifLog(!notifLog)} />
                </div>
                {notifLog && (
                  <div className="flex items-center gap-3 mt-2 ml-0">
                    <label className="text-[#c9ccbb]/40 text-[10px] uppercase tracking-widest flex-shrink-0">
                      Remind at
                    </label>
                    <input
                      type="time"
                      value={notifLogTime}
                      onChange={(e) => setNotifLogTime(e.target.value)}
                      className="bg-[#000]/20 border border-[#c9ccbb]/10 rounded-lg px-3 py-2 text-[#c9ccbb] text-xs focus:outline-none focus:border-[#b5a642]/50 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Assessment Cycle Reminder */}
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#c9ccbb]/3 transition-colors">
                <div>
                  <div className="text-[#c9ccbb] text-sm font-bold">Assessment Cycle Reminder</div>
                  <div className="text-[#c9ccbb]/50 text-xs">Notified at day 12 of each 14-day cycle.</div>
                </div>
                <Toggle checked={notifAssess} onChange={() => setNotifAssess(!notifAssess)} />
              </div>

              {/* Weekly Digest */}
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#c9ccbb]/3 transition-colors">
                <div>
                  <div className="text-[#c9ccbb] text-sm font-bold">Weekly Synthesis</div>
                  <div className="text-[#c9ccbb]/50 text-xs">A summary of your nervous system logs each week.</div>
                </div>
                <Toggle checked={notifDigest} onChange={() => setNotifDigest(!notifDigest)} />
              </div>

              {/* Product Updates */}
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#c9ccbb]/3 transition-colors">
                <div>
                  <div className="text-[#c9ccbb] text-sm font-bold">Product Updates</div>
                  <div className="text-[#c9ccbb]/50 text-xs">News about new tools and features.</div>
                </div>
                <Toggle checked={notifUpdates} onChange={() => setNotifUpdates(!notifUpdates)} />
              </div>

              <div className="pt-2">
                <StatusMessage message={notifMessage} />
              </div>
              <div className="flex justify-end pt-2">
                <SaveButton loading={notifLoading} label="Save Preferences" />
              </div>
            </form>
          </div>

          {/* ================================================================
              5. SUBSCRIPTION
          ================================================================ */}
          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CreditCard className="text-[#b5a642]" size={20} />
                <h2 className="text-xl font-serif text-[#c9ccbb]">Subscription</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#c9ccbb]/10 text-[#c9ccbb] text-xs font-bold uppercase tracking-widest">
                Free Plan
              </span>
            </div>

            <div className="bg-[#000]/20 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-[#c9ccbb] font-bold text-sm mb-1">Sentient Membership</h3>
                <p className="text-[#c9ccbb]/50 text-xs leading-relaxed max-w-xs">
                  Full sensory diagnostics, complete BSFI history, Oura integration, 14 day rhythm synthesis, somatic protocols, coaching modules and room audit.
                </p>
              </div>
              <Link
                href="/upgrade"
                className="flex items-center gap-2 px-6 py-3 bg-[#b5a642] text-[#1b270e] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#d4c55e] transition-all flex-shrink-0"
              >
                Upgrade <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* ================================================================
              6. SECURITY
          ================================================================ */}
          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10">
            <SectionHeader
              icon={<Lock size={20} />}
              title="Security"
              subtitle="Update your password"
            />

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="block text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#000]/20 border border-[#c9ccbb]/10 rounded-xl p-4 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 transition-colors text-sm"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label className="block text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#000]/20 border border-[#c9ccbb]/10 rounded-xl p-4 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 transition-colors text-sm"
                  placeholder="••••••••"
                />
              </div>

              <StatusMessage message={securityMessage} />
              <div className="flex justify-end">
                <SaveButton loading={securityLoading} disabled={!newPassword} label="Update Password" />
              </div>
            </form>
          </div>

          {/* ================================================================
              7. DATA & PRIVACY
          ================================================================ */}
          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10">
            <SectionHeader
              icon={<Shield size={20} />}
              title="Data & Privacy"
              subtitle="What is stored and how to manage it"
            />

            {/* What is stored */}
            <div className="bg-[#000]/20 rounded-xl p-5 mb-6 space-y-3">
              <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest">
                What the system stores
              </p>
              <ul className="text-[#c9ccbb]/60 text-xs space-y-2 leading-relaxed">
                <li>
                  <span className="text-[#c9ccbb]/80 font-bold">Assessment responses</span> — your answers from each
                  assessment cycle, used to calculate your NeuroLoad score and sensory profile.
                </li>
                <li>
                  <span className="text-[#c9ccbb]/80 font-bold">Daily logs</span> — light, sound, sleep,
                  and tension readings you submit. The BSFI engine uses your most recent
                  <span className="text-[#b5a642]"> 14 days</span>. Older entries are retained for your
                  personal history but do not affect your current score.
                </li>
                <li>
                  <span className="text-[#c9ccbb]/80 font-bold">BSFI results</span> — composite friction scores
                  calculated per log entry and stored for trend analysis.
                </li>
                <li>
                  <span className="text-[#c9ccbb]/80 font-bold">Profile settings</span> — display name, calibration
                  anchors, and notification preferences stored on this page.
                </li>
              </ul>
              <div className="pt-2 border-t border-[#c9ccbb]/5">
                <p className="text-[#c9ccbb]/30 text-[10px]">
                  Your data is never sold, shared with advertisers, or used to train external models.
                </p>
              </div>
            </div>

            <StatusMessage message={dataMessage} />

            <div className="space-y-3 mt-4">

              {/* Export */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#c9ccbb]/8 hover:border-[#c9ccbb]/15 transition-colors">
                <div>
                  <div className="text-[#c9ccbb] text-sm font-bold">Export Daily Logs</div>
                  <div className="text-[#c9ccbb]/50 text-xs">Download all log entries as a CSV file.</div>
                </div>
                <button
                  onClick={handleExport}
                  disabled={exportLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#c9ccbb]/15 text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-wider hover:border-[#b5a642]/40 hover:text-[#b5a642] transition-all"
                >
                  <Download size={13} />
                  {exportLoading ? 'Exporting...' : 'Export'}
                </button>
              </div>

              {/* Log Wipe */}
              <div className="p-4 rounded-xl border border-[#c9ccbb]/8">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[#c9ccbb] text-sm font-bold">Clear All Daily Logs</div>
                    <div className="text-[#c9ccbb]/50 text-xs">
                      Wipes all log entries and resets the 14-day engine window.
                      Use when restarting a baseline after a major life change.
                    </div>
                  </div>
                </div>

                {!showWipeConfirm ? (
                  <button
                    onClick={() => setShowWipeConfirm(true)}
                    className="text-xs text-amber-400/70 hover:text-amber-400 font-bold uppercase tracking-wider transition-colors"
                  >
                    Clear Logs
                  </button>
                ) : (
                  <div className="flex items-center gap-3 pt-1">
                    <p className="text-amber-300/70 text-xs flex-1">
                      This cannot be undone. All log history will be permanently deleted.
                    </p>
                    <button
                      onClick={() => setShowWipeConfirm(false)}
                      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#c9ccbb]/40 hover:text-[#c9ccbb] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleWipeLogs}
                      disabled={wipeLoading}
                      className="px-4 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500/25 transition-colors"
                    >
                      {wipeLoading ? 'Clearing...' : 'Confirm Clear'}
                    </button>
                  </div>
                )}
              </div>

              {/* Account Deletion */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#c9ccbb]/8">
                <div>
                  <div className="text-[#c9ccbb] text-sm font-bold">Delete Account</div>
                  <div className="text-[#c9ccbb]/50 text-xs">
                    Permanently erases your account and all associated data.
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-400/60 text-xs font-bold uppercase tracking-wider hover:border-red-500/40 hover:text-red-400 transition-all"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* ================================================================
              SIGN OUT
          ================================================================ */}
          <div className="pt-2 pb-12">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 text-[#c9ccbb]/50 hover:text-[#b5a642] transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
