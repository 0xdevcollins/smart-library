// User Types
export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'admin'
  studentId?: string
  department?: string
  level?: string
  createdAt: Date
  updatedAt: Date
}

export interface Student extends User {
  role: 'student'
  studentId: string
  department: string
  level: string
  booksBorrowed: number
  pdfRequests: number
  accountStatus: 'active' | 'suspended' | 'expired'
}

export interface Admin extends User {
  role: 'admin'
  permissions: string[]
}

// Book Types
export interface Book {
  id: number
  title: string
  author: string
  isbn: string
  category: string
  description: string
  available: number
  total: number
  publishedYear?: number
  publisher?: string
  location?: string
  coverImage?: string
  createdAt: Date
  updatedAt: Date
}

export interface BookCategory {
  id: string
  name: string
  description?: string
  bookCount: number
}

// Borrowing Types
export interface BorrowedBook {
  id: number
  bookId: number
  book: Book
  studentId: string
  borrowDate: string
  dueDate: string
  returnDate?: string
  status: 'borrowed' | 'returned' | 'overdue'
  fine?: number
}

// PDF Request Types
export interface PdfRequest {
  id: number
  bookId: number
  book: Book
  studentId: string
  requestDate: string
  status: 'pending' | 'approved' | 'rejected'
  reason: string
  adminNotes?: string
  processedDate?: string
  pdfUrl?: string
}

// Library Statistics
export interface LibraryStats {
  totalBooks: number
  borrowedBooks: number
  totalStudents: number
  pendingRequests: number
  overdueBooks: number
  totalCategories: number
}

// Activity Types
export interface Activity {
  id: number
  action: string
  userId: string
  userType: 'student' | 'admin'
  bookId?: number
  bookTitle?: string
  timestamp: Date
  details?: Record<string, any>
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface StudentLoginForm {
  studentId: string
  password: string
}

export interface BookForm {
  title: string
  author: string
  isbn: string
  category: string
  quantity: string
  description: string
  publishedYear?: string
  publisher?: string
  location?: string
}

// Search and Filter Types
export interface BookFilters {
  search?: string
  category?: string
  author?: string
  available?: boolean
  sortBy?: 'title' | 'author' | 'category' | 'available'
  sortOrder?: 'asc' | 'desc'
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
}

// Dashboard Types
export interface DashboardData {
  stats: LibraryStats
  recentActivity: Activity[]
  borrowedBooks: BorrowedBook[]
  pdfRequests: PdfRequest[]
  notifications: Notification[]
}

// NextAuth Types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: 'student' | 'admin'
      studentId?: string
      department?: string
      level?: string
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: 'student' | 'admin'
    studentId?: string
    department?: string
    level?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: 'student' | 'admin'
    studentId?: string
    department?: string
    level?: string
  }
}
