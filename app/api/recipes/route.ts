import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const maxTimeParam = url.searchParams.get("maxTime");
    const vegetarianParam = url.searchParams.get("vegetarian");
    const veganParam = url.searchParams.get("vegan");
    const tagParam = url.searchParams.get("tag");
    const qParam = url.searchParams.get("q");

    const where: any = {};

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

    const recipes = await prisma.recipe.findMany({
      where,
      take: 20,
      include: {
        ingredients: { orderBy: { order: "asc" } },
        steps: { orderBy: { order: "asc" } },
        tags: { include: { tag: true } },
      },
    });

    // Map tags to names for clarity
    const mapped = recipes.map((r) => ({
      ...r,
      tags: r.tags.map((t) => t.tag.name),
    }));

    return NextResponse.json({ recipes: mapped });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
