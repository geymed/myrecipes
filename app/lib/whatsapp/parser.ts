import type { RecipeInput, SourceType } from "@/app/types/recipe";
import { scrapeRecipeFromUrl } from "./recipe-scraper";

export interface WhatsAppMessage {
  timestamp: Date;
  author: string;
  content: string;
  media?: string[];
}

export interface ParsedRecipe {
  recipe: RecipeInput;
  messageId: string;
}

/**
 * Extract URLs from text
 */
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

/**
 * Check if URL is an Instagram link
 */
function isInstagramUrl(url: string): boolean {
  return /instagram\.com/.test(url) || /instagr\.am/.test(url);
}

/**
 * Check if URL is a recipe website
 */
function isRecipeWebsite(url: string): boolean {
  const recipeDomains = [
    "allrecipes",
    "food",
    "cooking",
    "recipe",
    "matkon",
    "shufersal",
    "rami-levy",
    "co.il",
  ];
  return recipeDomains.some((domain) => url.toLowerCase().includes(domain));
}

/**
 * Determine source type from message content
 */
function determineSourceType(content: string, urls: string[]): SourceType {
  if (urls.length === 0) {
    return "text";
  }

  const instagramUrl = urls.find(isInstagramUrl);
  if (instagramUrl) {
    return "instagram";
  }

  const recipeUrl = urls.find(isRecipeWebsite);
  if (recipeUrl) {
    return "website";
  }

  // If there's a URL but we're not sure, default to website
  return "website";
}

/**
 * Extract recipe title from message
 */
function extractTitle(content: string): string {
  // Try to find title in first line or before first colon/newline
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Remove URLs from title
    const titleWithoutUrls = firstLine.replace(/(https?:\/\/[^\s]+)/g, "").trim();
    if (titleWithoutUrls.length > 0 && titleWithoutUrls.length < 100) {
      return titleWithoutUrls;
    }
  }
  return "מתכון ללא כותרת";
}

/**
 * Extract ingredients from Hebrew text
 */
function extractIngredients(content: string): string[] {
  const ingredients: string[] = [];
  const lines = content.split("\n");

  // Common Hebrew patterns for ingredients
  const ingredientKeywords = [
    "מרכיבים",
    "רכיבים",
    "חומרים",
    "מה צריך",
    "רשימת מצרכים",
  ];

  let inIngredientsSection = false;
  const instructionKeywords = ["הוראות", "אופן הכנה", "שלבים", "איך"];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Check if we're entering ingredients section
    if (
      ingredientKeywords.some((keyword) =>
        trimmedLine.toLowerCase().includes(keyword)
      )
    ) {
      inIngredientsSection = true;
      continue;
    }

    // Check if we're leaving ingredients section (entering instructions)
    if (
      instructionKeywords.some((keyword) =>
        trimmedLine.toLowerCase().includes(keyword)
      )
    ) {
      inIngredientsSection = false;
      break;
    }

    // If in ingredients section, add line as ingredient
    if (inIngredientsSection) {
      // Remove common prefixes like "-", "•", numbers
      const cleaned = trimmedLine
        .replace(/^[-•\d.\s)]+/, "")
        .trim();
      if (cleaned.length > 0) {
        ingredients.push(cleaned);
      }
    }
  }

  // If no ingredients section found, try to extract from list format
  if (ingredients.length === 0) {
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Look for list items (starting with -, •, or numbers)
      if (/^[-•\d.]/.test(trimmedLine) && trimmedLine.length > 3) {
        const cleaned = trimmedLine.replace(/^[-•\d.\s)]+/, "").trim();
        if (cleaned.length > 0 && !trimmedLine.toLowerCase().includes("הוראות")) {
          ingredients.push(cleaned);
        }
      }
    }
  }

  return ingredients;
}

/**
 * Extract instructions from Hebrew text
 */
function extractInstructions(content: string): string[] {
  const instructions: string[] = [];
  const lines = content.split("\n");

  const instructionKeywords = [
    "הוראות",
    "אופן הכנה",
    "שלבים",
    "איך",
    "תהליך",
  ];

  let inInstructionsSection = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Check if we're entering instructions section
    if (
      instructionKeywords.some((keyword) =>
        trimmedLine.toLowerCase().includes(keyword)
      )
    ) {
      inInstructionsSection = true;
      continue;
    }

    // If in instructions section, add line as instruction
    if (inInstructionsSection) {
      // Remove common prefixes
      const cleaned = trimmedLine.replace(/^[-•\d.\s)]+/, "").trim();
      if (cleaned.length > 0) {
        instructions.push(cleaned);
      }
    }
  }

  // If no instructions section found, try to extract numbered steps
  if (instructions.length === 0) {
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Look for numbered steps
      if (/^\d+[.)]/.test(trimmedLine) && trimmedLine.length > 5) {
        const cleaned = trimmedLine.replace(/^\d+[.)]\s*/, "").trim();
        if (cleaned.length > 0) {
          instructions.push(cleaned);
        }
      }
    }
  }

  return instructions;
}

