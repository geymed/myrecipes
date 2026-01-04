import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

export interface ScrapedRecipe {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  images: string[];
}

/**
 * Extract recipe data from a website URL
 */
export async function scrapeRecipeFromUrl(
  url: string
): Promise<ScrapedRecipe | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try to find recipe data using common patterns
    const recipe: ScrapedRecipe = {
      title: extractTitle($),
      description: extractDescription($),
      ingredients: extractIngredients($),
      instructions: extractInstructions($),
      images: extractImages($, url),
    };

    // Only return if we found meaningful data
    if (recipe.title && (recipe.ingredients.length > 0 || recipe.instructions.length > 0)) {
      return recipe;
    }

    return null;
  } catch (error) {
    console.error(`Error scraping recipe from ${url}:`, error);
    return null;
  }
}

/**
 * Extract recipe title from page
 */
function extractTitle($: CheerioAPI): string {
  // Try common recipe title selectors
  const titleSelectors = [
    'h1[class*="recipe"]',
    'h1[class*="title"]',
    'h1[class*="name"]',
    'h1.recipe-title',
    'h1.entry-title',
    'article h1',
    'main h1',
    '.recipe-header h1',
    '[itemprop="name"]',
    'h1',
  ];

  for (const selector of titleSelectors) {
    const title = $(selector).first().text().trim();
    if (title && title.length > 3 && title.length < 200) {
      return title;
    }
  }

  // Fallback to page title
  const pageTitle = $("title").text().trim();
  if (pageTitle) {
    return pageTitle.split("|")[0].split("-")[0].trim();
  }

  return "";
}

/**
 * Extract recipe description
 */
function extractDescription($: CheerioAPI): string | undefined {
  const descSelectors = [
    '[itemprop="description"]',
    '.recipe-description',
    '.recipe-summary',
    'article p:first-of-type',
    'main p:first-of-type',
  ];

  for (const selector of descSelectors) {
    const desc = $(selector).first().text().trim();
    if (desc && desc.length > 20 && desc.length < 500) {
      return desc;
    }
  }

  return undefined;
}

/**
 * Extract ingredients list
 */
function extractIngredients($: CheerioAPI): string[] {
  const ingredients: string[] = [];

  // Try structured data first
  const structuredIngredients = $('[itemtype*="Recipe"] [itemprop="recipeIngredient"]');
  if (structuredIngredients.length > 0) {
    structuredIngredients.each((_, el) => {
      const ingredient = $(el).text().trim();
      if (ingredient) ingredients.push(ingredient);
    });
    if (ingredients.length > 0) return ingredients;
  }

  // Try common ingredient list selectors
  const ingredientSelectors = [
    '.ingredients li',
    '.ingredient-list li',
    '.recipe-ingredients li',
    '[class*="ingredient"] li',
    'ul.ingredients li',
    'ol.ingredients li',
    '#ingredients li',
    '.מרכיבים li',
    '.רכיבים li',
  ];

  for (const selector of ingredientSelectors) {
    const items = $(selector);
    if (items.length > 0) {
      items.each((_, el) => {
        const ingredient = $(el).text().trim();
        // Clean up common prefixes
        const cleaned = ingredient
          .replace(/^[-•\d.\s)]+/, "")
          .trim();
        if (cleaned && cleaned.length > 2) {
          ingredients.push(cleaned);
        }
      });
      if (ingredients.length > 0) return ingredients;
    }
  }

  // Try to find ingredients section by Hebrew keywords
  const hebrewKeywords = ["מרכיבים", "רכיבים", "חומרים", "רשימת מצרכים"];
  for (const keyword of hebrewKeywords) {
    const section = $(`*:contains("${keyword}")`).first();
    if (section.length > 0) {
      section.find("li, p").each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 2 && !text.includes("הוראות")) {
          ingredients.push(text.replace(/^[-•\d.\s)]+/, "").trim());
        }
      });
      if (ingredients.length > 0) return ingredients;
    }
  }

  return ingredients;
}

/**
 * Extract instructions/steps
 */
function extractInstructions($: CheerioAPI): string[] {
  const instructions: string[] = [];

  // Try structured data first
  const structuredSteps = $('[itemtype*="Recipe"] [itemprop="recipeInstructions"]');
  if (structuredSteps.length > 0) {
    structuredSteps.each((_, el) => {
      const step = $(el).text().trim();
      if (step) instructions.push(step);
    });
    if (instructions.length > 0) return instructions;
  }

  // Try common instruction selectors
  const instructionSelectors = [
    '.instructions li',
    '.steps li',
    '.recipe-steps li',
    '.method li',
    '[class*="instruction"] li',
    '[class*="step"] li',
    'ol.instructions li',
    'ol.steps li',
    '#instructions li',
    '.הוראות li',
    '.אופן הכנה li',
  ];

  for (const selector of instructionSelectors) {
    const items = $(selector);
    if (items.length > 0) {
      items.each((_, el) => {
        const step = $(el).text().trim();
        const cleaned = step.replace(/^\d+[.)]\s*/, "").trim();
        if (cleaned && cleaned.length > 5) {
          instructions.push(cleaned);
        }
      });
      if (instructions.length > 0) return instructions;
    }
  }

  // Try to find instructions section by Hebrew keywords
  const hebrewKeywords = ["הוראות", "אופן הכנה", "שלבים", "איך להכין"];
  for (const keyword of hebrewKeywords) {
    const section = $(`*:contains("${keyword}")`).first();
    if (section.length > 0) {
      section.find("li, p, div").each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 10) {
          instructions.push(text.replace(/^\d+[.)]\s*/, "").trim());
        }
      });
      if (instructions.length > 0) return instructions;
    }
  }

  return instructions;
}

/**
 * Extract recipe images
 */
function extractImages($: CheerioAPI, baseUrl: string): string[] {
  const images: string[] = [];

  // Try structured data
  const structuredImage = $('[itemprop="image"]').attr("content") ||
    $('[itemprop="image"]').attr("src");
  if (structuredImage) {
    images.push(resolveUrl(structuredImage, baseUrl));
  }

  // Try common recipe image selectors
  const imageSelectors = [
    '.recipe-image img',
    '.recipe-photo img',
    'article img',
    'main img',
    '.entry-content img',
  ];

  for (const selector of imageSelectors) {
    const img = $(selector).first().attr("src") || $(selector).first().attr("data-src");
    if (img && !img.includes("logo") && !img.includes("icon")) {
      images.push(resolveUrl(img, baseUrl));
      break; // Just get the first main image
    }
  }

  return images.filter(Boolean);
}

/**
 * Resolve relative URLs to absolute
 */
function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  if (url.startsWith("/")) {
    try {
      const base = new URL(baseUrl);
      return `${base.origin}${url}`;
    } catch {
      return url;
    }
  }
  try {
    const base = new URL(baseUrl);
    return new URL(url, base).href;
  } catch {
    return url;
  }
}
