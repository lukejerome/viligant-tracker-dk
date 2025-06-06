"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../components/auth-provider"

export function useUserStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const { user } = useAuth()
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Create user-specific key
  const userKey = user ? `${user.id}_${key}` : key

  useEffect(() => {
    if (!user) {
      setStoredValue(initialValue)
      return
    }

    try {
      const item = window.localStorage.getItem(userKey)
      if (item) {
        const parsedValue = JSON.parse(item)
        setStoredValue(parsedValue)
      } else {
        setStoredValue(initialValue)
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${userKey}":`, error)
      setStoredValue(initialValue)
    }
  }, [userKey, user])

  const setValue = useCallback(
    (value: T) => {
      if (!user) return

      try {
        setStoredValue(value)
        window.localStorage.setItem(userKey, JSON.stringify(value))
      } catch (error) {
        console.error(`Error setting localStorage key "${userKey}":`, error)
      }
    },
    [userKey, user],
  )

  return [storedValue, setValue]
}
