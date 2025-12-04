import RecipeClient from "./recipe-client"
import recipesData from "@/data/recipes.json"

export default async function RecipeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const recipe = recipesData.find((r) => r.id === id)

  return <RecipeClient recipe={recipe} />
}
