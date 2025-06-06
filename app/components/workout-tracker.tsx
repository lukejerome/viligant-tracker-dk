"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Timer, Dumbbell, Heart, Trophy, TrendingUp, Award, Search, Calendar, BarChart3 } from "lucide-react"
import { useUserStorage } from "../hooks/use-user-storage"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight?: number
  duration?: number
  caloriesBurned: number
  isPersonalRecord?: boolean
}

interface CardioActivity {
  id: string
  name: string
  duration: number
  distance?: number
  caloriesBurned: number
  isPersonalRecord?: boolean
}

interface Workout {
  id: string
  name: string
  date: string
  type: "strength" | "cardio"
  exercises?: Exercise[]
  cardioActivities?: CardioActivity[]
  totalCaloriesBurned: number
  duration: number
}

interface PersonalRecord {
  exerciseName: string
  type: "strength" | "cardio"
  weight?: number
  reps?: number
  duration?: number
  distance?: number
  date: string
  workoutId: string
}

interface WorkoutTrackerProps {
  onWorkoutComplete: (caloriesBurned: number) => void
}

const exerciseCalories: Record<string, number> = {
  "Push-ups": 8,
  Squats: 10,
  Burpees: 15,
  Running: 12,
  Cycling: 8,
  "Jumping Jacks": 10,
  Plank: 5,
  Deadlifts: 12,
  "Bench Press": 10,
  "Pull-ups": 12,
  "Bicep Curls": 6,
  "Tricep Dips": 8,
  Lunges: 9,
  "Mountain Climbers": 12,
  "Russian Twists": 7,
  "Leg Press": 10,
  "Shoulder Press": 8,
  "Lat Pulldowns": 9,
  "Chest Flyes": 7,
  "Leg Curls": 8,
  "Calf Raises": 5,
  "Hip Thrusts": 9,
  "Face Pulls": 6,
  "Hammer Curls": 6,
  "Overhead Press": 9,
  Rows: 8,
  "Dumbbell Press": 8,
  "Kettlebell Swings": 12,
  "Battle Ropes": 15,
  "Box Jumps": 11,
}

const cardioActivities = [
  "Running",
  "Cycling",
  "Swimming",
  "Walking",
  "Hiking",
  "Elliptical",
  "Rowing",
  "Stair Climbing",
  "Jump Rope",
  "Dancing",
]

