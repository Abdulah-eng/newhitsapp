import { NextRequest, NextResponse } from "next/server";
import { matchSpecialistWithAI } from "@/lib/gemini/matching";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issueDescription, preferences } = body;

    if (!issueDescription) {
      return NextResponse.json(
        { error: "Issue description is required" },
        { status: 400 }
      );
    }

    // Fetch verified specialists
    const supabase = await createSupabaseServerComponentClient();
    const { data: specialists, error } = await supabase
      .from("specialist_profiles")
      .select("*, user:user_id(full_name)")
      .eq("verification_status", "verified");

    if (error || !specialists) {
      return NextResponse.json(
        { error: "Failed to fetch specialists" },
        { status: 500 }
      );
    }

    // Apply basic filters if provided
    let filteredSpecialists = specialists;
    if (preferences?.maxRate) {
      filteredSpecialists = filteredSpecialists.filter(
        (s) => s.hourly_rate <= preferences.maxRate
      );
    }
    if (preferences?.languages && preferences.languages.length > 0) {
      filteredSpecialists = filteredSpecialists.filter((s) =>
        s.languages_spoken.some((lang: string) =>
          preferences.languages.includes(lang)
        )
      );
    }

    // Use AI to match specialists
    const matches = await matchSpecialistWithAI(
      issueDescription,
      filteredSpecialists,
      preferences
    );

    // Fetch full specialist details for matched IDs
    const matchedSpecialists = matches.map((match) => {
      const specialist = filteredSpecialists.find(
        (s) => s.id === match.specialistId
      );
      return {
        ...specialist,
        matchScore: match.matchScore,
        matchReasoning: match.reasoning,
      };
    });

    return NextResponse.json({
      matches: matchedSpecialists,
      total: matchedSpecialists.length,
    });
  } catch (error) {
    console.error("Error in matching API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

