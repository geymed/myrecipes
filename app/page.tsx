import RecipeList from "./components/RecipeList";
import SearchBar from "./components/SearchBar";
import WhatsAppImport from "./components/WhatsAppImport";

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ספר המתכונים שלי
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            ספריית מתכונים ניתנת לחיפוש המסונכרנת מ-WhatsApp
          </p>
        </div>

        <WhatsAppImport />
        <SearchBar />
        <RecipeList />
      </div>
    </main>
  );
}
