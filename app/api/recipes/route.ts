import { NextRequest, NextResponse } from "next/server";
import parseIngredientInput, { levenshtein } from "../../../utils/parse-ingredients";
import { query } from "../../../lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const maxTimeParam = url.searchParams.get("maxTime");
    const vegetarianParam = url.searchParams.get("vegetarian");
    const veganParam = url.searchParams.get("vegan");
    const tagParam = url.searchParams.get("tag");
    const qParam = url.searchParams.get("q");

    const where: any = {};

    // Ingredients query param (normalized comma list expected)
    const ingredientsParam = url.searchParams.get("ingredients")
    let parsedIngredients: string[] = []
    if (ingredientsParam) {
      // Re-parse for robustness (could be comma-separated or freeform)
      parsedIngredients = parseIngredientInput(ingredientsParam)
    }

    if (maxTimeParam) {
      const maxTime = parseInt(maxTimeParam, 10);
      if (!Number.isNaN(maxTime)) {
        where.totalTimeMinutes = { lte: maxTime };
      }
    }

    if (vegetarianParam === "true") {
      where.isVegetarian = true;
    }

    if (veganParam === "true") {
      where.isVegan = true;
    }

    if (tagParam) {
      where.tags = { some: { tag: { name: tagParam } } };
    }

    if (qParam) {
      where.title = { contains: qParam, mode: "insensitive" };
    }

    // If parsedIngredients exist, add an OR filter that checks any ingredient text contains the query
    if (parsedIngredients.length > 0) {
      where.OR = parsedIngredients.map((ing) => ({
        ingredients: { some: { text: { contains: ing } } },
      }));
    }

    // Fetch basic recipe rows (id, slug, title, description, totalTimeMinutes, flags)
    const whereClauses: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (where.totalTimeMinutes) {
      whereClauses.push(`"totalTimeMinutes" <= $${idx++}`);
      params.push(where.totalTimeMinutes.lte);
    }
    if (where.isVegetarian === true) {
      whereClauses.push(`"isVegetarian" = true`);
    }
    if (where.isVegan === true) {
      whereClauses.push(`"isVegan" = true`);
    }
    if (where.title) {
      whereClauses.push(`title ILIKE $${idx++}`);
      params.push(`%${where.title.contains}%`);
    }

    // tag filter handled later by filtering results client-side for simplicity

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const recipesRes = await query(
      `SELECT id, slug, title, description, "totalTimeMinutes", difficulty, "costLevel", "isVegetarian", "isVegan", "isGlutenFree", equipment, servings, "createdAt", "updatedAt" FROM "Recipe" ${whereSql} ORDER BY "createdAt" DESC LIMIT 50`,
      params
    );

    const recipes = [] as any[];
    for (const row of recipesRes.rows) {
      // fetch ingredients, steps, tags per recipe
      const ing = await query('SELECT text, "order" FROM "Ingredient" WHERE "recipeId" = $1 ORDER BY "order" ASC', [row.id]);
      const steps = await query('SELECT text, "order" FROM "Step" WHERE "recipeId" = $1 ORDER BY "order" ASC', [row.id]);
      const tagJoins = await query('SELECT rt.name FROM "RecipeTagOnRecipe" rj JOIN "RecipeTag" rt ON rt.id = rj."tagId" WHERE rj."recipeId" = $1', [row.id]);

      recipes.push({
        ...row,
        ingredients: ing.rows.map((r: any) => ({ text: r.text, order: r.order })),
        steps: steps.rows.map((s: any) => ({ text: s.text, order: s.order })),
        tags: tagJoins.rows.map((t: any) => ({ tag: { name: t.name } })),
      });
    }

    // Map tags to names for clarity and compute fuzzy scoring
    const scored = [] as any[]

    for (const r of recipes) {
      const recipeIngredientTexts = r.ingredients.map((i: any) => i.text || "")

      // For each user ingredient, check if any recipe ingredient matches (substring or fuzzy)
      let matchedUserCount = 0
      const matchedRecipeIngredients: string[] = []

      for (const userIng of parsedIngredients) {
        const u = userIng.toLowerCase()
        let matchedThisUser = false

        for (const riText of recipeIngredientTexts) {
          const norm = String(riText).toLowerCase()
          if (norm.includes(u) || u.includes(norm)) {
            matchedThisUser = true
            if (!matchedRecipeIngredients.includes(riText)) matchedRecipeIngredients.push(riText)
            break
          }

          // Try fuzzy on words
          const words = norm.replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean)
          for (const w of words) {
            const word = w.replace(/[^a-z0-9-]/g, "")
            if (!word) continue
            if (word.includes(u) || levenshtein(word, u) <= 2) {
              matchedThisUser = true
              if (!matchedRecipeIngredients.includes(riText)) matchedRecipeIngredients.push(riText)
              break
            }
          }

          if (matchedThisUser) break
        }

        if (matchedThisUser) matchedUserCount += 1
      }

      if (matchedUserCount > 0) {
          const missing = recipeIngredientTexts.filter((t: string) => !matchedRecipeIngredients.includes(t))
        scored.push({
          ...r,
          tags: r.tags.map((t: { tag: { name: string } }) => t.tag.name),
          matches: matchedRecipeIngredients,
          missing,
          score: matchedUserCount,
        })
      }
    }

    // Sort by score desc
    scored.sort((a, b) => b.score - a.score)

    return NextResponse.json({ recipes: scored })
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
