"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RecipeCard from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";
import type { Recipe } from "../types/recipe";

function SearchResults() {
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">טוען תוצאות...</p>
      </div>
    );
  }

  if (query && recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          לא נמצאו מתכונים עבור &ldquo;{query}&rdquo;
        </p>
      </div>
    );
  }

  if (query && recipes.length > 0) {
    return (
      <div>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          נמצאו {recipes.length} מתכונים עבור &ldquo;{query}&rdquo;
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <p className="text-gray-600 dark:text-gray-400">
        הזן מילת חיפוש כדי להתחיל
      </p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">חיפוש מתכונים</h1>
        </div>

        <SearchBar />

        <Suspense
          fallback={
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">טוען...</p>
            </div>
          }
        >
          <SearchResults />
        </Suspense>
      </div>
    </main>
  );
}
