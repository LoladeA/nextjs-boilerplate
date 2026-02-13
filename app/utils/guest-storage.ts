'use client'

// The key used to store data in the browser
const STORAGE_KEY = 'sentient_guest_data'

export interface GuestData {
  answers: Record<string, any>
  timestamp: number
  completed: boolean
}

// 1. SAVE AN ANSWER
export const saveGuestAnswer = (questionId: string, value: any) => {
  if (typeof window === 'undefined') return

  const current = getGuestData()
  const updated = {
    ...current,
    answers: {
      ...current.answers,
      [questionId]: value
    },
    timestamp: Date.now()
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

// 2. GET ALL DATA
export const getGuestData = (): GuestData => {
  if (typeof window === 'undefined') return { answers: {}, timestamp: 0, completed: false }

  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : { answers: {}, timestamp: Date.now(), completed: false }
}

// 3. CHECK IF GUEST HAS DATA
export const hasGuestData = (): boolean => {
  const data = getGuestData()
  return Object.keys(data.answers).length > 0
}

// 4. CLEAR DATA (After Syncing/Sign Up)
export const clearGuestData = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
