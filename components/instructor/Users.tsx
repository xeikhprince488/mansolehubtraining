"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
// import UserCard from "./UserCard";
import { Card } from "../ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button" // Import Button

interface SerializedUser {
  id: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  emailAddress: string | null
  role: string
  createdAt: number
}

interface UsersProps {
  initialUsers: SerializedUser[]
}

interface RoleStyle {
  bg: string
  text: string
}

const getRoleStyle = (role: string): RoleStyle => {
  switch (role.toLowerCase()) {
    case "instructor":
      return { bg: "bg-purple-100", text: "text-purple-800" }
    case "teacher":
      return { bg: "bg-blue-100", text: "text-blue-800" }
    case "student":
      return { bg: "bg-green-100", text: "text-green-800" }
    default:
      return { bg: "bg-gray-100", text: "text-gray-800" }
  }
}

export default function Users({ initialUsers }: UsersProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const router = useRouter()

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false

    if (filterRole === "all") return matchesSearch
    return matchesSearch && user.role.toLowerCase() === filterRole
  })

  const handleDownload = () => {
    if (filteredUsers.length === 0) {
      alert("No users to download.")
      return
    }

    // Define CSV headers
    const headers = ["ID", "First Name", "Last Name", "Email", "Role", "Joined Date"]

    // Map user data to CSV rows
    const rows = filteredUsers.map((user) => [
      user.id,
      user.firstName || "",
      user.lastName || "",
      user.emailAddress || "",
      user.role,
      new Date(user.createdAt).toLocaleDateString(),
    ])

    // Combine headers and rows, escaping commas and newlines in data
    const csvContent = [
      headers
        .map((header) => `"${header.replace(/"/g, '""')}"`)
        .join(","), // Quote headers
      ...rows.map(
        (row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","), // Quote and escape fields
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "users_data.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="teacher">Teachers</SelectItem>
              <SelectItem value="instructor">Instructors</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownload} className="w-full sm:w-auto">
            Download Users
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const roleStyle = getRoleStyle(user.role)
          return (
            <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16 border-2 border-blue-500">
                  <AvatarImage src={user.imageUrl || undefined} alt={user.firstName || "User"} />
                  <AvatarFallback>{user.firstName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.firstName || ""} {user.lastName || ""}
                  </h3>
                  <p className="text-sm text-gray-500">{user.emailAddress}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`px-2 py-1 ${roleStyle.bg} ${roleStyle.text} text-xs rounded-full`}>
                      {user.role}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No users found matching your search criteria.</p>
        </div>
      )}
    </div>
  )
}
