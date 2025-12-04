import Link from "next/link"
import Image from "next/image"
import { Clock, Tag } from "lucide-react"
import type { RecipeDTO } from "@/lib/types"

type RecipeCardProps = {
  recipe: RecipeDTO & { matches?: string[]; missing?: string[] }
  userIngredients: string[]
}

export default function RecipeCard({ recipe, userIngredients }: RecipeCardProps) {
  const missingCount = recipe.missing?.length || 0
  const missingPreview = recipe.missing?.slice(0, 3).join(", ") || ""
  const hasMoreMissing = missingCount > 3

  const ingredientsParam = userIngredients.join(",")

  const timeMinutes = recipe.totalTimeMinutes

  return (
    <Link
      href={`/recipe/${recipe.slug}?ingredients=${encodeURIComponent(ingredientsParam)}`}
      className="group bg-card rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="relative h-48 bg-secondary">
        <Image
          src={recipe['imageUrl'] || `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(recipe.title)}`}
          alt={recipe.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">{recipe.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{recipe.description}</p>

        {/* Match Info */}
        <div className="mb-4">
          <p className="text-sm font-medium text-primary mb-2">
            Uses {recipe.matches?.length || 0} of your ingredients
          </p>
          {missingCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Missing: {missingPreview}
              {hasMoreMissing ? "..." : ""}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{timeMinutes} min</span>
          </div>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span>{recipe.tags[0]}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
