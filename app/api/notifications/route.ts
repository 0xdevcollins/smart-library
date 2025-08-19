import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

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
    const read = searchParams.get('read')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let whereClause: any = {
      userId: session.user.id
    }

    if (read !== null) {
      whereClause.read = read === 'true'
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.notification.count({ where: whereClause })
    ])

    const response: ApiResponse<any> = {
      success: true,
      data: notifications,
      message: 'Notifications retrieved successfully',
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
    console.error('Error fetching notifications:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch notifications',
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, read } = body

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({
        success: false,
        error: 'Missing notificationIds array',
      }, { status: 400 })
    }

    if (typeof read !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'Missing read boolean value',
      }, { status: 400 })
    }

    // Update notifications (only user's own notifications)
    const updatedNotifications = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id
      },
      data: {
        read
      }
    })

    const response: ApiResponse<any> = {
      success: true,
      data: { updatedCount: updatedNotifications.count },
      message: `Marked ${updatedNotifications.count} notifications as ${read ? 'read' : 'unread'}`,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating notifications:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to update notifications',
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
