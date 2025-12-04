import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(_req: NextRequest, context: { params: any }) {
  try {
    const params = await Promise.resolve(context.params);
    const { slug } = params as { slug: string };
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        ingredients: { orderBy: { order: "asc" } },
        steps: { orderBy: { order: "asc" } },
        tags: { include: { tag: true } },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const mapped = { ...recipe, tags: recipe.tags.map((t: { tag: { name: string } }) => t.tag.name) };

    return NextResponse.json(mapped);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
