# ESUT Smart Library System

A modern, full-featured library management system built for Enugu State University of Technology (ESUT). This system provides comprehensive book management, student borrowing, PDF request processing, and administrative oversight capabilities.

## 🚀 Features

### For Students
- **User Authentication**: Secure login with student ID and password
- **Book Catalog**: Browse and search through the complete library catalog
- **Book Borrowing**: Borrow available books with automatic due date calculation
- **Book Returns**: Return borrowed books with fine calculation for overdue items
- **PDF Requests**: Request digital copies of unavailable books
- **Borrowing History**: Track all borrowing activities and due dates
- **Real-time Notifications**: Get notified about due dates, approvals, and system updates
- **Profile Management**: View personal information and account status

### For Administrators
- **Complete Book Management**: Add, edit, and delete books from the catalog
- **Student Management**: Monitor student accounts and borrowing activities
- **PDF Request Processing**: Approve or reject student PDF requests
- **Overdue Book Tracking**: Monitor and manage overdue books
- **Activity Monitoring**: View all system activities and transactions
- **Library Statistics**: Comprehensive reporting and analytics
- **Fine Management**: Automatic fine calculation and tracking

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Notifications**: Sonner Toast Notifications
- **Icons**: Lucide React

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smart-library
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/smart_library"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: For production
# NEXTAUTH_URL="https://your-domain.com"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with initial data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔑 Default Login Credentials

After seeding the database, you can use these credentials:

### Admin Access
- **Email**: admin@esut.edu.ng
- **Password**: admin123
- **Access**: Full administrative privileges

### Student Access
- **Student ID**: CS/2020/001
- **Password**: student123
- **Access**: Student portal with borrowing capabilities

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

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

### PDF Requests API
- `POST /api/pdf-requests` - Create PDF request (student only)
- `GET /api/pdf-requests` - Get PDF requests
- `PUT /api/pdf-requests/[id]` - Update request status (admin only)

### Notifications API
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications` - Mark notifications as read

### Admin APIs
- `GET /api/activities` - Get system activities (admin only)
- `GET /api/stats` - Get library statistics (admin only)

## 🏗️ Project Structure

```
smart-library/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── dashboard/         # Student dashboard
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   └── ui/               # Radix UI components
├── lib/                   # Utility libraries
│   ├── services/         # Business logic services
│   ├── auth.ts           # Authentication configuration
│   └── prisma.ts         # Database client
├── prisma/               # Database schema and migrations
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

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

## 🎯 Key Features Implementation

### Real-time Data Integration
- All dashboards use real API data instead of mock data
- Automatic data refresh on user actions
- Optimistic UI updates for better user experience

### Comprehensive Error Handling
- Form validation with user-friendly error messages
- API error handling with toast notifications
- Graceful fallbacks for failed operations

### Security Features
- Role-based access control (RBAC)
- Secure authentication with NextAuth.js
- Input validation and sanitization
- Protected API routes

### User Experience
- Responsive design for all screen sizes
- Loading states and skeleton screens
- Toast notifications for user feedback
- Intuitive navigation and workflows

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
# Build the application
npm run build

# Start production server
npm run start
```

### Database Migration

```bash
# Run migrations in production
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Verify database credentials in `.env.local`
   - Check if database exists: `psql -l`

2. **Authentication Issues**
   - Verify `NEXTAUTH_SECRET` is set
   - Ensure `NEXTAUTH_URL` matches your domain
   - Check if database is seeded with users

3. **Build Issues**
   - Run `npm run db:generate` after schema changes
   - Clear cache: `npm run clean`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Getting Help

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure the database is properly seeded
4. Check the browser's network tab for API errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for Enugu State University of Technology
- Powered by Next.js and Prisma
- UI components from Radix UI
- Icons from Lucide React

---

**ESUT Smart Library System** - Your Gateway to Knowledge 📚
