"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RecipeCard from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";
import type { Recipe } from "../types/recipe";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      searchRecipes(query);
    } else {
      setRecipes([]);
    }
  }, [query]);

  const searchRecipes = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/recipes/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) {
        throw new Error("Failed to search recipes");
      }
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Error searching recipes:", error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">חיפוש מתכונים</h1>
        </div>

        <SearchBar />

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">טוען תוצאות...</p>
          </div>
        ) : query && recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              לא נמצאו מתכונים עבור "{query}"
            </p>
          </div>
        ) : query && recipes.length > 0 ? (
          <div>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              נמצאו {recipes.length} מתכונים עבור "{query}"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              הזן מילת חיפוש כדי להתחיל
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
