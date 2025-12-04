import RecipeClient from "./recipe-client"
import { query } from "@/lib/db"
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

  const res = await query('SELECT id, slug, title, description, "totalTimeMinutes", difficulty, "costLevel", "isVegetarian", "isVegan", "isGlutenFree", equipment, servings, "createdAt", "updatedAt" FROM "Recipe" WHERE slug = $1 LIMIT 1', [slug])
  const recipeRow = res.rows[0]

  if (!recipeRow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Recipe not found</h2>
        </div>
      </div>
    )
  }

  const ingRes = await query('SELECT text, "order" FROM "Ingredient" WHERE "recipeId" = $1 ORDER BY "order" ASC', [recipeRow.id])
  const stepsRes = await query('SELECT text, "order" FROM "Step" WHERE "recipeId" = $1 ORDER BY "order" ASC', [recipeRow.id])
  const tagRes = await query('SELECT rt.name FROM "RecipeTagOnRecipe" rj JOIN "RecipeTag" rt ON rt.id = rj."tagId" WHERE rj."recipeId" = $1', [recipeRow.id])

  const recipe = {
    ...recipeRow,
    ingredients: ingRes.rows.map((r: any) => ({ text: r.text, order: r.order })),
    steps: stepsRes.rows.map((s: any) => ({ text: s.text, order: s.order })),
    tags: tagRes.rows.map((t: any) => ({ tag: { name: t.name } })),
  }

  // Map to the client shape expected by RecipeClient
  const mapped: any = {
    id: String(recipe.id),
    title: recipe.title,
    description: recipe.description ?? "",
    timeMinutes: recipe.totalTimeMinutes,
    servings: recipe.servings ?? 1,
    ingredients: recipe.ingredients.map((i: { text: string }) => i.text),
    steps: recipe.steps.map((s: { text: string }) => s.text),
    tags: recipe.tags.map((t: { tag: { name: string } }) => t.tag.name),
    vegetarian: recipe.isVegetarian,
    vegan: recipe.isVegan,
  }

  return <RecipeClient recipe={mapped} />
}
