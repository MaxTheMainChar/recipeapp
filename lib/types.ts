export type IngredientDTO = {
  id: number
  text: string
  order: number
}

export type StepDTO = {
  id: number
  text: string
  order: number
}

export type Difficulty = "EASY" | "MEDIUM" | "HARD"
export type CostLevel = "LOW" | "MEDIUM" | "HIGH"

export type RecipeDTO = {
  id: number
  slug: string
  title: string
  description?: string | null
  totalTimeMinutes: number
  difficulty: Difficulty
  costLevel: CostLevel
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  equipment?: string | null
  servings?: number | null
  ingredients: IngredientDTO[]
  steps: StepDTO[]
  tags: string[]
}
