import { prisma } from '@/lib/prisma'
import type { BorrowedBook } from '@/types'

export class BorrowingService {
  static async borrowBook(bookId: number, userId: string) {
    // Check if book is available
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    })

    if (!book) {
      throw new Error('Book not found')
    }

    if (book.available <= 0) {
      throw new Error('Book is not available')
    }

    // Check if user has overdue books
    const overdueBooks = await prisma.borrowedBook.findMany({
      where: {
        userId,
        status: 'BORROWED',
        dueDate: {
          lt: new Date()
        }
      }
    })

    if (overdueBooks.length > 0) {
      throw new Error('You have overdue books. Please return them first.')
    }

    // Calculate due date (30 days from now)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    // Create borrowing record and update book availability
    const [borrowedBook] = await prisma.$transaction([
      prisma.borrowedBook.create({
        data: {
          bookId,
          userId,
          dueDate,
          status: 'BORROWED'
        },
        include: {
          book: true,
          user: true
        }
      }),
      prisma.book.update({
        where: { id: bookId },
        data: {
          available: {
            decrement: 1
          }
        }
      }),
      prisma.activity.create({
        data: {
          action: 'Book borrowed',
          userId,
          userType: 'STUDENT',
          bookId,
          bookTitle: book.title
        }
      })
    ])

    return borrowedBook
  }

  static async returnBook(borrowedBookId: number) {
    const borrowedBook = await prisma.borrowedBook.findUnique({
      where: { id: borrowedBookId },
      include: {
        book: true,
        user: true
      }
    })

    if (!borrowedBook) {
      throw new Error('Borrowing record not found')
    }

    if (borrowedBook.status === 'RETURNED') {
      throw new Error('Book has already been returned')
    }

    // Calculate fine if overdue
    let fine = 0
    if (new Date(borrowedBook.dueDate) < new Date()) {
      const daysLate = Math.floor(
        (new Date().getTime() - new Date(borrowedBook.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      fine = daysLate * 50 // 50 naira per day
    }

    // Update borrowing record and book availability
    const [updatedBorrowedBook] = await prisma.$transaction([
      prisma.borrowedBook.update({
        where: { id: borrowedBookId },
        data: {
          status: 'RETURNED',
          returnDate: new Date(),
          fine
        },
        include: {
          book: true,
          user: true
        }
      }),
      prisma.book.update({
        where: { id: borrowedBook.bookId },
        data: {
          available: {
            increment: 1
          }
        }
      }),
      prisma.activity.create({
        data: {
          action: 'Book returned',
          userId: borrowedBook.userId,
          userType: 'STUDENT',
          bookId: borrowedBook.bookId,
          bookTitle: borrowedBook.book.title,
          details: { fine }
        }
      })
    ])

    return updatedBorrowedBook
  }

  static async getUserBorrowedBooks(userId: string) {
    return prisma.borrowedBook.findMany({
      where: { userId },
      include: {
        book: true
      },
      orderBy: { borrowDate: 'desc' }
    })
  }

  static async getOverdueBooks() {
    return prisma.borrowedBook.findMany({
      where: {
        status: 'BORROWED',
        dueDate: {
          lt: new Date()
        }
      },
      include: {
        book: true,
        user: true
      },
      orderBy: { dueDate: 'asc' }
    })
  }

  static async updateOverdueStatus() {
    // Update status of overdue books
    await prisma.borrowedBook.updateMany({
      where: {
        status: 'BORROWED',
        dueDate: {
          lt: new Date()
        }
      },
      data: {
        status: 'OVERDUE'
      }
    })
  }

  static async getBorrowingStats() {
    const [totalBorrowed, overdueCount, totalFines] = await Promise.all([
      prisma.borrowedBook.count({
        where: { status: 'BORROWED' }
      }),
      prisma.borrowedBook.count({
        where: {
          status: 'OVERDUE'
        }
      }),
      prisma.borrowedBook.aggregate({
        where: {
          status: 'RETURNED',
          fine: {
            gt: 0
          }
        },
        _sum: {
          fine: true
        }
      })
    ])

    return {
      totalBorrowed,
      overdueCount,
      totalFines: totalFines._sum.fine || 0
    }
  }
}
