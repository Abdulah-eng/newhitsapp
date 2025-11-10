import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Initialize Gemini AI client
 */
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Get a Gemini model instance
 */
export function getGeminiModel(modelName: string = "gemini-pro") {
  const client = getGeminiClient();
  return client.getGenerativeModel({ model: modelName });
}