export default function WorkoutTracker({ onWorkoutComplete }: WorkoutTrackerProps) {
  const [workouts, setWorkouts] = useUserStorage<Workout[]>("workouts", [])
  const [personalRecords, setPersonalRecords] = useUserStorage<PersonalRecord[]>("personalRecords", [])
  const [recentExercises, setRecentExercises] = useUserStorage<string[]>("recentExercises", [])
  const [currentWorkout, setCurrentWorkout] = useState<Exercise[]>([])
  const [currentCardioActivities, setCurrentCardioActivities] = useState<CardioActivity[]>([])
  const [workoutName, setWorkoutName] = useState("")
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [workoutType, setWorkoutType] = useState<"strength" | "cardio">("strength")

  // Strength training states
  const [exerciseSearch, setExerciseSearch] = useState("")
  const [sets, setSets] = useState("")
  const [reps, setReps] = useState("")
  const [weight, setWeight] = useState("")
  const [duration, setDuration] = useState("")

  // Cardio states
  const [cardioActivity, setCardioActivity] = useState("")
  const [cardioDuration, setCardioDuration] = useState("")
  const [distance, setDistance] = useState("")
  const [caloriesBurned, setCaloriesBurned] = useState("")

  // Add these new state variables after the existing state declarations
  const [cardioSearch, setCardioSearch] = useState("")
  const [recentCardioActivities, setRecentCardioActivities] = useUserStorage<string[]>("recentCardioActivities", [])

  // Progress graph states
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [timeRange, setTimeRange] = useState<"week" | "month" | "3months" | "6months" | "year" | "custom">("month")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  })

  // Play success sound effect
  const playSuccessSound = () => {
    try {
      // Create a simple success sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Create a pleasant success sound (C major chord)
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log("Audio not supported")
    }
  }

  // Check if current exercise/activity is a personal record
  const checkPersonalRecord = (exerciseName: string, type: "strength" | "cardio", currentStats: any) => {
    const existingRecords = personalRecords.filter(
      (record) => record.exerciseName === exerciseName && record.type === type,
    )

    if (existingRecords.length === 0) {
      return true // First time doing this exercise
    }

    if (type === "strength") {
      const { weight: currentWeight, reps: currentReps } = currentStats
      const bestRecord = existingRecords.reduce((best, record) => {
        const recordScore = (record.weight || 0) * (record.reps || 1)
        const bestScore = (best.weight || 0) * (best.reps || 1)
        return recordScore > bestScore ? record : best
      })

      const currentScore = (currentWeight || 0) * (currentReps || 1)
      const bestScore = (bestRecord.weight || 0) * (bestRecord.reps || 1)
      return currentScore > bestScore
    } else {
      const { duration: currentDuration, distance: currentDistance } = currentStats
      if (currentDistance) {
        const bestDistance = Math.max(...existingRecords.map((r) => r.distance || 0))
        return (currentDistance || 0) > bestDistance
      } else {
        const bestDuration = Math.max(...existingRecords.map((r) => r.duration || 0))
        return (currentDuration || 0) > bestDuration
      }
    }
  }

  // Add personal record
  const addPersonalRecord = (exerciseName: string, type: "strength" | "cardio", stats: any, workoutId: string) => {
    const newRecord: PersonalRecord = {
      exerciseName,
      type,
      date: new Date().toDateString(),
      workoutId,
      ...stats,
    }

    setPersonalRecords((prev) => [...prev, newRecord])
  }

  const addExercise = () => {
    if (!exerciseSearch.trim() || !sets) return

    const exerciseName = exerciseSearch.trim()

    // Add to recent exercises
    setRecentExercises((prev) => {
      const updated = [exerciseName, ...prev.filter((ex) => ex !== exerciseName)].slice(0, 10)
      return updated
    })

    // Calculate calories (use known value or default)
    const caloriesPerSet = exerciseCalories[exerciseName] || 8
    const totalCalories = Number.parseInt(sets) * caloriesPerSet

    const currentStats = {
      weight: weight ? Number.parseInt(weight) : undefined,
      reps: Number.parseInt(reps) || 0,
    }

    const isPersonalRecord = checkPersonalRecord(exerciseName, "strength", currentStats)

    const exercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      sets: Number.parseInt(sets),
      reps: Number.parseInt(reps) || 0,
      weight: weight ? Number.parseInt(weight) : undefined,
      duration: duration ? Number.parseInt(duration) : undefined,
      caloriesBurned: totalCalories,
      isPersonalRecord,
    }

    if (isPersonalRecord) {
      playSuccessSound()
    }

    setCurrentWorkout((prev) => [...prev, exercise])

    // Reset form
    setExerciseSearch("")
    setSets("")
    setReps("")
    setWeight("")
    setDuration("")
  }

  const addCustomExerciseFromSearch = (exerciseName: string) => {
    setExerciseSearch(exerciseName)
  }

  const addCardioActivity = () => {
    if (!cardioActivity || !cardioDuration || !caloriesBurned) return

    // Add to recent cardio activities
    setRecentCardioActivities((prev) => {
      const updated = [cardioActivity, ...prev.filter((act) => act !== cardioActivity)].slice(0, 10)
      return updated
    })

    const currentStats = {
      duration: Number.parseInt(cardioDuration),
      distance: distance ? Number.parseFloat(distance) : undefined,
    }

    const isPersonalRecord = checkPersonalRecord(cardioActivity, "cardio", currentStats)

    const activity: CardioActivity = {
      id: Date.now().toString(),
      name: cardioActivity,
      duration: Number.parseInt(cardioDuration),
      distance: distance ? Number.parseFloat(distance) : undefined,
      caloriesBurned: Number.parseInt(caloriesBurned),
      isPersonalRecord,
    }

    if (isPersonalRecord) {
      playSuccessSound()
    }

    setCurrentCardioActivities((prev) => [...prev, activity])

    // Reset form
    setCardioSearch("")
    setCardioActivity("")
    setCardioDuration("")
    setDistance("")
    setCaloriesBurned("")
  }

  const startWorkout = () => {
    if (!workoutName) return
    setIsWorkoutActive(true)
    setWorkoutStartTime(new Date())
  }

  const finishWorkout = () => {
    if (!workoutStartTime) return
    if (
      (workoutType === "strength" && currentWorkout.length === 0) ||
      (workoutType === "cardio" && currentCardioActivities.length === 0)
    )
      return

    const endTime = new Date()
    const durationMinutes = Math.round((endTime.getTime() - workoutStartTime.getTime()) / 60000)

    let totalCaloriesBurned = 0

    const workoutId = Date.now().toString()

    if (workoutType === "strength") {
      totalCaloriesBurned = currentWorkout.reduce((sum, exercise) => sum + exercise.caloriesBurned, 0)

      // Add personal records for strength exercises
      currentWorkout.forEach((exercise) => {
        if (exercise.isPersonalRecord) {
          addPersonalRecord(
            exercise.name,
            "strength",
            {
              weight: exercise.weight,
              reps: exercise.reps,
            },
            workoutId,
          )
        }
      })
    } else {
      totalCaloriesBurned = currentCardioActivities.reduce((sum, activity) => sum + activity.caloriesBurned, 0)

      // Add personal records for cardio activities
      currentCardioActivities.forEach((activity) => {
        if (activity.isPersonalRecord) {
          addPersonalRecord(
            activity.name,
            "cardio",
            {
              duration: activity.duration,
              distance: activity.distance,
            },
            workoutId,
          )
        }
      })
    }

    const workout: Workout = {
      id: workoutId,
      name: workoutName,
      date: new Date().toDateString(),
      type: workoutType,
      exercises: workoutType === "strength" ? currentWorkout : undefined,
      cardioActivities: workoutType === "cardio" ? currentCardioActivities : undefined,
      totalCaloriesBurned,
      duration: durationMinutes,
    }

    setWorkouts((prev) => [workout, ...prev])
    onWorkoutComplete(totalCaloriesBurned)

    // Reset workout
    setCurrentWorkout([])
    setCurrentCardioActivities([])
    setWorkoutName("")
    setIsWorkoutActive(false)
    setWorkoutStartTime(null)
  }

  const removeExercise = (id: string) => {
    setCurrentWorkout((prev) => prev.filter((exercise) => exercise.id !== id))
  }

  const removeCardioActivity = (id: string) => {
    setCurrentCardioActivities((prev) => prev.filter((activity) => activity.id !== id))
  }

  const getPersonalRecordForExercise = (exerciseName: string, type: "strength" | "cardio") => {
    const records = personalRecords.filter((record) => record.exerciseName === exerciseName && record.type === type)
    if (records.length === 0) return null

    if (type === "strength") {
      return records.reduce((best, record) => {
        const recordScore = (record.weight || 0) * (record.reps || 1)
        const bestScore = (best.weight || 0) * (best.reps || 1)
        return recordScore > bestScore ? record : best
      })
    } else {
      return records.reduce((best, record) => {
        if (record.distance && best.distance) {
          return record.distance > best.distance ? record : best
        } else {
          return (record.duration || 0) > (best.duration || 0) ? record : best
        }
      })
    }
  }

  // Filter exercises based on search
  const filteredExercises = Object.keys(exerciseCalories).filter((exercise) =>
    exercise.toLowerCase().includes(exerciseSearch.toLowerCase()),
  )

  // Get unique exercise names from all workouts
  const uniqueExerciseNames = useMemo(() => {
    const exerciseNames = new Set<string>()

    workouts.forEach((workout) => {
      if (workout.type === "strength" && workout.exercises) {
        workout.exercises.forEach((exercise) => {
          exerciseNames.add(exercise.name)
        })
      }
    })

    return Array.from(exerciseNames).sort()
  }, [workouts])

  // Get exercise data for the selected exercise and time range
  const exerciseProgressData = useMemo(() => {
    if (!selectedExercise) return []

    // Determine date range based on selected time range
    let fromDate: Date
    const toDate = new Date()

    if (timeRange === "custom" && dateRange.from) {
      fromDate = dateRange.from
    } else {
      const now = new Date()
      switch (timeRange) {
        case "week":
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case "3months":
          fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case "6months":
          fromDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
          break
        case "year":
          fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
    }

    // Filter workouts by date range
    const filteredWorkouts = workouts.filter((workout) => {
      const workoutDate = new Date(workout.date)
      return workoutDate >= fromDate && workoutDate <= toDate
    })

    // Extract exercise data for the selected exercise
    const exerciseData: Array<{
      date: string
      weight?: number
      reps?: number
      formattedDate: string
    }> = []

    filteredWorkouts.forEach((workout) => {
      if (workout.type === "strength" && workout.exercises) {
        workout.exercises.forEach((exercise) => {
          if (exercise.name === selectedExercise) {
            exerciseData.push({
              date: workout.date,
              weight: exercise.weight,
              reps: exercise.reps,
              formattedDate: new Date(workout.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            })
          }
        })
      }
    })

    // Sort by date
    return exerciseData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [selectedExercise, timeRange, dateRange, workouts])

  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as "week" | "month" | "3months" | "6months" | "year" | "custom")

    // Reset date range if not custom
    if (value !== "custom") {
      const now = new Date()
      let fromDate: Date

      switch (value) {
        case "week":
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case "3months":
          fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case "6months":
          fromDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
          break
        case "year":
          fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }

      setDateRange({
        from: fromDate,
        to: now,
      })
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="workout">Current Workout</TabsTrigger>
          <TabsTrigger value="records">Personal Records</TabsTrigger>
        </TabsList>

        <TabsContent value="workout" className="space-y-4">
          <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {workoutType === "strength" ? (
                  <Dumbbell className="h-5 w-5" />
                ) : (
                  <Heart className="h-5 w-5 text-red-500" />
                )}
                {isWorkoutActive ? "Active Workout" : "Start New Workout"}
              </CardTitle>
              <CardDescription>
                {isWorkoutActive ? "Add exercises to your current workout" : "Create and track your workout session"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isWorkoutActive ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workout-name">Workout Name</Label>
                    <Input
                      id="workout-name"
                      placeholder="e.g., Upper Body, Cardio, Full Body"
                      value={workoutName}
                      onChange={(e) => setWorkoutName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Workout Type</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Button
                        variant={workoutType === "strength" ? "default" : "outline"}
                        onClick={() => setWorkoutType("strength")}
                        className="flex-1"
                      >
                        <Dumbbell className="h-4 w-4 mr-2" />
                        Strength Training
                      </Button>
                      <Button
                        variant={workoutType === "cardio" ? "default" : "outline"}
                        onClick={() => setWorkoutType("cardio")}
                        className="flex-1"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Cardio
                      </Button>
                    </div>
                  </div>
                  <Button onClick={startWorkout} disabled={!workoutName}>
                    Start Workout
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{workoutName}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        Active
                      </Badge>
                      <Badge variant={workoutType === "strength" ? "outline" : "secondary"} className="bg-primary/10">
                        {workoutType === "strength" ? "Strength" : "Cardio"}
                      </Badge>
                    </div>
                  </div>

                  {workoutType === "strength" ? (
                    <>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label htmlFor="exercise-search">Exercise</Label>
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="exercise-search"
                              placeholder="Type exercise name (e.g., Push-ups, Squats, Bicep Curls)..."
                              className="pl-9"
                              value={exerciseSearch}
                              onChange={(e) => setExerciseSearch(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && exerciseSearch.trim() && sets) {
                                  addExercise()
                                }
                              }}
                            />
                          </div>

                          {/* Exercise Suggestions */}
                          {exerciseSearch && filteredExercises.length > 0 && (
                            <div className="mt-2 max-h-32 overflow-y-auto border border-border/30 rounded-lg bg-secondary/20">
                              {filteredExercises.slice(0, 5).map((exercise) => (
                                <button
                                  key={exercise}
                                  onClick={() => addCustomExerciseFromSearch(exercise)}
                                  className="w-full text-left px-3 py-2 hover:bg-secondary/50 text-sm border-b border-border/20 last:border-b-0"
                                >
                                  {exercise}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Recent Exercises */}
                          {recentExercises.length > 0 && !exerciseSearch && (
                            <div className="mt-2 space-y-2">
                              <Label className="text-xs text-muted-foreground">Recent Exercises:</Label>
                              <div className="flex flex-wrap gap-1">
                                {recentExercises.slice(0, 8).map((exercise, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addCustomExerciseFromSearch(exercise)}
                                    className="text-xs h-7 px-2 hover:bg-primary/10"
                                  >
                                    {exercise}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="sets">Sets</Label>
                            <Input
                              id="sets"
                              type="number"
                              placeholder="3"
                              value={sets}
                              onChange={(e) => setSets(e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="reps">Reps</Label>
                            <Input
                              id="reps"
                              type="number"
                              placeholder="12"
                              value={reps}
                              onChange={(e) => setReps(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                              id="weight"
                              type="number"
                              placeholder="Optional"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="duration">Duration (min)</Label>
                            <Input
                              id="duration"
                              type="number"
                              placeholder="Optional"
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                            />
                          </div>
                        </div>

                        <Button onClick={addExercise} disabled={!exerciseSearch.trim() || !sets} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Exercise
                        </Button>
                      </div>

                      {currentWorkout.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Current Workout:</h4>
                          {currentWorkout.map((exercise) => (
                            <div
                              key={exercise.id}
                              className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/30"
                            >
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">{exercise.name}</span>
                                    {exercise.isPersonalRecord && (
                                      <Trophy className="h-4 w-4 text-yellow-500 animate-pulse" />
                                    )}
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {exercise.sets} sets × {exercise.reps} reps
                                    {exercise.weight && ` @ ${exercise.weight}kg`}
                                    {exercise.duration && ` (${exercise.duration}min)`}
                                  </span>
                                  {exercise.isPersonalRecord && (
                                    <Badge
                                      variant="outline"
                                      className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs"
                                    >
                                      Personal Record!
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                  {exercise.caloriesBurned} kcal
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExercise(exercise.id)}
                                  className="hover:bg-destructive/10 hover:text-destructive"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}

                          <div className="flex justify-between items-center pt-2">
                            <span className="font-medium">
                              Total: {currentWorkout.reduce((sum, ex) => sum + ex.caloriesBurned, 0)} kcal
                            </span>
                            <Button onClick={finishWorkout}>Finish Workout</Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label htmlFor="cardio-search">Activity</Label>
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="cardio-search"
                              placeholder="Type activity name (e.g., Running, Swimming, Dancing)..."
                              className="pl-9"
                              value={cardioSearch}
                              onChange={(e) => setCardioSearch(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && cardioSearch.trim() && cardioDuration && caloriesBurned) {
                                  setCardioActivity(cardioSearch.trim())
                                  addCardioActivity()
                                }
                              }}
                            />
                          </div>

                          {/* Cardio Activity Suggestions */}
                          {cardioSearch &&
                            cardioActivities.filter((activity) =>
                              activity.toLowerCase().includes(cardioSearch.toLowerCase()),
                            ).length > 0 && (
                              <div className="mt-2 max-h-32 overflow-y-auto border border-border/30 rounded-lg bg-secondary/20">
                                {cardioActivities
                                  .filter((activity) => activity.toLowerCase().includes(cardioSearch.toLowerCase()))
                                  .slice(0, 5)
                                  .map((activity) => (
                                    <button
                                      key={activity}
                                      onClick={() => {
                                        setCardioSearch(activity)
                                        setCardioActivity(activity)
                                      }}
                                      className="w-full text-left px-3 py-2 hover:bg-secondary/50 text-sm border-b border-border/20 last:border-b-0"
                                    >
                                      {activity}
                                    </button>
                                  ))}
                              </div>
                            )}

                          {/* Recent Cardio Activities */}
                          {recentCardioActivities.length > 0 && !cardioSearch && (
                            <div className="mt-2 space-y-2">
                              <Label className="text-xs text-muted-foreground">Recent Activities:</Label>
                              <div className="flex flex-wrap gap-1">
                                {recentCardioActivities.slice(0, 8).map((activity, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setCardioSearch(activity)
                                      setCardioActivity(activity)
                                    }}
                                    className="text-xs h-7 px-2 hover:bg-primary/10"
                                  >
                                    {activity}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="cardio-duration">Duration (min)</Label>
                            <Input
                              id="cardio-duration"
                              type="number"
                              placeholder="30"
                              value={cardioDuration}
                              onChange={(e) => setCardioDuration(e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="distance">Distance (km)</Label>
                            <Input
                              id="distance"
                              type="number"
                              step="0.01"
                              placeholder="5.0"
                              value={distance}
                              onChange={(e) => setDistance(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="calories-burned">Calories Burned</Label>
                          <Input
                            id="calories-burned"
                            type="number"
                            placeholder="300"
                            value={caloriesBurned}
                            onChange={(e) => setCaloriesBurned(e.target.value)}
                          />
                        </div>

                        <Button
                          onClick={() => {
                            if (cardioSearch.trim()) {
                              setCardioActivity(cardioSearch.trim())
                            }
                            addCardioActivity()
                          }}
                          disabled={!cardioSearch.trim() || !cardioDuration || !caloriesBurned}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Cardio Activity
                        </Button>
                      </div>

                      {currentCardioActivities.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Current Cardio Activities:</h4>
                          {currentCardioActivities.map((activity) => (
                            <div
                              key={activity.id}
                              className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/30"
                            >
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">{activity.name}</span>
                                    {activity.isPersonalRecord && (
                                      <Trophy className="h-4 w-4 text-yellow-500 animate-pulse" />
                                    )}
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {activity.duration} min
                                    {activity.distance && ` • ${activity.distance} km`}
                                  </span>
                                  {activity.isPersonalRecord && (
                                    <Badge
                                      variant="outline"
                                      className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs"
                                    >
                                      Personal Record!
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                                  {activity.caloriesBurned} kcal
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCardioActivity(activity.id)}
                                  className="hover:bg-destructive/10 hover:text-destructive"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}

                          <div className="flex justify-between items-center pt-2">
                            <span className="font-medium">
                              Total: {currentCardioActivities.reduce((sum, act) => sum + act.caloriesBurned, 0)} kcal
                            </span>
                            <Button onClick={finishWorkout}>Finish Workout</Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercise Progress Graph */}
          <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Exercise Progress Tracker
              </CardTitle>
              <CardDescription>Track your progress for specific exercises over time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exercise-select">Select Exercise</Label>
                  <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                    <SelectTrigger id="exercise-select">
                      <SelectValue placeholder="Choose an exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueExerciseNames.length > 0 ? (
                        uniqueExerciseNames.map((exercise) => (
                          <SelectItem key={exercise} value={exercise}>
                            {exercise}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No exercises found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time-range">Time Range</Label>
                  <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                    <SelectTrigger id="time-range">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="3months">Last 3 Months</SelectItem>
                      <SelectItem value="6months">Last 6 Months</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Date Range Picker */}
              {timeRange === "custom" && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label>From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange.from ? format(dateRange.from, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1">
                    <Label>To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange.to ? format(dateRange.to, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* Progress Graph */}
              {selectedExercise ? (
                exerciseProgressData.length > 0 ? (
                  <div className="h-[350px] mt-4">
                    <ChartContainer
                      config={{
                        weight: {
                          label: "Weight (kg)",
                          color: "hsl(var(--chart-1))",
                        },
                        reps: {
                          label: "Reps",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={exerciseProgressData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="formattedDate" angle={-45} textAnchor="end" height={60} />
                          <YAxis yAxisId="left" orientation="left" stroke="var(--color-weight)" />
                          <YAxis yAxisId="right" orientation="right" stroke="var(--color-reps)" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="weight"
                            stroke="var(--color-weight)"
                            name="Weight (kg)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="reps"
                            stroke="var(--color-reps)"
                            name="Reps"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No data available for {selectedExercise} in the selected time period</p>
                    <p className="text-sm">Try selecting a different exercise or time range</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an exercise to view progress</p>
                  <p className="text-sm">Track your weight and reps over time</p>
                </div>
              )}
            </CardContent>
          </Card>

          {workouts.length > 0 && (
            <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Workouts</CardTitle>
                <CardDescription>Your workout history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workouts.slice(0, 5).map((workout) => (
                    <div key={workout.id} className="border border-border/30 rounded-xl p-4 bg-secondary/20 card-hover">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{workout.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {workout.type === "strength" ? "Strength" : "Cardio"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{workout.date}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            {workout.totalCaloriesBurned} kcal
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">{workout.duration} min</p>
                        </div>
                      </div>
                      <div className="text-sm">
                        {workout.type === "strength" && workout.exercises && (
                          <>
                            <span className="text-muted-foreground">Exercises: </span>
                            <span className="text-foreground">{workout.exercises.map((ex) => ex.name).join(", ")}</span>
                          </>
                        )}
                        {workout.type === "cardio" && workout.cardioActivities && (
                          <>
                            <span className="text-muted-foreground">Activities: </span>
                            <span className="text-foreground">
                              {workout.cardioActivities.map((act) => act.name).join(", ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Personal Records
              </CardTitle>
              <CardDescription>Your best performances across all exercises</CardDescription>
            </CardHeader>
            <CardContent>
              {personalRecords.length > 0 ? (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {personalRecords
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((record, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{record.exerciseName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {record.type === "strength" ? "Strength" : "Cardio"}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {record.type === "strength" ? (
                                  <>
                                    {record.weight && `${record.weight}kg × `}
                                    {record.reps} reps
                                  </>
                                ) : (
                                  <>
                                    {record.duration} min
                                    {record.distance && ` • ${record.distance} km`}
                                  </>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{record.date}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              PR
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No personal records yet!</p>
                  <p className="text-sm">Complete your first workout to start tracking records.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
