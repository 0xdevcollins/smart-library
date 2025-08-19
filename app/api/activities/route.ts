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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        include: {
          user: true
        },
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.activity.count()
    ])

    const response: ApiResponse<any> = {
      success: true,
      data: activities,
      message: 'Activities retrieved successfully',
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
    console.error('Error fetching activities:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch activities',
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
