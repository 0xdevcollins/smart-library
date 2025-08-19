"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Plus, Users, Download, BarChart3, LogOut, User, AlertCircle, CheckCircle, XCircle, Eye, Trash2, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { LoadingPage } from "@/components/LoadingSpinner"
import { toast } from "sonner"

interface Book {
  id: number
  title: string
  author: string
  isbn: string
  category: string
  available: number
  total: number
  description: string
  publishedYear?: number
  publisher?: string
  location?: string
}

interface BorrowedBook {
  id: number
  book: Book
  user: {
    id: string
    name: string
    studentId: string
    email: string
  }
  borrowDate: string
  dueDate: string
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE'
  fine?: number
}

interface PdfRequest {
  id: number
  book: Book
  user: {
    id: string
    name: string
    studentId: string
    email: string
  }
  requestDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reason: string
  adminNotes?: string
  pdfUrl?: string
}

interface Activity {
  id: number
  action: string
  user: {
    name: string
    studentId?: string
  }
  bookTitle?: string
  timestamp: string
}

interface Stats {
  totalBooks: number
  totalStudents: number
  borrowedBooks: number
  overdueBooks: number
  totalFines: number
  pendingRequests: number
}

export default function AdminDashboard() {
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  const [isEditBookOpen, setIsEditBookOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([])
  const [pdfRequests, setPdfRequests] = useState<PdfRequest[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PdfRequest | null>(null)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [pdfUrl, setPdfUrl] = useState("")
  
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    quantity: "",
    description: "",
    publishedYear: "",
    publisher: "",
    location: ""
  })

  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
      return
    }

    if (!isLoading && user?.role !== 'admin') {
      router.push("/")
      return
    }

    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboardData()
    }
  }, [isLoading, isAuthenticated, user, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchBooks(),
        fetchBorrowedBooks(),
        fetchPdfRequests(),
        fetchActivities(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books')
      if (response.ok) {
        const data = await response.json()
        setBooks(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    }
  }

  const fetchBorrowedBooks = async () => {
    try {
      const response = await fetch('/api/borrow?type=overdue')
      if (response.ok) {
        const data = await response.json()
        setBorrowedBooks(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching borrowed books:', error)
    }
  }

  const fetchPdfRequests = async () => {
    try {
      const response = await fetch('/api/pdf-requests')
      if (response.ok) {
        const data = await response.json()
        setPdfRequests(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching PDF requests:', error)
    }
  }

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities')
      if (response.ok) {
        const data = await response.json()
        setActivities(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data || null)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const handleAddBook = async () => {
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBook)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Book added successfully!')
        setIsAddBookOpen(false)
        setNewBook({
          title: "",
          author: "",
          isbn: "",
          category: "",
          quantity: "",
          description: "",
          publishedYear: "",
          publisher: "",
          location: ""
        })
        fetchBooks()
        fetchStats()
      } else {
        toast.error(data.error || 'Failed to add book')
      }
    } catch (error) {
      console.error('Error adding book:', error)
      toast.error('Failed to add book')
    }
  }

  const handleEditBook = async () => {
    if (!selectedBook) return

    try {
      const response = await fetch(`/api/books/${selectedBook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBook)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Book updated successfully!')
        setIsEditBookOpen(false)
        setSelectedBook(null)
        setNewBook({
          title: "",
          author: "",
          isbn: "",
          category: "",
          quantity: "",
          description: "",
          publishedYear: "",
          publisher: "",
          location: ""
        })
        fetchBooks()
      } else {
        toast.error(data.error || 'Failed to update book')
      }
    } catch (error) {
      console.error('Error updating book:', error)
      toast.error('Failed to update book')
    }
  }

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Book deleted successfully!')
        fetchBooks()
        fetchStats()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete book')
      }
    } catch (error) {
      console.error('Error deleting book:', error)
      toast.error('Failed to delete book')
    }
  }

  const handleApproveRequest = async () => {
    if (!selectedRequest) return

    try {
      const response = await fetch(`/api/pdf-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'APPROVED',
          adminNotes,
          pdfUrl
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('PDF request approved!')
        setIsRequestDialogOpen(false)
        setSelectedRequest(null)
        setAdminNotes("")
        setPdfUrl("")
        fetchPdfRequests()
        fetchStats()
      } else {
        toast.error(data.error || 'Failed to approve request')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('Failed to approve request')
    }
  }

  const handleRejectRequest = async () => {
    if (!selectedRequest) return

    try {
      const response = await fetch(`/api/pdf-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REJECTED',
          adminNotes
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('PDF request rejected!')
        setIsRequestDialogOpen(false)
        setSelectedRequest(null)
        setAdminNotes("")
        fetchPdfRequests()
        fetchStats()
      } else {
        toast.error(data.error || 'Failed to reject request')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Failed to reject request')
    }
  }

  const openEditBook = (book: Book) => {
    setSelectedBook(book)
    setNewBook({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      quantity: book.total.toString(),
      description: book.description,
      publishedYear: book.publishedYear?.toString() || "",
      publisher: book.publisher || "",
      location: book.location || ""
    })
    setIsEditBookOpen(true)
  }

  const openRequestDialog = (request: PdfRequest) => {
    setSelectedRequest(request)
    setAdminNotes(request.adminNotes || "")
    setPdfUrl(request.pdfUrl || "")
    setIsRequestDialogOpen(true)
  }

  if (isLoading) {
    return <LoadingPage text="Loading admin dashboard..." />
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <LoadingPage text="Redirecting..." />
  }

  if (loading) {
    return <LoadingPage text="Loading dashboard data..." />
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
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">{user?.name}</span>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Books</p>
                  <p className="text-2xl font-bold">{stats?.totalBooks || 0}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Books</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.overdueBooks || 0}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold">{stats?.pendingRequests || 0}</p>
                </div>
                <Download className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="requests">PDF Requests</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Books Management */}
          <TabsContent value="books" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Book Management</h2>
              <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Book</DialogTitle>
                    <DialogDescription>
                      Add a new book to the library catalog
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newBook.title}
                        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                        placeholder="Book title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={newBook.author}
                        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                        placeholder="Author name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        value={newBook.isbn}
                        onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                        placeholder="ISBN"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newBook.category} onValueChange={(value) => setNewBook({ ...newBook, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                          <SelectItem value="Networking">Networking</SelectItem>
                          <SelectItem value="Database">Database</SelectItem>
                          <SelectItem value="Operating Systems">Operating Systems</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="Literature">Literature</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newBook.quantity}
                        onChange={(e) => setNewBook({ ...newBook, quantity: e.target.value })}
                        placeholder="Number of copies"
                      />
                    </div>
                    <div>
                      <Label htmlFor="publishedYear">Published Year</Label>
                      <Input
                        id="publishedYear"
                        type="number"
                        value={newBook.publishedYear}
                        onChange={(e) => setNewBook({ ...newBook, publishedYear: e.target.value })}
                        placeholder="Year"
                      />
                    </div>
                    <div>
                      <Label htmlFor="publisher">Publisher</Label>
                      <Input
                        id="publisher"
                        value={newBook.publisher}
                        onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                        placeholder="Publisher"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newBook.location}
                        onChange={(e) => setNewBook({ ...newBook, location: e.target.value })}
                        placeholder="Shelf location"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newBook.description}
                      onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                      placeholder="Book description"
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddBookOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddBook}>
                      Add Book
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary">{book.category}</Badge>
                      <Badge variant={book.available > 0 ? "default" : "destructive"}>
                        {book.available}/{book.total}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                    <CardDescription>by {book.author}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{book.description}</p>
                    <p className="text-xs text-gray-500">ISBN: {book.isbn}</p>
                    {book.publishedYear && (
                      <p className="text-xs text-gray-500">Published: {book.publishedYear}</p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditBook(book)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteBook(book.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Overdue Books */}
          <TabsContent value="overdue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overdue Books</CardTitle>
                <CardDescription>Books that are past their due date</CardDescription>
              </CardHeader>
              <CardContent>
                {borrowedBooks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No overdue books</p>
                ) : (
                  <div className="space-y-4">
                    {borrowedBooks.map((borrowedBook) => (
                      <div key={borrowedBook.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{borrowedBook.book.title}</h4>
                          <p className="text-sm text-gray-600">by {borrowedBook.book.author}</p>
                          <p className="text-xs text-gray-500">
                            Borrowed by: {borrowedBook.user.name} ({borrowedBook.user.studentId})
                          </p>
                          <p className="text-xs text-gray-500">
                            Due: {new Date(borrowedBook.dueDate).toLocaleDateString()}
                          </p>
                          {borrowedBook.fine && borrowedBook.fine > 0 && (
                            <p className="text-xs text-red-600">
                              Fine: ₦{borrowedBook.fine}
                            </p>
                          )}
                        </div>
                        <Badge variant="destructive">Overdue</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PDF Requests */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>PDF Requests</CardTitle>
                <CardDescription>Review and manage student PDF requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pdfRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No PDF requests</p>
                ) : (
                  <div className="space-y-4">
                    {pdfRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{request.book.title}</h4>
                          <p className="text-sm text-gray-600">by {request.book.author}</p>
                          <p className="text-xs text-gray-500">
                            Requested by: {request.user.name} ({request.user.studentId})
                          </p>
                          <p className="text-xs text-gray-500">
                            Date: {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Reason: {request.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={
                            request.status === "APPROVED" ? "default" : 
                            request.status === "REJECTED" ? "destructive" : "secondary"
                          }>
                            {request.status.toLowerCase()}
                          </Badge>
                          {request.status === "PENDING" && (
                            <Button size="sm" onClick={() => openRequestDialog(request)}>
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities */}
          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest library activities and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No activities</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-600">
                            by {activity.user.name} {activity.user.studentId && `(${activity.user.studentId})`}
                          </p>
                          {activity.bookTitle && (
                            <p className="text-xs text-gray-500">Book: {activity.bookTitle}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Library Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Books:</span>
                    <span className="font-medium">{stats?.totalBooks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Students:</span>
                    <span className="font-medium">{stats?.totalStudents || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Borrowed Books:</span>
                    <span className="font-medium">{stats?.borrowedBooks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overdue Books:</span>
                    <span className="font-medium text-red-600">{stats?.overdueBooks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Fines:</span>
                    <span className="font-medium">₦{stats?.totalFines || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Requests:</span>
                    <span className="font-medium">{stats?.pendingRequests || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" onClick={() => fetchDashboardData()}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Book Dialog */}
      <Dialog open={isEditBookOpen} onOpenChange={setIsEditBookOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>
              Update book information
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={newBook.title}
                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                placeholder="Book title"
              />
            </div>
            <div>
              <Label htmlFor="edit-author">Author</Label>
              <Input
                id="edit-author"
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                placeholder="Author name"
              />
            </div>
            <div>
              <Label htmlFor="edit-isbn">ISBN</Label>
              <Input
                id="edit-isbn"
                value={newBook.isbn}
                onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                placeholder="ISBN"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={newBook.category} onValueChange={(value) => setNewBook({ ...newBook, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                  <SelectItem value="Database">Database</SelectItem>
                  <SelectItem value="Operating Systems">Operating Systems</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Literature">Literature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={newBook.quantity}
                onChange={(e) => setNewBook({ ...newBook, quantity: e.target.value })}
                placeholder="Number of copies"
              />
            </div>
            <div>
              <Label htmlFor="edit-publishedYear">Published Year</Label>
              <Input
                id="edit-publishedYear"
                type="number"
                value={newBook.publishedYear}
                onChange={(e) => setNewBook({ ...newBook, publishedYear: e.target.value })}
                placeholder="Year"
              />
            </div>
            <div>
              <Label htmlFor="edit-publisher">Publisher</Label>
              <Input
                id="edit-publisher"
                value={newBook.publisher}
                onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                placeholder="Publisher"
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={newBook.location}
                onChange={(e) => setNewBook({ ...newBook, location: e.target.value })}
                placeholder="Shelf location"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={newBook.description}
              onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
              placeholder="Book description"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditBookOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBook}>
              Update Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Request Review Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review PDF Request</DialogTitle>
            <DialogDescription>
              Review and process the PDF request for "{selectedRequest?.book.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-notes">Admin Notes</Label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this request..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="pdf-url">PDF URL (if approving)</Label>
              <Input
                id="pdf-url"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://example.com/book.pdf"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectRequest}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={handleApproveRequest}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
