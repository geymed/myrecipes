import { notFound } from "next/navigation";
import Link from "next/link";
import { getRecipeById } from "@/lib/db/recipes";
import type { Recipe } from "@/app/types/recipe";

async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    return await getRecipeById(id);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  const getSourceLabel = () => {
    switch (recipe.sourceType) {
      case "website":
        return "אתר אינטרנט";
      case "instagram":
        return "אינסטגרם";
      default:
        return "טקסט";
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← חזרה לרשימת המתכונים
        </Link>

        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {recipe.title}
              </h1>
              {recipe.description && (
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  {recipe.description}
                </p>
              )}
            </div>
            <span className="text-3xl ml-4">{getSourceLabel()}</span>
          </div>

          {recipe.originalLink && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <a
                href={recipe.originalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                לצפייה במקור ← {recipe.originalLink}
              </a>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">מרכיבים</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            {recipe.images.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">תמונות</h2>
                <div className="space-y-4">
                  {recipe.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${recipe.title} - תמונה ${index + 1}`}
                      className="w-full rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">הוראות הכנה</h2>
            <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-lg">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
            <p>
              נוסף ב: {new Date(recipe.createdAt).toLocaleDateString("he-IL")}
            </p>
            {recipe.whatsappMessageTimestamp && (
              <p>
                מהודעת WhatsApp:{" "}
                {new Date(recipe.whatsappMessageTimestamp).toLocaleDateString(
                  "he-IL"
                )}
              </p>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
