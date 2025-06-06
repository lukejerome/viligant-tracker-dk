"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Crown,
  Check,
  ArrowLeft,
  Calendar,
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  Shield,
  Star,
  Loader2,
} from "lucide-react"
import { useUserStorage } from "../hooks/use-user-storage"

interface SubscriptionPageProps {
  onBack: () => void
}

export default function SubscriptionPage({ onBack }: SubscriptionPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly")
  const [isProcessing, setIsProcessing] = useState(false)
  const [, setIsSubscribed] = useUserStorage<boolean>("ptSubscription", false)
  const [, setSubscriptionPlan] = useUserStorage<string>("subscriptionPlan", "")
  const [, setSubscriptionDate] = useUserStorage<string>("subscriptionDate", "")

  const handleSubscribe = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Update subscription status
    setIsSubscribed(true)
    setSubscriptionPlan(selectedPlan)
    setSubscriptionDate(new Date().toISOString())

    setIsProcessing(false)

    // Go back to the previous page
    setTimeout(() => {
      onBack()
    }, 1000)
  }

  const monthlyPrice = 4.99
  const yearlyPrice = 30
  const yearlyMonthlyEquivalent = yearlyPrice / 12
  const savings = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100)

  const premiumFeatures = [
    {
      icon: Calendar,
      title: "Weekly Analytics",
      description: "Detailed breakdown of your weekly calorie intake and patterns",
    },
    {
      icon: TrendingUp,
      title: "Monthly Insights",
      description: "Comprehensive monthly nutrition analysis and trends",
    },
    {
      icon: BarChart3,
      title: "Advanced Charts",
      description: "Visual charts and graphs to track your progress over time",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and monitor personalized nutrition and fitness goals",
    },
    {
      icon: Zap,
      title: "Priority Support",
      description: "Get faster response times and premium customer support",
    },
    {
      icon: Shield,
      title: "Data Export",
      description: "Export your nutrition data for external analysis",
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Upgrade to Premium</h1>
          <p className="text-muted-foreground">Unlock advanced nutrition tracking and insights</p>
        </div>
      </div>

      {/* Hero Section */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="p-4 bg-primary/20 rounded-full w-fit mx-auto">
              <Crown className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Vigilant Premium</h2>
              <p className="text-muted-foreground mt-2">
                Take your fitness journey to the next level with advanced analytics and insights
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="text-sm text-muted-foreground ml-2">Loved by 10,000+ users</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-center">Choose Your Plan</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Monthly Plan */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedPlan === "monthly"
                ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
                : "border-border/30 hover:border-border/50"
            }`}
            onClick={() => setSelectedPlan("monthly")}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Monthly</CardTitle>
                {selectedPlan === "monthly" && (
                  <div className="p-1 bg-primary/20 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
              <CardDescription>Perfect for trying out premium features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">${monthlyPrice}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">All premium features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card
            className={`cursor-pointer transition-all relative ${
              selectedPlan === "yearly"
                ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
                : "border-border/30 hover:border-border/50"
            }`}
            onClick={() => setSelectedPlan("yearly")}
          >
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 hover:bg-green-600">
              Save {savings}%
            </Badge>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Yearly</CardTitle>
                {selectedPlan === "yearly" && (
                  <div className="p-1 bg-primary/20 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
              <CardDescription>Best value for committed users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">${yearlyPrice}</div>
                  <div className="text-sm text-muted-foreground">
                    per year (${yearlyMonthlyEquivalent.toFixed(2)}/month)
                  </div>
                  <div className="text-xs text-green-600 font-medium mt-1">
                    Save ${(monthlyPrice * 12 - yearlyPrice).toFixed(2)} vs monthly
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">All premium features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">2 months free</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features List */}
      <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Premium Features
          </CardTitle>
          <CardDescription>Everything you need to optimize your nutrition and fitness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {premiumFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Subscribe Button */}
      <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-bold">Ready to upgrade?</h3>
              <p className="text-sm text-muted-foreground">
                Join thousands of users who have transformed their fitness journey
              </p>
            </div>
            <Button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="h-5 w-5 mr-2" />
                  Subscribe to {selectedPlan === "monthly" ? "Monthly" : "Yearly"} Plan - $
                  {selectedPlan === "monthly" ? monthlyPrice : yearlyPrice}
                </>
              )}
            </Button>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Secure payment processing</p>
              <p>• Cancel anytime from your profile</p>
              <p>• 30-day money-back guarantee</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
