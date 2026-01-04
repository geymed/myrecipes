export type SourceType = "text" | "website" | "instagram";

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  sourceType: SourceType;
  originalLink?: string;
  whatsappMessageId?: string;
  whatsappMessageTimestamp?: Date;
  images: string[];
  parsedContent?: Record<string, unknown>;
  createdAt: Date;
  lastSyncedAt: Date;
}

export interface RecipeInput {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  sourceType: SourceType;
  originalLink?: string;
  whatsappMessageId?: string;
  whatsappMessageTimestamp?: Date;
  images?: string[];
  parsedContent?: Record<string, unknown>;
}
