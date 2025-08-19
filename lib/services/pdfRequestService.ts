import { prisma } from '@/lib/prisma'

export class PdfRequestService {
  static async createRequest(bookId: number, userId: string, reason: string) {
    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    })

    if (!book) {
      throw new Error('Book not found')
    }

    // Check if user already has a pending request for this book
    const existingRequest = await prisma.pdfRequest.findFirst({
      where: {
        bookId,
        userId,
        status: 'PENDING'
      }
    })

    if (existingRequest) {
      throw new Error('You already have a pending request for this book')
    }

    // Create PDF request
    const pdfRequest = await prisma.pdfRequest.create({
      data: {
        bookId,
        userId,
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
        userId,
        userType: 'STUDENT',
        bookId,
        bookTitle: book.title
      }
    })

    return pdfRequest
  }

  static async getUserRequests(userId: string, status?: string) {
    let whereClause: any = { userId }

    if (status) {
      whereClause.status = status.toUpperCase()
    }

    return prisma.pdfRequest.findMany({
      where: whereClause,
      include: {
        book: true
      },
      orderBy: { requestDate: 'desc' }
    })
  }

  static async getAllRequests(status?: string, page = 1, limit = 10) {
    let whereClause: any = {}

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

    return {
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async updateRequestStatus(
    requestId: number, 
    status: 'APPROVED' | 'REJECTED', 
    adminNotes?: string, 
    pdfUrl?: string
  ) {
    const request = await prisma.pdfRequest.findUnique({
      where: { id: requestId },
      include: {
        book: true,
        user: true
      }
    })

    if (!request) {
      throw new Error('PDF request not found')
    }

    if (request.status !== 'PENDING') {
      throw new Error('Request has already been processed')
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
        userId: request.userId,
        userType: 'STUDENT',
        bookId: request.bookId,
        bookTitle: request.book.title,
        details: { adminNotes, pdfUrl }
      }
    })

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: request.userId,
        title: `PDF Request ${status}`,
        message: `Your PDF request for "${request.book.title}" has been ${status.toLowerCase()}.`,
        type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING'
      }
    })

    return updatedRequest
  }

  static async getRequestStats() {
    const [pending, approved, rejected, total] = await Promise.all([
      prisma.pdfRequest.count({ where: { status: 'PENDING' } }),
      prisma.pdfRequest.count({ where: { status: 'APPROVED' } }),
      prisma.pdfRequest.count({ where: { status: 'REJECTED' } }),
      prisma.pdfRequest.count()
    ])

    return {
      pending,
      approved,
      rejected,
      total
    }
  }
}
