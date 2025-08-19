import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { User, Student, Admin } from '@/types'

export class UserService {
  static async createUser(userData: {
    email: string
    name: string
    password: string
    role: 'STUDENT' | 'ADMIN'
    studentId?: string
    department?: string
    level?: string
  }) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    return prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
        studentId: userData.studentId,
        department: userData.department,
        level: userData.level
      }
    })
  }

  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        borrowedBooks: {
          include: {
            book: true
          }
        },
        pdfRequests: {
          include: {
            book: true
          }
        }
      }
    })
  }

  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    })
  }

  static async getUserByStudentId(studentId: string) {
    return prisma.user.findUnique({
      where: { studentId }
    })
  }

  static async getAllStudents(page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'STUDENT' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              borrowedBooks: true,
              pdfRequests: true
            }
          }
        }
      }),
      prisma.user.count({
        where: { role: 'STUDENT' }
      })
    ])

    return {
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async updateUser(id: string, userData: Partial<User> & { password?: string }) {
    const updateData: any = { ...userData }
    
    // Hash password if it's being updated
    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 12)
    }

    return prisma.user.update({
      where: { id },
      data: updateData
    })
  }

  static async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id }
    })
  }

  static async getUserStats() {
    const [totalStudents, activeStudents, suspendedStudents] = await Promise.all([
      prisma.user.count({
        where: { role: 'STUDENT' }
      }),
      prisma.user.count({
        where: { 
          role: 'STUDENT',
          accountStatus: 'ACTIVE'
        }
      }),
      prisma.user.count({
        where: { 
          role: 'STUDENT',
          accountStatus: 'SUSPENDED'
        }
      })
    ])

    return {
      totalStudents,
      activeStudents,
      suspendedStudents
    }
  }

  static async getStudentDashboardData(studentId: string) {
    const user = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        borrowedBooks: {
          include: {
            book: true
          },
          orderBy: { borrowDate: 'desc' }
        },
        pdfRequests: {
          include: {
            book: true
          },
          orderBy: { requestDate: 'desc' }
        }
      }
    })

    if (!user) throw new Error('User not found')

    const overdueBooks = user.borrowedBooks.filter(borrowed => {
      return borrowed.status === 'BORROWED' && new Date(borrowed.dueDate) < new Date()
    })

    return {
      user,
      borrowedBooks: user.borrowedBooks,
      pdfRequests: user.pdfRequests,
      overdueBooks,
      stats: {
        totalBorrowed: user.borrowedBooks.length,
        overdueCount: overdueBooks.length,
        pendingRequests: user.pdfRequests.filter(req => req.status === 'PENDING').length
      }
    }
  }
}
