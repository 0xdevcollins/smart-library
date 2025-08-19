import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BookService } from '@/lib/services/bookService'
import type { ApiResponse } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
      try {
      const bookId = parseInt(id)
    
    if (isNaN(bookId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid book ID',
      }, { status: 400 })
    }

    const book = await BookService.getBookById(bookId)
    
    if (!book) {
      return NextResponse.json({
        success: false,
        error: 'Book not found',
      }, { status: 404 })
    }

    const response: ApiResponse<any> = {
      success: true,
      data: book,
      message: 'Book retrieved successfully',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching book:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch book',
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const bookId = parseInt(id)
    
    if (isNaN(bookId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid book ID',
      }, { status: 400 })
    }

    const body = await request.json()
    const updatedBook = await BookService.updateBook(bookId, body)

    const response: ApiResponse<any> = {
      success: true,
      data: updatedBook,
      message: 'Book updated successfully',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating book:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to update book',
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const bookId = parseInt(id)
    
    if (isNaN(bookId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid book ID',
      }, { status: 400 })
    }

    await BookService.deleteBook(bookId)

    const response: ApiResponse<null> = {
      success: true,
      message: 'Book deleted successfully',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting book:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete book',
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
