# 🚀 Setup Guide - ESUT Smart Library

This guide will help you set up the ESUT Smart Library Management System with full functionality.

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## 🗄️ Database Setup

### 1. Install PostgreSQL
- **macOS**: `brew install postgresql`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

### 2. Create Database
```bash
# Start PostgreSQL service
sudo service postgresql start  # Linux
brew services start postgresql  # macOS

# Create database
createdb smart_library
```

## 🔧 Application Setup

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd smart-library
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/smart_library"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# API Configuration
API_BASE_URL="http://localhost:3000/api"
```

**Important**: Replace `postgres:password` with your actual PostgreSQL credentials.

### 3. Database Migration and Seeding
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🔑 Default Login Credentials

After seeding the database, you can use these credentials:

### Admin Access
- **Email**: `admin@esut.edu.ng`
- **Password**: `admin123`

### Student Access
- **Student ID**: `CS/2020/001`
- **Password**: `student123`

## 🧪 Testing the Application

### 1. Admin Features
- Login as admin
- Navigate to `/admin`
- Add new books
- Manage students
- Process PDF requests
- View library statistics

### 2. Student Features
- Login as student
- Navigate to `/dashboard`
- Browse book catalog
- Borrow books
- Request PDF copies
- View borrowing history

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run format          # Format code with Prettier
npm run type-check      # Check TypeScript types
```

## 🐛 Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check database credentials in `.env.local`
3. Verify database exists: `psql -l`

### Authentication Issues
1. Check `NEXTAUTH_SECRET` is set
2. Ensure `NEXTAUTH_URL` matches your domain
3. Verify database is seeded with users

### Build Issues
1. Run `npm run db:generate` after schema changes
2. Clear cache: `npm run clean`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

## 📚 API Documentation

### Books API
- `GET /api/books` - Get all books with filters
- `POST /api/books` - Create new book (admin only)
- `GET /api/books/[id]` - Get specific book
- `PUT /api/books/[id]` - Update book (admin only)
- `DELETE /api/books/[id]` - Delete book (admin only)

### Borrowing API
- `POST /api/borrow` - Borrow or return book
- `GET /api/borrow?type=borrowed` - Get user's borrowed books
- `GET /api/borrow?type=overdue` - Get overdue books (admin only)
- `GET /api/borrow?type=stats` - Get borrowing statistics (admin only)

## 🚀 Production Deployment

### Environment Variables
Update `.env.local` for production:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### Build and Deploy
```bash
npm run build
npm run start
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository

---

**Happy coding! 🎉**
