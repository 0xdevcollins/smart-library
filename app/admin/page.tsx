"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Users, Download, Plus, LogOut, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data for admin dashboard
const mockStats = {
  totalBooks: 5000,
  borrowedBooks: 1250,
  totalStudents: 2000,
  pendingRequests: 45,
}

const mockRecentActivity = [
  { id: 1, action: "Book borrowed", student: "CS/2020/001", book: "Data Structures", time: "2 hours ago" },
  { id: 2, action: "PDF requested", student: "CS/2020/045", book: "Advanced Algorithms", time: "4 hours ago" },
  { id: 3, action: "Book returned", student: "CS/2019/123", book: "Clean Code", time: "6 hours ago" },
  { id: 4, action: "New book added", admin: "Admin", book: "React Handbook", time: "1 day ago" },
]

const mockPdfRequests = [
  {
    id: 1,
    title: "Data Structures",
    author: "John Doe",
    student: "CS/2020/001",
    requestDate: "2023-10-01",
    reason: "For project",
  },
  {
    id: 2,
    title: "Advanced Algorithms",
    author: "Jane Smith",
    student: "CS/2020/045",
    requestDate: "2023-10-02",
    reason: "For study",
  },
]

export default function AdminDashboard() {
  const [adminEmail, setAdminEmail] = useState("")
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    quantity: "",
    description: "",
  })
  const router = useRouter()

  useEffect(() => {
    const storedAdminEmail = localStorage.getItem("adminEmail")
    const userType = localStorage.getItem("userType")

    if (!storedAdminEmail || userType !== "admin") {
      router.push("/")
      return
    }

    setAdminEmail(storedAdminEmail)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminEmail")
    localStorage.removeItem("userType")
    router.push("/")
  }

  const handleAddBook = () => {
    // In a real app, this would make an API call
    console.log("Adding book:", newBook)
    setIsAddBookOpen(false)
    setNewBook({
      title: "",
      author: "",
      isbn: "",
      category: "",
      quantity: "",
      description: "",
    })
    alert("Book added successfully!")
  }

  const handleApproveRequest = (requestId: number) => {
    alert(`PDF request ${requestId} approved!`)
  }

  const handleRejectRequest = (requestId: number) => {
    alert(`PDF request ${requestId} rejected!`)
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
              <span className="text-sm font-medium">{adminEmail}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Books</p>
                  <p className="text-3xl font-bold text-gray-900">{mockStats.totalBooks.toLocaleString()}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Borrowed Books</p>
                  <p className="text-3xl font-bold text-gray-900">{mockStats.borrowedBooks.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{mockStats.totalStudents.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{mockStats.pendingRequests}</p>
                </div>
                <Download className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="requests">PDF Requests</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest library activities and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-600">
                            {activity.student && `Student: ${activity.student} • `}
                            {activity.admin && `Admin: ${activity.admin} • `}
                            Book: {activity.book}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Books Management */}
          <TabsContent value="books" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Book Management</h2>
              <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Book</DialogTitle>
                    <DialogDescription>Enter the details of the new book to add to the library.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newBook.title}
                        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                        placeholder="Enter book title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={newBook.author}
                        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                        placeholder="Enter author name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        value={newBook.isbn}
                        onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                        placeholder="Enter ISBN"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newBook.category}
                        onValueChange={(value) => setNewBook({ ...newBook, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                          <SelectItem value="Networking">Networking</SelectItem>
                          <SelectItem value="Database">Database</SelectItem>
                          <SelectItem value="Operating Systems">Operating Systems</SelectItem>
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
                        placeholder="Enter quantity"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newBook.description}
                        onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                        placeholder="Enter book description"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddBook} className="flex-1">
                        Add Book
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddBookOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Books</CardTitle>
                <CardDescription>Manage your library's book collection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* This would be populated with actual book data */}
                  <p className="text-gray-600">
                    Book management interface would be implemented here with full CRUD operations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Management */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>View and manage student accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Student management interface would be implemented here.</p>
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
                <div className="space-y-4">
                  {mockPdfRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{request.title}</h4>
                        <p className="text-sm text-gray-600">by {request.author}</p>
                        <p className="text-xs text-gray-500">
                          Requested by: {request.student} • {request.requestDate}
                        </p>
                        <p className="text-xs text-gray-500">Reason: {request.reason}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApproveRequest(request.id)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.id)}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Library Reports</CardTitle>
                <CardDescription>Generate and view library statistics and reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Reporting dashboard would be implemented here with charts and analytics.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
