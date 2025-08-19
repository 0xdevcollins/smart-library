import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Admin only',
      }, { status: 401 })
    }

    const [
      totalBooks,
      totalStudents,
      borrowedBooks,
      overdueBooks,
      totalFines,
      pendingRequests
    ] = await Promise.all([
      prisma.book.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.borrowedBook.count({ where: { status: 'BORROWED' } }),
      prisma.borrowedBook.count({ 
        where: { 
          status: 'BORROWED',
          dueDate: { lt: new Date() }
        } 
      }),
      prisma.borrowedBook.aggregate({
        where: {
          status: 'RETURNED',
          fine: { gt: 0 }
        },
        _sum: { fine: true }
      }),
      prisma.pdfRequest.count({ where: { status: 'PENDING' } })
    ])

    const stats = {
      totalBooks,
      totalStudents,
      borrowedBooks,
      overdueBooks,
      totalFines: totalFines._sum.fine || 0,
      pendingRequests
    }

    const response: ApiResponse<any> = {
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch statistics',
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
