"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ChefHat, Clock, Users, ArrowLeft, Check, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface Recipe {
  id: string
  title: string
  description: string
  timeMinutes: number
  servings: number
  ingredients: string[]
  steps: string[]
  tags: string[]
  vegetarian: boolean
  vegan: boolean
  imageUrl?: string
}

export default function RecipeClient({ recipe }: { recipe: Recipe | undefined }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userIngredients, setUserIngredients] = useState<string[]>([])

  useEffect(() => {
    const ingredientsParam = searchParams.get("ingredients")
    if (ingredientsParam) {
      const ingredients = ingredientsParam.split(",").map((i) => i.trim().toLowerCase())
      setUserIngredients(ingredients)
    }
  }, [searchParams])

  const hasIngredient = (ingredient: string) => {
    return userIngredients.some((ui) => ui.includes(ingredient.toLowerCase()) || ingredient.toLowerCase().includes(ui))
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Recipe not found</h2>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Go back to home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">FridgeToFork</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to results
          </Button>

          {/* Recipe Hero */}
          <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden mb-8">
            <div className="relative h-64 md:h-96 bg-secondary">
              <Image
                src={
                  recipe.imageUrl || `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(recipe.title)}`
                }
                alt={recipe.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{recipe.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{recipe.description}</p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>Ready in {recipe.timeMinutes} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>{recipe.servings} servings</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                    {tag}
                  </span>
                ))}
                {recipe.vegetarian && (
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">Vegetarian</span>
                )}
                {recipe.vegan && (
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">Vegan</span>
                )}
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Ingredients</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient: string, index: number) => {
                const userHasIt = hasIngredient(ingredient)
                return (
                  <li
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${userHasIt ? "bg-primary/10" : "bg-muted/30"}`}
                  >
                    {userHasIt ? (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={userHasIt ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {ingredient}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Steps */}
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Instructions</h2>
            <ol className="space-y-6">
              {recipe.steps.map((step: string, index: number) => (
                <li key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <p className="text-foreground pt-1 flex-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-card mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 FridgeToFork. Cook smart, waste less.
        </div>
      </footer>
    </div>
  )
}
