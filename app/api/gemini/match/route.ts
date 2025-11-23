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

    if (error) {
      console.error("[AI Match] Error fetching specialists:", error);
      return NextResponse.json(
        { error: "Failed to fetch specialists", details: error.message },
        { status: 500 }
      );
    }

    if (!specialists || specialists.length === 0) {
      console.log("[AI Match] No verified specialists found");
      return NextResponse.json({
        matches: [],
        total: 0,
        message: "No verified specialists available at this time",
      });
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
        s.languages_spoken?.some((lang: string) =>
          preferences.languages.includes(lang)
        )
      );
    }

    if (filteredSpecialists.length === 0) {
      console.log("[AI Match] No specialists match the provided filters");
      return NextResponse.json({
        matches: [],
        total: 0,
        message: "No specialists match your preferences",
      });
    }

    console.log(`[AI Match] Matching against ${filteredSpecialists.length} specialists`);

    // Use AI to match specialists
    let matches;
    try {
      matches = await matchSpecialistWithAI(
        issueDescription,
        filteredSpecialists,
        preferences
      );
      console.log(`[AI Match] AI returned ${matches.length} matches`);
    } catch (aiError: any) {
      console.error("[AI Match] Error in AI matching:", aiError);
      return NextResponse.json(
        { 
          error: "Failed to generate matches", 
          details: aiError.message || "AI matching service unavailable",
          fallback: true
        },
        { status: 500 }
      );
    }

    if (!matches || matches.length === 0) {
      console.log("[AI Match] No matches found by AI");
      return NextResponse.json({
        matches: [],
        total: 0,
        message: "No specialists matched your issue description. Try being more specific or browse all specialists.",
      });
    }

    // Fetch full specialist details for matched IDs
    const matchedSpecialists = matches
      .map((match) => {
        const specialist = filteredSpecialists.find(
          (s) => s.id === match.specialistId
        );
        if (!specialist) {
          console.warn(`[AI Match] Specialist ${match.specialistId} not found in filtered list`);
          return null;
        }
        return {
          ...specialist,
          matchScore: match.matchScore,
          matchReasoning: match.reasoning,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    console.log(`[AI Match] Returning ${matchedSpecialists.length} matched specialists`);

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

