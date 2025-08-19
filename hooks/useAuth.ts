import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import type { User } from '@/types'

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: { email?: string; studentId?: string; password: string; userType: string }) => Promise<boolean>
  logout: () => void
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setIsLoading(status === 'loading')
  }, [status])

  const login = async (credentials: { email?: string; studentId?: string; password: string; userType: string }): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        studentId: credentials.studentId,
        password: credentials.password,
        userType: credentials.userType,
        redirect: false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (result?.ok) {
        if (credentials.userType === 'student') {
          router.push('/dashboard')
        } else {
          router.push('/admin')
        }
        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return false
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  return {
    user: session?.user as User | null,
    isLoading,
    isAuthenticated: !!session?.user,
    login,
    logout,
  }
}
