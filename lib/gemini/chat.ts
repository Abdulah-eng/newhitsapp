import { getGeminiModel } from "./client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Chat with Gemini AI for general support
 */
export async function chatWithAI(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    const model = getGeminiModel("models/gemini-2.5-flash");

    // Build conversation context
    const systemPrompt = `You are a helpful AI assistant for H.I.T.S. (Hire I.T. Specialists), a platform connecting seniors with IT specialists.

Your role:
- Answer general technology questions in simple, easy-to-understand language
- Help seniors describe their technology problems
- Provide basic troubleshooting tips
- Guide users on how to use the platform
- Be patient, friendly, and use non-technical language when possible
- If the issue is complex, suggest booking an appointment with a specialist

Keep responses concise (2-3 sentences when possible) and always be encouraging.`;

    const fullPrompt = `${systemPrompt}

Conversation History:
${conversationHistory
  .slice(-5)
  .map((msg) => `${msg.role}: ${msg.content}`)
  .join("\n")}

User: ${message}
Assistant:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error in AI chat:", error);
    return "I'm sorry, I'm having trouble right now. Please try again or contact support.";
  }
}

/**
 * Generate automated response for common questions
 */
export async function generateAutomatedResponse(
  question: string
): Promise<string | null> {
  const commonQuestions: Record<string, string> = {
    "how do i book": "To book an appointment, go to 'Book Appointment' and select a specialist. Choose a date and time, then describe your issue.",
    "how much does it cost": "Costs vary by specialist. Each specialist sets their own hourly rate, which is shown on their profile.",
    "what is hits": "H.I.T.S. is a platform that connects seniors with verified IT specialists who can help with technology problems.",
    "how do i cancel": "You can cancel appointments from your 'My Appointments' page. Click on the appointment and select 'Cancel'.",
    "how do i contact": "You can message specialists directly from your appointments page or use the messaging feature.",
  };

  const questionLower = question.toLowerCase();
  for (const [key, answer] of Object.entries(commonQuestions)) {
    if (questionLower.includes(key)) {
      return answer;
    }
  }

  return null;
}

