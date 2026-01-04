import { NextResponse } from "next/server";
import { searchRecipes } from "@/lib/db/recipes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const recipes = await searchRecipes(query);
    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error searching recipes:", error);
    return NextResponse.json(
      { error: "Failed to search recipes" },
      { status: 500 }
    );
  }
}
