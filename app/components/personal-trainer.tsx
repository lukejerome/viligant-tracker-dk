"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Crown,
  Target,
  Calendar,
  Zap,
  CheckCircle,
  Star,
  Users,
  Dumbbell,
  Clock,
  TrendingUp,
  BarChart3,
  Play,
  Plus,
  X,
} from "lucide-react"
import { useLocalStorage } from "../hooks/use-local-storage"

interface UserProfile {
  height: number // cm
  currentWeight: number // kg
  goalWeight: number // kg
  age: number
  gender: "male" | "female"
  workoutDaysPerWeek: number
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"
  goal: "lose" | "maintain" | "gain"
  targetDate: string
}

interface WorkoutLog {
  id: string
  date: string
  dayOfWeek: string
  workoutType: "strength" | "cardio" | "rest"
  exercises: Array<{
    name: string
    sets?: number
    reps?: string
    duration?: number
    weight?: number
    completed: boolean
  }>
  totalDuration: number
  caloriesBurned: number
  completed: boolean
  notes?: string
}

interface DailyWorkoutPlan {
  day: string
  type: "strength" | "cardio" | "rest"
  exercises: Array<{
    name: string
    sets?: number
    reps?: string
    duration?: number
    rest?: string
    instructions: string
  }>
  totalDuration: number
  caloriesBurned: number
}

interface DailyNutritionPlan {
  totalCalories: number
  macros: {
    protein: number
    carbs: number
    fats: number
  }
  meals: Array<{
    name: string
    time: string
    calories: number
    foods: Array<{
      item: string
      amount: string
      calories: number
      protein: number
      carbs: number
      fat: number
    }>
  }>
  waterIntake: number // liters
}

interface PersonalPlan {
  dailyCalories: number
  dailyCaloriesToBurn: number
  weeklyWorkouts: number
  workoutPlan: DailyWorkoutPlan[]
  nutritionPlan: DailyNutritionPlan
  timeline: {
    weeksToGoal: number
    weeklyWeightChange: number
    estimatedCompletion: string
  }
  recommendations: string[]
}

interface PersonalTrainerProps {
  weightGoal: {
    currentWeight: number
    targetWeight: number
    targetDate: string
    weeklyGoal: number
  }
}

