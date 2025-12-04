"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChefHat, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

const commonIngredients = ["egg", "rice", "cheese", "tomato", "onion", "garlic", "chicken", "pasta"]

export default function Home() {
  const router = useRouter()
  const [ingredients, setIngredients] = useState("")

  const handleAddIngredient = (ingredient: string) => {
    const current = ingredients.trim()
    if (current && !current.endsWith(",")) {
      setIngredients(current + ", " + ingredient)
    } else if (current.endsWith(",")) {
      setIngredients(current + " " + ingredient)
    } else {
      setIngredients(ingredient)
    }
  }

  const handleFindRecipes = () => {
    const ingredientList = ingredients
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0)
      .join(",")

    if (ingredientList) {
      router.push(`/results?ingredients=${encodeURIComponent(ingredientList)}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">FridgeToFork</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Turn your leftover ingredients into dinner.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance">
              Type what you have in your kitchen and get instant recipe ideas.
            </p>
          </div>

          {/* Input Card */}
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            <label htmlFor="ingredients" className="block text-sm font-medium text-foreground mb-3">
              What ingredients do you have?
            </label>
            <textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g., chicken, rice, onion, garlic, tomato"
              className="w-full h-32 px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />

            {/* Quick Add Chips */}
            <div className="mt-4 mb-6">
              <p className="text-sm text-muted-foreground mb-3">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {commonIngredients.map((ingredient) => (
                  <button
                    key={ingredient}
                    onClick={() => handleAddIngredient(ingredient)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    {ingredient}
                  </button>
                ))}
              </div>
            </div>

            {/* Find Recipes Button */}
            <Button
              onClick={handleFindRecipes}
              disabled={!ingredients.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold rounded-xl"
            >
              Find recipes
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-card">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 FridgeToFork. Cook smart, waste less.
        </div>
      </footer>
    </div>
  )
}
