"use client";

import { useState } from "react";

export default function WhatsAppImport() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    total: number;
    parsed: number;
    skipped: number;
    duplicates: number;
    errors: number;
  } | null>(null);
  const [clearResult, setClearResult] = useState<{
    success: boolean;
    deleted: number;
    message: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import/whatsapp", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById(
          "whatsapp-file"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        // Refresh the page to show new recipes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setResult({
          success: false,
          total: 0,
          parsed: 0,
          skipped: 0,
          duplicates: 0,
          errors: 1,
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setResult({
        success: false,
        total: 0,
        parsed: 0,
        skipped: 0,
        duplicates: 0,
        errors: 1,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את כל המתכונים? פעולה זו בלתי הפיכה.")) {
      return;
    }

    setClearing(true);
    setClearResult(null);

    try {
      const response = await fetch("/api/recipes/clear", {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setClearResult(data);
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setClearResult({
          success: false,
          deleted: 0,
          message: "שגיאה במחיקת המתכונים",
        });
      }
    } catch (error) {
      console.error("Error clearing recipes:", error);
      setClearResult({
        success: false,
        deleted: 0,
        message: "שגיאה במחיקת המתכונים",
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">ייבוא מ-WhatsApp</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        ייצא את ההיסטוריה של קבוצת WhatsApp והעלה את הקובץ כאן (ZIP או TXT)
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="whatsapp-file"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            בחר קובץ ייצוא WhatsApp (.zip או .txt)
          </label>
          <input
            id="whatsapp-file"
            type="file"
            accept=".zip,.txt"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900 dark:file:text-blue-300
              dark:hover:file:bg-blue-800"
            disabled={uploading}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={!file || uploading || clearing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? "מעבד..." : "ייבא מתכונים"}
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={uploading || clearing}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {clearing ? "מוחק..." : "מחק את כל המתכונים"}
          </button>
        </div>
      </form>

      {clearResult && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            clearResult.success
              ? "bg-green-50 dark:bg-green-900/20"
              : "bg-red-50 dark:bg-red-900/20"
          }`}
        >
          <p className="font-medium">{clearResult.message}</p>
        </div>
      )}

      {result && (
        <div
          className={`mt-6 p-4 rounded-lg ${
            result.success
              ? "bg-green-50 dark:bg-green-900/20"
              : "bg-red-50 dark:bg-red-900/20"
          }`}
        >
          <h3 className="font-bold mb-2">
            {result.success ? "ייבוא הושלם!" : "שגיאה בייבוא"}
          </h3>
          <ul className="text-sm space-y-1">
            <li>סה"כ הודעות: {result.total}</li>
            <li className="text-green-600 dark:text-green-400">
              מתכונים שנוספו: {result.parsed}
            </li>
            <li className="text-yellow-600 dark:text-yellow-400">
              הודעות שדולגו: {result.skipped}
            </li>
            <li className="text-gray-600 dark:text-gray-400">
              כפילויות: {result.duplicates}
            </li>
            {result.errors > 0 && (
              <li className="text-red-600 dark:text-red-400">
                שגיאות: {result.errors}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
