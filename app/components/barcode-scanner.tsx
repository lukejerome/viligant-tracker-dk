"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Camera, Scan, Package, Plus, X } from "lucide-react"

interface ScannedFood {
  barcode: string
  name: string
  brand: string
  caloriesPer100g: number
  protein: number
  carbs: number
  fat: number
  image?: string
}

interface BarcodeScannerProps {
  onFoodScanned: (food: ScannedFood, grams: number) => void
}

// Mock food database - in a real app, this would come from an API like OpenFoodFacts
const mockFoodDatabase: Record<string, ScannedFood> = {
  "1234567890123": {
    barcode: "1234567890123",
    name: "Whole Milk",
    brand: "Dairy Farm",
    caloriesPer100g: 61,
    protein: 3.2,
    carbs: 4.7,
    fat: 3.3,
  },
  "2345678901234": {
    barcode: "2345678901234",
    name: "Greek Yogurt",
    brand: "Healthy Choice",
    caloriesPer100g: 97,
    protein: 10,
    carbs: 3.6,
    fat: 5,
  },
  "3456789012345": {
    barcode: "3456789012345",
    name: "Banana",
    brand: "Fresh Produce",
    caloriesPer100g: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
  },
  "4567890123456": {
    barcode: "4567890123456",
    name: "Chicken Breast",
    brand: "Premium Meat",
    caloriesPer100g: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
  },
  "5678901234567": {
    barcode: "5678901234567",
    name: "Brown Rice",
    brand: "Organic Grains",
    caloriesPer100g: 111,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
  },
  "6789012345678": {
    barcode: "6789012345678",
    name: "Almonds",
    brand: "Nut Company",
    caloriesPer100g: 579,
    protein: 21.2,
    carbs: 21.6,
    fat: 49.9,
  },
}

export default function BarcodeScanner({ onFoodScanned }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedFood, setScannedFood] = useState<ScannedFood | null>(null)
  const [grams, setGrams] = useState("100")
  const [manualBarcode, setManualBarcode] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera if available
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsScanning(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Camera access denied. You can still enter barcodes manually.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const simulateScan = () => {
    // Simulate scanning by randomly selecting a barcode from our mock database
    const barcodes = Object.keys(mockFoodDatabase)
    const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)]
    const food = mockFoodDatabase[randomBarcode]
    setScannedFood(food)
    stopCamera()
  }

  const handleManualBarcode = () => {
    const food = mockFoodDatabase[manualBarcode]
    if (food) {
      setScannedFood(food)
      setManualBarcode("")
    } else {
      alert("Food not found in database. Try a different barcode or add manually.")
    }
  }

  const addFood = () => {
    if (scannedFood) {
      const gramsNum = Number.parseFloat(grams)
      onFoodScanned(scannedFood, gramsNum)
      setScannedFood(null)
      setGrams("100")
    }
  }

  const calculateNutrition = (baseValue: number, grams: number) => {
    return Math.round((baseValue * grams) / 100)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-4">
      {!scannedFood ? (
        <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Barcode Scanner
            </CardTitle>
            <CardDescription>Scan food barcodes to automatically log nutrition information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isScanning ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-secondary/30 rounded-xl w-fit">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <Button onClick={startCamera} className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera Scanner
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-barcode">Enter Barcode Manually</Label>
                  <div className="flex gap-2">
                    <Input
                      id="manual-barcode"
                      placeholder="Enter barcode number"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                    />
                    <Button onClick={handleManualBarcode} disabled={!manualBarcode}>
                      <Scan className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Try these demo barcodes: 1234567890123, 2345678901234, 3456789012345
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-64 bg-black rounded-lg object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-primary w-48 h-32 rounded-lg">
                      <div className="w-full h-full border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center">
                        <span className="text-primary text-sm">Align barcode here</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={simulateScan} className="flex-1">
                    <Scan className="h-4 w-4 mr-2" />
                    Simulate Scan
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Point your camera at a barcode or click "Simulate Scan" for demo
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Food Found
            </CardTitle>
            <CardDescription>Confirm the details and add to your log</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{scannedFood.name}</h3>
                  <p className="text-sm text-muted-foreground">{scannedFood.brand}</p>
                  <Badge variant="outline" className="mt-1">
                    {scannedFood.barcode}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-2 bg-secondary/30 rounded">
                  <div className="text-lg font-bold text-orange-500">{scannedFood.caloriesPer100g}</div>
                  <div className="text-xs text-muted-foreground">kcal/100g</div>
                </div>
                <div className="text-center p-2 bg-secondary/30 rounded">
                  <div className="text-lg font-bold text-blue-500">{scannedFood.protein}g</div>
                  <div className="text-xs text-muted-foreground">protein/100g</div>
                </div>
                <div className="text-center p-2 bg-secondary/30 rounded">
                  <div className="text-lg font-bold text-green-500">{scannedFood.carbs}g</div>
                  <div className="text-xs text-muted-foreground">carbs/100g</div>
                </div>
                <div className="text-center p-2 bg-secondary/30 rounded">
                  <div className="text-lg font-bold text-yellow-500">{scannedFood.fat}g</div>
                  <div className="text-xs text-muted-foreground">fat/100g</div>
                </div>
              </div>
            </div>

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

            {grams && Number.parseFloat(grams) > 0 && (
              <div className="p-3 bg-primary/10 rounded-xl">
                <h4 className="font-medium mb-2">Nutrition for {grams}g:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Calories:</span>
                    <span className="font-medium">
                      {calculateNutrition(scannedFood.caloriesPer100g, Number.parseFloat(grams))} kcal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein:</span>
                    <span className="font-medium">
                      {calculateNutrition(scannedFood.protein, Number.parseFloat(grams))}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbs:</span>
                    <span className="font-medium">
                      {calculateNutrition(scannedFood.carbs, Number.parseFloat(grams))}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat:</span>
                    <span className="font-medium">
                      {calculateNutrition(scannedFood.fat, Number.parseFloat(grams))}g
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={addFood} disabled={!grams || Number.parseFloat(grams) <= 0} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add to Food Log
              </Button>
              <Button onClick={() => setScannedFood(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
