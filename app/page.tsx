"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  Flame,
  TrendingUp,
  Crown,
  Home,
  Dumbbell,
  Utensils,
  Scale,
  Menu,
  X,
  User,
  Activity,
  ChevronRight,
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
import ViligantLogo from "./components/viligant-logo"

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
      <div className="min-h-screen flex items-center justify-center bg-[#222222]">
        <div className="text-center">
          <div className="flex justify-center mb-6 animate-pulse">
            <ViligantLogo size={120} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Loading Viligant Fitness Tracker...</h1>
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
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Today's Overview */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Today's Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/30 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-500">{dailyStats.caloriesConsumed}</div>
                  <p className="text-xs text-muted-foreground">Consumed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Activity className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{dailyStats.caloriesBurned}</div>
                  <p className="text-xs text-muted-foreground">Burned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">{netCalories}</div>
                  <p className="text-xs text-muted-foreground">Net</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{dailyStats.workoutsCompleted}</div>
                  <p className="text-xs text-muted-foreground">Workouts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="border-border/30 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors cursor-pointer group"
            onClick={() => setActiveTab("workouts")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Dumbbell className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Start Workout</h3>
                    <p className="text-sm text-muted-foreground">Track your exercises</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-border/30 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors cursor-pointer group"
            onClick={() => setActiveTab("calories")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Utensils className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Log Food</h3>
                    <p className="text-sm text-muted-foreground">Track your meals</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-border/30 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors cursor-pointer group"
            onClick={() => setActiveTab(isSubscribed ? "goals" : "trainer")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    {isSubscribed ? (
                      <Scale className="h-6 w-6 text-green-500" />
                    ) : (
                      <Crown className="h-6 w-6 text-green-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{isSubscribed ? "View Goals" : "Go Premium"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isSubscribed ? "Track your progress" : "Unlock all features"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Macro Progress */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Daily Macros</h2>
        <MacroTracker dailyMacros={dailyMacros} onMacroGoalsUpdate={handleMacroGoalsUpdate} />
      </div>

      {/* Premium Features */}
      {!isSubscribed && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Unlock More</h2>
          <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <Crown className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Premium Features</h3>
                    <p className="text-muted-foreground">Personalized plans and advanced tracking</p>
                  </div>
                </div>
                <Button onClick={() => setActiveTab("trainer")} className="bg-primary hover:bg-primary/90">
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weight Progress */}
      {isSubscribed && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Weight Progress</h2>
          <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">
                    {weightGoal.currentWeight}kg → {weightGoal.targetWeight}kg
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.abs(weightGoal.currentWeight - weightGoal.targetWeight).toFixed(1)}kg remaining
                  </span>
                </div>
                <Progress
                  value={
                    Math.abs(
                      (weightGoal.currentWeight - weightGoal.targetWeight) /
                        (weightGoal.currentWeight - weightGoal.targetWeight),
                    ) * 100
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#222222]">
      {/* Simplified Header */}
      <div className="sticky top-0 z-50 bg-[#222222]/95 backdrop-blur-xl border-b border-border/30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <ViligantLogo size={40} />
              <div>
                <h1 className="text-xl font-bold">Viligant</h1>
                <p className="text-xs text-muted-foreground">Hi, {user.name}</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/30 bg-[#222222]/98 backdrop-blur-xl">
            <div className="px-4 py-2 space-y-1 max-w-4xl mx-auto">
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
                    className={`w-full justify-start gap-3 h-12 ${
                      isActive ? "bg-primary/20 text-primary" : "hover:bg-card/50"
                    }`}
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
          <div className="animate-fade-in max-w-4xl mx-auto">
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
          <div className="animate-fade-in max-w-4xl mx-auto">
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
          <div className="animate-fade-in max-w-4xl mx-auto">
            <WeightGoals weightGoal={weightGoal} onWeightGoalUpdate={setWeightGoal} />
          </div>
        )}
        {activeTab === "trainer" && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <PersonalTrainer weightGoal={weightGoal} />
          </div>
        )}
        {activeTab === "profile" && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <UserProfile />
          </div>
        )}
      </div>

      {/* Simplified Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#222222]/95 backdrop-blur-xl border-t border-border/30">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-5 gap-1 p-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center gap-1 h-14 ${
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-20"></div>
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
