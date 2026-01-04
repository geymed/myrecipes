import { NextResponse } from "next/server";
import AdmZip from "adm-zip";
import { parseWhatsAppExport, parseWhatsAppMessage } from "@/app/lib/whatsapp/parser";
import { createRecipe, recipeExistsByMessageId } from "@/lib/db/recipes";

/**
 * Extract text file from WhatsApp zip export
 */
function extractTextFromZip(zipBuffer: Buffer): string | null {
  try {
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();

    // Find the .txt file (usually named like "_chat.txt" or similar)
    const textFile = zipEntries.find(
      (entry) =>
        entry.entryName.endsWith(".txt") &&
        !entry.isDirectory &&
        (entry.entryName.includes("chat") ||
          entry.entryName.includes("_") ||
          entry.entryName.match(/^\d/))
    );

    if (textFile) {
      return textFile.getData().toString("utf-8");
    }

    // If no obvious chat file found, try the first .txt file
    const firstTextFile = zipEntries.find(
      (entry) => entry.entryName.endsWith(".txt") && !entry.isDirectory
    );

    if (firstTextFile) {
      return firstTextFile.getData().toString("utf-8");
    }

    return null;
  } catch (error) {
    console.error("Error extracting zip file:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    let fileContent: string;

    // Check if file is a zip file
    if (file.name.endsWith(".zip") || file.type === "application/zip") {
      const arrayBuffer = await file.arrayBuffer();
      const zipBuffer = Buffer.from(arrayBuffer);
      const extractedText = extractTextFromZip(zipBuffer);

      if (!extractedText) {
        return NextResponse.json(
          { error: "Could not find chat text file in zip archive" },
          { status: 400 }
        );
      }

      fileContent = extractedText;
    } else {
      // Assume it's a text file
      fileContent = await file.text();
    }

    const messages = parseWhatsAppExport(fileContent);

    const results = {
      total: messages.length,
      parsed: 0,
      skipped: 0,
      duplicates: 0,
      errors: 0,
      recipes: [] as string[],
    };

    for (const message of messages) {
      try {
        const parsed = await parseWhatsAppMessage(message);

        if (!parsed) {
          results.skipped++;
          continue;
        }

        // Check for duplicates
        if (parsed.messageId && await recipeExistsByMessageId(parsed.messageId)) {
          results.duplicates++;
          continue;
        }

        // Create recipe
        const recipe = await createRecipe(parsed.recipe);
        results.parsed++;
        results.recipes.push(recipe.id);
      } catch (error) {
        console.error("Error processing message:", error);
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("Error importing WhatsApp export:", error);
    return NextResponse.json(
      { error: "Failed to import WhatsApp export" },
      { status: 500 }
    );
  }
}
