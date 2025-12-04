import { prisma } from "../lib/prisma.ts";

async function main() {
  // Create common tags (idempotent)
  const tagNames = [
    "breakfast",
    "under-10-minutes",
    "under-15-minutes",
    "cheap",
    "one-pot",
    "microwave",
    "quick",
    "vegetarian",
  ];

  const tagRecords = {} as Record<string, { id: number; name: string }>;

  for (const name of tagNames) {
    const t = await prisma.recipeTag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tagRecords[name] = t;
  }

  // Helper to build tag connect objects for the join table
  const tagConnectFor = (names: string[]) =>
    names.map((n) => ({ tag: { connect: { id: tagRecords[n].id } } }));

  // 1) 5-Minute Scrambled Eggs
  await prisma.recipe.upsert({
    where: { slug: "5-minute-scrambled-eggs" },
    update: {},
    create: {
      slug: "5-minute-scrambled-eggs",
      title: "5-Minute Scrambled Eggs",
      description: "Cheap, fast protein breakfast for students.",
      totalTimeMinutes: 5,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      equipment: "pan, stove",
      servings: 1,
      ingredients: {
        create: [
          { text: "2 eggs", order: 1 },
          { text: "1 tbsp butter or oil", order: 2 },
          { text: "Salt and pepper, to taste", order: 3 },
        ],
      },
      steps: {
        create: [
          { text: "Crack eggs into a bowl and whisk.", order: 1 },
          { text: "Heat butter or oil in a pan over medium heat.", order: 2 },
          { text: "Pour in the eggs and stir continuously until just set.", order: 3 },
        ],
      },
      tags: {
        create: tagConnectFor(["breakfast", "under-10-minutes", "cheap"]),
      },
    },
  });

  // 2) Microwave Mug Mac and Cheese
  await prisma.recipe.upsert({
    where: { slug: "microwave-mug-mac-and-cheese" },
    update: {},
    create: {
      slug: "microwave-mug-mac-and-cheese",
      title: "Microwave Mug Mac & Cheese",
      description: "Single-serve mac and cheese using only a mug and microwave.",
      totalTimeMinutes: 8,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      equipment: "microwave, mug",
      servings: 1,
      ingredients: {
        create: [
          { text: "1/2 cup macaroni", order: 1 },
          { text: "1/2 cup water", order: 2 },
          { text: "1/4 cup shredded cheese", order: 3 },
          { text: "Salt to taste", order: 4 },
        ],
      },
      steps: {
        create: [
          { text: "Combine macaroni and water in a microwave-safe mug.", order: 1 },
          { text: "Microwave 2-3 minutes, stir, then microwave until pasta is cooked.", order: 2 },
          { text: "Stir in cheese until melted; season to taste.", order: 3 },
        ],
      },
      tags: {
        create: tagConnectFor(["under-15-minutes", "microwave", "cheap"]),
      },
    },
  });

  // 3) One-Pot Veggie Rice (simple, cheap, vegetarian)
  await prisma.recipe.upsert({
    where: { slug: "one-pot-veg-rice" },
    update: {},
    create: {
      slug: "one-pot-veg-rice",
      title: "One-Pot Veggie Rice",
      description: "Minimal cleanup, one-pot rice with frozen veggies.",
      totalTimeMinutes: 20,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      equipment: "pot, stove",
      servings: 2,
      ingredients: {
        create: [
          { text: "1 cup rice", order: 1 },
          { text: "2 cups water or stock", order: 2 },
          { text: "1 cup frozen mixed vegetables", order: 3 },
          { text: "Salt and pepper", order: 4 },
        ],
      },
      steps: {
        create: [
          { text: "Combine rice and water/stock in a pot and bring to a boil.", order: 1 },
          { text: "Reduce heat, cover and simmer 15 minutes.", order: 2 },
          { text: "Stir in frozen veggies, heat through and season.", order: 3 },
        ],
      },
      tags: {
        create: tagConnectFor(["one-pot", "cheap", "quick"]),
      },
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
