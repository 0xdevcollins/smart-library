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
import { BookOpen, Search, Clock, Download, User, LogOut, Bell, AlertCircle, CheckCircle, XCircle, Plus, Eye } from "lucide-react"
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
  borrowDate: string
  dueDate: string
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE'
  fine?: number
}

interface PdfRequest {
  id: number
  book: Book
  requestDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reason: string
  adminNotes?: string
  pdfUrl?: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  read: boolean
  createdAt: string
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [books, setBooks] = useState<Book[]>([])
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([])
  const [pdfRequests, setPdfRequests] = useState<PdfRequest[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPdfRequestOpen, setIsPdfRequestOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [pdfRequestReason, setPdfRequestReason] = useState("")
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
      return
    }

    if (!isLoading && user?.role !== 'student') {
      router.push("/")
      return
    }

    if (isAuthenticated && user?.role === 'student') {
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
        fetchNotifications()
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
      const response = await fetch('/api/borrow?type=borrowed')
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

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=5')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data || [])
        setUnreadCount(data.data?.filter((n: Notification) => !n.read).length || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const handleBorrowBook = async (bookId: number) => {
    try {
      const response = await fetch('/api/borrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          action: 'borrow'
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Book borrowed successfully! Please collect it from the library within 24 hours.')
        fetchBooks()
        fetchBorrowedBooks()
      } else {
        toast.error(data.error || 'Failed to borrow book')
      }
    } catch (error) {
      console.error('Error borrowing book:', error)
      toast.error('Failed to borrow book')
    }
  }

  const handleReturnBook = async (borrowedBookId: number) => {
    try {
      const response = await fetch('/api/borrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: borrowedBookId,
          action: 'return'
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Book return initiated. Please return the physical book to complete the process.')
        fetchBooks()
        fetchBorrowedBooks()
      } else {
        toast.error(data.error || 'Failed to return book')
      }
    } catch (error) {
      console.error('Error returning book:', error)
      toast.error('Failed to return book')
    }
  }

  const handleRequestPdf = async () => {
    if (!selectedBook || !pdfRequestReason.trim()) {
      toast.error('Please provide a reason for the PDF request')
      return
    }

    try {
      const response = await fetch('/api/pdf-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: selectedBook.id,
          reason: pdfRequestReason
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`PDF request submitted for "${selectedBook.title}". You'll be notified when it's available.`)
        setIsPdfRequestOpen(false)
        setSelectedBook(null)
        setPdfRequestReason("")
        fetchPdfRequests()
      } else {
        toast.error(data.error || 'Failed to submit PDF request')
      }
    } catch (error) {
      console.error('Error requesting PDF:', error)
      toast.error('Failed to submit PDF request')
    }
  }

  const handleDownloadPdf = (pdfUrl: string, bookTitle: string) => {
    // In a real implementation, this would download the PDF
    window.open(pdfUrl, '_blank')
    toast.success(`Downloading PDF for "${bookTitle}"`)
  }

  const handleMarkNotificationsAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      if (unreadNotifications.length === 0) return

      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: unreadNotifications.map(n => n.id),
          read: true
        })
      })

      if (response.ok) {
        fetchNotifications()
        toast.success('Notifications marked as read')
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(books.map((book) => book.category)))]

  const overdueBooks = borrowedBooks.filter(book => 
    book.status === 'BORROWED' && new Date(book.dueDate) < new Date()
  )

  if (isLoading) {
    return <LoadingPage text="Loading your dashboard..." />
  }

  if (!isAuthenticated || user?.role !== 'student') {
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
                <p className="text-xs text-gray-500">Student Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Notifications</DialogTitle>
                    <DialogDescription>
                      {unreadCount > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleMarkNotificationsAsRead}
                          className="mt-2"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No notifications</p>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-3 rounded-lg border ${
                            notification.read ? 'bg-gray-50' : 'bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {notification.type === 'SUCCESS' && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                            {notification.type === 'WARNING' && <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />}
                            {notification.type === 'ERROR' && <XCircle className="h-4 w-4 text-red-600 mt-0.5" />}
                            {notification.type === 'INFO' && <Eye className="h-4 w-4 text-blue-600 mt-0.5" />}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">{user?.studentId || user?.name}</span>
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
                  <p className="text-sm font-medium text-gray-600">Books Borrowed</p>
                  <p className="text-2xl font-bold">{borrowedBooks.filter(b => b.status === 'BORROWED').length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Books</p>
                  <p className="text-2xl font-bold text-red-600">{overdueBooks.length}</p>
                </div>
                <Clock className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">PDF Requests</p>
                  <p className="text-2xl font-bold">{pdfRequests.length}</p>
                </div>
                <Download className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread Notifications</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
                <Bell className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

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
                    {book.publishedYear && (
                      <p className="text-xs text-gray-500">Published: {book.publishedYear}</p>
                    )}
                    <div className="flex gap-2">
                      {book.available > 0 ? (
                        <Button 
                          size="sm" 
                          className="flex-1" 
                          onClick={() => handleBorrowBook(book.id)}
                        >
                          Borrow Book
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => {
                            setSelectedBook(book)
                            setIsPdfRequestOpen(true)
                          }}
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
            {borrowedBooks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No borrowed books</h3>
                  <p className="text-gray-600">You haven't borrowed any books yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {borrowedBooks.map((borrowedBook) => (
                  <Card key={borrowedBook.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge variant={
                          borrowedBook.status === "OVERDUE" || 
                          (borrowedBook.status === "BORROWED" && new Date(borrowedBook.dueDate) < new Date())
                            ? "destructive" 
                            : "default"
                        }>
                          {borrowedBook.status === "BORROWED" && new Date(borrowedBook.dueDate) < new Date() 
                            ? "OVERDUE" 
                            : borrowedBook.status.toLowerCase()
                          }
                        </Badge>
                        <Clock className="h-4 w-4 text-gray-500" />
                      </div>
                      <CardTitle className="text-lg">{borrowedBook.book.title}</CardTitle>
                      <CardDescription>by {borrowedBook.book.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Borrowed:</span> {new Date(borrowedBook.borrowDate).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Due:</span> {new Date(borrowedBook.dueDate).toLocaleDateString()}
                        </p>
                        {borrowedBook.fine && borrowedBook.fine > 0 && (
                          <p className="text-red-600">
                            <span className="font-medium">Fine:</span> ₦{borrowedBook.fine}
                          </p>
                        )}
                      </div>
                      {borrowedBook.status === "BORROWED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => handleReturnBook(borrowedBook.id)}
                        >
                          Return Book
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* PDF Requests */}
          <TabsContent value="requests" className="space-y-6">
            {pdfRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No PDF requests</h3>
                  <p className="text-gray-600">You haven't made any PDF requests yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pdfRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                                                 <Badge variant={
                           request.status === "APPROVED" ? "default" : 
                           request.status === "REJECTED" ? "destructive" : "secondary"
                         }>
                           {request.status.toLowerCase()}
                         </Badge>
                        <Download className="h-4 w-4 text-gray-500" />
                      </div>
                      <CardTitle className="text-lg">{request.book.title}</CardTitle>
                      <CardDescription>by {request.book.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Requested:</span> {new Date(request.requestDate).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Reason:</span> {request.reason}
                        </p>
                        {request.adminNotes && (
                          <p>
                            <span className="font-medium">Admin Notes:</span> {request.adminNotes}
                          </p>
                        )}
                      </div>
                                             {request.status === "APPROVED" && request.pdfUrl && (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleDownloadPdf(request.pdfUrl!, request.book.title)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
                    <p className="text-sm text-gray-600">{user?.studentId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Department</Label>
                    <p className="text-sm text-gray-600">{user?.department || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Level</Label>
                    <p className="text-sm text-gray-600">{user?.level || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Books Borrowed</Label>
                    <p className="text-sm text-gray-600">{borrowedBooks.filter(b => b.status === 'BORROWED').length}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">PDF Requests</Label>
                    <p className="text-sm text-gray-600">{pdfRequests.length}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Account Status</Label>
                                         <Badge variant="default">
                       Active
                     </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* PDF Request Dialog */}
      <Dialog open={isPdfRequestOpen} onOpenChange={setIsPdfRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request PDF Copy</DialogTitle>
            <DialogDescription>
              Request a digital copy of "{selectedBook?.title}" by {selectedBook?.author}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for request</Label>
              <Textarea
                id="reason"
                placeholder="Please explain why you need a PDF copy of this book..."
                value={pdfRequestReason}
                onChange={(e) => setPdfRequestReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsPdfRequestOpen(false)
              setSelectedBook(null)
              setPdfRequestReason("")
            }}>
              Cancel
            </Button>
            <Button onClick={handleRequestPdf} disabled={!pdfRequestReason.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
