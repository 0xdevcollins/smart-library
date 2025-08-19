import { prisma } from '@/lib/prisma'
import type { Book, BookForm } from '@/types'

export class BookService {
  static async getAllBooks(filters: {
    search?: string
    category?: string
    page?: number
    limit?: number
  }) {
    const { search, category, page = 1, limit = 10 } = filters
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category && category !== 'all') {
      where.category = category
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.book.count({ where })
    ])

    return {
      books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getBookById(id: number) {
    return prisma.book.findUnique({
      where: { id },
      include: {
        borrowedBooks: {
          include: {
            user: true
          }
        },
        pdfRequests: {
          include: {
            user: true
          }
        }
      }
    })
  }

  static async createBook(bookData: BookForm) {
    return prisma.book.create({
      data: {
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        category: bookData.category,
        description: bookData.description,
        available: parseInt(bookData.quantity),
        total: parseInt(bookData.quantity),
        publishedYear: bookData.publishedYear ? parseInt(bookData.publishedYear) : null,
        publisher: bookData.publisher,
        location: bookData.location
      }
    })
  }

  static async updateBook(id: number, bookData: Partial<BookForm>) {
    return prisma.book.update({
      where: { id },
      data: {
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        category: bookData.category,
        description: bookData.description,
        available: bookData.quantity ? parseInt(bookData.quantity) : undefined,
        total: bookData.quantity ? parseInt(bookData.quantity) : undefined,
        publishedYear: bookData.publishedYear ? parseInt(bookData.publishedYear) : null,
        publisher: bookData.publisher,
        location: bookData.location
      }
    })
  }

  static async deleteBook(id: number) {
    return prisma.book.delete({
      where: { id }
    })
  }

  static async getCategories() {
    const categories = await prisma.book.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    })

    return categories.map(cat => ({
      name: cat.category,
      bookCount: cat._count.category
    }))
  }

  static async getBookStats() {
    const [totalBooks, borrowedBooks, availableBooks] = await Promise.all([
      prisma.book.aggregate({
        _sum: { total: true }
      }),
      prisma.borrowedBook.count({
        where: { status: 'BORROWED' }
      }),
      prisma.book.aggregate({
        _sum: { available: true }
      })
    ])

    return {
      totalBooks: totalBooks._sum.total || 0,
      borrowedBooks,
      availableBooks: availableBooks._sum.available || 0
    }
  }
}
