"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingDown, TrendingUp, Calendar } from "lucide-react"
import { useLocalStorage } from "../hooks/use-local-storage"

interface WeightGoal {
  currentWeight: number
  targetWeight: number
  targetDate: string
  weeklyGoal: number
}

interface WeightEntry {
  id: string
  weight: number
  date: string
  notes?: string
}

interface WeightGoalsProps {
  weightGoal: WeightGoal
  onWeightGoalUpdate: (goal: WeightGoal) => void
}

export default function WeightGoals({ weightGoal, onWeightGoalUpdate }: WeightGoalsProps) {
  const [weightHistory, setWeightHistory] = useLocalStorage<WeightEntry[]>("weightHistory", [])
  const [isEditing, setIsEditing] = useState(false)
  const [newWeight, setNewWeight] = useState("")
  const [notes, setNotes] = useState("")

  const [editGoal, setEditGoal] = useState({
    currentWeight: weightGoal.currentWeight.toString(),
    targetWeight: weightGoal.targetWeight.toString(),
    targetDate: weightGoal.targetDate,
    weeklyGoal: weightGoal.weeklyGoal.toString(),
  })

  const addWeightEntry = () => {
    if (!newWeight) return

    const entry: WeightEntry = {
      id: Date.now().toString(),
      weight: Number.parseFloat(newWeight),
      date: new Date().toDateString(),
      notes: notes || undefined,
    }

    const newHistory = [entry, ...weightHistory]
    setWeightHistory(newHistory)

    // Update current weight in goal
    onWeightGoalUpdate({
      ...weightGoal,
      currentWeight: Number.parseFloat(newWeight),
    })

    setNewWeight("")
    setNotes("")
  }

  const saveGoal = () => {
    onWeightGoalUpdate({
      currentWeight: Number.parseFloat(editGoal.currentWeight),
      targetWeight: Number.parseFloat(editGoal.targetWeight),
      targetDate: editGoal.targetDate,
      weeklyGoal: Number.parseFloat(editGoal.weeklyGoal),
    })
    setIsEditing(false)
  }

  const weightDifference = weightGoal.currentWeight - weightGoal.targetWeight
  const isLosingWeight = weightDifference > 0
  const progressPercentage =
    Math.abs(weightDifference) > 0
      ? Math.max(0, Math.min(100, (Math.abs(weightDifference) / Math.abs(weightDifference)) * 100))
      : 100

  const calculateTimeToGoal = () => {
    if (weightGoal.weeklyGoal <= 0) return "Set weekly goal to calculate"
    const weeksNeeded = Math.abs(weightDifference) / weightGoal.weeklyGoal
    const monthsNeeded = Math.round((weeksNeeded / 4.33) * 10) / 10
    return `~${monthsNeeded} months at current rate`
  }

  const getWeightTrend = () => {
    if (weightHistory.length < 2) return null
    const recent = weightHistory.slice(0, 2)
    const trend = recent[1].weight - recent[0].weight
    return trend
  }

  const trend = getWeightTrend()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Weight Goal
            </CardTitle>
            <CardDescription>Set and track your weight target</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Current Weight</Label>
                    <p className="text-2xl font-bold">{weightGoal.currentWeight}kg</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Target Weight</Label>
                    <p className="text-2xl font-bold">{weightGoal.targetWeight}kg</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.abs(weightDifference).toFixed(1)}kg to go</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isLosingWeight ? (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="text-sm">
                      {isLosingWeight ? "Losing" : "Gaining"} {weightGoal.weeklyGoal}kg per week
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{calculateTimeToGoal()}</p>
                </div>

                {weightGoal.targetDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Target: {weightGoal.targetDate}</span>
                  </div>
                )}

                <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">
                  Edit Goal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="current-weight">Current Weight (kg)</Label>
                    <Input
                      id="current-weight"
                      type="number"
                      step="0.1"
                      value={editGoal.currentWeight}
                      onChange={(e) => setEditGoal((prev) => ({ ...prev, currentWeight: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="target-weight">Target Weight (kg)</Label>
                    <Input
                      id="target-weight"
                      type="number"
                      step="0.1"
                      value={editGoal.targetWeight}
                      onChange={(e) => setEditGoal((prev) => ({ ...prev, targetWeight: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="weekly-goal">Weekly Goal (kg)</Label>
                  <Input
                    id="weekly-goal"
                    type="number"
                    step="0.1"
                    placeholder="0.5"
                    value={editGoal.weeklyGoal}
                    onChange={(e) => setEditGoal((prev) => ({ ...prev, weeklyGoal: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="target-date">Target Date (optional)</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={editGoal.targetDate}
                    onChange={(e) => setEditGoal((prev) => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveGoal} className="flex-1">
                    Save
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Log Weight</CardTitle>
            <CardDescription>Record your current weight</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-weight">Weight (kg)</Label>
              <Input
                id="new-weight"
                type="number"
                step="0.1"
                placeholder="70.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="Feeling great today!"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button onClick={addWeightEntry} disabled={!newWeight} className="w-full">
              Log Weight
            </Button>

            {trend !== null && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  {trend < 0 ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {trend === 0 ? "No change" : `${trend > 0 ? "+" : ""}${trend.toFixed(1)}kg since last entry`}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {weightHistory.length > 0 && (
        <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Weight History</CardTitle>
            <CardDescription>Your weight tracking progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weightHistory.slice(0, 10).map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/30"
                >
                  <div>
                    <span className="font-medium text-foreground">{entry.weight}kg</span>
                    <span className="text-sm text-muted-foreground ml-2">{entry.date}</span>
                    {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Latest
                      </Badge>
                    )}
                    {index > 0 && weightHistory[index - 1] && (
                      <Badge variant={entry.weight < weightHistory[index - 1].weight ? "default" : "outline"}>
                        {entry.weight < weightHistory[index - 1].weight ? "↓" : "↑"}
                        {Math.abs(entry.weight - weightHistory[index - 1].weight).toFixed(1)}kg
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
