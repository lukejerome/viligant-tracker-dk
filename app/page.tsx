"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Target,
  Flame,
  TrendingUp,
  Crown,
  CheckCircle,
  Home,
  Dumbbell,
  Utensils,
  Scale,
  Menu,
  X,
  User,
} from "lucide-react"
import WorkoutTracker from "./components/workout-tracker"
import CalorieTracker from "./components/calorie-tracker"
import WeightGoals from "./components/weight-goals"
import MacroTracker from "./components/macro-tracker"
import PersonalTrainer from "./components/personal-trainer"
import UserProfile from "./components/user-profile"
import AuthModal from "./components/auth-modal"
import { AuthProvider, useAuth } from "./components/auth-provider"
import { useUserStorage } from "./hooks/use-user-storage"

interface DailyStats {
  caloriesConsumed: number
  caloriesBurned: number
  workoutsCompleted: number
  date: string
}

interface DailyMacros {
  protein: number
  carbs: number
  fat: number
  date: string
}

interface MacroGoals {
  protein: number
  carbs: number
  fat: number
}

interface WeightGoal {
  currentWeight: number
  targetWeight: number
  targetDate: string
  weeklyGoal: number
}

function FitnessAppContent() {
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [dailyStats, setDailyStats] = useUserStorage<DailyStats>("dailyStats", {
    caloriesConsumed: 0,
    caloriesBurned: 0,
    workoutsCompleted: 0,
    date: new Date().toDateString(),
  })
  const [dailyMacros, setDailyMacros] = useUserStorage<DailyMacros>("dailyMacros", {
    protein: 0,
    carbs: 0,
    fat: 0,
    date: new Date().toDateString(),
  })
  const [weightGoal, setWeightGoal] = useUserStorage<WeightGoal>("weightGoal", {
    currentWeight: 70,
    targetWeight: 65,
    targetDate: "",
    weeklyGoal: 0.5,
  })

  const [isSubscribed] = useUserStorage<boolean>("ptSubscription", false)

  // Reset daily stats if it's a new day
  useEffect(() => {
    const today = new Date().toDateString()
    if (dailyStats.date !== today) {
      setDailyStats({
        caloriesConsumed: 0,
        caloriesBurned: 0,
        workoutsCompleted: 0,
        date: today,
      })
    }
    if (dailyMacros.date !== today) {
      setDailyMacros({
        protein: 0,
        carbs: 0,
        fat: 0,
        date: today,
      })
    }
  }, [dailyStats.date, dailyMacros.date, setDailyStats, setDailyMacros])

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit animate-pulse">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Loading FitTracker...</h1>
        </div>
      </div>
    )
  }

  // Show auth modal if not logged in
  if (!user) {
    return <AuthModal />
  }

  const netCalories = dailyStats.caloriesConsumed - dailyStats.caloriesBurned

  const handleMacroGoalsUpdate = (goals: MacroGoals) => {
    // Goals are automatically saved in the MacroTracker component
    console.log("Macro goals updated:", goals)
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "workouts", label: "Workouts", icon: Dumbbell },
    { id: "calories", label: "Nutrition", icon: Utensils },
    {
      id: isSubscribed ? "goals" : "trainer",
      label: isSubscribed ? "Goals" : "Premium",
      icon: isSubscribed ? Scale : Crown,
    },
    { id: "profile", label: "Profile", icon: User },
  ]

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Message */}
      <Card className="card-hover bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Welcome back, {user.name}!</h2>
              <p className="text-muted-foreground">Ready to crush your fitness goals today?</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-500 mb-1">{dailyStats.caloriesConsumed}</div>
            <p className="text-sm text-muted-foreground">Calories Consumed</p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <Activity className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-red-500 mb-1">{dailyStats.caloriesBurned}</div>
            <p className="text-sm text-muted-foreground">Calories Burned</p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-500 mb-1">{netCalories}</div>
            <p className="text-sm text-muted-foreground">Net Calories</p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-500 mb-1">{dailyStats.workoutsCompleted}</div>
            <p className="text-sm text-muted-foreground">Workouts Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Macro Tracker */}
      <MacroTracker dailyMacros={dailyMacros} onMacroGoalsUpdate={handleMacroGoalsUpdate} />

      {/* Premium Upgrade Card */}
      {!isSubscribed && (
        <Card className="card-hover border-primary/20 bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              Unlock Premium Features
            </CardTitle>
            <CardDescription className="text-base">
              Get personalized plans and advanced tracking to reach your goals faster
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/30">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">Personalized calorie targets</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/30">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">Custom macro breakdowns</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/30">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">Advanced progress tracking</span>
              </div>
            </div>
            <Button onClick={() => setActiveTab("trainer")} className="w-full btn-primary" size="lg">
              <Crown className="h-5 w-5 mr-2" />
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weight Goal Progress */}
      {isSubscribed && (
        <Card className="card-hover bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              Weight Progress
            </CardTitle>
            <CardDescription className="text-base">
              {weightGoal.currentWeight}kg → {weightGoal.targetWeight}kg
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progress to Goal</span>
                <span className="font-medium">
                  {Math.abs(weightGoal.currentWeight - weightGoal.targetWeight).toFixed(1)}kg remaining
                </span>
              </div>
              <div className="progress-enhanced rounded-full overflow-hidden">
                <Progress
                  value={
                    Math.abs(
                      (weightGoal.currentWeight - weightGoal.targetWeight) /
                        (weightGoal.currentWeight - weightGoal.targetWeight),
                    ) * 100
                  }
                  className="h-3 progress-bar"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Enhanced Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                <Activity className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">FitTracker</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/98 backdrop-blur-xl animate-slide-in">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => {
                      setActiveTab(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full justify-start gap-3 h-12 nav-item ${isActive ? "active" : ""}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "workouts" && (
          <div className="animate-fade-in">
            <WorkoutTracker
              onWorkoutComplete={(caloriesBurned) => {
                setDailyStats((prev) => ({
                  ...prev,
                  caloriesBurned: prev.caloriesBurned + caloriesBurned,
                  workoutsCompleted: prev.workoutsCompleted + 1,
                }))
              }}
            />
          </div>
        )}
        {activeTab === "calories" && (
          <div className="animate-fade-in">
            <CalorieTracker
              dailyStats={dailyStats}
              onCaloriesUpdate={(consumed, burned) => {
                setDailyStats((prev) => ({
                  ...prev,
                  caloriesConsumed: consumed,
                  caloriesBurned: prev.caloriesBurned + burned,
                }))
              }}
              onMacrosUpdate={(protein, carbs, fat) => {
                setDailyMacros((prev) => ({
                  ...prev,
                  protein,
                  carbs,
                  fat,
                }))
              }}
            />
          </div>
        )}
        {activeTab === "goals" && isSubscribed && (
          <div className="animate-fade-in">
            <WeightGoals weightGoal={weightGoal} onWeightGoalUpdate={setWeightGoal} />
          </div>
        )}
        {activeTab === "trainer" && (
          <div className="animate-fade-in">
            <PersonalTrainer weightGoal={weightGoal} />
          </div>
        )}
        {activeTab === "profile" && (
          <div className="animate-fade-in">
            <UserProfile />
          </div>
        )}
      </div>

      {/* Enhanced Desktop Bottom Navigation */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-5 gap-1 p-3">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center gap-2 h-16 nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-bottom">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 h-16 nav-item ${isActive ? "active" : ""}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Bottom padding to prevent content from being hidden behind navigation */}
      <div className="h-20 md:h-24"></div>
    </div>
  )
}

export default function FitnessApp() {
  return (
    <AuthProvider>
      <FitnessAppContent />
    </AuthProvider>
  )
}
