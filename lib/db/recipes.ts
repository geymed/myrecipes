import { prisma } from "./prisma";
import type { Recipe, RecipeInput, SourceType } from "@/app/types/recipe";

export async function getAllRecipes(): Promise<Recipe[]> {
  const recipes = await prisma.recipe.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return recipes.map(transformRecipe);
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const recipe = await prisma.recipe.findUnique({
    where: { id },
  });

  return recipe ? transformRecipe(recipe) : null;
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const recipes = await prisma.recipe.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { ingredients: { contains: query } },
        { instructions: { contains: query } },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return recipes.map(transformRecipe);
}

export async function getRecipesBySourceType(
  sourceType: SourceType
): Promise<Recipe[]> {
  const recipes = await prisma.recipe.findMany({
    where: { sourceType },
    orderBy: {
      createdAt: "desc",
    },
  });

  return recipes.map(transformRecipe);
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  const recipe = await prisma.recipe.create({
    data: {
      title: input.title,
      description: input.description,
      ingredients: JSON.stringify(input.ingredients),
      instructions: JSON.stringify(input.instructions),
      sourceType: input.sourceType,
      originalLink: input.originalLink,
      whatsappMessageId: input.whatsappMessageId,
      whatsappMessageTimestamp: input.whatsappMessageTimestamp,
      images: JSON.stringify(input.images || []),
      parsedContent: input.parsedContent
        ? JSON.stringify(input.parsedContent)
        : null,
    },
  });

  return transformRecipe(recipe);
}

export async function recipeExistsByMessageId(
  messageId: string
): Promise<boolean> {
  const count = await prisma.recipe.count({
    where: { whatsappMessageId: messageId },
  });
  return count > 0;
}

export async function deleteAllRecipes(): Promise<number> {
  const result = await prisma.recipe.deleteMany({});
  return result.count;
}

function transformRecipe(recipe: {
  id: string;
  title: string;
  description: string | null;
  ingredients: string;
  instructions: string;
  sourceType: string;
  originalLink: string | null;
  whatsappMessageId: string | null;
  whatsappMessageTimestamp: Date | null;
  images: string;
  parsedContent: string | null;
  createdAt: Date;
  lastSyncedAt: Date;
}): Recipe {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description || undefined,
    ingredients: JSON.parse(recipe.ingredients) as string[],
    instructions: JSON.parse(recipe.instructions) as string[],
    sourceType: recipe.sourceType as SourceType,
    originalLink: recipe.originalLink || undefined,
    whatsappMessageId: recipe.whatsappMessageId || undefined,
    whatsappMessageTimestamp: recipe.whatsappMessageTimestamp || undefined,
    images: JSON.parse(recipe.images) as string[],
    parsedContent: recipe.parsedContent
      ? (JSON.parse(recipe.parsedContent) as Record<string, unknown>)
      : undefined,
    createdAt: recipe.createdAt,
    lastSyncedAt: recipe.lastSyncedAt,
  };
}
