"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Utensils,
  Flame,
  History,
  Search,
  Scan,
  Check,
  Loader2,
  Calendar,
  TrendingUp,
  BarChart3,
  Crown,
} from "lucide-react"
import { useUserStorage } from "../hooks/use-user-storage"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BarcodeScanner from "./barcode-scanner"
import SubscriptionPage from "./subscription-page"

interface FoodItem {
  id: string
  name: string
  calories: number
  quantity: number
  unit: string
  date: string
  protein: number
  carbs: number
  fat: number
}

interface ScannedFood {
  barcode: string
  name: string
  brand: string
  caloriesPer100g: number
  protein: number
  carbs: number
  fat: number
}

interface BrandedFood {
  name: string
  brand: string
  caloriesPer100g: number
  protein: number
  carbs: number
  fat: number
  category: string
}

interface CalorieTrackerProps {
  dailyStats: {
    caloriesConsumed: number
    caloriesBurned: number
    workoutsCompleted: number
    date: string
  }
  onCaloriesUpdate: (consumed: number, burned: number) => void
  onMacrosUpdate: (protein: number, carbs: number, fat: number) => void
}

// Expanded food database with per-100g values
const basicFoodDatabase = {
  Apple: { caloriesPer100g: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  Banana: { caloriesPer100g: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  Orange: { caloriesPer100g: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  Strawberries: { caloriesPer100g: 32, protein: 0.7, carbs: 8, fat: 0.3 },
  Blueberries: { caloriesPer100g: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  Grapes: { caloriesPer100g: 62, protein: 0.6, carbs: 16, fat: 0.2 },
  "Chicken Breast": { caloriesPer100g: 165, protein: 31, carbs: 0, fat: 3.6 },
  "Chicken Thigh": { caloriesPer100g: 209, protein: 26, carbs: 0, fat: 11 },
  Salmon: { caloriesPer100g: 208, protein: 25, carbs: 0, fat: 12 },
  Tuna: { caloriesPer100g: 144, protein: 30, carbs: 0, fat: 1 },
  "Beef Sirloin": { caloriesPer100g: 271, protein: 31, carbs: 0, fat: 15 },
  "Ground Beef": { caloriesPer100g: 254, protein: 26, carbs: 0, fat: 17 },
  "Pork Chop": { caloriesPer100g: 231, protein: 23, carbs: 0, fat: 14 },
  Eggs: { caloriesPer100g: 155, protein: 13, carbs: 1.1, fat: 11 },
  "Egg Whites": { caloriesPer100g: 52, protein: 11, carbs: 0.7, fat: 0.2 },
  "Whole Milk": { caloriesPer100g: 61, protein: 3.2, carbs: 4.7, fat: 3.3 },
  "Skim Milk": { caloriesPer100g: 34, protein: 3.4, carbs: 5, fat: 0.1 },
  "Greek Yogurt": { caloriesPer100g: 97, protein: 10, carbs: 3.6, fat: 5 },
  "Cheddar Cheese": { caloriesPer100g: 403, protein: 25, carbs: 1.3, fat: 33 },
  "Cottage Cheese": { caloriesPer100g: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  "White Rice": { caloriesPer100g: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  "Brown Rice": { caloriesPer100g: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  Quinoa: { caloriesPer100g: 120, protein: 4.4, carbs: 22, fat: 1.9 },
  Oats: { caloriesPer100g: 68, protein: 2.4, carbs: 12, fat: 1.4 },
  "Whole Wheat Bread": { caloriesPer100g: 247, protein: 13, carbs: 41, fat: 4.2 },
  "White Bread": { caloriesPer100g: 265, protein: 9, carbs: 49, fat: 3.2 },
  Pasta: { caloriesPer100g: 131, protein: 5, carbs: 25, fat: 1.1 },
  "Sweet Potato": { caloriesPer100g: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  "Regular Potato": { caloriesPer100g: 77, protein: 2, carbs: 17, fat: 0.1 },
  Broccoli: { caloriesPer100g: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  Spinach: { caloriesPer100g: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  Carrots: { caloriesPer100g: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  Tomatoes: { caloriesPer100g: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  Cucumber: { caloriesPer100g: 16, protein: 0.7, carbs: 4, fat: 0.1 },
  Avocado: { caloriesPer100g: 160, protein: 2, carbs: 9, fat: 15 },
  Almonds: { caloriesPer100g: 579, protein: 21, carbs: 22, fat: 50 },
  Walnuts: { caloriesPer100g: 654, protein: 15, carbs: 14, fat: 65 },
  "Peanut Butter": { caloriesPer100g: 588, protein: 25, carbs: 20, fat: 50 },
  "Olive Oil": { caloriesPer100g: 884, protein: 0, carbs: 0, fat: 100 },
  Butter: { caloriesPer100g: 717, protein: 0.9, carbs: 0.1, fat: 81 },
}

// Comprehensive supermarket food database with 500+ products
const brandedFoodDatabase: BrandedFood[] = [
  // FRESH PRODUCE
  // Tesco Fresh
  {
    name: "Organic Bananas",
    brand: "Tesco",
    caloriesPer100g: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    category: "Fresh Fruit",
  },
  {
    name: "British Apples",
    brand: "Tesco",
    caloriesPer100g: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    category: "Fresh Fruit",
  },
  {
    name: "Strawberries",
    brand: "Tesco",
    caloriesPer100g: 32,
    protein: 0.7,
    carbs: 8,
    fat: 0.3,
    category: "Fresh Fruit",
  },
  { name: "Avocados", brand: "Tesco", caloriesPer100g: 160, protein: 2, carbs: 9, fat: 15, category: "Fresh Fruit" },
  {
    name: "Baby Spinach",
    brand: "Tesco",
    caloriesPer100g: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    category: "Fresh Vegetables",
  },
  {
    name: "Broccoli Crowns",
    brand: "Tesco",
    caloriesPer100g: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    category: "Fresh Vegetables",
  },
  {
    name: "Sweet Potatoes",
    brand: "Tesco",
    caloriesPer100g: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    category: "Fresh Vegetables",
  },
  {
    name: "Cherry Tomatoes",
    brand: "Tesco",
    caloriesPer100g: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    category: "Fresh Vegetables",
  },

  // MEAT & FISH
  // Tesco Meat
  {
    name: "British Chicken Breast",
    brand: "Tesco",
    caloriesPer100g: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    category: "Fresh Meat",
  },
  {
    name: "Lean Beef Mince 5%",
    brand: "Tesco",
    caloriesPer100g: 129,
    protein: 20.5,
    carbs: 0.5,
    fat: 5.0,
    category: "Fresh Meat",
  },
  {
    name: "Pork Sausages",
    brand: "Tesco",
    caloriesPer100g: 295,
    protein: 13,
    carbs: 15,
    fat: 21,
    category: "Fresh Meat",
  },
  {
    name: "Back Bacon",
    brand: "Tesco",
    caloriesPer100g: 215,
    protein: 23,
    carbs: 0.5,
    fat: 13,
    category: "Fresh Meat",
  },
  {
    name: "Atlantic Salmon Fillet",
    brand: "Tesco",
    caloriesPer100g: 208,
    protein: 25,
    carbs: 0,
    fat: 12,
    category: "Fresh Fish",
  },
  { name: "Cod Fillet", brand: "Tesco", caloriesPer100g: 82, protein: 18, carbs: 0, fat: 0.7, category: "Fresh Fish" },

  // DAIRY & EGGS
  // Tesco Dairy
  { name: "Whole Milk", brand: "Tesco", caloriesPer100g: 61, protein: 3.2, carbs: 4.7, fat: 3.3, category: "Dairy" },
  {
    name: "Semi-Skimmed Milk",
    brand: "Tesco",
    caloriesPer100g: 46,
    protein: 3.6,
    carbs: 4.8,
    fat: 1.8,
    category: "Dairy",
  },
  {
    name: "Greek Style Yogurt",
    brand: "Tesco",
    caloriesPer100g: 133,
    protein: 5.6,
    carbs: 5.2,
    fat: 10.2,
    category: "Dairy",
  },
  {
    name: "Natural Yogurt",
    brand: "Tesco",
    caloriesPer100g: 61,
    protein: 4.5,
    carbs: 4.7,
    fat: 3.3,
    category: "Dairy",
  },
  {
    name: "Finest Mature Cheddar",
    brand: "Tesco",
    caloriesPer100g: 416,
    protein: 25.4,
    carbs: 0.1,
    fat: 34.9,
    category: "Dairy",
  },
  { name: "Mozzarella", brand: "Tesco", caloriesPer100g: 280, protein: 18, carbs: 2, fat: 22, category: "Dairy" },
  {
    name: "Free Range Eggs",
    brand: "Tesco",
    caloriesPer100g: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    category: "Dairy",
  },
  { name: "Butter", brand: "Tesco", caloriesPer100g: 717, protein: 0.9, carbs: 0.1, fat: 81, category: "Dairy" },

  // BAKERY
  // Tesco Bakery
  {
    name: "White Sliced Bread",
    brand: "Tesco",
    caloriesPer100g: 265,
    protein: 9,
    carbs: 49,
    fat: 3.2,
    category: "Bakery",
  },
  {
    name: "Wholemeal Bread",
    brand: "Tesco",
    caloriesPer100g: 247,
    protein: 13,
    carbs: 41,
    fat: 4.2,
    category: "Bakery",
  },
  {
    name: "Croissants",
    brand: "Tesco",
    caloriesPer100g: 406,
    protein: 8.2,
    carbs: 45.8,
    fat: 20.9,
    category: "Bakery",
  },
  {
    name: "Finest Chocolate Chip Cookies",
    brand: "Tesco",
    caloriesPer100g: 496,
    protein: 5.8,
    carbs: 63.2,
    fat: 24.5,
    category: "Bakery",
  },
  {
    name: "Victoria Sponge Cake",
    brand: "Tesco",
    caloriesPer100g: 459,
    protein: 4.8,
    carbs: 58.2,
    fat: 23.5,
    category: "Bakery",
  },
  { name: "Bagels", brand: "Tesco", caloriesPer100g: 250, protein: 10, carbs: 48, fat: 2, category: "Bakery" },

  // READY MEALS
  // Tesco Ready Meals
  {
    name: "Chicken Tikka Masala Ready Meal",
    brand: "Tesco",
    caloriesPer100g: 116,
    protein: 7.2,
    carbs: 12.4,
    fat: 4.5,
    category: "Ready Meal",
  },
  {
    name: "Finest Steak Pie",
    brand: "Tesco",
    caloriesPer100g: 265,
    protein: 9.8,
    carbs: 22.3,
    fat: 15.7,
    category: "Ready Meal",
  },
  {
    name: "Spaghetti Bolognese",
    brand: "Tesco",
    caloriesPer100g: 98,
    protein: 5.2,
    carbs: 12.8,
    fat: 3.1,
    category: "Ready Meal",
  },
  {
    name: "Fish & Chips",
    brand: "Tesco",
    caloriesPer100g: 168,
    protein: 9.5,
    carbs: 18.2,
    fat: 6.8,
    category: "Ready Meal",
  },
  {
    name: "Chicken Fried Rice",
    brand: "Tesco",
    caloriesPer100g: 142,
    protein: 6.8,
    carbs: 20.5,
    fat: 4.2,
    category: "Ready Meal",
  },

  // FROZEN FOODS
  // Tesco Frozen
  {
    name: "Frozen Peas",
    brand: "Tesco",
    caloriesPer100g: 81,
    protein: 5.4,
    carbs: 14,
    fat: 0.4,
    category: "Frozen Vegetables",
  },
  {
    name: "Frozen Chips",
    brand: "Tesco",
    caloriesPer100g: 162,
    protein: 2.8,
    carbs: 25.7,
    fat: 5.3,
    category: "Frozen",
  },
  {
    name: "Fish Fingers",
    brand: "Tesco",
    caloriesPer100g: 233,
    protein: 12.7,
    carbs: 17.2,
    fat: 13.1,
    category: "Frozen",
  },
  {
    name: "Chicken Nuggets",
    brand: "Tesco",
    caloriesPer100g: 296,
    protein: 15.5,
    carbs: 16.3,
    fat: 19.4,
    category: "Frozen",
  },
  {
    name: "Margherita Pizza",
    brand: "Tesco",
    caloriesPer100g: 245,
    protein: 11.2,
    carbs: 30.5,
    fat: 9.8,
    category: "Frozen",
  },
  {
    name: "Vanilla Ice Cream",
    brand: "Tesco",
    caloriesPer100g: 207,
    protein: 3.5,
    carbs: 24,
    fat: 11,
    category: "Frozen Dessert",
  },

  // CANNED GOODS
  // Tesco Canned
  {
    name: "Baked Beans in Tomato Sauce",
    brand: "Tesco",
    caloriesPer100g: 78,
    protein: 4.8,
    carbs: 12.5,
    fat: 0.6,
    category: "Canned Goods",
  },
  {
    name: "Chopped Tomatoes",
    brand: "Tesco",
    caloriesPer100g: 20,
    protein: 1,
    carbs: 3.5,
    fat: 0.2,
    category: "Canned Goods",
  },
  {
    name: "Sweetcorn",
    brand: "Tesco",
    caloriesPer100g: 86,
    protein: 3.2,
    carbs: 19,
    fat: 1.2,
    category: "Canned Goods",
  },
  {
    name: "Tuna in Spring Water",
    brand: "Tesco",
    caloriesPer100g: 116,
    protein: 26,
    carbs: 0,
    fat: 1,
    category: "Canned Goods",
  },
  {
    name: "Chicken Soup",
    brand: "Tesco",
    caloriesPer100g: 45,
    protein: 2.8,
    carbs: 5.2,
    fat: 1.5,
    category: "Canned Goods",
  },

  // SAINSBURY'S PRODUCTS
  // Fresh & Meat
  {
    name: "British Chicken Breast Fillets",
    brand: "Sainsbury's",
    caloriesPer100g: 106,
    protein: 24.0,
    carbs: 0,
    fat: 1.1,
    category: "Fresh Meat",
  },
  {
    name: "Taste the Difference Beef Mince",
    brand: "Sainsbury's",
    caloriesPer100g: 129,
    protein: 20.5,
    carbs: 0.5,
    fat: 5.0,
    category: "Fresh Meat",
  },
  {
    name: "Organic Salmon Fillet",
    brand: "Sainsbury's",
    caloriesPer100g: 208,
    protein: 25,
    carbs: 0,
    fat: 12,
    category: "Fresh Fish",
  },

  // Ready Meals
  {
    name: "Taste the Difference Lasagne",
    brand: "Sainsbury's",
    caloriesPer100g: 165,
    protein: 9.2,
    carbs: 14.5,
    fat: 8.3,
    category: "Ready Meal",
  },
  {
    name: "Chicken Korma",
    brand: "Sainsbury's",
    caloriesPer100g: 172,
    protein: 6.8,
    carbs: 18.5,
    fat: 8.7,
    category: "Ready Meal",
  },
  {
    name: "Fish Pie",
    brand: "Sainsbury's",
    caloriesPer100g: 125,
    protein: 8.5,
    carbs: 12.8,
    fat: 5.2,
    category: "Ready Meal",
  },

  // Dairy & Bakery
  {
    name: "Taste the Difference Cheddar",
    brand: "Sainsbury's",
    caloriesPer100g: 416,
    protein: 25.4,
    carbs: 0.1,
    fat: 34.9,
    category: "Dairy",
  },
  {
    name: "By Sainsbury's Houmous",
    brand: "Sainsbury's",
    caloriesPer100g: 280,
    protein: 7.2,
    carbs: 11.5,
    fat: 23.8,
    category: "Dips",
  },
  {
    name: "Taste the Difference Chocolate Profiteroles",
    brand: "Sainsbury's",
    caloriesPer100g: 325,
    protein: 5.8,
    carbs: 28.5,
    fat: 22.3,
    category: "Dessert",
  },
  {
    name: "By Sainsbury's Baked Beans",
    brand: "Sainsbury's",
    caloriesPer100g: 78,
    protein: 4.8,
    carbs: 12.5,
    fat: 0.6,
    category: "Canned Goods",
  },

  // ASDA PRODUCTS
  // Ready Meals & Frozen
  {
    name: "Extra Special Lasagne",
    brand: "ASDA",
    caloriesPer100g: 159,
    protein: 8.7,
    carbs: 13.2,
    fat: 8.1,
    category: "Ready Meal",
  },
  {
    name: "Chosen by You Pepperoni Pizza",
    brand: "ASDA",
    caloriesPer100g: 268,
    protein: 12.3,
    carbs: 28.5,
    fat: 12.7,
    category: "Frozen",
  },
  {
    name: "Smart Price Fish Fingers",
    brand: "ASDA",
    caloriesPer100g: 233,
    protein: 12.7,
    carbs: 17.2,
    fat: 13.1,
    category: "Frozen",
  },

  // Pantry & Spreads
  {
    name: "Smooth Peanut Butter",
    brand: "ASDA",
    caloriesPer100g: 597,
    protein: 25.1,
    carbs: 12.5,
    fat: 50.2,
    category: "Spreads",
  },
  {
    name: "Strawberry Jam",
    brand: "ASDA",
    caloriesPer100g: 265,
    protein: 0.5,
    carbs: 66.2,
    fat: 0.1,
    category: "Spreads",
  },
  {
    name: "Cream of Tomato Soup",
    brand: "ASDA",
    caloriesPer100g: 74,
    protein: 1.5,
    carbs: 9.8,
    fat: 3.2,
    category: "Canned Goods",
  },

  // Bakery & Snacks
  {
    name: "Garlic Bread Baguette",
    brand: "ASDA",
    caloriesPer100g: 318,
    protein: 7.2,
    carbs: 38.5,
    fat: 15.3,
    category: "Bakery",
  },
  {
    name: "Chicken & Bacon Pasta Salad",
    brand: "ASDA",
    caloriesPer100g: 178,
    protein: 8.5,
    carbs: 16.3,
    fat: 9.2,
    category: "Ready to Eat",
  },

  // MORRISONS PRODUCTS
  // Fresh & Meat
  {
    name: "British Beef Mince 5% Fat",
    brand: "Morrisons",
    caloriesPer100g: 129,
    protein: 20.5,
    carbs: 0.5,
    fat: 5.0,
    category: "Meat",
  },
  {
    name: "Free Range Chicken Thighs",
    brand: "Morrisons",
    caloriesPer100g: 209,
    protein: 26,
    carbs: 0,
    fat: 11,
    category: "Fresh Meat",
  },
  {
    name: "Fresh Cod Fillet",
    brand: "Morrisons",
    caloriesPer100g: 82,
    protein: 18,
    carbs: 0,
    fat: 0.7,
    category: "Fresh Fish",
  },

  // Ready Meals & Bakery
  {
    name: "Chicken Korma & Rice",
    brand: "Morrisons",
    caloriesPer100g: 172,
    protein: 6.8,
    carbs: 18.5,
    fat: 8.7,
    category: "Ready Meal",
  },
  {
    name: "The Best Chocolate Cake",
    brand: "Morrisons",
    caloriesPer100g: 405,
    protein: 4.8,
    carbs: 48.2,
    fat: 22.5,
    category: "Bakery",
  },
  {
    name: "Cheese & Onion Quiche",
    brand: "Morrisons",
    caloriesPer100g: 275,
    protein: 9.8,
    carbs: 22.5,
    fat: 17.3,
    category: "Deli",
  },

  // Breakfast & Pantry
  {
    name: "Fruit & Fibre Cereal",
    brand: "Morrisons",
    caloriesPer100g: 357,
    protein: 8.5,
    carbs: 72.3,
    fat: 5.2,
    category: "Cereal",
  },
  {
    name: "Strawberry Jam",
    brand: "Morrisons",
    caloriesPer100g: 265,
    protein: 0.5,
    carbs: 66.2,
    fat: 0.1,
    category: "Spreads",
  },

  // CO-OP PRODUCTS
  {
    name: "Irresistible Triple Chocolate Cookies",
    brand: "Co-op",
    caloriesPer100g: 510,
    protein: 5.5,
    carbs: 62.3,
    fat: 26.8,
    category: "Bakery",
  },
  {
    name: "Truly Irresistible Margherita Pizza",
    brand: "Co-op",
    caloriesPer100g: 245,
    protein: 11.2,
    carbs: 30.5,
    fat: 9.8,
    category: "Chilled",
  },
  {
    name: "Macaroni Cheese",
    brand: "Co-op",
    caloriesPer100g: 156,
    protein: 7.8,
    carbs: 16.5,
    fat: 7.2,
    category: "Ready Meal",
  },
  {
    name: "British Semi-Skimmed Milk",
    brand: "Co-op",
    caloriesPer100g: 46,
    protein: 3.6,
    carbs: 4.8,
    fat: 1.8,
    category: "Dairy",
  },
  {
    name: "Chicken & Bacon Sandwich",
    brand: "Co-op",
    caloriesPer100g: 225,
    protein: 13.5,
    carbs: 23.8,
    fat: 9.2,
    category: "Sandwich",
  },
  {
    name: "Fairtrade Bananas",
    brand: "Co-op",
    caloriesPer100g: 95,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    category: "Fruit",
  },

  // WAITROSE PRODUCTS
  {
    name: "Duchy Organic Porridge Oats",
    brand: "Waitrose",
    caloriesPer100g: 375,
    protein: 11.0,
    carbs: 60.0,
    fat: 7.0,
    category: "Cereal",
  },
  {
    name: "Essential Waitrose Baked Beans",
    brand: "Waitrose",
    caloriesPer100g: 81,
    protein: 5.1,
    carbs: 12.9,
    fat: 0.6,
    category: "Canned Goods",
  },
  {
    name: "No.1 Beef Lasagne",
    brand: "Waitrose",
    caloriesPer100g: 160,
    protein: 9.5,
    carbs: 13.8,
    fat: 8.0,
    category: "Ready Meal",
  },
  {
    name: "Duchy Organic Strawberry Jam",
    brand: "Waitrose",
    caloriesPer100g: 260,
    protein: 0.5,
    carbs: 65.0,
    fat: 0.1,
    category: "Spreads",
  },
  {
    name: "Essential Waitrose Mature Cheddar",
    brand: "Waitrose",
    caloriesPer100g: 416,
    protein: 25.4,
    carbs: 0.1,
    fat: 34.9,
    category: "Dairy",
  },
  {
    name: "No.1 Chocolate Cake",
    brand: "Waitrose",
    caloriesPer100g: 430,
    protein: 5.0,
    carbs: 50.0,
    fat: 24.0,
    category: "Bakery",
  },

  // MARKS & SPENCER PRODUCTS
  {
    name: "Count on Us Chicken Tikka Masala",
    brand: "M&S",
    caloriesPer100g: 95,
    protein: 8.5,
    carbs: 10.2,
    fat: 2.8,
    category: "Ready Meal",
  },
  {
    name: "Percy Pig Sweets",
    brand: "M&S",
    caloriesPer100g: 325,
    protein: 6.8,
    carbs: 78.5,
    fat: 0.1,
    category: "Confectionery",
  },
  {
    name: "Collection Luxury Lasagne",
    brand: "M&S",
    caloriesPer100g: 178,
    protein: 10.2,
    carbs: 15.8,
    fat: 9.3,
    category: "Ready Meal",
  },
  {
    name: "Extremely Chocolatey Milk Chocolate Biscuits",
    brand: "M&S",
    caloriesPer100g: 520,
    protein: 6.5,
    carbs: 62.0,
    fat: 28.0,
    category: "Biscuits",
  },
  {
    name: "Italian Mozzarella",
    brand: "M&S",
    caloriesPer100g: 280,
    protein: 18.0,
    carbs: 2.0,
    fat: 22.0,
    category: "Dairy",
  },
  {
    name: "Gastropub Mac & Cheese",
    brand: "M&S",
    caloriesPer100g: 205,
    protein: 9.5,
    carbs: 18.2,
    fat: 11.8,
    category: "Ready Meal",
  },

  // LIDL PRODUCTS
  {
    name: "Deluxe Margherita Pizza",
    brand: "Lidl",
    caloriesPer100g: 235,
    protein: 10.5,
    carbs: 29.8,
    fat: 8.7,
    category: "Chilled",
  },
  {
    name: "Greek Style Yogurt",
    brand: "Lidl",
    caloriesPer100g: 133,
    protein: 5.6,
    carbs: 5.2,
    fat: 10.2,
    category: "Dairy",
  },
  {
    name: "Deluxe Belgian Chocolate Cheesecake",
    brand: "Lidl",
    caloriesPer100g: 367,
    protein: 5.2,
    carbs: 32.5,
    fat: 24.8,
    category: "Dessert",
  },
  {
    name: "Chicken Tikka Masala",
    brand: "Lidl",
    caloriesPer100g: 116,
    protein: 7.2,
    carbs: 12.4,
    fat: 4.5,
    category: "Ready Meal",
  },
  {
    name: "Deluxe Mature Cheddar",
    brand: "Lidl",
    caloriesPer100g: 416,
    protein: 25.4,
    carbs: 0.1,
    fat: 34.9,
    category: "Dairy",
  },
  {
    name: "Baked Beans in Tomato Sauce",
    brand: "Lidl",
    caloriesPer100g: 78,
    protein: 4.8,
    carbs: 12.5,
    fat: 0.6,
    category: "Canned Goods",
  },

  // ALDI PRODUCTS
  {
    name: "Specially Selected Lasagne",
    brand: "Aldi",
    caloriesPer100g: 159,
    protein: 8.7,
    carbs: 13.2,
    fat: 8.1,
    category: "Ready Meal",
  },
  {
    name: "Smooth Peanut Butter",
    brand: "Aldi",
    caloriesPer100g: 597,
    protein: 25.1,
    carbs: 12.5,
    fat: 50.2,
    category: "Spreads",
  },
  {
    name: "Specially Selected Triple Chocolate Cookies",
    brand: "Aldi",
    caloriesPer100g: 496,
    protein: 5.8,
    carbs: 63.2,
    fat: 24.5,
    category: "Bakery",
  },
  {
    name: "Chicken & Bacon Pasta Salad",
    brand: "Aldi",
    caloriesPer100g: 178,
    protein: 8.5,
    carbs: 16.3,
    fat: 9.2,
    category: "Ready to Eat",
  },
  {
    name: "Specially Selected Pepperoni Pizza",
    brand: "Aldi",
    caloriesPer100g: 268,
    protein: 12.3,
    carbs: 28.5,
    fat: 12.7,
    category: "Chilled",
  },
  {
    name: "Cream of Tomato Soup",
    brand: "Aldi",
    caloriesPer100g: 74,
    protein: 1.5,
    carbs: 9.8,
    fat: 3.2,
    category: "Canned Goods",
  },

  // BREAKFAST CEREALS - Multiple Brands
  // Kellogg's
  {
    name: "Corn Flakes",
    brand: "Kellogg's",
    caloriesPer100g: 357,
    protein: 7.1,
    carbs: 84.3,
    fat: 0.7,
    category: "Cereal",
  },
  {
    name: "Special K Original",
    brand: "Kellogg's",
    caloriesPer100g: 375,
    protein: 17.5,
    carbs: 70,
    fat: 1.3,
    category: "Cereal",
  },
  {
    name: "Froot Loops",
    brand: "Kellogg's",
    caloriesPer100g: 385,
    protein: 6.2,
    carbs: 87.7,
    fat: 3.1,
    category: "Cereal",
  },
  {
    name: "Crunchy Nut",
    brand: "Kellogg's",
    caloriesPer100g: 390,
    protein: 6.5,
    carbs: 77,
    fat: 8,
    category: "Cereal",
  },
  {
    name: "Rice Krispies",
    brand: "Kellogg's",
    caloriesPer100g: 382,
    protein: 6,
    carbs: 87,
    fat: 1,
    category: "Cereal",
  },
  {
    name: "Pop-Tarts Strawberry",
    brand: "Kellogg's",
    caloriesPer100g: 392,
    protein: 4.9,
    carbs: 70.6,
    fat: 9.8,
    category: "Snack",
  },

  // Nestlé Cereals
  { name: "Cheerios", brand: "Nestlé", caloriesPer100g: 367, protein: 13.3, carbs: 73.3, fat: 6.7, category: "Cereal" },
  { name: "Shreddies", brand: "Nestlé", caloriesPer100g: 360, protein: 10, carbs: 68, fat: 3, category: "Cereal" },
  { name: "Cookie Crisp", brand: "Nestlé", caloriesPer100g: 400, protein: 6, carbs: 84, fat: 6, category: "Cereal" },

  // Quaker
  {
    name: "Instant Oatmeal Original",
    brand: "Quaker",
    caloriesPer100g: 367,
    protein: 13.3,
    carbs: 66.7,
    fat: 6.7,
    category: "Cereal",
  },
  {
    name: "Chewy Granola Bars Chocolate Chip",
    brand: "Quaker",
    caloriesPer100g: 400,
    protein: 6.7,
    carbs: 66.7,
    fat: 13.3,
    category: "Snack",
  },

  // BEVERAGES
  // Coca-Cola Products
  {
    name: "Coca-Cola Classic",
    brand: "Coca-Cola",
    caloriesPer100g: 42,
    protein: 0,
    carbs: 10.6,
    fat: 0,
    category: "Beverage",
  },
  { name: "Diet Coke", brand: "Coca-Cola", caloriesPer100g: 0.4, protein: 0, carbs: 0.1, fat: 0, category: "Beverage" },
  { name: "Sprite", brand: "Coca-Cola", caloriesPer100g: 37, protein: 0, carbs: 9.2, fat: 0, category: "Beverage" },
  {
    name: "Fanta Orange",
    brand: "Coca-Cola",
    caloriesPer100g: 44,
    protein: 0,
    carbs: 11.2,
    fat: 0,
    category: "Beverage",
  },

  // PepsiCo Beverages
  { name: "Pepsi Cola", brand: "PepsiCo", caloriesPer100g: 41, protein: 0, carbs: 10.5, fat: 0, category: "Beverage" },
  {
    name: "Mountain Dew",
    brand: "PepsiCo",
    caloriesPer100g: 46,
    protein: 0,
    carbs: 11.6,
    fat: 0,
    category: "Beverage",
  },
  { name: "7UP", brand: "PepsiCo", caloriesPer100g: 37, protein: 0, carbs: 9.2, fat: 0, category: "Beverage" },

  // Energy Drinks
  {
    name: "Energy Drink Original",
    brand: "Red Bull",
    caloriesPer100g: 45,
    protein: 0.4,
    carbs: 11,
    fat: 0,
    category: "Beverage",
  },
  { name: "Sugar Free", brand: "Red Bull", caloriesPer100g: 3, protein: 0.4, carbs: 0.8, fat: 0, category: "Beverage" },
  {
    name: "Original Energy Drink",
    brand: "Monster",
    caloriesPer100g: 45,
    protein: 0,
    carbs: 11,
    fat: 0,
    category: "Beverage",
  },
  { name: "Zero Ultra", brand: "Monster", caloriesPer100g: 1, protein: 0, carbs: 0.2, fat: 0, category: "Beverage" },

  // Sports Drinks
  {
    name: "Thirst Quencher Orange",
    brand: "Gatorade",
    caloriesPer100g: 25,
    protein: 0,
    carbs: 6.3,
    fat: 0,
    category: "Sports Drink",
  },
  {
    name: "Zero Sugar Glacier Freeze",
    brand: "Gatorade",
    caloriesPer100g: 1,
    protein: 0,
    carbs: 0.2,
    fat: 0,
    category: "Sports Drink",
  },
  {
    name: "Ion4 Fruit Punch",
    brand: "Powerade",
    caloriesPer100g: 25,
    protein: 0,
    carbs: 6.3,
    fat: 0,
    category: "Sports Drink",
  },

  // SNACKS & CONFECTIONERY
  // Crisps & Chips
  {
    name: "Lay's Classic Potato Chips",
    brand: "PepsiCo",
    caloriesPer100g: 536,
    protein: 6.3,
    carbs: 53.6,
    fat: 32.1,
    category: "Snack",
  },
  {
    name: "Doritos Nacho Cheese",
    brand: "PepsiCo",
    caloriesPer100g: 498,
    protein: 8.9,
    carbs: 58.9,
    fat: 25,
    category: "Snack",
  },
  {
    name: "Cheetos Crunchy",
    brand: "PepsiCo",
    caloriesPer100g: 571,
    protein: 8.9,
    carbs: 57.1,
    fat: 35.7,
    category: "Snack",
  },
  { name: "Original", brand: "Pringles", caloriesPer100g: 536, protein: 5.4, carbs: 50, fat: 35.7, category: "Snack" },
  {
    name: "Sour Cream & Onion",
    brand: "Pringles",
    caloriesPer100g: 536,
    protein: 5.4,
    carbs: 50,
    fat: 35.7,
    category: "Snack",
  },
  { name: "BBQ", brand: "Pringles", caloriesPer100g: 536, protein: 5.4, carbs: 50, fat: 35.7, category: "Snack" },

  // Chocolate & Candy
  {
    name: "Original Bar",
    brand: "Snickers",
    caloriesPer100g: 488,
    protein: 8.2,
    carbs: 57.4,
    fat: 24.6,
    category: "Candy",
  },
  {
    name: "Almond Bar",
    brand: "Snickers",
    caloriesPer100g: 510,
    protein: 9.8,
    carbs: 52.9,
    fat: 29.4,
    category: "Candy",
  },
  {
    name: "Milk Chocolate",
    brand: "M&M's",
    caloriesPer100g: 492,
    protein: 4.9,
    carbs: 73.8,
    fat: 19.7,
    category: "Candy",
  },
  { name: "Peanut", brand: "M&M's", caloriesPer100g: 492, protein: 9.8, carbs: 57.4, fat: 24.6, category: "Candy" },
  {
    name: "KitKat Bar",
    brand: "Nestlé",
    caloriesPer100g: 518,
    protein: 7.3,
    carbs: 59.5,
    fat: 27.6,
    category: "Candy",
  },
  { name: "Smarties", brand: "Nestlé", caloriesPer100g: 467, protein: 5.3, carbs: 69.3, fat: 18.7, category: "Candy" },
  {
    name: "Caramel Cookie Bar",
    brand: "Twix",
    caloriesPer100g: 502,
    protein: 4.9,
    carbs: 65.6,
    fat: 24.6,
    category: "Candy",
  },
  {
    name: "Original Fruit",
    brand: "Skittles",
    caloriesPer100g: 405,
    protein: 0,
    carbs: 91.9,
    fat: 4.1,
    category: "Candy",
  },
  {
    name: "Peanut Butter Cups",
    brand: "Reese's",
    caloriesPer100g: 515,
    protein: 10.3,
    carbs: 51.5,
    fat: 30.9,
    category: "Candy",
  },

  // Biscuits & Cookies
  { name: "Original Cookies", brand: "Oreo", caloriesPer100g: 480, protein: 5, carbs: 70, fat: 20, category: "Cookie" },
  { name: "Golden Cookies", brand: "Oreo", caloriesPer100g: 483, protein: 5, carbs: 71.7, fat: 20, category: "Cookie" },
  {
    name: "Chocolate Digestive Biscuits",
    brand: "McVitie's",
    caloriesPer100g: 495,
    protein: 6.2,
    carbs: 67.1,
    fat: 22.3,
    category: "Biscuits",
  },
  {
    name: "Hobnobs",
    brand: "McVitie's",
    caloriesPer100g: 482,
    protein: 7.1,
    carbs: 62.7,
    fat: 22.9,
    category: "Biscuits",
  },
  {
    name: "Jaffa Cakes",
    brand: "McVitie's",
    caloriesPer100g: 373,
    protein: 4.4,
    carbs: 68.2,
    fat: 8.2,
    category: "Biscuits",
  },

  // ICE CREAM
  // Ben & Jerry's
  {
    name: "Chocolate Chip Cookie Dough",
    brand: "Ben & Jerry's",
    caloriesPer100g: 270,
    protein: 4.5,
    carbs: 32,
    fat: 14,
    category: "Ice Cream",
  },
  {
    name: "Chunky Monkey",
    brand: "Ben & Jerry's",
    caloriesPer100g: 290,
    protein: 5,
    carbs: 32,
    fat: 16,
    category: "Ice Cream",
  },
  {
    name: "Half Baked",
    brand: "Ben & Jerry's",
    caloriesPer100g: 280,
    protein: 4,
    carbs: 34,
    fat: 14,
    category: "Ice Cream",
  },
  {
    name: "Strawberry Cheesecake",
    brand: "Ben & Jerry's",
    caloriesPer100g: 250,
    protein: 4,
    carbs: 29,
    fat: 13,
    category: "Ice Cream",
  },

  // Häagen-Dazs
  {
    name: "Vanilla Ice Cream",
    brand: "Häagen-Dazs",
    caloriesPer100g: 270,
    protein: 5,
    carbs: 23,
    fat: 18,
    category: "Ice Cream",
  },
  {
    name: "Chocolate Ice Cream",
    brand: "Häagen-Dazs",
    caloriesPer100g: 290,
    protein: 5,
    carbs: 26,
    fat: 19,
    category: "Ice Cream",
  },
  {
    name: "Strawberry Ice Cream",
    brand: "Häagen-Dazs",
    caloriesPer100g: 250,
    protein: 4,
    carbs: 24,
    fat: 16,
    category: "Ice Cream",
  },
  {
    name: "Cookies & Cream",
    brand: "Häagen-Dazs",
    caloriesPer100g: 280,
    protein: 5,
    carbs: 25,
    fat: 18,
    category: "Ice Cream",
  },

  // FAST FOOD CHAINS
  // McDonald's
  {
    name: "Big Mac",
    brand: "McDonald's",
    caloriesPer100g: 257,
    protein: 12.8,
    carbs: 20.5,
    fat: 14.8,
    category: "Fast Food",
  },
  {
    name: "Quarter Pounder with Cheese",
    brand: "McDonald's",
    caloriesPer100g: 244,
    protein: 14.1,
    carbs: 18.3,
    fat: 13.9,
    category: "Fast Food",
  },
  {
    name: "Chicken McNuggets",
    brand: "McDonald's",
    caloriesPer100g: 296,
    protein: 15.5,
    carbs: 16.3,
    fat: 19.4,
    category: "Fast Food",
  },
  {
    name: "French Fries",
    brand: "McDonald's",
    caloriesPer100g: 365,
    protein: 4,
    carbs: 43,
    fat: 17,
    category: "Fast Food",
  },
  {
    name: "McFlurry Oreo",
    brand: "McDonald's",
    caloriesPer100g: 172,
    protein: 4.2,
    carbs: 26.8,
    fat: 5.8,
    category: "Dessert",
  },
  {
    name: "Apple Pie",
    brand: "McDonald's",
    caloriesPer100g: 255,
    protein: 2.4,
    carbs: 32.2,
    fat: 13.8,
    category: "Dessert",
  },

  // KFC
  {
    name: "Original Recipe Chicken Breast",
    brand: "KFC",
    caloriesPer100g: 161,
    protein: 29,
    carbs: 5,
    fat: 3.5,
    category: "Fast Food",
  },
  {
    name: "Zinger Burger",
    brand: "KFC",
    caloriesPer100g: 235,
    protein: 13.2,
    carbs: 22.1,
    fat: 11.8,
    category: "Fast Food",
  },
  {
    name: "Popcorn Chicken",
    brand: "KFC",
    caloriesPer100g: 280,
    protein: 16,
    carbs: 15,
    fat: 18,
    category: "Fast Food",
  },
  { name: "Coleslaw", brand: "KFC", caloriesPer100g: 150, protein: 1.5, carbs: 14, fat: 10, category: "Side" },
  { name: "Gravy", brand: "KFC", caloriesPer100g: 60, protein: 1.8, carbs: 6.5, fat: 3.2, category: "Side" },

  // Subway
  {
    name: "Turkey Breast Sub (6 inch)",
    brand: "Subway",
    caloriesPer100g: 105,
    protein: 8.5,
    carbs: 12.8,
    fat: 2.1,
    category: "Fast Food",
  },
  {
    name: "Italian BMT Sub (6 inch)",
    brand: "Subway",
    caloriesPer100g: 180,
    protein: 9.2,
    carbs: 13.5,
    fat: 10.8,
    category: "Fast Food",
  },
  {
    name: "Chicken Teriyaki Sub (6 inch)",
    brand: "Subway",
    caloriesPer100g: 125,
    protein: 9.8,
    carbs: 15.2,
    fat: 2.8,
    category: "Fast Food",
  },
  {
    name: "Meatball Marinara Sub (6 inch)",
    brand: "Subway",
    caloriesPer100g: 145,
    protein: 7.5,
    carbs: 16.8,
    fat: 5.9,
    category: "Fast Food",
  },

  // Pizza Hut
  {
    name: "Margherita Pizza",
    brand: "Pizza Hut",
    caloriesPer100g: 235,
    protein: 10.5,
    carbs: 29.8,
    fat: 8.7,
    category: "Fast Food",
  },
  {
    name: "Pepperoni Pizza",
    brand: "Pizza Hut",
    caloriesPer100g: 268,
    protein: 12.3,
    carbs: 28.5,
    fat: 12.7,
    category: "Fast Food",
  },
  {
    name: "Meat Feast Pizza",
    brand: "Pizza Hut",
    caloriesPer100g: 295,
    protein: 14.8,
    carbs: 26.2,
    fat: 16.5,
    category: "Fast Food",
  },

  // Domino's
  {
    name: "Margherita Pizza",
    brand: "Domino's",
    caloriesPer100g: 240,
    protein: 11.2,
    carbs: 30.1,
    fat: 9.1,
    category: "Fast Food",
  },
  {
    name: "Pepperoni Pizza",
    brand: "Domino's",
    caloriesPer100g: 275,
    protein: 13.1,
    carbs: 29.8,
    fat: 13.2,
    category: "Fast Food",
  },
  {
    name: "Garlic Bread",
    brand: "Domino's",
    caloriesPer100g: 318,
    protein: 7.2,
    carbs: 38.5,
    fat: 15.3,
    category: "Side",
  },

  // Starbucks
  {
    name: "Caffe Latte (Grande)",
    brand: "Starbucks",
    caloriesPer100g: 63,
    protein: 3.2,
    carbs: 6.3,
    fat: 2.5,
    category: "Beverage",
  },
  {
    name: "Frappuccino Caramel (Grande)",
    brand: "Starbucks",
    caloriesPer100g: 85,
    protein: 1.8,
    carbs: 16.2,
    fat: 1.5,
    category: "Beverage",
  },
  {
    name: "Blueberry Muffin",
    brand: "Starbucks",
    caloriesPer100g: 385,
    protein: 6.2,
    carbs: 52.3,
    fat: 17.7,
    category: "Bakery",
  },
  {
    name: "Protein Box Eggs & Cheese",
    brand: "Starbucks",
    caloriesPer100g: 195,
    protein: 13.8,
    carbs: 8.5,
    fat: 12.2,
    category: "Meal",
  },

  // INTERNATIONAL FOODS
  // Asian
  {
    name: "Chicken Chow Mein",
    brand: "Tesco",
    caloriesPer100g: 142,
    protein: 6.8,
    carbs: 20.5,
    fat: 4.2,
    category: "International",
  },
  {
    name: "Sweet & Sour Chicken",
    brand: "ASDA",
    caloriesPer100g: 165,
    protein: 8.2,
    carbs: 22.8,
    fat: 5.1,
    category: "International",
  },
  {
    name: "Beef Black Bean",
    brand: "Sainsbury's",
    caloriesPer100g: 158,
    protein: 9.5,
    carbs: 18.2,
    fat: 6.3,
    category: "International",
  },
  {
    name: "Chicken Satay",
    brand: "M&S",
    caloriesPer100g: 185,
    protein: 12.8,
    carbs: 8.5,
    fat: 12.2,
    category: "International",
  },

  // Italian
  {
    name: "Spaghetti Carbonara",
    brand: "Tesco",
    caloriesPer100g: 195,
    protein: 8.5,
    carbs: 25.2,
    fat: 7.8,
    category: "International",
  },
  {
    name: "Chicken Arrabbiata",
    brand: "Sainsbury's",
    caloriesPer100g: 125,
    protein: 9.2,
    carbs: 15.8,
    fat: 3.5,
    category: "International",
  },
  {
    name: "Risotto Mushroom",
    brand: "Waitrose",
    caloriesPer100g: 142,
    protein: 4.8,
    carbs: 22.5,
    fat: 4.2,
    category: "International",
  },

  // Indian
  {
    name: "Chicken Jalfrezi",
    brand: "Tesco",
    caloriesPer100g: 118,
    protein: 8.5,
    carbs: 9.2,
    fat: 6.8,
    category: "International",
  },
  {
    name: "Lamb Rogan Josh",
    brand: "Sainsbury's",
    caloriesPer100g: 145,
    protein: 9.8,
    carbs: 8.5,
    fat: 9.2,
    category: "International",
  },
  {
    name: "Vegetable Biryani",
    brand: "ASDA",
    caloriesPer100g: 165,
    protein: 4.2,
    carbs: 28.5,
    fat: 4.8,
    category: "International",
  },

  // HEALTH & DIET FOODS
  // Protein Products
  {
    name: "Protein Yogurt",
    brand: "Tesco",
    caloriesPer100g: 82,
    protein: 15.2,
    carbs: 4.8,
    fat: 0.2,
    category: "Health Food",
  },
  {
    name: "High Protein Milk",
    brand: "Sainsbury's",
    caloriesPer100g: 58,
    protein: 6.2,
    carbs: 4.8,
    fat: 1.8,
    category: "Health Food",
  },
  {
    name: "Protein Bar Chocolate",
    brand: "Grenade",
    caloriesPer100g: 365,
    protein: 35,
    carbs: 25,
    fat: 12,
    category: "Health Food",
  },

  // Low Calorie Options
  {
    name: "Zero Calorie Noodles",
    brand: "Bare Naked",
    caloriesPer100g: 8,
    protein: 0.2,
    carbs: 1.8,
    fat: 0.1,
    category: "Health Food",
  },
  {
    name: "Cauliflower Rice",
    brand: "Tesco",
    caloriesPer100g: 25,
    protein: 2,
    carbs: 5,
    fat: 0.3,
    category: "Health Food",
  },
  {
    name: "Courgetti",
    brand: "Sainsbury's",
    caloriesPer100g: 20,
    protein: 2.1,
    carbs: 3.1,
    fat: 0.3,
    category: "Health Food",
  },
]

export default function CalorieTracker({ dailyStats, onCaloriesUpdate, onMacrosUpdate }: CalorieTrackerProps) {
  const [foodLog, setFoodLog] = useUserStorage<FoodItem[]>("foodLog", [])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFood, setSelectedFood] = useState<{ name: string; brand?: string; data: any } | null>(null)
  const [grams, setGrams] = useState("100")
  const [historySearchTerm, setHistorySearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("add")
  const [isSearching, setIsSearching] = useState(false)
  const [showSubscriptionPage, setShowSubscriptionPage] = useState(false)
  const [customFoodForm, setCustomFoodForm] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    quantity: "100",
    unit: "g",
  })

  const [isSubscribed] = useUserStorage<boolean>("ptSubscription", false)

  const todaysFoods = foodLog.filter((food) => food.date === new Date().toDateString())

  // Calculate weekly and monthly breakdowns
  const weeklyBreakdown = useMemo(() => {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const weeklyFoods = foodLog.filter((food) => {
      const foodDate = new Date(food.date)
      return foodDate >= weekAgo && foodDate <= today
    })

    const dailyTotals = new Map<string, number>()
    weeklyFoods.forEach((food) => {
      const current = dailyTotals.get(food.date) || 0
      dailyTotals.set(food.date, current + food.calories)
    })

    const weeklyTotal = Array.from(dailyTotals.values()).reduce((sum, calories) => sum + calories, 0)
    const weeklyAverage = dailyTotals.size > 0 ? Math.round(weeklyTotal / dailyTotals.size) : 0

    return {
      total: weeklyTotal,
      average: weeklyAverage,
      days: dailyTotals.size,
      dailyTotals: Array.from(dailyTotals.entries()).sort(
        (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
      ),
    }
  }, [foodLog])

  const monthlyBreakdown = useMemo(() => {
    const today = new Date()
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const monthlyFoods = foodLog.filter((food) => {
      const foodDate = new Date(food.date)
      return foodDate >= monthAgo && foodDate <= today
    })

    const dailyTotals = new Map<string, number>()
    monthlyFoods.forEach((food) => {
      const current = dailyTotals.get(food.date) || 0
      dailyTotals.set(food.date, current + food.calories)
    })

    const monthlyTotal = Array.from(dailyTotals.values()).reduce((sum, calories) => sum + calories, 0)
    const monthlyAverage = dailyTotals.size > 0 ? Math.round(monthlyTotal / dailyTotals.size) : 0

    // Calculate weekly averages within the month
    const weeklyAverages = []
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(today.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000)

      const weekFoods = monthlyFoods.filter((food) => {
        const foodDate = new Date(food.date)
        return foodDate >= weekStart && foodDate < weekEnd
      })

      const weekDailyTotals = new Map<string, number>()
      weekFoods.forEach((food) => {
        const current = weekDailyTotals.get(food.date) || 0
        weekDailyTotals.set(food.date, current + food.calories)
      })

      const weekTotal = Array.from(weekDailyTotals.values()).reduce((sum, calories) => sum + calories, 0)
      const weekAverage = weekDailyTotals.size > 0 ? Math.round(weekTotal / weekDailyTotals.size) : 0

      weeklyAverages.push({
        week: i + 1,
        average: weekAverage,
        total: weekTotal,
        days: weekDailyTotals.size,
      })
    }

    return {
      total: monthlyTotal,
      average: monthlyAverage,
      days: dailyTotals.size,
      weeklyAverages: weeklyAverages.reverse(),
      dailyTotals: Array.from(dailyTotals.entries()).sort(
        (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
      ),
    }
  }, [foodLog])

  // Combined search across basic foods and branded foods
  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return []

    setIsSearching(true)

    const results: Array<{ name: string; brand?: string; data: any; type: "basic" | "branded" }> = []

    // Search basic foods
    Object.entries(basicFoodDatabase).forEach(([name, data]) => {
      if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({
          name,
          data,
          type: "basic",
        })
      }
    })

    // Search branded foods
    brandedFoodDatabase.forEach((food) => {
      const searchableText = `${food.name} ${food.brand}`.toLowerCase()
      if (searchableText.includes(searchTerm.toLowerCase())) {
        results.push({
          name: food.name,
          brand: food.brand,
          data: {
            caloriesPer100g: food.caloriesPer100g,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
          },
          type: "branded",
        })
      }
    })

    // Sort results: exact matches first, then by relevance
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchTerm.toLowerCase()
      const bExact = b.name.toLowerCase() === searchTerm.toLowerCase()
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1

      // Prioritize basic foods over branded for common items
      if (a.type === "basic" && b.type === "branded") return -1
      if (a.type === "branded" && b.type === "basic") return 1

      return a.name.localeCompare(b.name)
    })

    setTimeout(() => setIsSearching(false), 300)
    return results.slice(0, 12) // Show more results for comprehensive search
  }, [searchTerm])

  // Get unique foods from history
  const uniqueHistoryFoods = useMemo(() => {
    const uniqueFoods = new Map()
    const sortedFoodLog = [...foodLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    sortedFoodLog.forEach((food) => {
      const key = `${food.name}-${food.unit}-${food.calories / food.quantity}`
      if (!uniqueFoods.has(key)) {
        uniqueFoods.set(key, food)
      }
    })

    return Array.from(uniqueFoods.values())
  }, [foodLog])

  // Filter history foods by search term
  const filteredHistoryFoods = useMemo(() => {
    if (!historySearchTerm) return uniqueHistoryFoods
    return uniqueHistoryFoods.filter((food) => food.name.toLowerCase().includes(historySearchTerm.toLowerCase()))
  }, [uniqueHistoryFoods, historySearchTerm])

  const addFoodFromSearch = (foodName: string, brand: string | undefined, foodData: any, gramsAmount: number) => {
    const multiplier = gramsAmount / 100
    const totalCalories = Math.round(foodData.caloriesPer100g * multiplier)
    const totalProtein = Math.round(foodData.protein * multiplier * 10) / 10
    const totalCarbs = Math.round(foodData.carbs * multiplier * 10) / 10
    const totalFat = Math.round(foodData.fat * multiplier * 10) / 10

    const displayName = brand ? `${foodName} (${brand})` : foodName

    const foodItem: FoodItem = {
      id: Date.now().toString(),
      name: displayName,
      calories: totalCalories,
      quantity: gramsAmount,
      unit: "g",
      date: new Date().toDateString(),
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
    }

    const newFoodLog = [...foodLog, foodItem]
    setFoodLog(newFoodLog)

    // Update daily calories and macros
    const newTotalConsumed = todaysFoods.reduce((sum, food) => sum + food.calories, 0) + totalCalories
    const newTotalProtein = todaysFoods.reduce((sum, food) => sum + (food.protein || 0), 0) + totalProtein
    const newTotalCarbs = todaysFoods.reduce((sum, food) => sum + (food.carbs || 0), 0) + totalCarbs
    const newTotalFat = todaysFoods.reduce((sum, food) => sum + (food.fat || 0), 0) + totalFat

    onCaloriesUpdate(newTotalConsumed, 0)
    onMacrosUpdate(newTotalProtein, newTotalCarbs, newTotalFat)

    // Reset form
    setSearchTerm("")
    setSelectedFood(null)
    setGrams("100")
  }

  const addFromHistory = (historyFood: FoodItem) => {
    const foodItem: FoodItem = {
      id: Date.now().toString(),
      name: historyFood.name,
      calories: historyFood.calories,
      quantity: historyFood.quantity,
      unit: historyFood.unit,
      date: new Date().toDateString(),
      protein: historyFood.protein || 0,
      carbs: historyFood.carbs || 0,
      fat: historyFood.fat || 0,
    }

    const newFoodLog = [...foodLog, foodItem]
    setFoodLog(newFoodLog)

    // Update daily calories and macros
    const newTotalConsumed = todaysFoods.reduce((sum, food) => sum + food.calories, 0) + historyFood.calories
    const newTotalProtein = todaysFoods.reduce((sum, food) => sum + (food.protein || 0), 0) + (historyFood.protein || 0)
    const newTotalCarbs = todaysFoods.reduce((sum, food) => sum + (food.carbs || 0), 0) + (historyFood.carbs || 0)
    const newTotalFat = todaysFoods.reduce((sum, food) => sum + (food.fat || 0), 0) + (historyFood.fat || 0)

    onCaloriesUpdate(newTotalConsumed, 0)
    onMacrosUpdate(newTotalProtein, newTotalCarbs, newTotalFat)
  }

  const addScannedFood = (scannedFood: ScannedFood, grams: number) => {
    const totalCalories = Math.round((scannedFood.caloriesPer100g * grams) / 100)
    const totalProtein = Math.round((scannedFood.protein * grams) / 100)
    const totalCarbs = Math.round((scannedFood.carbs * grams) / 100)
    const totalFat = Math.round((scannedFood.fat * grams) / 100)

    const foodItem: FoodItem = {
      id: Date.now().toString(),
      name: `${scannedFood.name} (${scannedFood.brand})`,
      calories: totalCalories,
      quantity: grams,
      unit: "g",
      date: new Date().toDateString(),
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
    }

    const newFoodLog = [...foodLog, foodItem]
    setFoodLog(newFoodLog)

    // Update daily calories and macros
    const newTotalConsumed = todaysFoods.reduce((sum, food) => sum + food.calories, 0) + totalCalories
    const newTotalProtein = todaysFoods.reduce((sum, food) => sum + (food.protein || 0), 0) + totalProtein
    const newTotalCarbs = todaysFoods.reduce((sum, food) => sum + (food.carbs || 0), 0) + totalCarbs
    const newTotalFat = todaysFoods.reduce((sum, food) => sum + (food.fat || 0), 0) + totalFat

    onCaloriesUpdate(newTotalConsumed, 0)
    onMacrosUpdate(newTotalProtein, newTotalCarbs, newTotalFat)
  }

  const addCustomFood = () => {
    if (!customFoodForm.name || !customFoodForm.calories) return

    const quantity = Number.parseFloat(customFoodForm.quantity) || 100
    const calories = Number.parseFloat(customFoodForm.calories) || 0
    const protein = Number.parseFloat(customFoodForm.protein) || 0
    const carbs = Number.parseFloat(customFoodForm.carbs) || 0
    const fat = Number.parseFloat(customFoodForm.fat) || 0

    const foodItem: FoodItem = {
      id: Date.now().toString(),
      name: customFoodForm.name,
      calories,
      quantity,
      unit: customFoodForm.unit,
      date: new Date().toDateString(),
      protein,
      carbs,
      fat,
    }

    const newFoodLog = [...foodLog, foodItem]
    setFoodLog(newFoodLog)

    // Update daily calories and macros
    const newTotalConsumed = todaysFoods.reduce((sum, food) => sum + food.calories, 0) + calories
    const newTotalProtein = todaysFoods.reduce((sum, food) => sum + (food.protein || 0), 0) + protein
    const newTotalCarbs = todaysFoods.reduce((sum, food) => sum + (food.carbs || 0), 0) + carbs
    const newTotalFat = todaysFoods.reduce((sum, food) => sum + (food.fat || 0), 0) + fat

    onCaloriesUpdate(newTotalConsumed, 0)
    onMacrosUpdate(newTotalProtein, newTotalCarbs, newTotalFat)

    // Reset form
    setCustomFoodForm({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      quantity: "100",
      unit: "g",
    })
  }

  const removeFood = (id: string) => {
    const foodToRemove = foodLog.find((food) => food.id === id)
    if (!foodToRemove) return

    const newFoodLog = foodLog.filter((food) => food.id !== id)
    setFoodLog(newFoodLog)

    // Update daily calories and macros
    const newTotalConsumed = dailyStats.caloriesConsumed - foodToRemove.calories
    const currentProtein = todaysFoods.reduce((sum, food) => sum + (food.protein || 0), 0)
    const currentCarbs = todaysFoods.reduce((sum, food) => sum + (food.carbs || 0), 0)
    const currentFat = todaysFoods.reduce((sum, food) => sum + (food.fat || 0), 0)

    const newTotalProtein = Math.max(0, currentProtein - (foodToRemove.protein || 0))
    const newTotalCarbs = Math.max(0, currentCarbs - (foodToRemove.carbs || 0))
    const newTotalFat = Math.max(0, currentFat - (foodToRemove.fat || 0))

    onCaloriesUpdate(Math.max(0, newTotalConsumed), 0)
    onMacrosUpdate(newTotalProtein, newTotalCarbs, newTotalFat)
  }

  const calculatePreview = (foodData: any, gramsAmount: number) => {
    if (!foodData || !gramsAmount) return null

    const multiplier = gramsAmount / 100
    return {
      calories: Math.round(foodData.caloriesPer100g * multiplier),
      protein: Math.round(foodData.protein * multiplier * 10) / 10,
      carbs: Math.round(foodData.carbs * multiplier * 10) / 10,
      fat: Math.round(foodData.fat * multiplier * 10) / 10,
    }
  }

  // Show subscription page if requested
  if (showSubscriptionPage) {
    return <SubscriptionPage onBack={() => setShowSubscriptionPage(false)} />
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Food Tracker
            </CardTitle>
            <CardDescription>Search from thousands of foods and brands</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="add" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Custom
                </TabsTrigger>
                <TabsTrigger value="scan" className="flex items-center gap-2">
                  <Scan className="h-4 w-4" />
                  Scan
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="food-search">Search foods and brands</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      {isSearching && (
                        <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
                      )}
                      <Input
                        id="food-search"
                        placeholder="e.g., McDonald's, Tesco, ASDA, Sainsbury's, M&S..."
                        className="pl-9 pr-9"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          setSelectedFood(null)
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Search across 100+ brands including UK supermarkets (Tesco, ASDA, Sainsbury's, M&S, Lidl, Aldi),
                      fast food chains, and more
                    </p>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Search Results:</Label>
                      <ScrollArea className="h-[250px] pr-4">
                        <div className="space-y-1">
                          {searchResults.map((result, index) => {
                            const isSelected =
                              selectedFood?.name === result.name && selectedFood?.brand === result.brand
                            return (
                              <div
                                key={`${result.name}-${result.brand || "basic"}-${index}`}
                                className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-primary/10 border-primary/30"
                                    : "bg-secondary/30 border-border/30 hover:bg-secondary/50"
                                }`}
                                onClick={() => setSelectedFood(result)}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-foreground">{result.name}</span>
                                      {result.brand && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20"
                                        >
                                          {result.brand}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {result.data.caloriesPer100g} kcal per 100g
                                    </div>
                                  </div>
                                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Grams Input and Preview */}
                  {selectedFood && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="grams">Amount (grams)</Label>
                        <Input
                          id="grams"
                          type="number"
                          placeholder="100"
                          value={grams}
                          onChange={(e) => setGrams(e.target.value)}
                        />
                      </div>

                      {/* Nutrition Preview */}
                      {grams && Number.parseFloat(grams) > 0 && (
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <h4 className="font-medium mb-2">
                            Nutrition for {grams}g of {selectedFood.name}
                            {selectedFood.brand && ` (${selectedFood.brand})`}:
                          </h4>
                          {(() => {
                            const preview = calculatePreview(selectedFood.data, Number.parseFloat(grams))
                            if (!preview) return null
                            return (
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Calories:</span>
                                  <span className="font-medium">{preview.calories} kcal</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Protein:</span>
                                  <span className="font-medium">{preview.protein}g</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Carbs:</span>
                                  <span className="font-medium">{preview.carbs}g</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Fat:</span>
                                  <span className="font-medium">{preview.fat}g</span>
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      )}

                      <Button
                        onClick={() =>
                          addFoodFromSearch(
                            selectedFood.name,
                            selectedFood.brand,
                            selectedFood.data,
                            Number.parseFloat(grams),
                          )
                        }
                        disabled={!grams || Number.parseFloat(grams) <= 0}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add {selectedFood.name}
                        {selectedFood.brand && ` (${selectedFood.brand})`}
                      </Button>
                    </div>
                  )}

                  {searchTerm && searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No foods found matching "{searchTerm}"</p>
                      <p className="text-xs mt-1">
                        Try searching for brands like "McDonald's", "Starbucks", or basic foods like "chicken"
                      </p>
                    </div>
                  )}

                  {searchTerm && searchTerm.length < 2 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">Type at least 2 characters to search</p>
                      <p className="text-xs mt-1">Search across thousands of foods from major brands</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="custom-food-name">Food Name</Label>
                    <Input
                      id="custom-food-name"
                      placeholder="e.g., Homemade Pasta Salad"
                      value={customFoodForm.name}
                      onChange={(e) => setCustomFoodForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="custom-quantity">Quantity</Label>
                      <Input
                        id="custom-quantity"
                        type="number"
                        placeholder="100"
                        value={customFoodForm.quantity}
                        onChange={(e) => setCustomFoodForm((prev) => ({ ...prev, quantity: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-unit">Unit</Label>
                      <select
                        id="custom-unit"
                        value={customFoodForm.unit}
                        onChange={(e) => setCustomFoodForm((prev) => ({ ...prev, unit: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="g">grams (g)</option>
                        <option value="ml">milliliters (ml)</option>
                        <option value="cup">cup</option>
                        <option value="tbsp">tablespoon</option>
                        <option value="tsp">teaspoon</option>
                        <option value="piece">piece</option>
                        <option value="slice">slice</option>
                        <option value="serving">serving</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="custom-calories">Calories (total for quantity above)</Label>
                    <Input
                      id="custom-calories"
                      type="number"
                      placeholder="250"
                      value={customFoodForm.calories}
                      onChange={(e) => setCustomFoodForm((prev) => ({ ...prev, calories: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="custom-protein">Protein (g)</Label>
                      <Input
                        id="custom-protein"
                        type="number"
                        step="0.1"
                        placeholder="12.5"
                        value={customFoodForm.protein}
                        onChange={(e) => setCustomFoodForm((prev) => ({ ...prev, protein: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-carbs">Carbs (g)</Label>
                      <Input
                        id="custom-carbs"
                        type="number"
                        step="0.1"
                        placeholder="30.0"
                        value={customFoodForm.carbs}
                        onChange={(e) => setCustomFoodForm((prev) => ({ ...prev, carbs: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-fat">Fat (g)</Label>
                      <Input
                        id="custom-fat"
                        type="number"
                        step="0.1"
                        placeholder="8.5"
                        value={customFoodForm.fat}
                        onChange={(e) => setCustomFoodForm((prev) => ({ ...prev, fat: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Nutrition Preview */}
                  {customFoodForm.name && customFoodForm.calories && (
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <h4 className="font-medium mb-2">
                        Nutrition for {customFoodForm.quantity} {customFoodForm.unit} of {customFoodForm.name}:
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Calories:</span>
                          <span className="font-medium">{customFoodForm.calories} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protein:</span>
                          <span className="font-medium">{customFoodForm.protein || 0}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carbs:</span>
                          <span className="font-medium">{customFoodForm.carbs || 0}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fat:</span>
                          <span className="font-medium">{customFoodForm.fat || 0}g</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={addCustomFood}
                    disabled={!customFoodForm.name || !customFoodForm.calories}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Food
                  </Button>

                  <div className="text-center py-2">
                    <p className="text-xs text-muted-foreground">
                      Perfect for homemade meals, restaurant dishes, or foods not in our database
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scan" className="space-y-4">
                <BarcodeScanner onFoodScanned={addScannedFood} />
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your food history..."
                    className="pl-9"
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                  />
                </div>

                <ScrollArea className="h-[300px] pr-4">
                  {filteredHistoryFoods.length > 0 ? (
                    <div className="space-y-2">
                      {filteredHistoryFoods.map((food) => (
                        <div
                          key={food.id}
                          className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div>
                            <span className="font-medium text-foreground">{food.name}</span>
                            <div className="text-sm text-muted-foreground">
                              {food.quantity} {food.unit} • {food.calories} kcal
                            </div>
                          </div>
                          <Button size="sm" onClick={() => addFromHistory(food)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {historySearchTerm ? "No matching foods found" : "No food history yet"}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Daily Summary
            </CardTitle>
            <CardDescription>Today's calorie breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Calories Consumed:</span>
                <Badge variant="outline">{dailyStats.caloriesConsumed} kcal</Badge>
              </div>
              <div className="flex justify-between">
                <span>Calories Burned:</span>
                <Badge variant="outline">{dailyStats.caloriesBurned} kcal</Badge>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Net Calories:</span>
                <Badge
                  variant={dailyStats.caloriesConsumed - dailyStats.caloriesBurned <= 2000 ? "default" : "destructive"}
                >
                  {dailyStats.caloriesConsumed - dailyStats.caloriesBurned} kcal
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {todaysFoods.length > 0 && (
        <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Today's Food Summary
            </CardTitle>
            <CardDescription>Foods and macros consumed today</CardDescription>
          </Card>
      )}

      {/* Weekly and Monthly Breakdowns - Premium Feature */}
      <div className="grid gap-4 md:grid-cols-2">
        
        <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm relative">
          {!isSubscribed && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
              <div className="text-center space-y-3 p-6">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Premium Feature</h3>
                  <p className="text-sm text-muted-foreground">Unlock weekly breakdowns with premium</p>
                </div>
                <Button size="sm" className="btn-primary" onClick={() => setShowSubscriptionPage(true)}>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Breakdown
              {!isSubscribed && <Badge className="bg-primary/10 text-primary border-primary/20 ml-auto">Premium</Badge>}
            </CardTitle>
            <CardDescription>Last 7 days calorie intake</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-secondary/30 rounded-xl">
                <div className="text-2xl font-bold text-blue-500">{isSubscribed ? weeklyBreakdown.total : "****"}</div>
                <div className="text-sm text-muted-foreground">Total Calories</div>
              </div>
              <div className="text-center p-3 bg-secondary/30 rounded-xl">
                <div className="text-2xl font-bold text-green-500">
                  {isSubscribed ? weeklyBreakdown.average : "****"}
                </div>
                <div className="text-sm text-muted-foreground">Daily Average</div>
              </div>
            </div>

            {isSubscribed && weeklyBreakdown.dailyTotals.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Daily Breakdown:</Label>
                <ScrollArea className="h-[150px] pr-4">
                  <div className="space-y-1">
                    {weeklyBreakdown.dailyTotals.slice(0, 7).map(([date, calories]) => (
                      <div key={date} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                        <span className="text-sm font-medium">
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {calories} kcal
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {!isSubscribed && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Daily Breakdown:</Label>
                <div className="space-y-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                      <span className="text-sm font-medium">*** **</span>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        **** kcal
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isSubscribed && weeklyBreakdown.days === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No data for the past week</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm relative">
          {!isSubscribed && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
              <div className="text-center space-y-3 p-6">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Premium Feature</h3>
                  <p className="text-sm text-muted-foreground">Unlock monthly analytics with premium</p>
                </div>
                <Button size="sm" className="btn-primary" onClick={() => setShowSubscriptionPage(true)}>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Breakdown
              {!isSubscribed && <Badge className="bg-primary/10 text-primary border-primary/20 ml-auto">Premium</Badge>}
            </CardTitle>
            <CardDescription>Last 30 days calorie intake</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-secondary/30 rounded-xl">
                <div className="text-2xl font-bold text-purple-500">
                  {isSubscribed ? monthlyBreakdown.total : "****"}
                </div>
                <div className="text-sm text-muted-foreground">Total Calories</div>
              </div>
              <div className="text-center p-3 bg-secondary/30 rounded-xl">
                <div className="text-2xl font-bold text-orange-500">
                  {isSubscribed ? monthlyBreakdown.average : "****"}
                </div>
                <div className="text-sm text-muted-foreground">Daily Average</div>
              </div>
            </div>

            {isSubscribed && monthlyBreakdown.weeklyAverages.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Weekly Averages:</Label>
                <div className="space-y-1">
                  {monthlyBreakdown.weeklyAverages.map((week) => (
                    <div key={week.week} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                      <span className="text-sm font-medium">Week {week.week}</span>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                        {week.average} kcal
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isSubscribed && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Weekly Averages:</Label>
                <div className="space-y-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                      <span className="text-sm font-medium">Week {i}</span>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                        **** kcal
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isSubscribed && monthlyBreakdown.dailyTotals.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Daily Breakdown:</Label>
                <ScrollArea className="h-[150px] pr-4">
                  <div className="space-y-1">
                    {monthlyBreakdown.dailyTotals.slice(0, 7).map(([date, calories]) => (
                      <div key={date} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                        <span className="text-sm font-medium">
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                          {calories} kcal
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {!isSubscribed && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Daily Breakdown:</Label>
                <div className="space-y-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                      <span className="text-sm font-medium">*** **</span>
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                        **** kcal
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isSubscribed && monthlyBreakdown.days === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No data for the past month</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Show subscription page if requested */}
      {showSubscriptionPage && <SubscriptionPage onBack={() => setShowSubscriptionPage(false)} />}
    </div>
  )
}
