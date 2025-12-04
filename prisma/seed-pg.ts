import 'dotenv/config';
import { Client } from 'pg';
import fs from 'fs/promises';
import path from 'path';

type RawRecipe = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  timeMinutes?: number | null;
  totalTimeMinutes?: number | null;
  difficulty?: string | null;
  costLevel?: string | null;
  isVegetarian?: boolean | null;
  isVegan?: boolean | null;
  isGlutenFree?: boolean | null;
  equipment?: string[] | null;
  servings?: number | null;
  ingredients?: Array<{ text: string }>;
  steps?: Array<{ text: string }>;
  tags?: string[];
  imageUrl?: string | null;
};

const file = path.resolve(process.cwd(), 'data', 'recipes.json');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set in the environment');
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  const raw = await fs.readFile(file, 'utf-8');
  const recipes: RawRecipe[] = JSON.parse(raw);

  try {
    await client.query('BEGIN');

    // Ensure tables exist (migrations should have created them). This script is idempotent.

    // Helper: upsert tag and return id
    const tagIdCache = new Map<string, number>();
    async function getTagId(name: string) {
      const existing = tagIdCache.get(name);
      if (existing) return existing;
      const res = await client.query(
        'INSERT INTO "RecipeTag" (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [name]
      );
      let id: number;
      if ((res.rowCount ?? 0) > 0 && res.rows && res.rows[0]) {
        id = res.rows[0].id;
      } else {
        const sel = await client.query('SELECT id FROM "RecipeTag" WHERE name = $1', [name]);
        id = sel.rows[0].id;
      }
      tagIdCache.set(name, id);
      return id;
    }

    for (const r of recipes) {
      // ensure slug exists; fallback to a slugified title
      function slugify(s: string) {
        return s
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
          .slice(0, 200);
      }
      const recipeSlug = r.slug ?? (r.title ? slugify(r.title) : undefined);
      if (!recipeSlug) {
        throw new Error(`Recipe missing slug and title: ${JSON.stringify(r).slice(0,200)}`);
      }
      // Upsert recipe by slug
      const insertRecipe = await client.query(
        `INSERT INTO "Recipe" (slug, title, description, "totalTimeMinutes", difficulty, "costLevel", "isVegetarian", "isVegan", "isGlutenFree", equipment, servings, "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, NOW())
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           "totalTimeMinutes" = EXCLUDED."totalTimeMinutes",
           difficulty = EXCLUDED.difficulty,
           "costLevel" = EXCLUDED."costLevel",
           "isVegetarian" = EXCLUDED."isVegetarian",
           "isVegan" = EXCLUDED."isVegan",
           "isGlutenFree" = EXCLUDED."isGlutenFree",
           equipment = EXCLUDED.equipment,
          servings = EXCLUDED.servings,
          "updatedAt" = NOW()
         RETURNING id`,
        [
          recipeSlug,
          r.title,
          r.description ?? null,
          // totalTimeMinutes is non-null in the schema; provide fallback 0
          r.totalTimeMinutes ?? r.timeMinutes ?? 0,
          // Provide schema defaults when missing
          r.difficulty ?? 'EASY',
          r.costLevel ?? 'LOW',
          r.isVegetarian ?? false,
          r.isVegan ?? false,
          r.isGlutenFree ?? false,
          r.equipment && r.equipment.length ? JSON.stringify(r.equipment) : null,
          r.servings ?? null,
        ]
      );

      const recipeId = insertRecipe.rows[0].id;

      // Delete existing ingredients and steps for this recipe so we can re-insert preserving order
      await client.query('DELETE FROM "Ingredient" WHERE "recipeId" = $1', [recipeId]);
      await client.query('DELETE FROM "Step" WHERE "recipeId" = $1', [recipeId]);

      if (r.ingredients && r.ingredients.length) {
        for (let i = 0; i < r.ingredients.length; i++) {
          const ing = r.ingredients[i];
          const text = typeof ing === 'string' ? ing : (ing && typeof ing.text === 'string' ? ing.text : undefined);
          if (!text) continue;
          await client.query(
            'INSERT INTO "Ingredient" ("recipeId", text, "order") VALUES ($1, $2, $3)',
            [recipeId, text, i]
          );
        }
      }

      if (r.steps && r.steps.length) {
        for (let i = 0; i < r.steps.length; i++) {
          const step = r.steps[i];
          const text = typeof step === 'string' ? step : (step && typeof step.text === 'string' ? step.text : undefined);
          if (!text) continue;
          await client.query(
            'INSERT INTO "Step" ("recipeId", text, "order") VALUES ($1, $2, $3)',
            [recipeId, text, i]
          );
        }
      }

      // Tags
      if (r.tags && r.tags.length) {
        for (const t of r.tags) {
          const tagId = await getTagId(t);
          // Insert join row if not exists
          await client.query(
            'INSERT INTO "RecipeTagOnRecipe" ("recipeId", "tagId") VALUES ($1, $2) ON CONFLICT ("recipeId", "tagId") DO NOTHING',
            [recipeId, tagId]
          );
        }
      }
    }

    await client.query('COMMIT');
    console.log(`Seeded ${recipes.length} recipes into the database.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
