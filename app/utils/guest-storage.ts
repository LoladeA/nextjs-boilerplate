'use client'

const STORAGE_KEY = 'sentient_guest_data'

export interface GuestData {
  answers: Record<string, any>
  timestamp: number
}

// 1. SAVE AN ANSWER (Merges with existing data)
export const saveGuestAnswer = (key: string, value: any) => {
  if (typeof window === 'undefined') return

  const current = getGuestData()
  const updated = {
    ...current,
    answers: {
      ...current.answers,
      [key]: value
    },
    timestamp: Date.now()
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

// 2. GET ALL DATA
export const getGuestData = (): GuestData => {
  if (typeof window === 'undefined') return { answers: {}, timestamp: 0 }
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : { answers: {}, timestamp: Date.now() }
}

// 3. CLEAR DATA (Used after successful sign-up sync)
export const clearGuestData = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
