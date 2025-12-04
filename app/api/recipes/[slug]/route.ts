import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function GET(_req: NextRequest, context: { params: any }) {
  try {
    const params = await Promise.resolve(context.params);
    const { slug } = params as { slug: string };
    const res = await query('SELECT id, slug, title, description, "totalTimeMinutes", difficulty, "costLevel", "isVegetarian", "isVegan", "isGlutenFree", equipment, servings, "createdAt", "updatedAt" FROM "Recipe" WHERE slug = $1 LIMIT 1', [slug]);
    const recipeRow = res.rows[0];
    if (!recipeRow) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const ing = await query('SELECT text, "order" FROM "Ingredient" WHERE "recipeId" = $1 ORDER BY "order" ASC', [recipeRow.id]);
    const steps = await query('SELECT text, "order" FROM "Step" WHERE "recipeId" = $1 ORDER BY "order" ASC', [recipeRow.id]);
    const tagJoins = await query('SELECT rt.name FROM "RecipeTagOnRecipe" rj JOIN "RecipeTag" rt ON rt.id = rj."tagId" WHERE rj."recipeId" = $1', [recipeRow.id]);

    const mapped = { ...recipeRow, ingredients: ing.rows.map((r: any) => ({ text: r.text, order: r.order })), steps: steps.rows.map((s: any) => ({ text: s.text, order: s.order })), tags: tagJoins.rows.map((t: any) => t.name) };

    return NextResponse.json(mapped);
  } catch (err) {
    console.error(err);
    const body: any = { error: "Server error" };
    if (process.env.NODE_ENV !== 'production') {
      body.message = (err as any)?.message;
      body.stack = (err as any)?.stack;
    }
    return NextResponse.json(body, { status: 500 });
  }
}
