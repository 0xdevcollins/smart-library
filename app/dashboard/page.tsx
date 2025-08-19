"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Search, Clock, Download, User, LogOut, Bell } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data for demonstration
const mockBooks = [
  {
    id: 1,
    title: "Data Structures and Algorithms",
    author: "Thomas H. Cormen",
    isbn: "978-0262033848",
    category: "Computer Science",
    available: 3,
    total: 5,
    description: "Comprehensive guide to algorithms and data structures",
  },
  {
    id: 2,
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Software Engineering",
    available: 2,
    total: 4,
    description: "A handbook of agile software craftsmanship",
  },
  {
    id: 3,
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    isbn: "978-0132126953",
    category: "Networking",
    available: 0,
    total: 3,
    description: "Comprehensive introduction to computer networks",
  },
  {
    id: 4,
    title: "Database System Concepts",
    author: "Abraham Silberschatz",
    isbn: "978-0073523323",
    category: "Database",
    available: 1,
    total: 2,
    description: "Fundamental concepts of database systems",
  },
  {
    id: 5,
    title: "Operating System Concepts",
    author: "Abraham Silberschatz",
    isbn: "978-1118063330",
    category: "Operating Systems",
    available: 4,
    total: 6,
    description: "Essential concepts of operating systems",
  },
]

const mockBorrowedBooks = [
  {
    id: 1,
    title: "Introduction to Machine Learning",
    author: "Ethem Alpaydin",
    borrowDate: "2024-01-15",
    dueDate: "2024-02-15",
    status: "borrowed",
  },
  {
    id: 2,
    title: "Web Development with React",
    author: "Alex Banks",
    borrowDate: "2024-01-20",
    dueDate: "2024-02-20",
    status: "overdue",
  },
]

const mockPdfRequests = [
  {
    id: 1,
    title: "Advanced Algorithms",
    author: "Jon Kleinberg",
    requestDate: "2024-01-25",
    status: "pending",
    reason: "Not available in physical library",
  },
  {
    id: 2,
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell",
    requestDate: "2024-01-20",
    status: "approved",
    reason: "Research purposes",
  },
]

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [studentId, setStudentId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") return

      const storedStudentId = localStorage.getItem("studentId")
      const userType = localStorage.getItem("userType")

      if (!storedStudentId || userType !== "student") {
        router.push("/")
        return
      }

      setStudentId(storedStudentId)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("studentId")
      localStorage.removeItem("userType")
    }
    router.push("/")
  }

  const filteredBooks = mockBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(mockBooks.map((book) => book.category)))]

  const handleBorrowBook = (bookId: number) => {
    alert(`Book borrowed successfully! Please collect it from the library within 24 hours.`)
  }

  const handleReturnBook = (bookId: number) => {
    alert(`Book return initiated. Please return the physical book to complete the process.`)
  }

  const handleRequestPdf = (bookId: number) => {
    const book = mockBooks.find((b) => b.id === bookId)
    if (book) {
      alert(`PDF request submitted for "${book.title}". You'll be notified when it's available.`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">ESUT Library</h1>
                <p className="text-xs text-gray-500">Student Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Bell className="h-5 w-5 text-gray-600" />
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">{studentId}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="catalog" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="catalog">Book Catalog</TabsTrigger>
            <TabsTrigger value="borrowed">My Books</TabsTrigger>
            <TabsTrigger value="requests">PDF Requests</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Book Catalog */}
          <TabsContent value="catalog" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search books by title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === "all" ? "All Categories" : category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary">{book.category}</Badge>
                      <Badge variant={book.available > 0 ? "default" : "destructive"}>
                        {book.available > 0 ? `${book.available} available` : "Not available"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                    <CardDescription>by {book.author}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{book.description}</p>
                    <p className="text-xs text-gray-500">ISBN: {book.isbn}</p>
                    <div className="flex gap-2">
                      {book.available > 0 ? (
                        <Button size="sm" className="flex-1" onClick={() => handleBorrowBook(book.id)}>
                          Borrow Book
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => handleRequestPdf(book.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Request PDF
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Borrowed Books */}
          <TabsContent value="borrowed" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockBorrowedBooks.map((book) => (
                <Card key={book.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant={book.status === "overdue" ? "destructive" : "default"}>{book.status}</Badge>
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                    <CardDescription>by {book.author}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Borrowed:</span> {book.borrowDate}
                      </p>
                      <p>
                        <span className="font-medium">Due:</span> {book.dueDate}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => handleReturnBook(book.id)}
                    >
                      Return Book
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* PDF Requests */}
          <TabsContent value="requests" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockPdfRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant={request.status === "approved" ? "default" : "secondary"}>{request.status}</Badge>
                      <Download className="h-4 w-4 text-gray-500" />
                    </div>
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <CardDescription>by {request.author}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Requested:</span> {request.requestDate}
                      </p>
                      <p>
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                    </div>
                    {request.status === "approved" && (
                      <Button size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Profile</CardTitle>
                <CardDescription>Your library account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Student ID</Label>
                    <p className="text-sm text-gray-600">{studentId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Department</Label>
                    <p className="text-sm text-gray-600">Computer Science</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Level</Label>
                    <p className="text-sm text-gray-600">400 Level</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Books Borrowed</Label>
                    <p className="text-sm text-gray-600">{mockBorrowedBooks.length}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">PDF Requests</Label>
                    <p className="text-sm text-gray-600">{mockPdfRequests.length}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Account Status</Label>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
