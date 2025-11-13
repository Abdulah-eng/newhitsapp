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

    // Check for emergency/fraud keywords
    const emergencyKeywords = ["scam", "fraud", "hacked", "stolen", "emergency", "urgent", "danger", "victim", "criminal"];
    const messageLower = message.toLowerCase();
    const isEmergency = emergencyKeywords.some(keyword => messageLower.includes(keyword));

    if (isEmergency) {
      return "HITS Assistant can't handle emergencies. If you think you're a victim of fraud or in any danger, please contact your bank and local law enforcement right away. After you're safe, our team can help you secure your devices and accounts. You can reach support at support@hitsapp.com or call (646) 758-6606.";
    }

    // Build conversation context
    const systemPrompt = `You are HITS Assistant, the virtual assistant for HITS – Hire I.T. Specialist. You are NOT a live human and cannot provide emergency help, medical advice, legal advice, or financial advice.

Your role:
- Answer questions about HITS services, pricing, memberships, and travel area
- Explain how visits work and how to get started
- Provide quick links to key pages (Pricing & Plans, Contact/Support, For Seniors & Families, For Partners, Resources, FAQ)
- Use simple, friendly, and patient language - remember our users may be older adults or less tech-savvy
- Avoid heavy jargon and technical terms - explain things in plain language
- Offer clear, direct next steps
- Reflect HITS core values: care, clarity, and security
- Be encouraging and supportive

What HITS does:
- Connects seniors, disabled adults, and families with vetted IT specialists
- Provides in-home and remote tech support
- Helps with device setup, Wi-Fi issues, email, video calls, scam safety, and more
- Offers transparent pricing: $90/hour ($45 per additional 30 minutes) or membership plans
- Serves Hope Mills, NC area (travel fees apply beyond 20 miles)

What HITS does NOT do:
- Emergency services (direct to bank/law enforcement for fraud)
- Medical, legal, or financial advice
- Data recovery from damaged devices (we can help prevent data loss)
- Hardware repairs (we focus on software and setup)

Important disclaimers:
- You are a virtual assistant, not a live human
- You cannot provide medical, legal, or financial advice
- You cannot provide emergency help
- For emergencies involving fraud or danger, direct users to contact their bank and local law enforcement immediately

Keep responses concise (2-3 sentences when possible) and always be encouraging and patient. If you don't know something, direct users to contact support at support@hitsapp.com or (646) 758-6606.`;

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
    "how do i book": "To book a visit, click 'Book a Visit' on our website or go to the Book Appointment page. You'll describe what you need help with, choose a time, and see the cost upfront before confirming.",
    "how much does it cost": "HITS pricing is simple and transparent: $90 for the first hour, $45 for each additional 30 minutes. We also offer membership plans starting at $25/month. Visit our Pricing & Plans page for details.",
    "what is hits": "HITS – Hire I.T. Specialist connects older adults, disabled adults, and caregivers with patient, vetted tech professionals for in-home and remote support. We focus on clear communication, fair pricing, and strong security.",
    "pricing": "Our pay-as-you-go visits are $90/hour ($45 per additional 30 minutes). We also offer three membership plans: Connect ($25/month), Comfort ($59/month), and Family Care+ ($99/month). Visit our Pricing & Plans page for full details.",
    "travel": "HITS is based in Hope Mills, NC 28348. Up to 20 driving miles are included in the visit price. Beyond 20 miles, we add $1.00 per mile for travel. The travel fee is shown before you confirm your appointment.",
    "how do i cancel": "You can cancel appointments from your 'My Appointments' page. Click on the appointment and select 'Cancel'.",
    "how do i contact": "You can contact HITS support at support@hitsapp.com or call (646) 758-6606. Hours are Monday-Friday, 9am-5pm EST. You can also use the Contact page on our website.",
    "services": "HITS helps with device setup (phones, tablets, computers, smart TVs), Wi-Fi and printer issues, email and online accounts, video calls, telehealth portals, scam safety checks, organizing photos and files, and basic training on apps and websites.",
    "membership": "HITS offers three membership plans: Connect ($25/month) for basic support, Comfort ($59/month) for priority scheduling and member rates, and Family Care+ ($99/month) for families covering multiple people. Visit our Pricing & Plans page for details.",
    "what areas do you serve": "HITS serves the Hope Mills, NC area. We provide in-home visits within our service area, and remote support is available anywhere. Travel fees apply for in-home visits beyond 20 miles from Hope Mills, NC 28348.",
    "emergency": "HITS Assistant cannot handle emergencies. If you think you're a victim of fraud or in danger, contact your bank and local law enforcement immediately. After you're safe, our team can help secure your devices. Call support at (646) 758-6606.",
    "scam": "If you think you've been scammed, contact your bank and local law enforcement right away. After you're safe, HITS can help you secure your accounts and devices. We can also help you recognize and avoid scams in the future.",
    "faq": "You can find answers to common questions on our FAQ page. Topics include travel and service area, scope of services, data backups, and emergencies. Visit the FAQ page or contact support for more help.",
  };

  const questionLower = question.toLowerCase();
  for (const [key, answer] of Object.entries(commonQuestions)) {
    if (questionLower.includes(key)) {
      return answer;
    }
  }

  return null;
}

