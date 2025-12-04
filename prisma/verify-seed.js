require('dotenv').config();
const { Client } = require('pg');

async function verify() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const res = await client.query(`
      SELECT
        (SELECT count(*) FROM "Recipe") as recipes,
        (SELECT count(*) FROM "Ingredient") as ingredients,
        (SELECT count(*) FROM "Step") as steps,
        (SELECT count(*) FROM "RecipeTag") as tags,
        (SELECT count(*) FROM "RecipeTagOnRecipe") as tag_joins
    `);

    console.log('Seed verification counts:', res.rows[0]);
  } catch (err) {
    console.error('Verification query failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});
