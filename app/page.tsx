"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, Download, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated, login } = useAuth()

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'student') {
        router.push('/dashboard')
      } else if (user?.role === 'admin') {
        router.push('/admin')
      }
    }
  }, [isAuthenticated, user, router])

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (studentId && password) {
      setIsLoading(true)
      try {
        const success = await login({
          studentId,
          password,
          userType: 'student'
        })
        
        if (!success) {
          alert("Login failed. Please check your credentials.")
        }
      } catch (error) {
        console.error("Login error:", error)
        alert("Login failed. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (adminEmail && adminPassword) {
      setIsLoading(true)
      try {
        const success = await login({
          email: adminEmail,
          password: adminPassword,
          userType: 'admin'
        })
        
        if (!success) {
          alert("Login failed. Please check your credentials.")
        }
      } catch (error) {
        console.error("Login error:", error)
        alert("Login failed. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <BookOpen className="h-12 w-12 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ESUT Library</h1>
              <p className="text-sm text-gray-600">Smart Management System</p>
            </div>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Your Gateway to
            <span className="text-blue-600"> Knowledge</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-lg">
            Access thousands of books, manage your borrowings, and request digital copies - all in one smart platform
            designed for ESUT students.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold">5000+</p>
                <p className="text-sm text-gray-600">Books Available</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold">2000+</p>
                <p className="text-sm text-gray-600">Active Students</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
              <Download className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-semibold">500+</p>
                <p className="text-sm text-gray-600">PDF Requests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Forms */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your library account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      placeholder="Enter your student ID (e.g., CS/2020/001)"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In as Student"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="Enter admin email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter admin password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-transparent" variant="outline" disabled={isLoading}>
                    <Shield className="w-4 h-4 mr-2" />
                    {isLoading ? "Signing In..." : "Sign In as Admin"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
