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
 * 
 * Usage Note: Gemini 2.5 Flash is on Google's free tier with generous rate limits.
 * Monitor usage in Google Cloud Console to ensure we stay within free tier limits.
 * If usage grows, consider implementing rate limiting or upgrading to a paid tier.
 */
export function getGeminiModel(modelName: string = DEFAULT_MODEL) {
  const client = getGeminiClient();
  return client.getGenerativeModel({ 
    model: modelName,
    // Add safety settings to prevent inappropriate content
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT" as any,
        threshold: "BLOCK_MEDIUM_AND_ABOVE" as any,
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH" as any,
        threshold: "BLOCK_MEDIUM_AND_ABOVE" as any,
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any,
        threshold: "BLOCK_MEDIUM_AND_ABOVE" as any,
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any,
        threshold: "BLOCK_MEDIUM_AND_ABOVE" as any,
      },
    ],
  });
}

