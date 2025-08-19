import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function isOverdue(dueDate: string | Date): boolean {
  return new Date(dueDate) < new Date()
}

export function calculateFine(dueDate: string | Date, dailyRate: number = 50): number {
  if (!isOverdue(dueDate)) return 0
  
  const due = new Date(dueDate)
  const today = new Date()
  const daysLate = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  
  return daysLate * dailyRate
}

// String utilities
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidStudentId(studentId: string): boolean {
  // ESUT student ID format: CS/2020/001
  const studentIdRegex = /^[A-Z]{2}\/\d{4}\/\d{3}$/
  return studentIdRegex.test(studentId)
}

export function isValidISBN(isbn: string): boolean {
  // Remove hyphens and spaces
  const cleanIsbn = isbn.replace(/[-\s]/g, '')
  
  // Check if it's 10 or 13 digits
  if (cleanIsbn.length !== 10 && cleanIsbn.length !== 13) {
    return false
  }
  
  // Basic validation - in production, you'd want more robust ISBN validation
  return /^\d{10}(\d{3})?$/.test(cleanIsbn)
}

// Search utilities
export function searchBooks(books: any[], searchTerm: string): any[] {
  if (!searchTerm.trim()) return books
  
  const term = searchTerm.toLowerCase()
  return books.filter(book => 
    book.title.toLowerCase().includes(term) ||
    book.author.toLowerCase().includes(term) ||
    book.isbn.toLowerCase().includes(term) ||
    book.category.toLowerCase().includes(term)
  )
}

// Pagination utilities
export function paginateArray<T>(array: T[], page: number, limit: number): {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
} {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const data = array.slice(startIndex, endIndex)
  
  return {
    data,
    pagination: {
      page,
      limit,
      total: array.length,
      totalPages: Math.ceil(array.length / limit)
    }
  }
}

// Status utilities
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'available':
      return 'text-green-600 bg-green-100'
    case 'pending':
      return 'text-yellow-600 bg-yellow-100'
    case 'overdue':
    case 'rejected':
    case 'suspended':
      return 'text-red-600 bg-red-100'
    case 'borrowed':
      return 'text-blue-600 bg-blue-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

// File utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

// Notification utilities
export function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  // In a real app, you'd use a toast library like react-hot-toast or react-toastify
  console.log(`${type.toUpperCase()}: ${message}`)
  
  // For now, use browser alert
  if (type === 'error') {
    alert(`Error: ${message}`)
  } else {
    alert(message)
  }
}

// Local storage utilities
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return defaultValue
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error)
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error)
  }
}
