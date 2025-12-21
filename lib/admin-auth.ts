"use client"

// Admin authentication utility
// This provides a simple password-based admin access control

const ADMIN_PASSWORD = "admin123"
const ADMIN_AUTH_KEY = "admin_authenticated"

export const verifyAdminPassword = (password: string): boolean => {
  return password === ADMIN_PASSWORD
}

export const setAdminAuthenticated = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true')
  }
}

export const isAdminAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true'
  }
  return false
}

export const clearAdminAuth = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_AUTH_KEY)
  }
}
