import { NextRequest, NextResponse } from "next/server";
import { generateRecommendations } from "@/lib/gemini/matching";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issueDescription } = body;

    if (!issueDescription) {
      return NextResponse.json(
        { error: "Issue description is required" },
        { status: 400 }
      );
    }

    const recommendations = await generateRecommendations(issueDescription);

    return NextResponse.json({
      recommendations,
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

