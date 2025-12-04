import RecipeClient from "./recipe-client"
import { prisma } from "@/lib/prisma"
import type { RecipeDTO } from "@/lib/types"

type Props = { params: any }

export default async function RecipeDetail({ params }: Props) {
  // `params` can be a Promise in Next.js App Router server components — await it first.
  const resolvedParams = await Promise.resolve(params)
  const slug = resolvedParams?.id ?? resolvedParams?.slug

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Recipe not found</h2>
        </div>
      </div>
    )
  }

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: {
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } },
    },
  })

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Recipe not found</h2>
        </div>
      </div>
    )
  }

  // Map to the client shape expected by RecipeClient
  const mapped: any = {
    id: String(recipe.id),
    title: recipe.title,
    description: recipe.description ?? "",
    timeMinutes: recipe.totalTimeMinutes,
    servings: recipe.servings ?? 1,
    ingredients: recipe.ingredients.map((i) => i.text),
    steps: recipe.steps.map((s) => s.text),
    tags: recipe.tags.map((t) => t.tag.name),
    vegetarian: recipe.isVegetarian,
    vegan: recipe.isVegan,
  }

  return <RecipeClient recipe={mapped} />
}
