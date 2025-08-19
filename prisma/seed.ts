import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@esut.edu.ng' },
    update: {},
    create: {
      email: 'admin@esut.edu.ng',
      name: 'Library Administrator',
      password: adminPassword,
      role: 'ADMIN',
      accountStatus: 'ACTIVE'
    }
  })

  // Create sample students
  const studentPassword = await bcrypt.hash('student123', 12)
  const students = await Promise.all([
    prisma.user.upsert({
      where: { studentId: 'CS/2020/001' },
      update: {},
      create: {
        email: 'cs2020001@esut.edu.ng',
        name: 'John Doe',
        password: studentPassword,
        role: 'STUDENT',
        studentId: 'CS/2020/001',
        department: 'Computer Science',
        level: '400 Level',
        accountStatus: 'ACTIVE'
      }
    }),
    prisma.user.upsert({
      where: { studentId: 'CS/2020/002' },
      update: {},
      create: {
        email: 'cs2020002@esut.edu.ng',
        name: 'Jane Smith',
        password: studentPassword,
        role: 'STUDENT',
        studentId: 'CS/2020/002',
        department: 'Computer Science',
        level: '300 Level',
        accountStatus: 'ACTIVE'
      }
    })
  ])

  // Create sample books
  const books = await Promise.all([
    prisma.book.upsert({
      where: { isbn: '978-0262033848' },
      update: {},
      create: {
        title: 'Data Structures and Algorithms',
        author: 'Thomas H. Cormen',
        isbn: '978-0262033848',
        category: 'Computer Science',
        description: 'Comprehensive guide to algorithms and data structures',
        available: 3,
        total: 5,
        publishedYear: 2009,
        publisher: 'MIT Press',
        location: 'Shelf A1'
      }
    }),
    prisma.book.upsert({
      where: { isbn: '978-0132350884' },
      update: {},
      create: {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        category: 'Software Engineering',
        description: 'A handbook of agile software craftsmanship',
        available: 2,
        total: 4,
        publishedYear: 2008,
        publisher: 'Prentice Hall',
        location: 'Shelf A2'
      }
    }),
    prisma.book.upsert({
      where: { isbn: '978-0132126953' },
      update: {},
      create: {
        title: 'Computer Networks',
        author: 'Andrew S. Tanenbaum',
        isbn: '978-0132126953',
        category: 'Networking',
        description: 'Comprehensive introduction to computer networks',
        available: 0,
        total: 3,
        publishedYear: 2010,
        publisher: 'Prentice Hall',
        location: 'Shelf B1'
      }
    }),
    prisma.book.upsert({
      where: { isbn: '978-0073523323' },
      update: {},
      create: {
        title: 'Database System Concepts',
        author: 'Abraham Silberschatz',
        isbn: '978-0073523323',
        category: 'Database',
        description: 'Fundamental concepts of database systems',
        available: 1,
        total: 2,
        publishedYear: 2010,
        publisher: 'McGraw-Hill',
        location: 'Shelf B2'
      }
    }),
    prisma.book.upsert({
      where: { isbn: '978-1118063330' },
      update: {},
      create: {
        title: 'Operating System Concepts',
        author: 'Abraham Silberschatz',
        isbn: '978-1118063330',
        category: 'Operating Systems',
        description: 'Essential concepts of operating systems',
        available: 4,
        total: 6,
        publishedYear: 2012,
        publisher: 'Wiley',
        location: 'Shelf C1'
      }
    })
  ])

  // Create sample borrowing records
  const borrowedBook = await prisma.borrowedBook.create({
    data: {
      bookId: books[0].id,
      userId: students[0].id,
      borrowDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      status: 'BORROWED'
    }
  })

  // Create sample PDF requests
  const pdfRequest = await prisma.pdfRequest.create({
    data: {
      bookId: books[2].id, // Computer Networks (unavailable)
      userId: students[1].id,
      requestDate: new Date('2024-01-25'),
      status: 'PENDING',
      reason: 'Not available in physical library'
    }
  })

  // Create sample activities
  await prisma.activity.createMany({
    data: [
      {
        action: 'Book borrowed',
        userId: students[0].id,
        userType: 'STUDENT',
        bookId: books[0].id,
        bookTitle: books[0].title
      },
      {
        action: 'PDF requested',
        userId: students[1].id,
        userType: 'STUDENT',
        bookId: books[2].id,
        bookTitle: books[2].title
      }
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Created admin: ${admin.email}`)
  console.log(`👥 Created ${students.length} students`)
  console.log(`📚 Created ${books.length} books`)
  console.log(`📖 Created 1 borrowing record`)
  console.log(`📄 Created 1 PDF request`)
  console.log(`📝 Created 2 activities`)

  console.log('\n🔑 Login Credentials:')
  console.log('Admin: admin@esut.edu.ng / admin123')
  console.log('Student: CS/2020/001 / student123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