export default function PersonalTrainer({ weightGoal }: PersonalTrainerProps) {
  const [isSubscribed, setIsSubscribed] = useLocalStorage<boolean>("ptSubscription", false)
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>("userProfile", null)
  const [workoutLogs, setWorkoutLogs] = useLocalStorage<WorkoutLog[]>("workoutLogs", [])
  const [personalPlan, setPersonalPlan] = useState<PersonalPlan | null>(null)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [activeWorkout, setActiveWorkout] = useState<WorkoutLog | null>(null)

  const [profileForm, setProfileForm] = useState({
    height: "",
    currentWeight: "",
    goalWeight: "",
    age: "",
    gender: "",
    workoutDaysPerWeek: "",
    activityLevel: "",
    goal: "",
    targetDate: "",
  })

  // Add state for managing custom exercises in the active workout:
  const [customExerciseSearch, setCustomExerciseSearch] = useState("")
  const [recentExercises, setRecentExercises] = useLocalStorage<string[]>("recentExercises", [])

  // Calculate weekly and monthly progression data
  const progressionData = useMemo(() => {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Weekly data
    const weeklyWorkouts = workoutLogs.filter((log) => {
      const logDate = new Date(log.date)
      return logDate >= weekAgo && logDate <= today && log.completed
    })

    // Monthly data
    const monthlyWorkouts = workoutLogs.filter((log) => {
      const logDate = new Date(log.date)
      return logDate >= monthAgo && logDate <= today && log.completed
    })

    // Calculate weekly stats
    const weeklyStats = {
      totalWorkouts: weeklyWorkouts.length,
      totalDuration: weeklyWorkouts.reduce((sum, log) => sum + log.totalDuration, 0),
      totalCaloriesBurned: weeklyWorkouts.reduce((sum, log) => sum + log.caloriesBurned, 0),
      averageDuration:
        weeklyWorkouts.length > 0
          ? Math.round(weeklyWorkouts.reduce((sum, log) => sum + log.totalDuration, 0) / weeklyWorkouts.length)
          : 0,
      strengthWorkouts: weeklyWorkouts.filter((log) => log.workoutType === "strength").length,
      cardioWorkouts: weeklyWorkouts.filter((log) => log.workoutType === "cardio").length,
    }

    // Calculate monthly stats
    const monthlyStats = {
      totalWorkouts: monthlyWorkouts.length,
      totalDuration: monthlyWorkouts.reduce((sum, log) => sum + log.totalDuration, 0),
      totalCaloriesBurned: monthlyWorkouts.reduce((sum, log) => sum + log.caloriesBurned, 0),
      averageDuration:
        monthlyWorkouts.length > 0
          ? Math.round(monthlyWorkouts.reduce((sum, log) => sum + log.totalDuration, 0) / monthlyWorkouts.length)
          : 0,
      strengthWorkouts: monthlyWorkouts.filter((log) => log.workoutType === "strength").length,
      cardioWorkouts: monthlyWorkouts.filter((log) => log.workoutType === "cardio").length,
    }

    // Group workouts by week for weekly progression
    const weeklyProgression = []
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(today.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000)

      const weekWorkouts = workoutLogs.filter((log) => {
        const logDate = new Date(log.date)
        return logDate >= weekStart && logDate < weekEnd && log.completed
      })

      weeklyProgression.push({
        week: `Week ${4 - i}`,
        workouts: weekWorkouts.length,
        duration: weekWorkouts.reduce((sum, log) => sum + log.totalDuration, 0),
        calories: weekWorkouts.reduce((sum, log) => sum + log.caloriesBurned, 0),
        strength: weekWorkouts.filter((log) => log.workoutType === "strength").length,
        cardio: weekWorkouts.filter((log) => log.workoutType === "cardio").length,
      })
    }

    return {
      weekly: weeklyStats,
      monthly: monthlyStats,
      weeklyProgression: weeklyProgression.reverse(),
      recentWorkouts: workoutLogs
        .filter((log) => log.completed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10),
    }
  }, [workoutLogs])

  useEffect(() => {
    if (userProfile && isSubscribed) {
      generatePersonalPlan()
    }
  }, [userProfile, isSubscribed])

  const calculateBMR = (profile: UserProfile) => {
    // Mifflin-St Jeor Equation
    let bmr: number
    if (profile.gender === "male") {
      bmr = 88.362 + 13.397 * profile.currentWeight + 4.799 * profile.height - 5.677 * profile.age
    } else {
      bmr = 447.593 + 9.247 * profile.currentWeight + 3.098 * profile.height - 4.33 * profile.age
    }
    return bmr
  }

  const getActivityMultiplier = (level: string) => {
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    }
    return multipliers[level as keyof typeof multipliers] || 1.2
  }

  const generateWorkoutPlan = (profile: UserProfile, dailyCaloriesToBurn: number): DailyWorkoutPlan[] => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const workoutPlan: DailyWorkoutPlan[] = []

    const caloriesPerWorkout = (dailyCaloriesToBurn * 7) / profile.workoutDaysPerWeek

    // Determine workout distribution
    let workoutDays: number[] = []
    if (profile.workoutDaysPerWeek === 3) {
      workoutDays = [0, 2, 4] // Mon, Wed, Fri
    } else if (profile.workoutDaysPerWeek === 4) {
      workoutDays = [0, 1, 3, 5] // Mon, Tue, Thu, Sat
    } else if (profile.workoutDaysPerWeek === 5) {
      workoutDays = [0, 1, 2, 4, 5] // Mon-Wed, Fri-Sat
    } else if (profile.workoutDaysPerWeek === 6) {
      workoutDays = [0, 1, 2, 3, 4, 5] // Mon-Sat
    } else if (profile.workoutDaysPerWeek === 7) {
      workoutDays = [0, 1, 2, 3, 4, 5, 6] // Every day
    }

    days.forEach((day, index) => {
      if (workoutDays.includes(index)) {
        const isStrengthDay = index % 2 === 0 || profile.goal === "gain"

        if (isStrengthDay && profile.goal !== "lose") {
          // Strength Training Day
          workoutPlan.push({
            day,
            type: "strength",
            exercises: [
              {
                name: "Warm-up",
                duration: 10,
                instructions: "5 minutes light cardio + 5 minutes dynamic stretching",
              },
              {
                name: "Squats",
                sets: 3,
                reps: "8-12",
                rest: "60-90 seconds",
                instructions: "Keep chest up, knees behind toes, full range of motion",
              },
              {
                name: "Push-ups",
                sets: 3,
                reps: "8-15",
                rest: "60 seconds",
                instructions: "Maintain straight line from head to heels",
              },
              {
                name: "Deadlifts",
                sets: 3,
                reps: "6-10",
                rest: "90 seconds",
                instructions: "Keep back straight, drive through heels",
              },
              {
                name: "Plank",
                sets: 3,
                duration: 30,
                rest: "30 seconds",
                instructions: "Hold strong core position, breathe normally",
              },
              {
                name: "Cool-down",
                duration: 10,
                instructions: "Static stretching focusing on worked muscles",
              },
            ],
            totalDuration: 45,
            caloriesBurned: Math.round(caloriesPerWorkout),
          })
        } else {
          // Cardio Day
          workoutPlan.push({
            day,
            type: "cardio",
            exercises: [
              {
                name: "Warm-up",
                duration: 5,
                instructions: "Light walking or marching in place",
              },
              {
                name: "High-Intensity Intervals",
                duration: 20,
                instructions: "30 seconds high intensity, 30 seconds rest. Repeat 20 times.",
              },
              {
                name: "Steady-State Cardio",
                duration: 15,
                instructions: "Moderate pace running, cycling, or brisk walking",
              },
              {
                name: "Cool-down",
                duration: 5,
                instructions: "Slow walking and light stretching",
              },
            ],
            totalDuration: 45,
            caloriesBurned: Math.round(caloriesPerWorkout),
          })
        }
      } else {
        // Rest Day
        workoutPlan.push({
          day,
          type: "rest",
          exercises: [
            {
              name: "Active Recovery",
              duration: 20,
              instructions: "Light walking, yoga, or gentle stretching",
            },
          ],
          totalDuration: 20,
          caloriesBurned: 50,
        })
      }
    })

    return workoutPlan
  }

  const generateNutritionPlan = (profile: UserProfile, dailyCalories: number): DailyNutritionPlan => {
    // Calculate macros
    const protein = Math.round((dailyCalories * 0.3) / 4) // 30% protein
    const carbs = Math.round((dailyCalories * 0.4) / 4) // 40% carbs
    const fats = Math.round((dailyCalories * 0.3) / 9) // 30% fats

    const meals = [
      {
        name: "Breakfast",
        time: "7:00 AM",
        calories: Math.round(dailyCalories * 0.25),
        foods: [
          {
            item: "Oatmeal with berries",
            amount: "1 cup",
            calories: 150,
            protein: 5,
            carbs: 30,
            fat: 3,
          },
          {
            item: "Greek yogurt",
            amount: "150g",
            calories: 100,
            protein: 15,
            carbs: 6,
            fat: 0,
          },
          {
            item: "Almonds",
            amount: "15g",
            calories: 87,
            protein: 3,
            carbs: 3,
            fat: 7,
          },
        ],
      },
      {
        name: "Mid-Morning Snack",
        time: "10:00 AM",
        calories: Math.round(dailyCalories * 0.1),
        foods: [
          {
            item: "Apple",
            amount: "1 medium",
            calories: 80,
            protein: 0,
            carbs: 21,
            fat: 0,
          },
          {
            item: "Peanut butter",
            amount: "1 tbsp",
            calories: 95,
            protein: 4,
            carbs: 3,
            fat: 8,
          },
        ],
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        calories: Math.round(dailyCalories * 0.3),
        foods: [
          {
            item: "Grilled chicken breast",
            amount: "150g",
            calories: 248,
            protein: 46,
            carbs: 0,
            fat: 5,
          },
          {
            item: "Brown rice",
            amount: "100g cooked",
            calories: 111,
            protein: 3,
            carbs: 23,
            fat: 1,
          },
          {
            item: "Mixed vegetables",
            amount: "200g",
            calories: 50,
            protein: 3,
            carbs: 10,
            fat: 0,
          },
        ],
      },
      {
        name: "Afternoon Snack",
        time: "4:00 PM",
        calories: Math.round(dailyCalories * 0.1),
        foods: [
          {
            item: "Protein shake",
            amount: "1 scoop + 250ml milk",
            calories: 150,
            protein: 25,
            carbs: 5,
            fat: 3,
          },
        ],
      },
      {
        name: "Dinner",
        time: "7:00 PM",
        calories: Math.round(dailyCalories * 0.25),
        foods: [
          {
            item: "Salmon fillet",
            amount: "120g",
            calories: 250,
            protein: 30,
            carbs: 0,
            fat: 14,
          },
          {
            item: "Sweet potato",
            amount: "150g",
            calories: 129,
            protein: 2,
            carbs: 30,
            fat: 0,
          },
          {
            item: "Green salad",
            amount: "100g",
            calories: 20,
            protein: 2,
            carbs: 4,
            fat: 0,
          },
        ],
      },
    ]

    return {
      totalCalories: dailyCalories,
      macros: { protein, carbs, fats },
      meals,
      waterIntake: 2.5 + profile.workoutDaysPerWeek * 0.5, // Base 2.5L + extra for workouts
    }
  }

  const generatePersonalPlan = () => {
    if (!userProfile) return

    const bmr = calculateBMR(userProfile)
    const tdee = bmr * getActivityMultiplier(userProfile.activityLevel)

    // Calculate timeline
    const targetDate = new Date(userProfile.targetDate)
    const today = new Date()
    const timeLeft = targetDate.getTime() - today.getTime()
    const weeksLeft = Math.max(1, timeLeft / (1000 * 3600 * 24 * 7))

    const weightDifference = userProfile.goalWeight - userProfile.currentWeight
    const weeklyWeightChange = weightDifference / weeksLeft

    // Calculate calorie needs
    let dailyCalories = tdee
    let dailyCaloriesToBurn = 0

    if (userProfile.goal === "lose") {
      const weeklyDeficit = Math.abs(weeklyWeightChange) * 7700 // 7700 kcal per kg
      const dailyDeficit = weeklyDeficit / 7

      // Split 70% diet, 30% exercise for sustainable weight loss
      const dietDeficit = dailyDeficit * 0.7
      const exerciseDeficit = dailyDeficit * 0.3

      dailyCalories = Math.max(1200, tdee - dietDeficit) // Minimum 1200 calories
      dailyCaloriesToBurn = exerciseDeficit
    } else if (userProfile.goal === "gain") {
      const weeklySurplus = weeklyWeightChange * 7700
      const dailySurplus = weeklySurplus / 7

      dailyCalories = tdee + dailySurplus
      dailyCaloriesToBurn = 200 // Light exercise for muscle building
    } else {
      dailyCaloriesToBurn = 250 // Maintenance with exercise
    }

    const workoutPlan = generateWorkoutPlan(userProfile, dailyCaloriesToBurn)
    const nutritionPlan = generateNutritionPlan(userProfile, Math.round(dailyCalories))

    const recommendations = [
      `Aim for ${Math.abs(weeklyWeightChange).toFixed(1)}kg per week to reach your goal`,
      `Drink ${nutritionPlan.waterIntake}L of water daily`,
      `Get 7-9 hours of sleep each night for optimal recovery`,
      `Track your progress weekly and adjust portions as needed`,
      `Take progress photos and measurements monthly`,
      userProfile.goal === "lose" ? "Focus on protein to maintain muscle mass" : "Eat within 30 minutes post-workout",
    ]

    setPersonalPlan({
      dailyCalories: Math.round(dailyCalories),
      dailyCaloriesToBurn: Math.round(dailyCaloriesToBurn),
      weeklyWorkouts: userProfile.workoutDaysPerWeek,
      workoutPlan,
      nutritionPlan,
      timeline: {
        weeksToGoal: Math.round(weeksLeft),
        weeklyWeightChange,
        estimatedCompletion: targetDate.toLocaleDateString(),
      },
      recommendations,
    })
  }

  const startWorkout = (dayPlan: DailyWorkoutPlan) => {
    const workout: WorkoutLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      dayOfWeek: dayPlan.day,
      workoutType: dayPlan.type,
      exercises: dayPlan.exercises.map((exercise) => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        duration: exercise.duration,
        weight: 0,
        completed: false,
      })),
      totalDuration: dayPlan.totalDuration,
      caloriesBurned: dayPlan.caloriesBurned,
      completed: false,
    }
    setActiveWorkout(workout)
  }

  const completeWorkout = (notes?: string) => {
    if (!activeWorkout) return

    const completedWorkout = {
      ...activeWorkout,
      completed: true,
      notes,
    }

    setWorkoutLogs((prev) => [completedWorkout, ...prev])
    setActiveWorkout(null)
  }

  const saveProfile = () => {
    const profile: UserProfile = {
      height: Number.parseInt(profileForm.height),
      currentWeight: Number.parseFloat(profileForm.currentWeight),
      goalWeight: Number.parseFloat(profileForm.goalWeight),
      age: Number.parseInt(profileForm.age),
      gender: profileForm.gender as "male" | "female",
      workoutDaysPerWeek: Number.parseInt(profileForm.workoutDaysPerWeek),
      activityLevel: profileForm.activityLevel as UserProfile["activityLevel"],
      goal: profileForm.goal as "lose" | "maintain" | "gain",
      targetDate: profileForm.targetDate,
    }

    setUserProfile(profile)
    setShowProfileForm(false)
  }

  const handleSubscribe = () => {
    setIsSubscribed(true)
    if (!userProfile) {
      setShowProfileForm(true)
    }
  }

  // Add this helper function before the return statement
  const getLastWorkoutDate = (dayName: string, workoutType: string) => {
    const lastWorkout = workoutLogs
      .filter((log) => log.dayOfWeek === dayName && log.workoutType === workoutType && log.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    if (!lastWorkout) return null

    const date = new Date(lastWorkout.date)
    const today = new Date()
    const diffTime = today.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const addCustomExercise = (exerciseName: string) => {
    if (!activeWorkout || !exerciseName.trim()) return

    const newExercise = {
      name: exerciseName.trim(),
      sets: 3,
      reps: "8-12",
      weight: 0,
      completed: false,
    }

    setActiveWorkout((prev) => ({
      ...prev!,
      exercises: [...prev!.exercises, newExercise],
    }))

    // Add to recent exercises
    setRecentExercises((prev) => {
      const updated = [exerciseName.trim(), ...prev.filter((ex) => ex !== exerciseName.trim())].slice(0, 10)
      return updated
    })

    setCustomExerciseSearch("")
  }

  if (!isSubscribed) {
    return (
      <div className="space-y-6">
        <Card className="card-hover border-border/50 bg-gradient-to-br from-card/50 to-primary/5 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Crown className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              Personal Trainer
              <Badge className="bg-primary/10 text-primary border-primary/20">Premium</Badge>
            </CardTitle>
            <CardDescription className="text-lg">
              Get personalized daily workout and nutrition plans with comprehensive progress tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-secondary/30 rounded-xl">
                <Dumbbell className="h-6 w-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Daily Workouts</h3>
                <p className="text-sm text-muted-foreground">Specific exercises with progress tracking</p>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-xl">
                <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Progress Analytics</h3>
                <p className="text-sm text-muted-foreground">Weekly & monthly workout logs</p>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-xl">
                <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Goal Tracking</h3>
                <p className="text-sm text-muted-foreground">Precise timeline to reach your goal</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What you'll get:</h3>
              <div className="space-y-2">
                {[
                  "Complete daily workout plans with specific exercises",
                  "Workout progression tracking with weekly/monthly analytics",
                  "Detailed meal plans with exact portions and calories",
                  "Personalized macro breakdown for your goals",
                  "Weekly workout schedule based on your availability",
                  "Timeline tracking to reach your target weight",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-xl">
                <div className="text-3xl font-bold text-primary">$4.99</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
              <Button onClick={handleSubscribe} size="lg" className="w-full">
                <Crown className="h-4 w-4 mr-2" />
                Start Your Personal Training Journey
              </Button>
              <p className="text-xs text-muted-foreground">Cancel anytime • 7-day free trial • Money-back guarantee</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Success Stories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Sarah M.", result: "Lost 15kg in 4 months", rating: 5 },
              { name: "Mike R.", result: "Gained 8kg muscle mass", rating: 5 },
              { name: "Emma L.", result: "Reached goal weight in 3 months", rating: 5 },
            ].map((story, index) => (
              <div key={index} className="p-3 bg-secondary/30 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{story.name}</span>
                  <div className="flex">
                    {Array.from({ length: story.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{story.result}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showProfileForm || !userProfile) {
    return (
      <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Create Your Personal Plan
          </CardTitle>
          <CardDescription>Tell us about yourself to generate your custom workout and nutrition plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                value={profileForm.height}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, height: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="current-weight">Current Weight (kg)</Label>
              <Input
                id="current-weight"
                type="number"
                step="0.1"
                placeholder="70.0"
                value={profileForm.currentWeight}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, currentWeight: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="goal-weight">Goal Weight (kg)</Label>
              <Input
                id="goal-weight"
                type="number"
                step="0.1"
                placeholder="65.0"
                value={profileForm.goalWeight}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, goalWeight: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={profileForm.age}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, age: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={profileForm.gender}
                onValueChange={(value) => setProfileForm((prev) => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="workout-days">Workout Days Per Week</Label>
              <Select
                value={profileForm.workoutDaysPerWeek}
                onValueChange={(value) => setProfileForm((prev) => ({ ...prev, workoutDaysPerWeek: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="4">4 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="6">6 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="activity">Current Activity Level</Label>
              <Select
                value={profileForm.activityLevel}
                onValueChange={(value) => setProfileForm((prev) => ({ ...prev, activityLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (desk job)</SelectItem>
                  <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (2x/day)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="goal">Primary Goal</Label>
              <Select
                value={profileForm.goal}
                onValueChange={(value) => setProfileForm((prev) => ({ ...prev, goal: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">Lose Weight</SelectItem>
                  <SelectItem value="maintain">Maintain Weight</SelectItem>
                  <SelectItem value="gain">Gain Weight</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="target-date">Target Date</Label>
              <Input
                id="target-date"
                type="date"
                value={profileForm.targetDate}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, targetDate: e.target.value }))}
              />
            </div>
          </div>

          <Button
            onClick={saveProfile}
            className="w-full"
            disabled={
              !profileForm.height ||
              !profileForm.currentWeight ||
              !profileForm.goalWeight ||
              !profileForm.age ||
              !profileForm.gender ||
              !profileForm.workoutDaysPerWeek ||
              !profileForm.activityLevel ||
              !profileForm.goal ||
              !profileForm.targetDate
            }
          >
            Generate My Personal Plan
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="card-hover border-border/50 bg-gradient-to-br from-card/50 to-primary/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Your Personal Plan
            <Badge className="bg-primary/10 text-primary border-primary/20">Active</Badge>
          </CardTitle>
          <CardDescription>
            {userProfile?.currentWeight}kg → {userProfile?.goalWeight}kg by {personalPlan?.timeline.estimatedCompletion}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {personalPlan && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4 h-auto p-1">
                <TabsTrigger value="overview" className="text-xs py-2">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="workouts" className="text-xs py-2">
                  Workouts
                </TabsTrigger>
                <TabsTrigger value="progress" className="text-xs py-2">
                  Progress
                </TabsTrigger>
              </TabsList>

              {/* Secondary tabs for nutrition and timeline */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.querySelector('[value="nutrition"]')?.click()}
                  className="flex-1 text-xs"
                >
                  Nutrition
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.querySelector('[value="timeline"]')?.click()}
                  className="flex-1 text-xs"
                >
                  Timeline
                </Button>
              </div>

              <TabsContent value="overview" className="space-y-4 mt-0">
                {/* Compact stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <Target className="h-5 w-5 text-primary mx-auto mb-1" />
                    <div className="text-lg font-bold text-primary">{personalPlan.dailyCalories}</div>
                    <div className="text-xs text-muted-foreground">Daily Calories</div>
                  </div>

                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <Zap className="h-5 w-5 text-red-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-red-500">{personalPlan.dailyCaloriesToBurn}</div>
                    <div className="text-xs text-muted-foreground">To Burn</div>
                  </div>

                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <Dumbbell className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-blue-500">{personalPlan.weeklyWorkouts}</div>
                    <div className="text-xs text-muted-foreground">Workouts/Week</div>
                  </div>

                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <Calendar className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-green-500">{personalPlan.timeline.weeksToGoal}</div>
                    <div className="text-xs text-muted-foreground">Weeks Left</div>
                  </div>
                </div>

                {/* Compact recommendations */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Key Recommendations:</h3>
                  <div className="space-y-2">
                    {personalPlan.recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-secondary/20 rounded-lg">
                        <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="workouts" className="space-y-3 mt-0">
                <ScrollArea className="h-[500px] pr-2">
                  <div className="space-y-3">
                    {personalPlan.workoutPlan.map((day, index) => (
                      <Card key={index} className="bg-secondary/20">
                        <CardHeader className="pb-2 pt-3 px-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{day.day}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={day.type === "rest" ? "outline" : "default"} className="text-xs">
                                  {day.type === "strength" ? "Strength" : day.type === "cardio" ? "Cardio" : "Rest"}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="bg-red-500/10 text-red-500 border-red-500/20 text-xs"
                                >
                                  {day.caloriesBurned} kcal
                                </Badge>
                              </div>
                            </div>
                            {day.type !== "rest" && (
                              <Button size="sm" onClick={() => startWorkout(day)} className="ml-2">
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {day.totalDuration} min
                          </div>
                        </CardHeader>
                        <CardContent className="px-3 pb-3 space-y-2">
                          {day.exercises.slice(0, 3).map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex} className="p-2 bg-secondary/30 rounded text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{exercise.name}</span>
                                {exercise.sets && (
                                  <Badge variant="outline" className="text-xs h-5">
                                    {exercise.sets}×{exercise.reps}
                                  </Badge>
                                )}
                                {exercise.duration && (
                                  <Badge variant="outline" className="text-xs h-5">
                                    {exercise.duration}min
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                          {day.exercises.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{day.exercises.length - 3} more exercises
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4 mt-0">
                {/* Compact weekly/monthly toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <Card className="bg-secondary/20">
                    <CardContent className="p-3">
                      <div className="text-center">
                        <BarChart3 className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                        <div className="text-sm font-semibold">This Week</div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div>
                            <div className="font-bold text-blue-500">{progressionData.weekly.totalWorkouts}</div>
                            <div className="text-muted-foreground">Workouts</div>
                          </div>
                          <div>
                            <div className="font-bold text-red-500">{progressionData.weekly.totalCaloriesBurned}</div>
                            <div className="text-muted-foreground">Calories</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary/20">
                    <CardContent className="p-3">
                      <div className="text-center">
                        <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-500" />
                        <div className="text-sm font-semibold">This Month</div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div>
                            <div className="font-bold text-blue-500">{progressionData.monthly.totalWorkouts}</div>
                            <div className="text-muted-foreground">Workouts</div>
                          </div>
                          <div>
                            <div className="font-bold text-red-500">{progressionData.monthly.totalCaloriesBurned}</div>
                            <div className="text-muted-foreground">Calories</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent workouts - mobile optimized */}
                <Card className="bg-secondary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recent Workouts</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <ScrollArea className="h-[200px]">
                      {progressionData.recentWorkouts.length > 0 ? (
                        <div className="space-y-2">
                          {progressionData.recentWorkouts.slice(0, 5).map((workout, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-secondary/30 rounded text-xs"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{workout.dayOfWeek}</span>
                                  <Badge
                                    variant={workout.workoutType === "strength" ? "default" : "outline"}
                                    className="text-xs h-4"
                                  >
                                    {workout.workoutType}
                                  </Badge>
                                </div>
                                <div className="text-muted-foreground">
                                  {new Date(workout.date).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-red-500">{workout.caloriesBurned}</div>
                                <div className="text-muted-foreground">kcal</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">No workouts yet</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nutrition" className="space-y-4 mt-0">
                {/* Compact macro display */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-secondary/30 rounded text-center">
                    <div className="text-lg font-bold text-blue-500">{personalPlan.nutritionPlan.macros.protein}g</div>
                    <div className="text-xs text-muted-foreground">Protein</div>
                  </div>
                  <div className="p-2 bg-secondary/30 rounded text-center">
                    <div className="text-lg font-bold text-green-500">{personalPlan.nutritionPlan.macros.carbs}g</div>
                    <div className="text-xs text-muted-foreground">Carbs</div>
                  </div>
                  <div className="p-2 bg-secondary/30 rounded text-center">
                    <div className="text-lg font-bold text-orange-500">{personalPlan.nutritionPlan.macros.fats}g</div>
                    <div className="text-xs text-muted-foreground">Fats</div>
                  </div>
                </div>

                {/* Simplified meal plan */}
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {personalPlan.nutritionPlan.meals.map((meal, index) => (
                      <Card key={index} className="bg-secondary/20">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{meal.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs"
                              >
                                {meal.calories} kcal
                              </Badge>
                              <span className="text-xs text-muted-foreground">{meal.time}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {meal.foods.slice(0, 2).map((food, foodIndex) => (
                              <div key={foodIndex} className="flex justify-between text-xs">
                                <span>{food.item}</span>
                                <span className="text-muted-foreground">{food.calories} kcal</span>
                              </div>
                            ))}
                            {meal.foods.length > 2 && (
                              <div className="text-xs text-muted-foreground">+{meal.foods.length - 2} more items</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                {/* Water intake */}
                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="text-lg">💧</div>
                      <div>
                        <div className="font-medium text-sm">Daily Water</div>
                        <div className="text-xs text-muted-foreground">
                          {personalPlan.nutritionPlan.waterIntake}L per day
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4 mt-0">
                {/* Compact timeline stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary/30 rounded text-center">
                    <div className="text-lg font-bold text-primary">{userProfile?.currentWeight}kg</div>
                    <div className="text-xs text-muted-foreground">Current</div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded text-center">
                    <div className="text-lg font-bold text-green-500">{userProfile?.goalWeight}kg</div>
                    <div className="text-xs text-muted-foreground">Goal</div>
                  </div>
                </div>

                {/* Progress info */}
                <Card className="bg-secondary/20">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span>Target Date:</span>
                      <Badge variant="outline" className="text-xs">
                        {personalPlan.timeline.estimatedCompletion}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Weeks Left:</span>
                      <Badge variant="outline" className="text-xs">
                        {personalPlan.timeline.weeksToGoal} weeks
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Weekly Target:</span>
                      <Badge variant="outline" className="text-xs">
                        {personalPlan.timeline.weeklyWeightChange > 0 ? "+" : ""}
                        {personalPlan.timeline.weeklyWeightChange.toFixed(1)}kg/week
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Total Change:</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.abs((userProfile?.goalWeight || 0) - (userProfile?.currentWeight || 0)).toFixed(1)}kg
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Active Workout Modal */}
      {activeWorkout && (
        <Card className="fixed inset-4 z-50 bg-background border-2 border-primary/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Active Workout: {activeWorkout.dayOfWeek}
            </CardTitle>
            <CardDescription>
              {activeWorkout.workoutType} • {activeWorkout.totalDuration} min • {activeWorkout.caloriesBurned} kcal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Custom Exercise Section */}
            <div className="space-y-3 p-3 bg-secondary/20 rounded-lg border border-border/30">
              <Label className="text-sm font-medium">Add Exercise</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type exercise name (e.g., Bicep Curls, Lunges)..."
                  value={customExerciseSearch}
                  onChange={(e) => setCustomExerciseSearch(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && customExerciseSearch.trim()) {
                      addCustomExercise(customExerciseSearch)
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={() => addCustomExercise(customExerciseSearch)}
                  disabled={!customExerciseSearch.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Recent Exercises */}
              {recentExercises.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Recent Exercises:</Label>
                  <div className="flex flex-wrap gap-1">
                    {recentExercises.slice(0, 8).map((exercise, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => addCustomExercise(exercise)}
                        className="text-xs h-7 px-2 hover:bg-primary/10"
                      >
                        {exercise}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Exercise List */}
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {activeWorkout.exercises.map((exercise, index) => (
                  <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{exercise.name}</h4>
                      <div className="flex items-center gap-2">
                        {exercise.sets && (
                          <Badge variant="outline" className="text-xs">
                            {exercise.sets} sets × {exercise.reps}
                          </Badge>
                        )}
                        {exercise.duration && (
                          <Badge variant="outline" className="text-xs">
                            {exercise.duration} min
                          </Badge>
                        )}
                        {/* Remove button for custom exercises */}
                        {index >=
                          (personalPlan?.workoutPlan.find((p) => p.day === activeWorkout.dayOfWeek)?.exercises.length ||
                            0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActiveWorkout((prev) => ({
                                ...prev!,
                                exercises: prev!.exercises.filter((_, i) => i !== index),
                              }))
                            }}
                            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Show instructions for planned exercises */}
                    {index <
                      (personalPlan?.workoutPlan.find((p) => p.day === activeWorkout.dayOfWeek)?.exercises.length ||
                        0) && (
                      <p className="text-sm text-muted-foreground">
                        {
                          personalPlan?.workoutPlan.find((p) => p.day === activeWorkout.dayOfWeek)?.exercises[index]
                            ?.instructions
                        }
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Button onClick={() => completeWorkout()} className="flex-1">
                Complete Workout
              </Button>
              <Button onClick={() => setActiveWorkout(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setShowProfileForm(true)} className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Update Profile & Regenerate Plan
        </Button>
      </div>
    </div>
  )
}
