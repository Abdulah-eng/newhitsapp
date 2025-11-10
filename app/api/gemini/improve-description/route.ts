import { NextRequest, NextResponse } from "next/server";
import { improveIssueDescription } from "@/lib/gemini/matching";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description } = body;

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const improved = await improveIssueDescription(description);

    return NextResponse.json({
      improvedDescription: improved,
      originalDescription: description,
    });
  } catch (error) {
    console.error("Error improving description:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

