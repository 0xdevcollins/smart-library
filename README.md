# ESUT Smart Library Management System

A modern, responsive library management system built with Next.js 15, TypeScript, and Tailwind CSS for Enugu State University of Technology (ESUT).

## 🚀 Features

### For Students
- **Book Catalog**: Browse and search through the library's collection
- **Borrowing System**: Request and manage book borrowings
- **PDF Requests**: Request digital copies of unavailable books
- **Personal Dashboard**: Track borrowed books and due dates
- **Profile Management**: View account information and borrowing history

### For Administrators
- **Book Management**: Add, edit, and manage library books
- **Student Management**: View and manage student accounts
- **PDF Request Processing**: Approve or reject student PDF requests
- **Analytics Dashboard**: View library statistics and reports
- **Activity Monitoring**: Track all library activities

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Custom Components
- **Icons**: Lucide React
- **Authentication**: Local Storage (to be upgraded to proper auth)
- **Database**: Mock data (ready for integration)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-library
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
smart-library/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin portal pages
│   ├── dashboard/         # Student dashboard pages
│   ├── api/               # API routes (to be implemented)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing/login page
├── components/            # Reusable components
│   └── ui/               # UI components (Radix-based)
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
└── utils/                # Helper functions
```

## 🔐 Authentication

Currently using localStorage for demo purposes. **Production recommendations:**
- Implement NextAuth.js or Clerk for authentication
- Add JWT tokens with proper expiration
- Implement role-based access control (RBAC)
- Add session management

## 🗄️ Database Integration

The project is ready for database integration. **Recommended setup:**
- **Primary Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for session storage and caching
- **File Storage**: AWS S3 or similar for PDF storage

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **Railway**: Use their PostgreSQL and Redis services
- **Self-hosted**: Docker configuration available

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use conventional commit messages

### Component Structure
- Keep components small and focused
- Use composition over inheritance
- Implement proper error boundaries

### State Management
- Use React hooks for local state
- Consider Zustand for global state
- Implement proper loading and error states

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@esut.edu.ng or create an issue in the repository.

---

**Built with ❤️ for ESUT Library**
