import { prisma } from "../lib/prisma.ts";

async function main() {
  // Create common tags (idempotent)
  const tagNames = [
    "breakfast",
    "under-10-minutes",
    "under-15-minutes",
    "under-20-minutes",
    "cheap",
    "one-pot",
    "one-pan",
    "microwave",
    "quick",
    "vegetarian",
    "vegan",
    "no-oven",
    "no-cook",
    "snack",
    "late-night",
    "high-protein",
    "comfort-food",
    "spicy",
    "meal-prep",
    "pan-fry",
    "lunch",
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

  // Additional recipes requested by user

  await prisma.recipe.upsert({
    where: { slug: "garlic-butter-ramen-bowl" },
    update: {},
    create: {
      slug: "garlic-butter-ramen-bowl",
      title: "Garlic Butter Ramen Bowl",
      description:
        "Upgrade instant ramen with butter, garlic, and a fried egg for a satisfying late-night meal.",
      totalTimeMinutes: 10,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      equipment: "pot, pan",
      servings: 1,
      ingredients: {
        create: [
          { text: "1 pack instant ramen (any flavor)", order: 1 },
          { text: "1 tbsp butter", order: 2 },
          { text: "1 clove garlic, minced", order: 3 },
          { text: "1 egg", order: 4 },
          { text: "1 tsp soy sauce", order: 5 },
          { text: "Chili flakes (optional)", order: 6 },
        ],
      },
      steps: {
        create: [
          { text: "Cook the instant ramen in a pot according to package instructions, then drain most of the water.", order: 1 },
          { text: "In a small pan, melt the butter over medium heat and sauté the minced garlic for about 30 seconds until fragrant.", order: 2 },
          { text: "Add the cooked noodles to the pan with the garlic butter and toss with soy sauce.", order: 3 },
          { text: "In the same or a separate pan, fry the egg to your liking.", order: 4 },
          { text: "Serve the garlicky noodles in a bowl topped with the fried egg and chili flakes.", order: 5 },
        ],
      },
      tags: { create: tagConnectFor(["under-15-minutes", "cheap", "one-pan", "late-night"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "no-oven-pizza-wrap" },
    update: {},
    create: {
      slug: "no-oven-pizza-wrap",
      title: "No-Oven Pizza Wrap",
      description: "Tortilla-based pizza you can cook on the stovetop in just a few minutes.",
      totalTimeMinutes: 8,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      equipment: "pan",
      servings: 1,
      ingredients: {
        create: [
          { text: "1 large tortilla", order: 1 },
          { text: "2–3 tbsp tomato sauce or passata", order: 2 },
          { text: "1/4 cup shredded cheese", order: 3 },
          { text: "1/2 tsp dried oregano", order: 4 },
          { text: "Leftover veggies (pepper, onion, corn, etc., optional)", order: 5 },
        ],
      },
      steps: {
        create: [
          { text: "Place the tortilla in a dry pan over medium heat.", order: 1 },
          { text: "Spread tomato sauce evenly over the tortilla, leaving a small border.", order: 2 },
          { text: "Sprinkle cheese and any leftover veggies on top.", order: 3 },
          { text: "Sprinkle with oregano, cover the pan with a lid, and cook until the cheese melts and the tortilla is crisp on the bottom.", order: 4 },
          { text: "Slice into wedges and serve immediately.", order: 5 },
        ],
      },
      tags: { create: tagConnectFor(["under-10-minutes", "cheap", "no-oven", "snack"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "15-minute-chickpea-curry" },
    update: {},
    create: {
      slug: "15-minute-chickpea-curry",
      title: "15-Minute Chickpea Curry",
      description: "A simple one-pot vegan curry using pantry staples.",
      totalTimeMinutes: 15,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      equipment: "pot",
      servings: 2,
      ingredients: {
        create: [
          { text: "1 can chickpeas, drained and rinsed", order: 1 },
          { text: "1/2 cup tomato sauce or passata", order: 2 },
          { text: "1/2 cup coconut milk", order: 3 },
          { text: "1 tsp curry powder", order: 4 },
          { text: "1/2 tsp garlic powder or 1 clove garlic, minced", order: 5 },
          { text: "Salt and pepper to taste", order: 6 },
          { text: "Cooked rice, for serving", order: 7 },
        ],
      },
      steps: {
        create: [
          { text: "Add chickpeas, tomato sauce, coconut milk, curry powder, and garlic to a pot.", order: 1 },
          { text: "Stir well and bring to a gentle simmer over medium heat.", order: 2 },
          { text: "Cook for about 10 minutes, stirring occasionally, until slightly thickened.", order: 3 },
          { text: "Season with salt and pepper.", order: 4 },
          { text: "Serve hot over cooked rice.", order: 5 },
        ],
      },
      tags: { create: tagConnectFor(["under-20-minutes", "vegan", "one-pot", "cheap", "high-protein"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "microwave-scrambled-egg-burrito" },
    update: {},
    create: {
      slug: "microwave-scrambled-egg-burrito",
      title: "Microwave Scrambled Egg Burrito",
      description: "A fast breakfast burrito made entirely in the microwave.",
      totalTimeMinutes: 5,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      equipment: "microwave",
      servings: 1,
      ingredients: {
        create: [
          { text: "2 eggs", order: 1 },
          { text: "1 tbsp milk or water", order: 2 },
          { text: "Salt and pepper", order: 3 },
          { text: "1 tortilla", order: 4 },
          { text: "2 tbsp shredded cheese", order: 5 },
          { text: "Hot sauce (optional)", order: 6 },
        ],
      },
      steps: {
        create: [
          { text: "Crack the eggs into a microwave-safe mug, add milk or water, and whisk with a fork.", order: 1 },
          { text: "Microwave in 20–30 second bursts, stirring in between, until the eggs are just set.", order: 2 },
          { text: "Warm the tortilla for 10–15 seconds in the microwave.", order: 3 },
          { text: "Place the scrambled eggs in the tortilla, sprinkle cheese on top, and add hot sauce if using.", order: 4 },
          { text: "Roll up into a burrito and microwave for another 10–15 seconds to melt the cheese.", order: 5 },
        ],
      },
      tags: { create: tagConnectFor(["under-10-minutes", "breakfast", "microwave", "cheap"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "lazy-pesto-pasta" },
    update: {},
    create: {
      slug: "lazy-pesto-pasta",
      title: "Lazy Pesto Pasta",
      description: "Three-ingredient pasta dish that tastes like you made an effort.",
      totalTimeMinutes: 12,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      equipment: "pot",
      servings: 1,
      ingredients: {
        create: [
          { text: "1 serving pasta", order: 1 },
          { text: "2 tbsp pesto", order: 2 },
          { text: "1 tbsp olive oil", order: 3 },
          { text: "Salt and pepper", order: 4 },
        ],
      },
      steps: {
        create: [
          { text: "Cook the pasta in salted boiling water according to package instructions.", order: 1 },
          { text: "Reserve a small splash of pasta water, then drain.", order: 2 },
          { text: "Stir pesto and olive oil into the hot pasta, loosening with a bit of pasta water if needed.", order: 3 },
          { text: "Season with salt and pepper and serve.", order: 4 },
        ],
      },
      tags: { create: tagConnectFor(["under-15-minutes", "vegetarian", "cheap", "one-pot"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "one-pan-tomato-rice" },
    update: {},
    create: {
      slug: "one-pan-tomato-rice",
      title: "One-Pan Tomato Rice",
      description: "Rice simmered in tomato broth for an easy, flavorful base.",
      totalTimeMinutes: 18,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      equipment: "pan with lid",
      servings: 2,
      ingredients: {
        create: [
          { text: "1 cup rice, rinsed", order: 1 },
          { text: "1 cup water", order: 2 },
          { text: "1/2 cup tomato sauce or passata", order: 3 },
          { text: "1 tsp dried oregano", order: 4 },
          { text: "1/2 tsp salt", order: 5 },
          { text: "1 tbsp oil", order: 6 },
        ],
      },
      steps: {
        create: [
          { text: "Add rice, water, tomato sauce, oregano, salt, and oil to a pan.", order: 1 },
          { text: "Stir and bring to a simmer over medium heat.", order: 2 },
          { text: "Reduce heat to low, cover with a lid, and cook for 15–18 minutes until rice is tender and liquid absorbed.", order: 3 },
          { text: "Fluff with a fork and serve.", order: 4 },
        ],
      },
      tags: { create: tagConnectFor(["one-pot", "cheap", "under-20-minutes", "vegan"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "microwave-potato-mash-bowl" },
    update: {},
    create: {
      slug: "microwave-potato-mash-bowl",
      title: "Microwave Potato Mash Bowl",
      description: "Mashed potatoes without needing to boil a single pot.",
      totalTimeMinutes: 12,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      equipment: "microwave",
      servings: 1,
      ingredients: {
        create: [
          { text: "2 medium potatoes", order: 1 },
          { text: "1 tbsp butter or margarine", order: 2 },
          { text: "2–3 tbsp milk or plant milk", order: 3 },
          { text: "Salt and pepper", order: 4 },
        ],
      },
      steps: {
        create: [
          { text: "Peel (optional) and cube the potatoes into small pieces.", order: 1 },
          { text: "Place cubes in a microwave-safe bowl with a splash of water, cover, and microwave 6–8 minutes until very soft.", order: 2 },
          { text: "Drain any excess water and mash potatoes with butter and milk.", order: 3 },
          { text: "Season with salt and pepper and mash until creamy.", order: 4 },
        ],
      },
      tags: { create: tagConnectFor(["microwave", "cheap", "comfort-food", "vegetarian"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "quick-tuna-fried-rice" },
    update: {},
    create: {
      slug: "quick-tuna-fried-rice",
      title: "Quick Tuna Fried Rice",
      description: "One-pan fried rice using leftover rice and a can of tuna.",
      totalTimeMinutes: 12,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      equipment: "pan",
      servings: 2,
      ingredients: {
        create: [
          { text: "1 cup cooked rice (preferably cold)", order: 1 },
          { text: "1 can tuna, drained", order: 2 },
          { text: "1 egg", order: 3 },
          { text: "1 tbsp soy sauce", order: 4 },
          { text: "1 tbsp oil", order: 5 },
          { text: "Frozen peas or mixed veggies (optional)", order: 6 },
        ],
      },
      steps: {
        create: [
          { text: "Heat oil in a pan over medium-high heat.", order: 1 },
          { text: "Add the cooked rice and stir-fry for 1–2 minutes.", order: 2 },
          { text: "Push rice to one side, crack in the egg, and scramble until mostly set.", order: 3 },
          { text: "Stir in the tuna and any frozen veggies.", order: 4 },
          { text: "Add soy sauce and cook for another 2–3 minutes, stirring, until hot.", order: 5 },
        ],
      },
      tags: { create: tagConnectFor(["one-pan", "cheap", "under-15-minutes", "high-protein"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "5-minute-hummus-wrap" },
    update: {},
    create: {
      slug: "5-minute-hummus-wrap",
      title: "5-Minute Hummus Wrap",
      description: "A fresh, no-cook wrap perfect for quick lunches between classes.",
      totalTimeMinutes: 5,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: false,
      equipment: "none",
      servings: 1,
      ingredients: {
        create: [
          { text: "1 tortilla or flatbread", order: 1 },
          { text: "2–3 tbsp hummus", order: 2 },
          { text: "A handful of lettuce or spinach", order: 3 },
          { text: "Sliced cucumber or tomato", order: 4 },
          { text: "Salt and pepper", order: 5 },
        ],
      },
      steps: {
        create: [
          { text: "Lay the tortilla flat and spread hummus evenly over it.", order: 1 },
          { text: "Top with greens and sliced veggies.", order: 2 },
          { text: "Season lightly with salt and pepper.", order: 3 },
          { text: "Roll up tightly and slice in half to serve.", order: 4 },
        ],
      },
      tags: { create: tagConnectFor(["under-10-minutes", "vegan", "no-cook", "cheap", "lunch"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "creamy-microwave-oats" },
    update: {},
    create: {
      slug: "creamy-microwave-oats",
      title: "Creamy Microwave Oats",
      description: "A warm, filling breakfast in just a few minutes and one bowl.",
      totalTimeMinutes: 4,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      equipment: "microwave",
      servings: 1,
      ingredients: {
        create: [
          { text: "1/2 cup rolled oats", order: 1 },
          { text: "1 cup milk or water", order: 2 },
          { text: "1 tsp honey or sugar", order: 3 },
          { text: "Optional toppings: fruit, nuts, peanut butter", order: 4 },
        ],
      },
      steps: {
        create: [
          { text: "Add oats and milk or water to a microwave-safe bowl.", order: 1 },
          { text: "Microwave for 2–3 minutes, stirring once halfway through, until thickened.", order: 2 },
          { text: "Sweeten with honey or sugar.", order: 3 },
          { text: "Top with any fruit, nuts, or peanut butter you have.", order: 4 },
        ],
      },
      tags: { create: tagConnectFor(["breakfast", "microwave", "cheap", "under-10-minutes"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "spicy-peanut-butter-noodles" },
    update: {},
    create: {
      slug: "spicy-peanut-butter-noodles",
      title: "Spicy Peanut Butter Noodles",
      description: "Instant noodles transformed with a creamy spicy peanut sauce.",
      totalTimeMinutes: 10,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      equipment: "pot, bowl",
      servings: 1,
      ingredients: {
        create: [
          { text: "1 pack instant noodles (without seasoning or use half the packet)", order: 1 },
          { text: "1 tbsp peanut butter", order: 2 },
          { text: "1 tsp soy sauce", order: 3 },
          { text: "1/2 tsp chili sauce or sriracha", order: 4 },
          { text: "2–3 tbsp hot noodle cooking water", order: 5 },
          { text: "Spring onion (optional)", order: 6 },
        ],
      },
      steps: {
        create: [
          { text: "Cook noodles according to package instructions and reserve some cooking water.", order: 1 },
          { text: "In a bowl, mix peanut butter, soy sauce, chili sauce, and hot water until smooth.", order: 2 },
          { text: "Drain noodles and toss them in the peanut sauce.", order: 3 },
          { text: "Top with chopped spring onion if you have it.", order: 4 },
        ],
      },
      tags: { create: tagConnectFor(["under-15-minutes", "cheap", "spicy", "late-night"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "one-pot-lentil-tomato-stew" },
    update: {},
    create: {
      slug: "one-pot-lentil-tomato-stew",
      title: "One-Pot Lentil Tomato Stew",
      description: "Hearty lentil stew with tomato, perfect for batch cooking.",
      totalTimeMinutes: 20,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      equipment: "pot",
      servings: 3,
      ingredients: {
        create: [
          { text: "1 cup red lentils, rinsed", order: 1 },
          { text: "2 cups water or broth", order: 2 },
          { text: "1/2 cup tomato sauce or passata", order: 3 },
          { text: "1 tsp paprika", order: 4 },
          { text: "1/2 tsp garlic powder", order: 5 },
          { text: "Salt and pepper", order: 6 },
          { text: "1 tbsp oil", order: 7 },
        ],
      },
      steps: {
        create: [
          { text: "Add lentils, water or broth, tomato sauce, paprika, garlic powder, and oil to a pot.", order: 1 },
          { text: "Stir and bring to a boil, then reduce heat to low.", order: 2 },
          { text: "Simmer for 15–20 minutes, stirring occasionally, until lentils are soft and stew is thick.", order: 3 },
          { text: "Season with salt and pepper and serve.", order: 4 },
        ],
      },
      tags: { create: tagConnectFor(["one-pot", "cheap", "vegan", "meal-prep", "high-protein"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "microwave-veggie-quesadilla" },
    update: {},
    create: {
      slug: "microwave-veggie-quesadilla",
      title: "Microwave Veggie Quesadilla",
      description: "Cheesy quesadilla made in the microwave with whatever veggies you have.",
      totalTimeMinutes: 6,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      equipment: "microwave",
      servings: 1,
      ingredients: {
        create: [
          { text: "1 tortilla", order: 1 },
          { text: "1/4 cup shredded cheese", order: 2 },
          { text: "A small handful of chopped veggies (pepper, onion, corn, etc.)", order: 3 },
        ],
      },
      steps: {
        create: [
          { text: "Place the tortilla on a microwave-safe plate.", order: 1 },
          { text: "Sprinkle cheese over half the tortilla, then add chopped veggies.", order: 2 },
          { text: "Fold the tortilla over to cover the filling.", order: 3 },
          { text: "Microwave for 45–60 seconds until the cheese is melted.", order: 4 },
          { text: "Let cool briefly, then slice and serve.", order: 5 },
        ],
      },
      tags: { create: tagConnectFor(["microwave", "under-10-minutes", "snack", "vegetarian"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "quick-egg-fried-tortilla" },
    update: {},
    create: {
      slug: "quick-egg-fried-tortilla",
      title: "Quick Egg Fried Tortilla",
      description: "Crispy tortilla fried together with egg for a cheap, filling meal.",
      totalTimeMinutes: 10,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      equipment: "pan",
      servings: 1,
      ingredients: {
        create: [
          { text: "1 tortilla", order: 1 },
          { text: "2 eggs", order: 2 },
          { text: "1 tbsp oil or butter", order: 3 },
          { text: "1 tsp soy sauce (optional)", order: 4 },
          { text: "Chili flakes (optional)", order: 5 },
        ],
      },
      steps: {
        create: [
          { text: "Whisk the eggs in a bowl with soy sauce if using.", order: 1 },
          { text: "Heat oil or butter in a pan over medium heat.", order: 2 },
          { text: "Pour in the eggs and immediately place the tortilla on top.", order: 3 },
          { text: "When the eggs are mostly set, flip so the tortilla crisps on the pan.", order: 4 },
          { text: "Cook until golden, then roll or fold and serve with chili flakes.", order: 5 },
        ],
      },
      tags: { create: tagConnectFor(["under-15-minutes", "cheap", "pan-fry", "breakfast"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "10-minute-bean-rice-bowl" },
    update: {},
    create: {
      slug: "10-minute-bean-rice-bowl",
      title: "10-Minute Bean & Rice Bowl",
      description: "Microwave rice and canned beans come together for a fast, filling bowl.",
      totalTimeMinutes: 10,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      equipment: "microwave",
      servings: 1,
      ingredients: {
        create: [
          { text: "1 microwave pouch of rice or 1 cup cooked rice", order: 1 },
          { text: "1/2 can beans (black beans, kidney beans, etc.), drained and rinsed", order: 2 },
          { text: "2 tbsp salsa or tomato sauce", order: 3 },
          { text: "Salt and pepper", order: 4 },
          { text: "Optional: grated cheese or avocado", order: 5 },
        ],
      },
      steps: {
        create: [
          { text: "Heat the rice according to package instructions if using a pouch.", order: 1 },
          { text: "Combine beans and salsa in a microwave-safe bowl and heat for 1–2 minutes.", order: 2 },
          { text: "Add rice to the bowl and mix well.", order: 3 },
          { text: "Season with salt and pepper and top with cheese or avocado if you like.", order: 4 },
        ],
      },
      tags: { create: tagConnectFor(["under-15-minutes", "cheap", "vegan", "high-protein"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "honey-soy-chicken-bites" },
    update: {},
    create: {
      slug: "honey-soy-chicken-bites",
      title: "Honey Soy Chicken Bites",
      description: "Small chicken pieces cooked quickly in a sweet soy glaze.",
      totalTimeMinutes: 15,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      equipment: "pan",
      servings: 2,
      ingredients: {
        create: [
          { text: "200 g chicken breast or thigh, cut into small pieces", order: 1 },
          { text: "1 tbsp soy sauce", order: 2 },
          { text: "1 tbsp honey", order: 3 },
          { text: "1 tbsp oil", order: 4 },
          { text: "1 clove garlic, minced or 1/2 tsp garlic powder", order: 5 },
          { text: "Cooked rice, for serving", order: 6 },
        ],
      },
      steps: {
        create: [
          { text: "Heat oil in a pan over medium-high heat.", order: 1 },
          { text: "Add chicken pieces and cook until lightly browned.", order: 2 },
          { text: "Stir in garlic and cook for 30 seconds.", order: 3 },
          { text: "Add soy sauce and honey, stirring to coat the chicken.", order: 4 },
          { text: "Cook for another 2–3 minutes until the sauce is sticky and chicken is cooked through.", order: 5 },
          { text: "Serve over rice.", order: 6 },
        ],
      },
      tags: { create: tagConnectFor(["under-20-minutes", "cheap", "high-protein", "one-pan"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "simple-garlic-butter-rice" },
    update: {},
    create: {
      slug: "simple-garlic-butter-rice",
      title: "Simple Garlic Butter Rice",
      description: "Turn plain rice into something addictive with garlic and butter.",
      totalTimeMinutes: 12,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      equipment: "pan",
      servings: 2,
      ingredients: {
        create: [
          { text: "2 cups cooked rice", order: 1 },
          { text: "2 tbsp butter", order: 2 },
          { text: "2 cloves garlic, minced", order: 3 },
          { text: "Salt and pepper", order: 4 },
          { text: "Chopped parsley or spring onion (optional)", order: 5 },
        ],
      },
      steps: {
        create: [
          { text: "Melt butter in a pan over medium heat.", order: 1 },
          { text: "Add minced garlic and cook until fragrant but not browned.", order: 2 },
          { text: "Stir in the cooked rice and fry for 3–4 minutes, breaking up clumps.", order: 3 },
          { text: "Season with salt and pepper.", order: 4 },
          { text: "Top with chopped herbs if you have them.", order: 5 },
        ],
      },
      tags: { create: tagConnectFor(["under-15-minutes", "cheap", "comfort-food", "vegetarian"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "one-pot-creamy-tomato-pasta" },
    update: {},
    create: {
      slug: "one-pot-creamy-tomato-pasta",
      title: "One-Pot Creamy Tomato Pasta",
      description: "Pasta cooked directly in a creamy tomato sauce for minimal cleanup.",
      totalTimeMinutes: 18,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      equipment: "pot with lid",
      servings: 2,
      ingredients: {
        create: [
          { text: "1.5 cups short pasta", order: 1 },
          { text: "2 cups water or broth", order: 2 },
          { text: "1/2 cup tomato sauce or passata", order: 3 },
          { text: "1/2 cup milk or cream", order: 4 },
          { text: "1 tbsp oil", order: 5 },
          { text: "1/2 tsp garlic powder", order: 6 },
          { text: "Salt and pepper", order: 7 },
          { text: "2 tbsp grated cheese (optional)", order: 8 },
        ],
      },
      steps: {
        create: [
          { text: "Add pasta, water or broth, tomato sauce, milk, oil, garlic powder, and a pinch of salt to a pot.", order: 1 },
          { text: "Bring to a boil, then reduce heat to medium-low.", order: 2 },
          { text: "Cook uncovered, stirring occasionally, until the pasta is tender and the liquid has thickened into a sauce (about 12–15 minutes).", order: 3 },
          { text: "Stir in cheese if using and adjust seasoning with salt and pepper.", order: 4 },
        ],
      },
      tags: { create: tagConnectFor(["one-pot", "cheap", "under-20-minutes", "comfort-food"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "microwave-mac-and-peas" },
    update: {},
    create: {
      slug: "microwave-mac-and-peas",
      title: "Microwave Mac & Peas",
      description: "Mac and cheese shortcut with peas, made entirely in the microwave.",
      totalTimeMinutes: 12,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      equipment: "microwave",
      servings: 1,
      ingredients: {
        create: [
          { text: "1/2 cup small pasta (macaroni or similar)", order: 1 },
          { text: "1 cup water", order: 2 },
          { text: "1/4 cup frozen peas", order: 3 },
          { text: "1/4 cup shredded cheese", order: 4 },
          { text: "Salt and pepper", order: 5 },
        ],
      },
      steps: {
        create: [
          { text: "Add pasta and water to a large microwave-safe bowl (the water should cover the pasta).", order: 1 },
          { text: "Microwave in 2–3 minute bursts, stirring in between, until the pasta is just tender and most of the water is absorbed (around 8–10 minutes total).", order: 2 },
          { text: "Stir in frozen peas and cheese.", order: 3 },
          { text: "Microwave for another 30–60 seconds until peas are hot and cheese is melted.", order: 4 },
          { text: "Season with salt and pepper and serve.", order: 5 },
        ],
      },
      tags: { create: tagConnectFor(["microwave", "cheap", "under-15-minutes", "comfort-food"]) },
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "cheesy-veggie-omelette" },
    update: {},
    create: {
      slug: "cheesy-veggie-omelette",
      title: "Cheesy Veggie Omelette",
      description: "Simple omelette packed with leftover veggies and melted cheese.",
      totalTimeMinutes: 10,
      difficulty: "EASY",
      costLevel: "LOW",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      equipment: "pan",
      servings: 1,
      ingredients: {
        create: [
          { text: "2–3 eggs", order: 1 },
          { text: "2 tbsp milk or water", order: 2 },
          { text: "1/4 cup chopped veggies (onion, pepper, tomato, etc.)", order: 3 },
          { text: "1/4 cup shredded cheese", order: 4 },
          { text: "1 tbsp oil or butter", order: 5 },
          { text: "Salt and pepper", order: 6 },
        ],
      },
      steps: {
        create: [
          { text: "Whisk eggs with milk or water, salt, and pepper in a bowl.", order: 1 },
          { text: "Heat oil or butter in a pan over medium heat.", order: 2 },
          { text: "Add chopped veggies and cook for 2–3 minutes until slightly softened.", order: 3 },
          { text: "Pour egg mixture over the veggies and tilt the pan to spread evenly.", order: 4 },
          { text: "When the omelette is almost set, sprinkle cheese on one half, fold, and cook another minute.", order: 5 },
          { text: "Slide onto a plate and serve.", order: 6 },
        ],
      },
      tags: { create: tagConnectFor(["under-15-minutes", "cheap", "breakfast", "vegetarian", "high-protein"]) },
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
