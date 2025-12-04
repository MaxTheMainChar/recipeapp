"use client"

import { useEffect, useState, Suspense, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ChefHat, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import RecipeCard from "@/components/recipe-card"
import Filters from "@/components/filters"
import type { RecipeDTO } from "@/lib/types"

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ingredientsParam = searchParams.get("ingredients") || ""

  const [userIngredients, setUserIngredients] = useState<string[]>([])
  const [matchedRecipes, setMatchedRecipes] = useState<any[]>([])
  const [vegetarianOnly, setVegetarianOnly] = useState(false)
  const [veganOnly, setVeganOnly] = useState(false)
  const [maxTime, setMaxTime] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!ingredientsParam) return

      const ingredients = ingredientsParam
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i.length > 0)
      setUserIngredients(ingredients)

      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        // forward filters from the URL
        const maxTimeParam = searchParams.get("maxTime")
        const vegetarianParam = searchParams.get("vegetarian")
        const veganParam = searchParams.get("vegan")
        const tagParam = searchParams.get("tag")
        const qParam = searchParams.get("q")
        // forward the normalized ingredients param so backend can re-parse and score
        if (ingredientsParam) params.set("ingredients", ingredientsParam)

        if (maxTimeParam) params.set("maxTime", maxTimeParam)
        if (vegetarianParam) params.set("vegetarian", vegetarianParam)
        if (veganParam) params.set("vegan", veganParam)
        if (tagParam) params.set("tag", tagParam)
        if (qParam) params.set("q", qParam)

        // fetch from API
        const res = await fetch(`/api/recipes?${params.toString()}`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || "Failed to fetch recipes")
        }
        const body = await res.json()
        // Backend returns scored & ranked recipes; use as-is
        const apiRecipes: any[] = (body.recipes || []) as any[]
        setMatchedRecipes(apiRecipes)
      } catch (err: any) {
        setError(err.message || "Failed to load recipes")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [ingredientsParam])

  const filteredRecipes = useMemo(() => {
    let filtered = [...matchedRecipes]

    if (vegetarianOnly) {
      filtered = filtered.filter((r) => r.vegetarian)
    }

    if (veganOnly) {
      filtered = filtered.filter((r) => r.vegan)
    }

    if (maxTime !== null) {
      filtered = filtered.filter((r) => r.timeMinutes <= maxTime)
    }

    return filtered
  }, [vegetarianOnly, veganOnly, maxTime, matchedRecipes])

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
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to search
          </Button>

          {/* Results Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Recipe Results</h1>
            <p className="text-muted-foreground">
              Results for: <span className="font-medium text-foreground">{userIngredients.join(", ")}</span>
            </p>
          </div>

          {/* Filters */}
          <Filters
            vegetarianOnly={vegetarianOnly}
            veganOnly={veganOnly}
            maxTime={maxTime}
            onVegetarianChange={setVegetarianOnly}
            onVeganChange={setVeganOnly}
            onMaxTimeChange={setMaxTime}
          />

          {/* Recipe Grid */}
          {loading ? (
            <div className="text-center py-16">Loading recipes…</div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">{error}</div>
          ) : filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} userIngredients={userIngredients} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-card rounded-2xl shadow-lg border border-border p-12 max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                  <ChefHat className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">No recipes found</h2>
                <p className="text-muted-foreground mb-6">
                  Try removing some filters or adding more ingredients to see better matches.
                </p>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Go back to search
                </Button>
              </div>
            </div>
          )}
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

export default function Results() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResultsContent />
    </Suspense>
  )
}