/**
 * Generate a unique message ID from timestamp and content
 */
function generateMessageId(timestamp: Date, content: string): string {
  const timestampStr = timestamp.toISOString();
  const contentHash = content.substring(0, 50).replace(/\s/g, "");
  return `${timestampStr}-${contentHash}`.replace(/[^a-zA-Z0-9-]/g, "");
}

/**
 * Parse a WhatsApp message into a recipe
 */
export async function parseWhatsAppMessage(
  message: WhatsAppMessage
): Promise<ParsedRecipe | null> {
  const content = message.content.trim();

  // Skip if message is too short or doesn't look like a recipe
  if (content.length < 10) {
    return null;
  }

  // Skip system messages or non-recipe content
  const skipPatterns = [
    /^הצטרף/,
    /^עזב/,
    /^שינה את/,
    /^הוסיף/,
    /^הסיר/,
    /^Messages and calls are end-to-end encrypted/,
    /^You created this group/,
    /^You deleted this message/,
    /^This message was deleted/,
    /^Your security code/,
    /^You changed this group/,
    /^Tap to learn more/,
  ];
  if (skipPatterns.some((pattern) => pattern.test(content))) {
    return null;
  }

  const urls = extractUrls(content);
  const sourceType = determineSourceType(content, urls);
  const originalLink = urls[0] || undefined;

  // Extract recipe data from message
  let title = extractTitle(content);
  let ingredients = extractIngredients(content);
  let instructions = extractInstructions(content);
  let description = content.length > 200 ? content.substring(0, 200) + "..." : content;
  let images = message.media || [];

  // If we have a URL and it's a website, try to scrape recipe data
  if (originalLink && sourceType === "website") {
    try {
      const scraped = await scrapeRecipeFromUrl(originalLink);
      if (scraped) {
        // Use scraped data, but keep original title if message has one
        if (!title || title === "מתכון ללא כותרת") {
          title = scraped.title || title;
        }
        if (scraped.ingredients.length > 0) {
          ingredients = scraped.ingredients;
        }
        if (scraped.instructions.length > 0) {
          instructions = scraped.instructions;
        }
        if (scraped.description) {
          description = scraped.description;
        }
        if (scraped.images.length > 0) {
          images = [...images, ...scraped.images];
        }
      }
    } catch (error) {
      console.error(`Failed to scrape recipe from ${originalLink}:`, error);
      // Continue with message data if scraping fails
    }
  }

  // If we have a URL, it's a valid recipe even without ingredients/instructions
  // If we have ingredients or instructions, it's a valid recipe
  // Otherwise, skip
  if (ingredients.length === 0 && instructions.length === 0 && !originalLink) {
    return null;
  }

  const messageId = generateMessageId(message.timestamp, content);

  const recipe: RecipeInput = {
    title: title || "מתכון ללא כותרת",
    description,
    ingredients: ingredients.length > 0 ? ingredients : ["לא צוין"],
    instructions: instructions.length > 0 ? instructions : ["לא צוין"],
    sourceType,
    originalLink,
    whatsappMessageId: messageId,
    whatsappMessageTimestamp: message.timestamp,
    images,
  };

  return {
    recipe,
    messageId,
  };
}

/**
 * Parse WhatsApp chat export file
 * Supports both .txt format (Android) and other formats
 */
export function parseWhatsAppExport(
  exportContent: string
): WhatsAppMessage[] {
  const messages: WhatsAppMessage[] = [];
  const lines = exportContent.split("\n");

  // Pattern for WhatsApp export format: DD/MM/YYYY, HH:MM - Author: Message
  // Also supports system messages: DD/MM/YYYY, HH:MM - Message (no author)
  // Also supports: [DD/MM/YYYY, HH:MM:SS] Author: Message (older format)
  const messagePattern =
    /(?:\[)?(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2}(?::\d{2})?)(?:\])?\s*-\s*(?:(.+?):\s*)?(.+)/;

  let currentMessage: Partial<WhatsAppMessage> | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const match = line.match(messagePattern);

    if (match) {
      // Save previous message if exists
      if (currentMessage && currentContent.length > 0) {
        messages.push({
          timestamp: currentMessage.timestamp!,
          author: currentMessage.author!,
          content: currentContent.join("\n"),
          media: currentMessage.media,
        });
      }

      // Start new message
      const [, dateStr, timeStr, author, content] = match;
      const [day, month, year] = dateStr.split("/").map(Number);
      const [hour, minute, second = 0] = timeStr.split(":").map(Number);

      currentMessage = {
        timestamp: new Date(year, month - 1, day, hour, minute, second),
        author: author ? author.trim() : "System",
        content: content.trim(),
      };
      currentContent = [content.trim()];
    } else if (currentMessage && line.trim()) {
      // Continuation of current message
      currentContent.push(line.trim());
    }
  }

  // Add last message
  if (currentMessage && currentContent.length > 0) {
    messages.push({
      timestamp: currentMessage.timestamp!,
      author: currentMessage.author!,
      content: currentContent.join("\n"),
      media: currentMessage.media,
    });
  }

  return messages;
}
