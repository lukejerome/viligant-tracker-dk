"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Settings, Target } from "lucide-react"
import { useLocalStorage } from "../hooks/use-local-storage"

interface MacroGoals {
  protein: number
  carbs: number
  fat: number
}

interface DailyMacros {
  protein: number
  carbs: number
  fat: number
  date: string
}

interface MacroTrackerProps {
  dailyMacros: DailyMacros
  onMacroGoalsUpdate: (goals: MacroGoals) => void
}

export default function MacroTracker({ dailyMacros, onMacroGoalsUpdate }: MacroTrackerProps) {
  const [macroGoals, setMacroGoals] = useLocalStorage<MacroGoals>("macroGoals", {
    protein: 150,
    carbs: 200,
    fat: 70,
  })
  const [isEditingGoals, setIsEditingGoals] = useState(false)
  const [goalForm, setGoalForm] = useState({
    protein: macroGoals.protein.toString(),
    carbs: macroGoals.carbs.toString(),
    fat: macroGoals.fat.toString(),
  })

  const saveGoals = () => {
    const newGoals = {
      protein: Number.parseInt(goalForm.protein) || 0,
      carbs: Number.parseInt(goalForm.carbs) || 0,
      fat: Number.parseInt(goalForm.fat) || 0,
    }
    setMacroGoals(newGoals)
    onMacroGoalsUpdate(newGoals)
    setIsEditingGoals(false)
  }

  const getProgressPercentage = (current: number, goal: number) => {
    return goal > 0 ? Math.min(100, (current / goal) * 100) : 0
  }

  const getProgressColor = (current: number, goal: number) => {
    const percentage = getProgressPercentage(current, goal)
    if (percentage >= 100) return "bg-green-500"
    if (percentage >= 80) return "bg-yellow-500"
    return "bg-blue-500"
  }

  return (
    <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Daily Macros
            </CardTitle>
            <CardDescription className="text-sm">Track your protein, carbs, and fat intake</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsEditingGoals(!isEditingGoals)} className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditingGoals ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="protein-goal" className="text-xs">
                  Protein (g)
                </Label>
                <Input
                  id="protein-goal"
                  type="number"
                  placeholder="150"
                  value={goalForm.protein}
                  onChange={(e) => setGoalForm((prev) => ({ ...prev, protein: e.target.value }))}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="carbs-goal" className="text-xs">
                  Carbs (g)
                </Label>
                <Input
                  id="carbs-goal"
                  type="number"
                  placeholder="200"
                  value={goalForm.carbs}
                  onChange={(e) => setGoalForm((prev) => ({ ...prev, carbs: e.target.value }))}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="fat-goal" className="text-xs">
                  Fat (g)
                </Label>
                <Input
                  id="fat-goal"
                  type="number"
                  placeholder="70"
                  value={goalForm.fat}
                  onChange={(e) => setGoalForm((prev) => ({ ...prev, fat: e.target.value }))}
                  className="h-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveGoals} size="sm" className="flex-1">
                Save Goals
              </Button>
              <Button onClick={() => setIsEditingGoals(false)} variant="outline" size="sm" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Protein */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-400">Protein</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{dailyMacros.protein}g</span>
                  <span className="text-xs text-muted-foreground">/ {macroGoals.protein}g</span>
                </div>
              </div>
              <div className="relative">
                <Progress value={getProgressPercentage(dailyMacros.protein, macroGoals.protein)} className="h-2" />
                <div
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor(
                    dailyMacros.protein,
                    macroGoals.protein,
                  )}`}
                  style={{
                    width: `${Math.min(100, getProgressPercentage(dailyMacros.protein, macroGoals.protein))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(getProgressPercentage(dailyMacros.protein, macroGoals.protein))}%</span>
                <span>
                  {macroGoals.protein - dailyMacros.protein > 0
                    ? `${macroGoals.protein - dailyMacros.protein}g remaining`
                    : "Goal reached!"}
                </span>
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-400">Carbs</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{dailyMacros.carbs}g</span>
                  <span className="text-xs text-muted-foreground">/ {macroGoals.carbs}g</span>
                </div>
              </div>
              <div className="relative">
                <Progress value={getProgressPercentage(dailyMacros.carbs, macroGoals.carbs)} className="h-2" />
                <div
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor(
                    dailyMacros.carbs,
                    macroGoals.carbs,
                  )}`}
                  style={{
                    width: `${Math.min(100, getProgressPercentage(dailyMacros.carbs, macroGoals.carbs))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(getProgressPercentage(dailyMacros.carbs, macroGoals.carbs))}%</span>
                <span>
                  {macroGoals.carbs - dailyMacros.carbs > 0
                    ? `${macroGoals.carbs - dailyMacros.carbs}g remaining`
                    : "Goal reached!"}
                </span>
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-yellow-400">Fat</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{dailyMacros.fat}g</span>
                  <span className="text-xs text-muted-foreground">/ {macroGoals.fat}g</span>
                </div>
              </div>
              <div className="relative">
                <Progress value={getProgressPercentage(dailyMacros.fat, macroGoals.fat)} className="h-2" />
                <div
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor(
                    dailyMacros.fat,
                    macroGoals.fat,
                  )}`}
                  style={{
                    width: `${Math.min(100, getProgressPercentage(dailyMacros.fat, macroGoals.fat))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(getProgressPercentage(dailyMacros.fat, macroGoals.fat))}%</span>
                <span>
                  {macroGoals.fat - dailyMacros.fat > 0
                    ? `${macroGoals.fat - dailyMacros.fat}g remaining`
                    : "Goal reached!"}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="pt-2 border-t border-border/30">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Macros:</span>
                <div className="flex gap-3">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                    P: {dailyMacros.protein}g
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                    C: {dailyMacros.carbs}g
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs">
                    F: {dailyMacros.fat}g
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
