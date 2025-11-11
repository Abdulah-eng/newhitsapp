import { getGeminiModel } from "./client";
import type { SpecialistProfile } from "@/types";

interface MatchingRequest {
  issueDescription: string;
  location?: string;
  preferences?: {
    maxRate?: number;
    languages?: string[];
  };
}

interface MatchingResult {
  specialistId: string;
  matchScore: number;
  reasoning: string;
}

/**
 * Use Gemini AI to match a senior's issue with the best specialist
 */
export async function matchSpecialistWithAI(
  issueDescription: string,
  specialists: SpecialistProfile[],
  userPreferences?: MatchingRequest["preferences"]
): Promise<MatchingResult[]> {
  try {
    const model = getGeminiModel("models/gemini-2.5-flash");

    // Prepare specialist data for AI
    const specialistData = specialists.map((spec) => ({
      id: spec.id,
      specialties: spec.specialties.join(", "),
      bio: spec.bio || "",
      rating: spec.rating_average,
      experience: spec.years_experience || 0,
      languages: spec.languages_spoken.join(", "),
    }));

    const prompt = `You are an AI assistant helping match seniors with IT specialists based on their technology needs.

Senior's Issue Description: "${issueDescription}"

Available Specialists:
${JSON.stringify(specialistData, null, 2)}

User Preferences:
${JSON.stringify(userPreferences || {}, null, 2)}

Analyze the issue description and match it with the most suitable specialists. Consider:
1. How well the specialist's specialties align with the issue
2. The specialist's experience and rating
3. Language preferences if specified
4. Overall fit for the problem type

Return a JSON array of matches in this format:
[
  {
    "specialistId": "specialist-id",
    "matchScore": 0.95,
    "reasoning": "Brief explanation of why this specialist is a good match"
  }
]

Order by match score (highest first). Include only specialists with matchScore >= 0.5.
Return ONLY valid JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let matches: MatchingResult[] = [];
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        matches = JSON.parse(jsonMatch[0]);
      } else {
        matches = JSON.parse(text);
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Fallback to simple keyword matching
      return fallbackMatching(issueDescription, specialists);
    }

    // Validate and sort results
    matches = matches
      .filter((m) => m.specialistId && m.matchScore >= 0.5)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Top 5 matches

    return matches;
  } catch (error) {
    console.error("Error in AI matching:", error);
    // Fallback to simple matching
    return fallbackMatching(issueDescription, specialists);
  }
}

/**
 * Fallback matching algorithm using keyword matching
 */
function fallbackMatching(
  issueDescription: string,
  specialists: SpecialistProfile[]
): MatchingResult[] {
  const issueLower = issueDescription.toLowerCase();
  const keywords = issueLower.split(/\s+/);

  const matches = specialists.map((spec) => {
    let score = 0;
    const specialtiesLower = spec.specialties.map((s) => s.toLowerCase());
    const bioLower = (spec.bio || "").toLowerCase();

    // Check specialty matches
    keywords.forEach((keyword) => {
      if (specialtiesLower.some((s) => s.includes(keyword))) {
        score += 0.3;
      }
      if (bioLower.includes(keyword)) {
        score += 0.1;
      }
    });

    // Boost score based on rating
    score += (spec.rating_average / 5) * 0.2;

    // Boost score based on experience
    if (spec.years_experience) {
      score += Math.min(spec.years_experience / 10, 0.2);
    }

    return {
      specialistId: spec.id,
      matchScore: Math.min(score, 1.0),
      reasoning: `Matches based on specialties and experience`,
    };
  });

  return matches
    .filter((m) => m.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

/**
 * Improve issue description using AI
 */
export async function improveIssueDescription(
  originalDescription: string
): Promise<string> {
  try {
    const model = getGeminiModel("models/gemini-2.5-flash");

    const prompt = `You are helping a senior citizen describe their technology problem more clearly.

Original description: "${originalDescription}"

Rewrite this description to be:
1. Clear and specific
2. Include relevant technical details if mentioned
3. Easy for an IT specialist to understand
4. Keep the same meaning and intent
5. Use simple, clear language
6. Fix all spelling errors and typos
7. Add proper punctuation and capitalization
8. Correct grammar mistakes
9. Make it more professional while keeping the user's voice

IMPORTANT: You must actually improve the text. If there are spelling errors, fix them. If there's no punctuation, add it. If the grammar is poor, correct it. Do not just return the original text unchanged.

Return ONLY the improved description, no additional text or explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error improving description:", error);
    return originalDescription; // Return original if AI fails
  }
}

/**
 * Generate smart recommendations based on issue type
 */
export async function generateRecommendations(
  issueDescription: string
): Promise<string[]> {
  try {
    const model = getGeminiModel("models/gemini-2.5-flash");

    const prompt = `Based on this technology issue: "${issueDescription}"

Generate 3-5 helpful recommendations or tips that might help the user before their appointment. These should be:
1. Simple and easy to understand
2. Safe to try (no risky operations)
3. Relevant to the problem
4. Written for non-technical users

Return as a JSON array of strings, example:
["Try restarting your device", "Check your internet connection", "Make sure software is up to date"]

Return ONLY the JSON array, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse JSON array
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch {
      // Fallback recommendations
      return [
        "Try restarting your device",
        "Check your internet connection",
        "Make sure your software is up to date",
      ];
    }
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return [];
  }
}

