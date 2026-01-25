"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"payments" | "courses" | "levels" | "videos" | "quizzes" | "users">(
    "payments",
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-foreground text-background border-r border-border">
          <div className="p-6 border-b border-background/20">
            <h1 className="font-serif text-2xl font-bold">🌙 Moon Learning</h1>
            <p className="text-sm opacity-75">Admin Dashboard</p>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { id: "payments", label: "Pending Payments", badge: true },
              { id: "courses", label: "Courses" },
              { id: "levels", label: "Levels" },
              { id: "videos", label: "Videos" },
              { id: "quizzes", label: "Quizzes" },
              { id: "users", label: "Users" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full text-left px-4 py-2 rounded transition-colors flex items-center justify-between ${activeTab === item.id
                  ? "bg-background text-foreground font-semibold"
                  : "text-background hover:bg-background/10"
                  }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="bg-destructive text-background text-xs font-bold px-2 py-1 rounded-full">3</span>
                )}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-background/20">
            <Button
              variant="outline"
              className="w-full text-background border-background hover:bg-background hover:text-foreground rounded-full bg-transparent"
              asChild
            >
              <Link href="/">Exit Admin</Link>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {activeTab === "payments" && <PendingPaymentsSection />}
            {activeTab === "courses" && <CourseManagement onNavigate={setActiveTab} />}
            {activeTab === "levels" && <LevelManagement onNavigate={setActiveTab} />}
            {activeTab === "videos" && <VideoManagement />}
            {activeTab === "quizzes" && <QuizManagement />}
            {activeTab === "users" && <UserManagement />}
          </div>
        </div>
      </div>
    </div>
  )
}

