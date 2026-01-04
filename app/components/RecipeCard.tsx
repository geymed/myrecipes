import Link from "next/link";
import type { Recipe } from "@/app/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const getSourceIcon = () => {
    switch (recipe.sourceType) {
      case "website":
        return "🌐";
      case "instagram":
        return "📷";
      default:
        return "📝";
    }
  };

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {recipe.title}
        </h2>
        <span className="text-2xl">{getSourceIcon()}</span>
      </div>

      {recipe.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {recipe.description}
        </p>
      )}

      {recipe.originalLink && (
        <div className="mb-3">
          <a
            href={recipe.originalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            לצפייה במקור →
          </a>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{recipe.ingredients.length} מרכיבים</span>
        <span>
          {new Date(recipe.createdAt).toLocaleDateString("he-IL")}
        </span>
      </div>
    </Link>
  );
}
