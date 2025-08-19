import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BorrowingService } from '@/lib/services/borrowingService'
import type { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Students only',
      }, { status: 401 })
    }

    const body = await request.json()
    const { bookId, action } = body

    if (!bookId || !action) {
      return NextResponse.json({
        success: false,
        error: 'Missing bookId or action',
      }, { status: 400 })
    }

    let result

    if (action === 'borrow') {
      result = await BorrowingService.borrowBook(bookId, session.user.id)
    } else if (action === 'return') {
      result = await BorrowingService.returnBook(bookId)
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use "borrow" or "return"',
      }, { status: 400 })
    }

    const response: ApiResponse<any> = {
      success: true,
      data: result,
      message: `Book ${action}ed successfully`,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error processing book action:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: error.message || 'Failed to process book action',
    }

    return NextResponse.json(errorResponse, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'borrowed', 'overdue', 'stats'

    let result

    if (type === 'borrowed' && session.user.role === 'student') {
      result = await BorrowingService.getUserBorrowedBooks(session.user.id)
    } else if (type === 'overdue' && session.user.role === 'admin') {
      result = await BorrowingService.getOverdueBooks()
    } else if (type === 'stats' && session.user.role === 'admin') {
      result = await BorrowingService.getBorrowingStats()
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid type or insufficient permissions',
      }, { status: 400 })
    }

    const response: ApiResponse<any> = {
      success: true,
      data: result,
      message: 'Data retrieved successfully',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching borrowing data:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch borrowing data',
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