function PendingPaymentsSection() {
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  // Fetch pending payments from API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch("/api/admin/payments")
        const data = await response.json()
        if (data.success) {
          setPendingPayments(data.payments)
        }
      } catch (error) {
        console.error("Error fetching payments:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  const handleApprove = async (payment: any) => {
    setVerifyingId(payment.id)
    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment.id,
          courseId: payment.courseId,
          userId: payment.userId,
          action: "approve",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPendingPayments(pendingPayments.filter((p) => p.id !== payment.id))
        alert("Payment approved! User access granted.")
      } else {
        alert("Error: " + data.error)
      }
    } catch (error) {
      console.error("Error approving payment:", error)
      alert("Failed to approve payment")
    } finally {
      setVerifyingId(null)
    }
  }

  const handleReject = async (payment: any) => {
    if (!confirm("Are you sure you want to reject this payment?")) return

    setVerifyingId(payment.id)
    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment.id,
          courseId: payment.courseId,
          userId: payment.userId,
          action: "reject",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPendingPayments(pendingPayments.filter((p) => p.id !== payment.id))
        alert("Payment rejected.")
      } else {
        alert("Error: " + data.error)
      }
    } catch (error) {
      console.error("Error rejecting payment:", error)
      alert("Failed to reject payment")
    } finally {
      setVerifyingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="font-serif text-3xl font-bold text-foreground">Payment Confirmations</h2>
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-3xl font-bold text-foreground">Payment Confirmations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {pendingPayments.length} pending manual payment{pendingPayments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full bg-transparent"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>

      {pendingPayments.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-4xl mb-4">✓</p>
          <p className="text-lg font-semibold text-foreground mb-2">All Clear!</p>
          <p className="text-muted-foreground">No pending payment confirmations at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-card border border-border rounded-lg p-6 hover:border-accent/50 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Student</p>
                  <p className="font-semibold text-foreground">{payment.userName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Course</p>
                  <p className="font-semibold text-foreground">{payment.courseName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Amount</p>
                  <p className="font-serif text-lg font-bold text-accent">${payment.amount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Submitted</p>
                  <p className="font-semibold text-foreground text-sm">{payment.submittedAt}</p>
                </div>
              </div>

              <div className="mb-4 pb-4 border-b border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Student Phone Number</p>
                    <p className="font-mono text-sm text-foreground">{payment.userPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                    <p className="font-semibold text-foreground text-sm">{payment.paymentMethod}</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-amber-900 mb-1">Action Required:</p>
                <p className="text-xs text-amber-800">
                  Verify the transfer of ${payment.amount} from {payment.userPhone} to the platform Vodafone account,
                  then approve or reject.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
                  onClick={() => handleApprove(payment)}
                  disabled={verifyingId === payment.id}
                >
                  {verifyingId === payment.id ? "Processing..." : "Approve & Grant Access"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-full border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                  onClick={() => handleReject(payment)}
                  disabled={verifyingId === payment.id}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-sm font-semibold text-blue-900 mb-2">Admin Tips:</p>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Check your Vodafone Cash account for incoming transfers</li>
          <li>• Verify the amount and student phone number match</li>
          <li>• Approve within 1-2 hours for best user experience</li>
          <li>• Rejected payments will be refunded by students</li>
        </ul>
      </div>
    </div>
  )
}

function CourseManagement({ onNavigate }: { onNavigate: (tab: "payments" | "courses" | "levels" | "videos" | "quizzes" | "users") => void }) {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ title: "", description: "", price: "", instructor: "", instructorBio: "", currency: "EGP", status: "draft" })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses")
      const data = await response.json()
      if (data.success) setCourses(data.courses)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.price) {
      alert("Please fill in all required fields")
      return
    }
    setSaving(true)
    try {
      const url = "/api/admin/courses"
      const method = editingId ? "PUT" : "POST"
      const body = editingId
        ? { id: editingId, ...formData, price: parseFloat(formData.price) }
        : { ...formData, price: parseFloat(formData.price) }
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await response.json()
      if (data.success) {
        fetchCourses()
        setShowForm(false)
        setEditingId(null)
        setFormData({ title: "", description: "", price: "", instructor: "", instructorBio: "", currency: "EGP", status: "draft" })
        alert(editingId ? "Course updated!" : "Course created!")
      } else {
        alert("Error: " + data.error)
      }
    } catch (error) {
      console.error("Error saving course:", error)
      alert("Failed to save course")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course and all its levels, videos, and quizzes?")) return
    try {
      const response = await fetch(`/api/admin/courses?id=${id}`, { method: "DELETE" })
      const data = await response.json()
      if (data.success) { fetchCourses(); alert("Course deleted!") }
      else alert("Error: " + data.error)
    } catch (error) { console.error("Error deleting course:", error); alert("Failed to delete course") }
  }

  if (loading) return <div className="space-y-6"><h2 className="font-serif text-3xl font-bold text-foreground">Manage Courses</h2><div className="bg-card border border-border rounded-lg p-12 text-center"><p className="text-muted-foreground">Loading courses...</p></div></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="font-serif text-3xl font-bold text-foreground">Manage Courses</h2><p className="text-sm text-muted-foreground mt-1">{courses.length} course{courses.length !== 1 ? "s" : ""}</p></div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ title: "", description: "", price: "", instructor: "", instructorBio: "", currency: "EGP", status: "draft" }) }}>
          {showForm ? "Cancel" : "Add Course"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-foreground">{editingId ? "Edit Course" : "Create New Course"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-2">Course Title *</label><Input placeholder="Enter course title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-foreground mb-2">Price *</label>
              <div className="flex gap-2"><Input type="number" placeholder="299" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} step="0.01" className="flex-1" />
                <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="px-3 rounded-md border border-input bg-background"><option value="EGP">EGP</option><option value="USD">USD</option></select></div></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-2">Description</label><Input placeholder="Enter course description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-2">Instructor Name</label><Input placeholder="Enter instructor name" value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-foreground mb-2">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-2">Instructor Bio</label><Input placeholder="Brief bio about the instructor" value={formData.instructorBio} onChange={(e) => setFormData({ ...formData, instructorBio: e.target.value })} /></div>
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full" onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : editingId ? "Update Course" : "Create Course"}</Button>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center"><p className="text-4xl mb-4">📚</p><p className="text-lg font-semibold text-foreground mb-2">No Courses Yet</p><p className="text-muted-foreground">Create your first course to get started.</p></div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-card border border-border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div><p className="text-xs text-muted-foreground mb-1">Course</p><p className="font-semibold text-foreground">{course.title}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Price</p><p className="font-semibold text-foreground">{course.currency} {course.price}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Levels</p><p className="font-semibold text-foreground">{course.levelCount || 0}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Students</p><p className="font-semibold text-foreground">{course.studentCount || 0}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Status</p><p className={`font-semibold ${course.status === "active" ? "text-accent" : "text-muted-foreground"}`}>{course.status?.charAt(0).toUpperCase() + course.status?.slice(1) || "Draft"}</p></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="text-sm rounded-full border-foreground bg-transparent" onClick={() => { setEditingId(course.id); setFormData({ title: course.title || "", description: course.description || "", price: course.price?.toString() || "", instructor: course.instructor || "", instructorBio: course.instructorBio || "", currency: course.currency || "EGP", status: course.status || "draft" }); setShowForm(true) }}>Edit</Button>
                <Button variant="outline" className="text-sm rounded-full border-foreground bg-transparent" onClick={() => onNavigate("levels")}>Manage Levels</Button>
                <Button variant="outline" className="text-sm rounded-full border-destructive text-destructive hover:bg-destructive/10 bg-transparent" onClick={() => handleDelete(course.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LevelManagement({ onNavigate }: { onNavigate: (tab: "payments" | "courses" | "levels" | "videos" | "quizzes" | "users") => void }) {
  const [levels, setLevels] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ title: "", courseId: "", description: "", orderNumber: "1" })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [levelsRes, coursesRes] = await Promise.all([fetch("/api/admin/levels"), fetch("/api/admin/courses")])
      const [levelsData, coursesData] = await Promise.all([levelsRes.json(), coursesRes.json()])
      if (levelsData.success) setLevels(levelsData.levels)
      if (coursesData.success) setCourses(coursesData.courses)
    } catch (error) { console.error("Error fetching data:", error) }
    finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.courseId) { alert("Please fill in all required fields"); return }
    setSaving(true)
    try {
      const url = "/api/admin/levels"
      const method = editingId ? "PUT" : "POST"
      const body = editingId ? { id: editingId, ...formData, orderNumber: parseInt(formData.orderNumber) } : { ...formData, orderNumber: parseInt(formData.orderNumber) }
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await response.json()
      if (data.success) { fetchData(); setShowForm(false); setEditingId(null); setFormData({ title: "", courseId: "", description: "", orderNumber: "1" }); alert(editingId ? "Level updated!" : "Level created!") }
      else alert("Error: " + data.error)
    } catch (error) { console.error("Error saving level:", error); alert("Failed to save level") }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this level and all its videos and quizzes?")) return
    try {
      const response = await fetch(`/api/admin/levels?id=${id}`, { method: "DELETE" })
      const data = await response.json()
      if (data.success) { fetchData(); alert("Level deleted!") } else alert("Error: " + data.error)
    } catch (error) { console.error("Error deleting level:", error); alert("Failed to delete level") }
  }

  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.title || "Unknown Course"

  if (loading) return <div className="space-y-6"><h2 className="font-serif text-3xl font-bold text-foreground">Manage Levels</h2><div className="bg-card border border-border rounded-lg p-12 text-center"><p className="text-muted-foreground">Loading levels...</p></div></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="font-serif text-3xl font-bold text-foreground">Manage Levels</h2><p className="text-sm text-muted-foreground mt-1">{levels.length} level{levels.length !== 1 ? "s" : ""}</p></div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ title: "", courseId: courses[0]?.id || "", description: "", orderNumber: "1" }) }}>
          {showForm ? "Cancel" : "Add Level"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-foreground">{editingId ? "Edit Level" : "Create New Level"}</h3>
          <div><label className="block text-sm font-medium text-foreground mb-2">Select Course *</label>
            <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background">
              <option value="">Select a course...</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-2">Level Title *</label><Input placeholder="Enter level title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-foreground mb-2">Order Number</label><Input type="number" placeholder="1" value={formData.orderNumber} onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })} min="1" /></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-2">Description</label><Input placeholder="Enter level description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full" onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : editingId ? "Update Level" : "Create Level"}</Button>
        </div>
      )}

      {levels.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center"><p className="text-4xl mb-4">📊</p><p className="text-lg font-semibold text-foreground mb-2">No Levels Yet</p><p className="text-muted-foreground">Create a course first, then add levels.</p></div>
      ) : (
        <div className="grid gap-4">
          {levels.map((level) => (
            <div key={level.id} className="bg-card border border-border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div><p className="text-xs text-muted-foreground mb-1">Level</p><p className="font-semibold text-foreground">{level.title}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Course</p><p className="font-semibold text-foreground truncate">{getCourseName(level.courseId)}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Order</p><p className="font-semibold text-foreground">#{level.orderNumber}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Videos</p><p className="font-semibold text-foreground">{level.videoCount || 0}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Has Quiz</p><p className="font-semibold text-foreground">{level.hasQuiz ? "Yes" : "No"}</p></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="text-sm rounded-full border-foreground bg-transparent" onClick={() => { setEditingId(level.id); setFormData({ title: level.title || "", courseId: level.courseId || "", description: level.description || "", orderNumber: level.orderNumber?.toString() || "1" }); setShowForm(true) }}>Edit</Button>
                <Button variant="outline" className="text-sm rounded-full border-foreground bg-transparent" onClick={() => onNavigate("videos")}>Manage Content</Button>
                <Button variant="outline" className="text-sm rounded-full border-destructive text-destructive hover:bg-destructive/10 bg-transparent" onClick={() => handleDelete(level.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function VideoManagement() {
  const [videos, setVideos] = useState<any[]>([])
  const [levels, setLevels] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ title: "", levelId: "", courseId: "", youtubeId: "", duration: "", orderNumber: "1" })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [videosRes, levelsRes, coursesRes] = await Promise.all([fetch("/api/admin/videos"), fetch("/api/admin/levels"), fetch("/api/admin/courses")])
      const [videosData, levelsData, coursesData] = await Promise.all([videosRes.json(), levelsRes.json(), coursesRes.json()])
      if (videosData.success) setVideos(videosData.videos)
      if (levelsData.success) setLevels(levelsData.levels)
      if (coursesData.success) setCourses(coursesData.courses)
    } catch (error) { console.error("Error fetching data:", error) }
    finally { setLoading(false) }
  }

  const extractYouTubeId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return match ? match[1] : url
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.levelId || !formData.youtubeId) { alert("Please fill in all required fields"); return }
    setSaving(true)
    try {
      const youtubeId = extractYouTubeId(formData.youtubeId)
      const url = "/api/admin/videos"
      const method = editingId ? "PUT" : "POST"
      const body = editingId ? { id: editingId, ...formData, youtubeId, orderNumber: parseInt(formData.orderNumber) } : { ...formData, youtubeId, orderNumber: parseInt(formData.orderNumber) }
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await response.json()
      if (data.success) { fetchData(); setShowForm(false); setEditingId(null); setFormData({ title: "", levelId: "", courseId: "", youtubeId: "", duration: "", orderNumber: "1" }); alert(editingId ? "Video updated!" : "Video created!") }
      else alert("Error: " + data.error)
    } catch (error) { console.error("Error saving video:", error); alert("Failed to save video") }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return
    try {
      const response = await fetch(`/api/admin/videos?id=${id}`, { method: "DELETE" })
      const data = await response.json()
      if (data.success) { fetchData(); alert("Video deleted!") } else alert("Error: " + data.error)
    } catch (error) { console.error("Error deleting video:", error); alert("Failed to delete video") }
  }

  const getLevelName = (levelId: string) => levels.find(l => l.id === levelId)?.title || "Unknown Level"
  const getFilteredLevels = () => formData.courseId ? levels.filter(l => l.courseId === formData.courseId) : levels

  if (loading) return <div className="space-y-6"><h2 className="font-serif text-3xl font-bold text-foreground">Manage Videos</h2><div className="bg-card border border-border rounded-lg p-12 text-center"><p className="text-muted-foreground">Loading videos...</p></div></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="font-serif text-3xl font-bold text-foreground">Manage Videos</h2><p className="text-sm text-muted-foreground mt-1">{videos.length} video{videos.length !== 1 ? "s" : ""}</p></div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ title: "", levelId: "", courseId: "", youtubeId: "", duration: "", orderNumber: "1" }) }}>
          {showForm ? "Cancel" : "Add Video"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-foreground">{editingId ? "Edit Video" : "Add New Video"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-2">Select Course</label>
              <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value, levelId: "" })} className="w-full px-3 py-2 rounded-md border border-input bg-background">
                <option value="">All courses...</option>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-foreground mb-2">Select Level *</label>
              <select value={formData.levelId} onChange={(e) => setFormData({ ...formData, levelId: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background">
                <option value="">Select a level...</option>
                {getFilteredLevels().map((level) => <option key={level.id} value={level.id}>{level.title}</option>)}
              </select></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-2">Video Title *</label><Input placeholder="Enter video title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><label className="block text-sm font-medium text-foreground mb-2">YouTube URL or Video ID *</label><Input placeholder="https://youtube.com/watch?v=... or dQw4w9WgXcQ" value={formData.youtubeId} onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-foreground mb-2">Duration</label><Input placeholder="12:34" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} /></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-2">Order Number</label><Input type="number" placeholder="1" value={formData.orderNumber} onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })} min="1" /></div>
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full" onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : editingId ? "Update Video" : "Add Video"}</Button>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center"><p className="text-4xl mb-4">🎬</p><p className="text-lg font-semibold text-foreground mb-2">No Videos Yet</p><p className="text-muted-foreground">Create levels first, then add videos.</p></div>
      ) : (
        <div className="grid gap-4">
          {videos.map((video) => (
            <div key={video.id} className="bg-card border border-border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div><p className="text-xs text-muted-foreground mb-1">Video Title</p><p className="font-semibold text-foreground truncate">{video.title}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Level</p><p className="font-semibold text-foreground truncate">{getLevelName(video.levelId)}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Duration</p><p className="font-semibold text-foreground">{video.duration || "N/A"}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Order</p><p className="font-semibold text-foreground">#{video.orderNumber}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">YouTube ID</p><p className="font-mono text-xs text-foreground truncate">{video.youtubeId}</p></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="text-sm rounded-full border-foreground bg-transparent" onClick={() => { setEditingId(video.id); setFormData({ title: video.title || "", levelId: video.levelId || "", courseId: video.courseId || "", youtubeId: video.youtubeId || "", duration: video.duration || "", orderNumber: video.orderNumber?.toString() || "1" }); setShowForm(true) }}>Edit</Button>
                <Button variant="outline" className="text-sm rounded-full border-foreground bg-transparent" onClick={() => window.open(`https://youtube.com/watch?v=${video.youtubeId}`, "_blank")}>Preview</Button>
                <Button variant="outline" className="text-sm rounded-full border-destructive text-destructive hover:bg-destructive/10 bg-transparent" onClick={() => handleDelete(video.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function QuizManagement() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [levels, setLevels] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showQuestions, setShowQuestions] = useState<string | null>(null)
  const [formData, setFormData] = useState({ title: "", levelId: "", courseId: "", passingScore: "51", questions: [] as any[] })
  const [questionForm, setQuestionForm] = useState({ question: "", options: ["", "", "", ""], correctAnswer: 0 })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [quizzesRes, levelsRes, coursesRes] = await Promise.all([fetch("/api/admin/quizzes"), fetch("/api/admin/levels"), fetch("/api/admin/courses")])
      const [quizzesData, levelsData, coursesData] = await Promise.all([quizzesRes.json(), levelsRes.json(), coursesRes.json()])
      if (quizzesData.success) setQuizzes(quizzesData.quizzes)
      if (levelsData.success) setLevels(levelsData.levels)
      if (coursesData.success) setCourses(coursesData.courses)
    } catch (error) { console.error("Error fetching data:", error) }
    finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.levelId) { alert("Please fill in all required fields"); return }
    setSaving(true)
    try {
      const url = "/api/admin/quizzes"
      const method = editingId ? "PUT" : "POST"
      const body = editingId ? { id: editingId, ...formData, passingScore: parseInt(formData.passingScore) } : { ...formData, passingScore: parseInt(formData.passingScore) }
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await response.json()
      if (data.success) { fetchData(); setShowForm(false); setEditingId(null); setFormData({ title: "", levelId: "", courseId: "", passingScore: "51", questions: [] }); alert(editingId ? "Quiz updated!" : "Quiz created!") }
      else alert("Error: " + data.error)
    } catch (error) { console.error("Error saving quiz:", error); alert("Failed to save quiz") }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return
    try {
      const response = await fetch(`/api/admin/quizzes?id=${id}`, { method: "DELETE" })
      const data = await response.json()
      if (data.success) { fetchData(); alert("Quiz deleted!") } else alert("Error: " + data.error)
    } catch (error) { console.error("Error deleting quiz:", error); alert("Failed to delete quiz") }
  }

  const addQuestion = () => {
    if (!questionForm.question || questionForm.options.some(o => !o)) { alert("Please fill in the question and all options"); return }
    setFormData({ ...formData, questions: [...formData.questions, { ...questionForm }] })
    setQuestionForm({ question: "", options: ["", "", "", ""], correctAnswer: 0 })
  }

  const removeQuestion = (index: number) => setFormData({ ...formData, questions: formData.questions.filter((_, i) => i !== index) })
  const getLevelName = (levelId: string) => levels.find(l => l.id === levelId)?.title || "Unknown Level"
  const getFilteredLevels = () => formData.courseId ? levels.filter(l => l.courseId === formData.courseId) : levels

  if (loading) return <div className="space-y-6"><h2 className="font-serif text-3xl font-bold text-foreground">Manage Quizzes</h2><div className="bg-card border border-border rounded-lg p-12 text-center"><p className="text-muted-foreground">Loading quizzes...</p></div></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="font-serif text-3xl font-bold text-foreground">Manage Quizzes</h2><p className="text-sm text-muted-foreground mt-1">{quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}</p></div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ title: "", levelId: "", courseId: "", passingScore: "51", questions: [] }) }}>
          {showForm ? "Cancel" : "Add Quiz"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-foreground">{editingId ? "Edit Quiz" : "Create New Quiz"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-2">Select Course</label>
              <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value, levelId: "" })} className="w-full px-3 py-2 rounded-md border border-input bg-background">
                <option value="">All courses...</option>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-foreground mb-2">Select Level *</label>
              <select value={formData.levelId} onChange={(e) => setFormData({ ...formData, levelId: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background">
                <option value="">Select a level...</option>
                {getFilteredLevels().map((level) => <option key={level.id} value={level.id}>{level.title}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-2">Quiz Title *</label><Input placeholder="Enter quiz title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-foreground mb-2">Passing Score (%)</label><Input type="number" placeholder="51" value={formData.passingScore} onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })} min="0" max="100" /></div>
          </div>
          <div className="border-t border-border pt-4 mt-4">
            <h4 className="font-semibold text-foreground mb-4">Questions ({formData.questions.length})</h4>
            {formData.questions.map((q, i) => (
              <div key={i} className="bg-muted p-3 rounded-lg mb-2 flex justify-between items-start">
                <div><p className="font-medium text-foreground text-sm">{i + 1}. {q.question}</p><p className="text-xs text-muted-foreground mt-1">Correct: {q.options[q.correctAnswer]}</p></div>
                <Button variant="ghost" size="sm" onClick={() => removeQuestion(i)} className="text-destructive">×</Button>
              </div>
            ))}
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <Input placeholder="Enter question" value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                {questionForm.options.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="radio" name="correctAnswer" checked={questionForm.correctAnswer === i} onChange={() => setQuestionForm({ ...questionForm, correctAnswer: i })} />
                    <Input placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => { const newOptions = [...questionForm.options]; newOptions[i] = e.target.value; setQuestionForm({ ...questionForm, options: newOptions }) }} />
                  </div>
                ))}
              </div>
              <Button variant="outline" onClick={addQuestion} className="w-full">Add Question</Button>
            </div>
          </div>
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full" onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : editingId ? "Update Quiz" : "Create Quiz"}</Button>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center"><p className="text-4xl mb-4">📝</p><p className="text-lg font-semibold text-foreground mb-2">No Quizzes Yet</p><p className="text-muted-foreground">Create levels first, then add quizzes.</p></div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-card border border-border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div><p className="text-xs text-muted-foreground mb-1">Quiz Title</p><p className="font-semibold text-foreground">{quiz.title}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Level</p><p className="font-semibold text-foreground truncate">{getLevelName(quiz.levelId)}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Questions</p><p className="font-semibold text-foreground">{quiz.questions?.length || 0}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Passing Score</p><p className="font-semibold text-accent">{quiz.passingScore}%</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Created</p><p className="font-semibold text-foreground text-sm">{quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : "N/A"}</p></div>
              </div>
              {showQuestions === quiz.id && (
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-foreground mb-3">Questions:</h4>
                  {quiz.questions?.length > 0 ? quiz.questions.map((q: any, i: number) => (
                    <div key={i} className="mb-3 pb-3 border-b border-border last:border-0">
                      <p className="font-medium text-foreground text-sm">{i + 1}. {q.question}</p>
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {q.options.map((opt: string, j: number) => (
                          <p key={j} className={`text-xs ${j === q.correctAnswer ? "text-accent font-semibold" : "text-muted-foreground"}`}>{j === q.correctAnswer ? "✓" : "○"} {opt}</p>
                        ))}
                      </div>
                    </div>
                  )) : <p className="text-muted-foreground text-sm">No questions added yet.</p>}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="text-sm rounded-full border-foreground bg-transparent" onClick={() => { setEditingId(quiz.id); setFormData({ title: quiz.title || "", levelId: quiz.levelId || "", courseId: quiz.courseId || "", passingScore: quiz.passingScore?.toString() || "51", questions: quiz.questions || [] }); setShowForm(true) }}>Edit</Button>
                <Button variant="outline" className="text-sm rounded-full border-foreground bg-transparent" onClick={() => setShowQuestions(showQuestions === quiz.id ? null : quiz.id)}>{showQuestions === quiz.id ? "Hide Questions" : "View Questions"}</Button>
                <Button variant="outline" className="text-sm rounded-full border-destructive text-destructive hover:bg-destructive/10 bg-transparent" onClick={() => handleDelete(quiz.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "student" })

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      if (data.success) setUsers(data.users)
    } catch (error) { console.error("Error fetching users:", error) }
    finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) { alert("Please fill in all required fields"); return }
    setSaving(true)
    try {
      const url = "/api/admin/users"
      const method = editingId ? "PUT" : "POST"
      const body = editingId ? { id: editingId, ...formData } : formData
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await response.json()
      if (data.success) { fetchUsers(); setShowForm(false); setEditingId(null); setFormData({ name: "", email: "", phone: "", role: "student" }); alert(editingId ? "User updated!" : "User created!") }
      else alert("Error: " + data.error)
    } catch (error) { console.error("Error saving user:", error); alert("Failed to save user") }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      const response = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" })
      const data = await response.json()
      if (data.success) { fetchUsers(); alert("User deleted!") } else alert("Error: " + data.error)
    } catch (error) { console.error("Error deleting user:", error); alert("Failed to delete user") }
  }

  if (loading) return <div className="space-y-6"><h2 className="font-serif text-3xl font-bold text-foreground">Manage Users</h2><div className="bg-card border border-border rounded-lg p-12 text-center"><p className="text-muted-foreground">Loading users...</p></div></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="font-serif text-3xl font-bold text-foreground">Manage Users</h2><p className="text-sm text-muted-foreground mt-1">{users.length} user{users.length !== 1 ? "s" : ""}</p></div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "", email: "", phone: "", role: "student" }) }}>
          {showForm ? "Cancel" : "Add User"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-foreground">{editingId ? "Edit User" : "Create New User"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-2">Name *</label><Input placeholder="Enter user name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-foreground mb-2">Email *</label><Input type="email" placeholder="Enter email address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-2">Phone</label><Input placeholder="Enter phone number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-foreground mb-2">Role</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background">
                <option value="student">Student</option><option value="instructor">Instructor</option><option value="admin">Admin</option>
              </select></div>
          </div>
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full" onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : editingId ? "Update User" : "Create User"}</Button>
        </div>
      )}

      {users.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center"><p className="text-4xl mb-4">👥</p><p className="text-lg font-semibold text-foreground mb-2">No Users Yet</p><p className="text-muted-foreground">Users will appear here when they sign up.</p></div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-6 gap-4 p-4 bg-muted font-semibold text-foreground border-b border-border text-sm">
              <div>Name</div><div>Email</div><div>Phone</div><div>Role</div><div>Courses</div><div>Actions</div>
            </div>
            {users.map((user) => (
              <div key={user.id} className="grid grid-cols-6 gap-4 p-4 border-b border-border text-sm hover:bg-muted/50 transition-colors">
                <div className="font-medium text-foreground">{user.name}</div>
                <div className="text-muted-foreground truncate">{user.email}</div>
                <div className="text-muted-foreground">{user.phone || "N/A"}</div>
                <div><span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-accent/20 text-accent" : user.role === "instructor" ? "bg-blue-100 text-blue-800" : "bg-muted text-foreground"}`}>{user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || "Student"}</span></div>
                <div className="text-foreground">{user.enrolledCourses?.length || 0}</div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-accent hover:bg-accent/10 text-xs" onClick={() => { setEditingId(user.id); setFormData({ name: user.name || "", email: user.email || "", phone: user.phone || "", role: user.role || "student" }); setShowForm(true) }}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 text-xs" onClick={() => handleDelete(user.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-accent/10 border border-accent rounded-lg p-4">
            <p className="text-sm text-foreground font-semibold mb-2">User Management</p>
            <p className="text-sm text-muted-foreground">Use the Edit button to modify user details or change their role. Admins have full access to the dashboard.</p>
          </div>
        </div>
      )}
    </div>
  )
}
