import { NextResponse } from "next/server";
import { getAllRecipes, createRecipe } from "@/lib/db/recipes";
import type { RecipeInput } from "@/app/types/recipe";

export async function GET() {
  try {
    const recipes = await getAllRecipes();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: RecipeInput = await request.json();
    const recipe = await createRecipe(body);
    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}
