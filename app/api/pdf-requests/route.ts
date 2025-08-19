import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
    const { bookId, reason } = body

    if (!bookId || !reason) {
      return NextResponse.json({
        success: false,
        error: 'Missing bookId or reason',
      }, { status: 400 })
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: parseInt(bookId) }
    })

    if (!book) {
      return NextResponse.json({
        success: false,
        error: 'Book not found',
      }, { status: 404 })
    }

    // Check if user already has a pending request for this book
    const existingRequest = await prisma.pdfRequest.findFirst({
      where: {
        bookId: parseInt(bookId),
        userId: session.user.id,
        status: 'PENDING'
      }
    })

    if (existingRequest) {
      return NextResponse.json({
        success: false,
        error: 'You already have a pending request for this book',
      }, { status: 400 })
    }

    // Create PDF request
    const pdfRequest = await prisma.pdfRequest.create({
      data: {
        bookId: parseInt(bookId),
        userId: session.user.id,
        reason,
        status: 'PENDING'
      },
      include: {
        book: true,
        user: true
      }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        action: 'PDF requested',
        userId: session.user.id,
        userType: 'STUDENT',
        bookId: parseInt(bookId),
        bookTitle: book.title
      }
    })

    const response: ApiResponse<any> = {
      success: true,
      data: pdfRequest,
      message: 'PDF request submitted successfully',
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error('Error creating PDF request:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: error.message || 'Failed to create PDF request',
    }

    return NextResponse.json(errorResponse, { status: 500 })
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
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let whereClause: any = {}

    if (session.user.role === 'student') {
      whereClause.userId = session.user.id
    }

    if (status) {
      whereClause.status = status.toUpperCase()
    }

    const [requests, total] = await Promise.all([
      prisma.pdfRequest.findMany({
        where: whereClause,
        include: {
          book: true,
          user: true
        },
        orderBy: { requestDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.pdfRequest.count({ where: whereClause })
    ])

    const response: ApiResponse<any> = {
      success: true,
      data: requests,
      message: 'PDF requests retrieved successfully',
    }

    return NextResponse.json(response, {
      headers: {
        'X-Total-Count': total.toString(),
        'X-Page': page.toString(),
        'X-Limit': limit.toString(),
        'X-Total-Pages': Math.ceil(total / limit).toString(),
      },
    })
  } catch (error) {
    console.error('Error fetching PDF requests:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch PDF requests',
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
