"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useLocalStorage } from "../hooks/use-local-storage"

interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useLocalStorage<
    Record<string, { email: string; password: string; name: string; createdAt: string }>
  >("users", {})
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>("currentUserId", null)

  useEffect(() => {
    // Check if user is logged in on app start
    if (currentUserId && users[currentUserId]) {
      const userData = users[currentUserId]
      setUser({
        id: currentUserId,
        email: userData.email,
        name: userData.name,
        createdAt: userData.createdAt,
      })
    }
    setIsLoading(false)
  }, [currentUserId, users])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Find user by email
    const userEntry = Object.entries(users).find(([_, userData]) => userData.email === email)

    if (!userEntry) {
      setIsLoading(false)
      return { success: false, error: "User not found" }
    }

    const [userId, userData] = userEntry

    if (userData.password !== password) {
      setIsLoading(false)
      return { success: false, error: "Invalid password" }
    }

    // Login successful
    const loggedInUser: User = {
      id: userId,
      email: userData.email,
      name: userData.name,
      createdAt: userData.createdAt,
    }

    setUser(loggedInUser)
    setCurrentUserId(userId)
    setIsLoading(false)

    return { success: true }
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check if user already exists
    const existingUser = Object.values(users).find((userData) => userData.email === email)

    if (existingUser) {
      setIsLoading(false)
      return { success: false, error: "User already exists with this email" }
    }

    // Create new user
    const userId = Date.now().toString()
    const newUserData = {
      email,
      password,
      name,
      createdAt: new Date().toISOString(),
    }

    const updatedUsers = {
      ...users,
      [userId]: newUserData,
    }

    setUsers(updatedUsers)

    // Auto-login after signup
    const newUser: User = {
      id: userId,
      email,
      name,
      createdAt: newUserData.createdAt,
    }

    setUser(newUser)
    setCurrentUserId(userId)
    setIsLoading(false)

    return { success: true }
  }

  const logout = () => {
    setUser(null)
    setCurrentUserId(null)
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}
