import { GoogleGenerativeAI } from "@google/generative-ai";

// Hardcoded Gemini API key and configuration
const GEMINI_API_KEY = "AIzaSyAG4y_lmu728vT3oRCY49j7UrfqPomOpnI";
const DEFAULT_MODEL = "models/gemini-2.5-flash";

/**
 * Initialize Gemini AI client
 */
export function getGeminiClient() {
  return new GoogleGenerativeAI(GEMINI_API_KEY);
}

/**
 * Get a Gemini model instance
 * Using models/gemini-2.5-flash as the default model (latest stable model)
 */
export function getGeminiModel(modelName: string = DEFAULT_MODEL) {
  const client = getGeminiClient();
  return client.getGenerativeModel({ model: modelName });
}

