import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        studentId: { label: 'Student ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials) return null

        try {
          let user

          if (credentials.userType === 'student' && credentials.studentId) {
            // Student login
            user = await prisma.user.findUnique({
              where: { studentId: credentials.studentId }
            })
          } else if (credentials.userType === 'admin' && credentials.email) {
            // Admin login
            user = await prisma.user.findUnique({
              where: { email: credentials.email }
            })
          }

          if (!user) {
            throw new Error('User not found')
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }

          // Check if account is active
          if (user.accountStatus !== 'ACTIVE') {
            throw new Error('Account is not active')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.toLowerCase() as 'student' | 'admin',
            studentId: user.studentId || undefined,
            department: user.department || undefined,
            level: user.level || undefined,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.studentId = user.studentId
        token.department = user.department
        token.level = user.level
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as 'student' | 'admin'
        session.user.studentId = token.studentId as string
        session.user.department = token.department as string
        session.user.level = token.level as string
      }
      return session
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  },
  secret: process.env.NEXTAUTH_SECRET
}
