import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Admin only',
      }, { status: 401 })
    }

    const { id } = await params
    const requestId = parseInt(id)
    
    if (isNaN(requestId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request ID',
      }, { status: 400 })
    }

    const body = await request.json()
    const { status, adminNotes, pdfUrl } = body

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status. Must be APPROVED or REJECTED',
      }, { status: 400 })
    }

    // Check if request exists
    const existingRequest = await prisma.pdfRequest.findUnique({
      where: { id: requestId },
      include: {
        book: true,
        user: true
      }
    })

    if (!existingRequest) {
      return NextResponse.json({
        success: false,
        error: 'PDF request not found',
      }, { status: 404 })
    }

    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json({
        success: false,
        error: 'Request has already been processed',
      }, { status: 400 })
    }

    // Update request
    const updatedRequest = await prisma.pdfRequest.update({
      where: { id: requestId },
      data: {
        status,
        adminNotes,
        pdfUrl: status === 'APPROVED' ? pdfUrl : null,
        processedDate: new Date()
      },
      include: {
        book: true,
        user: true
      }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        action: `PDF request ${status.toLowerCase()}`,
        userId: existingRequest.userId,
        userType: 'STUDENT',
        bookId: existingRequest.bookId,
        bookTitle: existingRequest.book.title,
        details: { adminNotes, pdfUrl }
      }
    })

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: existingRequest.userId,
        title: `PDF Request ${status}`,
        message: `Your PDF request for "${existingRequest.book.title}" has been ${status.toLowerCase()}.`,
        type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING'
      }
    })

    const response: ApiResponse<any> = {
      success: true,
      data: updatedRequest,
      message: `PDF request ${status.toLowerCase()} successfully`,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error updating PDF request:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: error.message || 'Failed to update PDF request',
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const { id } = await params
    const requestId = parseInt(id)
    
    if (isNaN(requestId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request ID',
      }, { status: 400 })
    }

    const pdfRequest = await prisma.pdfRequest.findUnique({
      where: { id: requestId },
      include: {
        book: true,
        user: true
      }
    })

    if (!pdfRequest) {
      return NextResponse.json({
        success: false,
        error: 'PDF request not found',
      }, { status: 404 })
    }

    // Check if user has permission to view this request
    if (session.user.role === 'student' && pdfRequest.userId !== session.user.id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const response: ApiResponse<any> = {
      success: true,
      data: pdfRequest,
      message: 'PDF request retrieved successfully',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching PDF request:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch PDF request',
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
