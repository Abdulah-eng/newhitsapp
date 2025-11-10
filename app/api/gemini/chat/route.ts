import { NextRequest, NextResponse } from "next/server";
import { chatWithAI, generateAutomatedResponse } from "@/lib/gemini/chat";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check for automated responses first
    const automatedResponse = await generateAutomatedResponse(message);
    if (automatedResponse) {
      return NextResponse.json({
        response: automatedResponse,
        isAutomated: true,
      });
    }

    // Use AI chat
    const response = await chatWithAI(message, conversationHistory);

    return NextResponse.json({
      response,
      isAutomated: false,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

