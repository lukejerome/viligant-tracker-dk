"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, LogOut, Calendar, Trophy, Activity } from "lucide-react"
import { useAuth } from "./auth-provider"
import { useUserStorage } from "../hooks/use-user-storage"

interface UserStats {
  totalWorkouts: number
  personalRecords: number
  joinDate: string
}

export default function UserProfile() {
  const { user, logout } = useAuth()
  const [workouts] = useUserStorage("workouts", [])
  const [personalRecords] = useUserStorage("personalRecords", [])

  if (!user) return null

  const userStats: UserStats = {
    totalWorkouts: workouts.length,
    personalRecords: personalRecords.length,
    joinDate: new Date(user.createdAt).toLocaleDateString(),
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
        <CardDescription>Your account information and stats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Joined {userStats.joinDate}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid - Removed Total Calories Burned */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-secondary/30 rounded-xl text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-500">{userStats.totalWorkouts}</div>
            <div className="text-sm text-muted-foreground">Total Workouts</div>
          </div>

          <div className="p-4 bg-secondary/30 rounded-xl text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-yellow-500">{userStats.personalRecords}</div>
            <div className="text-sm text-muted-foreground">Personal Records</div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-3">
          <Button
            onClick={logout}
            variant="outline"
            className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Account Badge */}
        <div className="text-center">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Free Account
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
