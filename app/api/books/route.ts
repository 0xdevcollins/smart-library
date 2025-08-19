import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BookService } from '@/lib/services/bookService'
import type { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const result = await BookService.getAllBooks({
      search,
      category,
      page,
      limit
    })

    const response: ApiResponse<any> = {
      success: true,
      data: result.books,
      message: 'Books retrieved successfully',
    }

    return NextResponse.json(response, {
      headers: {
        'X-Total-Count': result.pagination.total.toString(),
        'X-Page': result.pagination.page.toString(),
        'X-Limit': result.pagination.limit.toString(),
        'X-Total-Pages': result.pagination.totalPages.toString(),
      },
    })
  } catch (error) {
    console.error('Error fetching books:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch books',
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['title', 'author', 'isbn', 'category', 'quantity', 'description']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`,
        }, { status: 400 })
      }
    }

    const newBook = await BookService.createBook(body)

    const response: ApiResponse<any> = {
      success: true,
      data: newBook,
      message: 'Book added successfully',
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating book:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to create book',
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
