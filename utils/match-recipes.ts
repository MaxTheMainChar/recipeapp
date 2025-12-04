interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  timeMinutes: number
  servings: number
  tags: string[]
  vegetarian: boolean
  vegan: boolean
  imageUrl?: string
}

interface MatchedRecipe extends Recipe {
  matches: string[]
  missing: string[]
  score: number
}

export function matchRecipes(userIngredients: string[], recipes: Recipe[]): MatchedRecipe[] {
  // Normalize user ingredients
  const normalizedUserIngredients = userIngredients.map((i) => i.trim().toLowerCase())

  const matchedRecipes: MatchedRecipe[] = []

  for (const recipe of recipes) {
    const normalizedRecipeIngredients = recipe.ingredients.map((i) => i.trim().toLowerCase())

    const matches: string[] = []
    const missing: string[] = []

    // Check each recipe ingredient
    for (const recipeIngredient of recipe.ingredients) {
      const normalized = recipeIngredient.trim().toLowerCase()

      // Check if user has this ingredient (substring match)
      const hasIngredient = normalizedUserIngredients.some(
        (userIng) => userIng.includes(normalized) || normalized.includes(userIng),
      )

      if (hasIngredient) {
        matches.push(recipeIngredient)
      } else {
        missing.push(recipeIngredient)
      }
    }

    // Calculate score
    const score = matches.length - missing.length

    // Only include recipes with at least one match
    if (matches.length > 0) {
      matchedRecipes.push({
        ...recipe,
        matches,
        missing,
        score,
      })
    }
  }

  // Sort by score descending
  matchedRecipes.sort((a, b) => b.score - a.score)

  return matchedRecipes
}
